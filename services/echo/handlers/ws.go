package handlers

import (
	"echo/lib/state"
	"echo/lib/utils"
	"echo/lib/wss"
	"encoding/json"
	"log"
	"strconv"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/pion/webrtc/v4"
)

func UpgradeWs(c *fiber.Ctx) error {
	// IsWebSocketUpgrade returns true if the client
	// requested upgrade to the WebSocket protocol.
	if websocket.IsWebSocketUpgrade(c) {
		return c.Next()
	}
	return fiber.ErrUpgradeRequired
}

func NewSocketConn(s *state.State) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		socket := wss.New(conn)

		sid := socket.Params("sid")
		mid, _ := strconv.Atoi(socket.Params("mid"))

		log.Printf("socket: session=%s user=%d", sid, mid)

		utils.IncreaseThread()
		defer utils.DecreaseThread()
		for {
			messageType, message, err := socket.ReadMessage()

			if err != nil {
				log.Println("readding socket message error", err)
				s.RemoveSessionMember(sid, mid)
				break
			}

			if messageType != websocket.BinaryMessage {
				log.Println("ignore non-binary socket messages")
				continue
			}

			// message is made of header and body. first byte of the message
			// represents the message type (aka kind) rest of the bytes
			// repersents the message itself (the body). The header will
			// determine how the body will be parsed/interpreted
			header := message[0]
			body := message[1:]
			kind := socket.GetMessageKind(header)
			session := s.GetSession(sid)
			log.Printf("message kind: %s", kind.String())

			if kind == wss.ClientMessageTypeOffer {
				// parse message body
				var sessionDescription webrtc.SessionDescription
				if err := json.Unmarshal(body, &sessionDescription); err != nil {
					log.Println("failed to parse session offer message body")
					continue
				}

				// add or reiterative the member for the state
				current := s.GetSessionMember(sid, mid)
				if current == nil {
					current = utils.Must(state.NewMember(mid, &socket))
				}

				utils.Unwrap(current.Conn.SetRemoteDescription(sessionDescription))
				localSdp := utils.Must(current.Conn.CreateAnswer(nil))
				utils.Unwrap(current.Conn.SetLocalDescription(localSdp))
				socket.SendAnswerMessage(&localSdp)

				// add member to session
				if !s.IsMemberExist(sid, mid) {
					s.AddSessionMember(sid, current)
				}

				// share other members tracks with the current member
				members := s.GetSessionMembers(sid)

				for _, member := range members {
					// skip current member
					if member.Id == mid {
						continue
					}

					for _, track := range member.Tracks {
						log.Printf("sending %s track from %d to %d", track.Kind().String(), member.Id, mid)
						current.SendTrack(track)
					}
				}
			}

			if kind == wss.ClientMessageTypeAnswer {
				// parse message body
				var sessionDescription webrtc.SessionDescription
				if err := json.Unmarshal(body, &sessionDescription); err != nil {
					log.Println("failed to parse session answer message body")
					continue
				}

				member := s.GetSessionMember(sid, mid)
				if member == nil {
					continue
				}

				utils.Unwrap(member.Conn.SetRemoteDescription(sessionDescription))
			}

			if kind == wss.ClientMessageTypeToggleVideo && session != nil {
				// parse message body
				var video bool
				if err := json.Unmarshal(body, &video); err != nil {
					log.Println("failed to parse toggle video message body")
					continue
				}

				session.SetMemberVideo(mid, video)
			}

			if kind == wss.ClientMessageTypeToggleAudio && session != nil {
				// parse message body
				var audio bool
				if err := json.Unmarshal(body, &audio); err != nil {
					log.Println("failed to parse toggle video message body")
					continue
				}

				session.SetMemberAudio(mid, audio)
			}

		}
	})
}
