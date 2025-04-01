// ancillary funcions appertain to webrtc (pion implementaion)
// credits go to https://github.com/pion/webrtc/blob/master/examples/broadcast/main.go#L229
package utils

import (
	"errors"
	"fmt"
	"io"
	"log"

	"echo/state"

	"github.com/pion/interceptor"
	"github.com/pion/interceptor/pkg/intervalpli"
	"github.com/pion/webrtc/v4"
)

/*
establish a webrtc peer connection by using pion webrtc. this function does
more than establishing the connection; it manages the global state of peers
connections and streams as well.

Note: it returns the peer connection with the associated id if it's already
established before, by retrieving it from the state package.
*/
func GetPeerConn(id int, config webrtc.Configuration) (*webrtc.PeerConnection, error) {
	// check if the peer connection is already established
	if state.Get(id) != nil {
		return state.Get(id).Conn, nil
	}

	mediaEngine := &webrtc.MediaEngine{}
	if err := mediaEngine.RegisterDefaultCodecs(); err != nil {
		panic(err)
	}

	// Create a InterceptorRegistry. This is the user configurable RTP/RTCP Pipeline.
	// This provides NACKs, RTCP Reports and other features. If you use `webrtc.NewPeerConnection`
	// this is enabled by default. If you are manually managing You MUST create a InterceptorRegistry
	// for each PeerConnection.
	interceptorRegistry := &interceptor.Registry{}

	// Use the default set of Interceptors
	if err := webrtc.RegisterDefaultInterceptors(mediaEngine, interceptorRegistry); err != nil {
		return nil, err
	}

	// Register a intervalpli factory
	// This interceptor sends a PLI every 3 seconds. A PLI causes a video keyframe to be generated by the sender.
	// This makes our video seekable and more error resilent, but at a cost of lower picture quality and higher bitrates
	// TODO: A real world application should process incoming RTCP packets from viewers and forward them to senders
	intervalPliFactory, err := intervalpli.NewReceiverInterceptor()
	if err != nil {
		return nil, err
	}
	interceptorRegistry.Add(intervalPliFactory)

	// Create a new RTCPeerConnection
	conn, err := webrtc.NewAPI(
		webrtc.WithMediaEngine(mediaEngine),
		webrtc.WithInterceptorRegistry(interceptorRegistry),
	).NewPeerConnection(config)

	// ensure that the peer connection only stored when it's connected
	// and moreover it's removed when the connection is terminated
	conn.OnConnectionStateChange(func(connState webrtc.PeerConnectionState) {
		log.Println(fmt.Sprintf("Peer %d: %s", id, connState))
		if connState == webrtc.PeerConnectionStateConnected {
			state.Add(id, conn)
		} else {
			state.Remove(id)
		}
	})

	// store different tracks received from the remote peer in the global state
	conn.OnTrack(func(remoteTrack *webrtc.TrackRemote, _ *webrtc.RTPReceiver) {
		// create a local track with the remote track capabilities
		localTrack, newTrackErr := webrtc.NewTrackLocalStaticRTP(remoteTrack.Codec().RTPCodecCapability, "video", "pion")
		if newTrackErr != nil {
			panic(newTrackErr)
		}

		// store the track address in the state map
		peer := state.Get(id)
		if peer == nil {
			log.Println("container not found! should never happen.")
			return
		}
		peer.Tracks = append(peer.Tracks, localTrack)

		// write the buffer from the remote track in the local track simultaneously
		rtpBuf := make([]byte, 1400)
		for {
			i, _, readErr := remoteTrack.Read(rtpBuf)
			if readErr != nil {
				log.Println(readErr)
				break
			}
			// ErrClosedPipe means we don't have any subscribers, this is ok if no peers have connected yet
			if _, err = localTrack.Write(rtpBuf[:i]); err != nil && !errors.Is(err, io.ErrClosedPipe) {
				log.Println(err)
				break
			}
		}
	})

	return conn, err
}

/*
close an already established peer connection. an error is returned
if the connection cannot be closed. and nothing happens if the peer
connection cannot be found.
*/
func ClosePeerConn(id int) error {
	peer := state.Get(id)
	if peer == nil {
		return nil
	}
	return peer.Conn.Close()
}

func GatherICEs(conn *webrtc.PeerConnection) {
	// Create channel that is blocked until ICE Gathering is complete
	gatherComplete := webrtc.GatheringCompletePromise(conn)

	// Block until ICE Gathering is complete, disabling trickle ICE
	// we do this because we only can exchange one signaling message
	// in a production application you should exchange ICE Candidates via OnICECandidate
	<-gatherComplete
}
