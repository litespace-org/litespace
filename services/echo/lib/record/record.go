package record

import (
	"log"

	"github.com/pion/webrtc/v4"
	"github.com/pion/webrtc/v4/pkg/media"
	"github.com/pion/webrtc/v4/pkg/media/ivfwriter"
	"github.com/pion/webrtc/v4/pkg/media/oggwriter"
)

func SaveToDisk(writer media.Writer, track *webrtc.TrackRemote) {
	defer func() {
		if err := writer.Close(); err != nil {
			panic(err)
		}
	}()

	for {
		rtpPacket, _, err := track.ReadRTP()
		if err != nil {
			log.Println(err)

			return
		}
		if err := writer.WriteRTP(rtpPacket); err != nil {
			log.Println(err)

			return
		}
	}
}

func NewOggWritter() (*oggwriter.OggWriter, error) {
	oggFile, err := oggwriter.New("output.ogg", 48000, 2)
	return oggFile, err
}

func NewIvfWritter() (*ivfwriter.IVFWriter, error) {
	ivfFile, err := ivfwriter.New("output.ivf", ivfwriter.WithCodec("video/VP8"))
	return ivfFile, err
}
