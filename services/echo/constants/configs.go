package constants

import "github.com/pion/webrtc/v4"

var Config = webrtc.Configuration{
	ICEServers: []webrtc.ICEServer{
		{
			URLs: []string{
				"stun:stun.litespace.org",
			},
			Username:   "litespace",
			Credential: "litespace",
		},
		{
			URLs: []string{
				"turn:turn.litespace.org",
			},
			Username:   "litespace",
			Credential: "litespace",
		},
	},
}
