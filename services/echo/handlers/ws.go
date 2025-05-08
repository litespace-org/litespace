package handlers

import (
	"echo/lib/statev2"
	"echo/lib/utils"
	"encoding/json"
	"log"
	"strconv"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/pion/webrtc/v4"
)

type MessageKind string

const (
	MessageKindOffer     MessageKind = "offer"
	MessageKindAnswer    MessageKind = "answer"
	MessageKindCandidate MessageKind = "candidate"
)

type Message struct {
	Kind  MessageKind `json:"kind"`
	Value string      `json:"value"`
}

func NewMessage(kind MessageKind, value interface{}) Message {
	return Message{
		Kind:  kind,
		Value: string(utils.Must(json.Marshal(value))),
	}
}

func (m *Message) bytes() []byte {
	return utils.Must(json.Marshal(m))
}

func UpgradeWs(c *fiber.Ctx) error {
	// IsWebSocketUpgrade returns true if the client
	// requested upgrade to the WebSocket protocol.
	if websocket.IsWebSocketUpgrade(c) {
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

// Returns a fiber connection by using the websocket module. It handles the socket
// connection by adding a PeerContainer with the associated id (if it doesn't exist)
// and then attach the socket connection to it in order to be able to send candidates
// to the other peer, and finally handle recieving ice candidates from the other peer.
//
// NOTE: the socket connection is automatically closed after a certain amount of seconds.
// it's used only to establish connection. exchanging data shall be proceeded by using
// webrtc data channels.
func NewSocketConn(appstate *statev2.State) fiber.Handler {
	return websocket.New(func(socket *websocket.Conn) {

		sid := socket.Params("sid")
		mid, _ := strconv.Atoi(socket.Params("mid"))

		log.Println(sid, mid)

		utils.IncreaseThread()
		defer utils.DecreaseThread()
		for {
			wssMessageType, wssMessage, err := socket.ReadMessage()
			if err != nil {
				log.Println("[NewSocketConn]", err)
				break
			}

			if wssMessageType == websocket.TextMessage {
				var message Message

				if err := json.Unmarshal(wssMessage, &message); err != nil {
					log.Println("[NewSocketConn]", err)
					continue
				}

				log.Println("message kind:", message.Kind)

				if message.Kind == MessageKindOffer || message.Kind == MessageKindAnswer {
					var sessionDescription webrtc.SessionDescription

					if err := json.Unmarshal([]byte(message.Value), &sessionDescription); err != nil {
						log.Println("[NewSocketConn]", err)
						continue

					}

					currentMember := appstate.GetSessionMember(sid, mid)

					if currentMember == nil {
						currentMember = utils.Must(statev2.NewMember(mid, socket))
					}

					// ===================== share current member stream with the other member ===================
					utils.IncreaseThread()
					defer utils.DecreaseThread()
					go func() {
						for {
							track := <-currentMember.TracksChannel

							members := appstate.GetSessionMembers(sid)

							for _, member := range members {
								// skip current member
								if member.Id == mid {
									continue
								}

								member.SendTrack(track)
							}

						}
					}()

					currentMember.Conn.OnNegotiationNeeded(func() {
						log.Println("Negotiation needed")
						localSdp := utils.Must(currentMember.Conn.CreateOffer(nil))
						utils.Unwrap(currentMember.Conn.SetLocalDescription(localSdp))
						offerMessage := NewMessage(MessageKindOffer, localSdp)
						socket.WriteMessage(websocket.TextMessage, offerMessage.bytes())
					})

					if message.Kind == MessageKindOffer {
						utils.Unwrap(currentMember.Conn.SetRemoteDescription(sessionDescription))
						localSDB := utils.Must(currentMember.Conn.CreateAnswer(nil))
						utils.Unwrap(currentMember.Conn.SetLocalDescription(localSDB))
						answerMessage := NewMessage(MessageKindAnswer, localSDB)
						socket.WriteMessage(websocket.TextMessage, answerMessage.bytes())
					}

					if message.Kind == MessageKindAnswer {
						utils.Unwrap(currentMember.Conn.SetRemoteDescription(sessionDescription))
					}

					// add member to session
					if !appstate.IsMemberExist(sid, mid) {
						appstate.AddSessionMember(sid, currentMember)
					}

					// ===================== share the other member streams with the current member ===================
					if message.Kind == MessageKindOffer {
						members := appstate.GetSessionMembers(sid)

						for _, member := range members {
							// skip current member
							if member.Id == mid {
								continue
							}

							for _, track := range member.Tracks {
								log.Printf("[NewSocketConn] sending %s track (id=%s) from %d to %d", track.Kind().String(), track.ID(), member.Id, mid)
								currentMember.SendTrack(track)
							}

						}
					}

				}

			}
		}
	})
}
