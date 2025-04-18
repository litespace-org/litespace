package state

import (
	"encoding/json"
	"errors"
	"log"

	"github.com/pion/webrtc/v4"
)

// This represents the state of the current and/or the other peer:
// whether he/she is openning the mic, etc. Moreover, it can contain
// other info that they may be interested in sharing: like ice candidates.
type DataChannelMsg struct {
	Mic             *bool  `json:"mic"`
	Cam             *bool  `json:"cam"`
	NewIceCandidate string `json:"newIceCandidate"`
}

// this describes how data channel should send and recieve info
type DataChannelContainer struct {
	Channel      *webrtc.DataChannel
	OnNewMessage func(msg *DataChannelMsg)
}

func (dcc *DataChannelContainer) Init() error {
	if dcc.Channel == nil {
		return errors.New("couldn't initialize; channel is undefined!")
	}
	dcc.Channel.OnMessage(func(msg webrtc.DataChannelMessage) {
		if msg.IsString == false {
			log.Println("datachannel", dcc.Channel.ID(), ": unsupported message type.")
			return
		}
		msgInfo := DataChannelMsg{}
		if err := json.Unmarshal(msg.Data, &msgInfo); err != nil {
			log.Println("datachannel", dcc.Channel.ID(), ": invalid message structure.")
			return
		}
		if dcc.OnNewMessage == nil {
			log.Println("datachannel", dcc.Channel.ID(), ": OnNewMessage is nil; this's probably a mistake.")
			return
		}
		dcc.OnNewMessage(&msgInfo)
	})
	return nil
}

func (dcc *DataChannelContainer) Send(msg DataChannelMsg) error {
	if dcc.Channel == nil {
		return errors.New("couldn't send a message; channel is undefined!")
	}
	b, err := json.Marshal(msg)
	if err != nil {
		return err
	}
	return dcc.Channel.Send(b)
}

func (dcc *DataChannelContainer) Destroy() error {
	err := dcc.Channel.Close()
	dcc.Channel = nil
	return err
}
