package handlers

type ApiConsumePayload struct {
	PeerId         int
	Sdp            string
	ProducerPeerId int
}

type ApiProducePayload struct {
	PeerId int
	Sdp    string
}
