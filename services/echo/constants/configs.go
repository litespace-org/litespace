package constants

import "github.com/pion/webrtc/v4"

var Config = webrtc.Configuration{
	ICEServers: []webrtc.ICEServer{
		{
			URLs: []string{"stun:turn.litespace.org"},
		},
		{
			URLs:       []string{"turn:turn.litespace.org"},
			Username:   "litespace",
			Credential: "litespace",
		},
	},
}
