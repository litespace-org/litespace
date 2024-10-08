# Space

## Data Models

Check [DrawSQL](https://drawsql.app/teams/no-sim/diagrams/space)

![Database Schema](./schema.png)

# Project Setup

## Tools

### nvm

1. Install NVM (node version manager)

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
   ```

2. Configure NVM

   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
   ```

3. Verify NVM installation by running `nvm -v`. You should see no errors.

4. Install the current project node version.

   ```bash
   # from the project root
   nvm install
   ```

5. Use the project node version.

   ```bash
   nvm use
   ```

### pnpm

Enable `pnpm`

```bash
corepack enable pnpm
```

Verify pnpm installation by running `pnpm -v`. You should see no errors.

### Docker

Follow the instractions on how to install [Docker on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) (recommended but feel free to use any linux distro)

# Tools

- [`pg`](https://node-postgres.com/)
- [`node-pg-migrate`](https://salsita.github.io/node-pg-migrate/getting-started)

- https://gist.github.com/Oleshkooo/a403dc8b85e98070fb39844dfb3c0208
- https://www.digitalocean.com/community/tutorials/how-to-set-up-apache-virtual-hosts-on-ubuntu-16-04
- https://docs.vultr.com/how-to-configure-apache-as-a-reverse-proxy-with-mod-proxy-54152
- https://developer.chrome.com/blog/background-blur
- https://github.com/riju/backgroundBlur/blob/main/explainer.md
- https://github.com/Vanilagy/webm-muxer
- https://www.npmjs.com/package/mp4-muxer
- https://blog.bitsrc.io/high-fidelity-web-audio-with-javascript-2e5fff0f071d
  - Audo AI
    - Batch Processing — Remove noise from multiple audio files.
    - Stream Processing — Real-time noise cancellation.
- https://stackoverflow.com/questions/62702721/how-to-get-microphone-volume-using-audioworklet
- Audio Volume Meter: https://codepen.io/forgived/pen/ZEQrWeW
- https://github.com/google-ai-edge/mediapipe <--- AI on medai streams
- TODO: Use `humanize-duration` to handle durations
- https://blog.expo.dev/running-expo-in-windows-subsystem-for-linux-wsl2-425f6fd7838e
- https://docs.expo.dev/get-started/set-up-your-environment/?platform=android&device=simulated&mode=development-build
- https://github.com/expo/config-plugins/tree/main/packages/react-native-webrtc
- https://reactnative.directory/
- https://github.com/byCedric/expo-monorepo-example
- https://medium.com/locastic/react-native-cookie-based-authentication-80ee18f4c71b
- https://medium.com/swlh/custom-tab-navigator-using-react-navigation-svg-b659b395a7c4
- https://medium.com/@malikchohra/build-for-scale-how-to-use-svgs-in-react-native-5f49ad4a7715
