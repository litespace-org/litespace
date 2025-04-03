# Echo

Litespace media server implementaion with [Fiber](https://docs.gofiber.io/) and [Pion/WebRTC](https://github.com/pion/webrtc).

# Getting Started

First of all make sure to install [Go](https://go.dev/dl/) and thereafter [Air](https://github.com/air-verse/air) (optional) on your machine.

> In case you've installed Air with `go install ...`, Notice that this command just downloads the binary in `~/go/bin` directory; ensure that it's concatenated into your PATH enviourment varialbe (in case you are using linux).

Now execute the following command, in the root directory of this go app, to download the dependencies:

```bash
go mod tidy
```

You can run the server by either using `go` or `air` cli, however air is recommended for better dev experience (don't use it if you don't care about hot-reload):

```bash
go run .
```

```bash
air
```

If everything goes well, the server should be listening on port `4004`.
You may try out the demo with this link: [http://localhost:4004/demo](http://localhost:4004/demo).
