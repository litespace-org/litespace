package record

import (
	"echo/lib/utils"
	"log"
	"strings"

	"github.com/pion/rtp"
	"github.com/pion/webrtc/v4"
	"github.com/pion/webrtc/v4/pkg/media"
	"github.com/pion/webrtc/v4/pkg/media/ivfwriter"
	"github.com/pion/webrtc/v4/pkg/media/oggwriter"
)

func GetWriter(codec webrtc.RTPCodecParameters) media.Writer {
	if strings.EqualFold(codec.MimeType, webrtc.MimeTypeOpus) {
		log.Println("Got Opus track, saving to disk as output.opus (48 kHz, 2 channels)")
		ogg, err := NewOggWritter()
		if err != nil {
			log.Println("ogg record error:", err)
		}
		return ogg
	} else if strings.EqualFold(codec.MimeType, webrtc.MimeTypeVP8) {
		log.Println("Got VP8 track, saving to disk as output.ivf")
		ivf, err := NewIvfWritter()
		if err != nil {
			log.Println("ivf record error:", err)
		}
		return ivf
	}
	return nil
}

func SavePacketToDisk(writer media.Writer, packet *rtp.Packet) {
	if writer == nil {
		log.Println("record: writer is nil!")
		return
	}
	if err := writer.WriteRTP(packet); err != nil {
		log.Println(err)
		return
	}
}

func SaveToDisk(writer media.Writer, track *webrtc.TrackRemote) {
	defer func() {
		if err := writer.Close(); err != nil {
			log.Println("remote error:", err)
		}
	}()

	utils.IncreaseThread()
	defer utils.DecreaseThread()
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
