package constants

import (
	"os"

	"github.com/pion/webrtc/v4"
)

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

var Features = struct {
	EnableRecording bool
}{
	EnableRecording: os.Getenv("ENABLE_RECORDING") == "true",
}
