# LiteSpace

## Project Strucutre

- `packages/*`
  - `packages/assets` - sharable assets (files and images).
  - `packages/atlas` - API SDK.
  - `packages/auth` - Server authentication and authorization module.
  - `packages/email` - Email templates.
  - `packages/headless` - React components logic that can be used in the web and mobile.
  - `packages/UI` - Components library.
  - `packages/models` - Database models.
  - `packages/utils`- Sharable pure javascript logic that can be use on web, server, and mobile.
- `apps/*`
  - `apps/blog` - LiteSpace blog.
  - `apps/dashboard` - LiteSpace admin dashboard.
  - `apps/mobile` - LiteSpace mobile app.
  - `apps/landing` - LiteSpace landing page.
  - `apps/web` - LiteSpace main web platform.

## Project Setup

### Tools

#### nvm

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

#### pnpm

Enable `pnpm`

```bash
corepack enable pnpm
```

### Run the server

1. Run docker compose

   ```bash
   # from services/server/
   sudo docker compose up -d
   ```

   **note:** if you want to remove the containers and flush the data use `sudo docker compose down`

2. Setup your environment variables

   ```bash
   # from services/server
   cp .env.example .env
   ```

   Make changes if needed.

3. Setup database

   1. Setup environment variables to be able to apply the database migrations.

      ```bash
          # from packages/models/
          cp .env.example .env
      ```

   2. Apply the migrations by running `pnpm migrate up` from `packages/models/`
   3. To undo the migrations run `pnpm migrate down`

Verify pnpm installation by running `pnpm -v`. You should see no errors.

#### Docker

Follow the instractions on how to install [Docker on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) (recommended but feel free to use any linux distro)

## LiteSpace Packages

As LiteSpace is a monorepo and a large-scale project, organizing its logic is essential to maintain scalability and avoid complexity. To achieve this, we use **packages**, which group related logic for specific purposes. All packages are located under `/packages/*`.

### **Packages Overview**

| Package  | Purpose                                                              |
| -------- | -------------------------------------------------------------------- |
| assets   | Contains all SVGs used across the project.                           |
| atlas    | Centralized API SDK using `axios` to send requests to the backend.   |
| auth     | Authentication management library.                                   |
| emails   | Logic for sending emails via `nodemailer` and email templates.       |
| headless | Custom React hooks for shared functionality.                         |
| kafka    | Inter-service communication logic for backend services using kafka.  |
| models   | Database models and interaction logic with the database.             |
| radio    | Implementation of WhatsApp and Telegram clients for notifications.   |
| types    | Centralized location for TypeScript types.                           |
| ui       | Reusable UI components with Storybook integration for documentation. |
| utils    | Shared utility functions and logic.                                  |

### **Creating a New Package**

To create a new package, follow these steps:

1. **Initialize the Package**:

   - Run `pnpm init` in the package folder to generate a `package.json`.
   - Add the package to the root `package.json` workspace configuration ([example](https://github.com/litespace-org/litespace/blob/master/package.json#L50-L70)) and include it in the [`build:pkgs`](https://github.com/litespace-org/litespace/blob/master/package.json#L8) script.

2. **Install Dependencies**:

   - Be cautious when installing dependencies like `typescript`, `dayjs`, or `zod`. Copy their versions from existing packages to ensure consistency across the monorepo.

3. **Configure Scripts**:

   - Include the following scripts in the `package.json`:
     ```json
     "scripts": {
       "build": "...",
       "check": "...",
       "clean": "...",
       "watch": "...",
       "prepare": "...",
       "test": "..."
     }
     ```
     If a script is unused, it can remain empty (e.g., `"test": "exit 1"`).

4. **Set Up TypeScript**:

   - Create a `tsconfig.json` file. You may need multiple configurations for different environments (e.g., ESM for web, CJS for Node.js) [(example)](https://github.com/litespace-org/litespace/blob/master/packages/utils/tsconfig.esm.json)
   - Use `typescript-transform-paths` to enable absolute imports [(example ts file)](https://github.com/litespace-org/litespace/blob/d03198be2b5bb281f2be15d8bb463a5dd6169f89/packages/utils/tsconfig.json#L1-L25).

5. **Test Your Setup**:
   - Verify that your package builds correctly and integrates with the rest of the monorepo.

> **Note**: Always ensure dependency versions match across packages to avoid compatibility issues.

## Port Map

| Process              | Location           | Port |
| -------------------- | ------------------ | ---- |
| Web interface (vite) | apps/web           | 3000 |
| Dashboard (vite)     | apps/dashboard     | 3001 |
| Web storybook (vite) | apps/web           | 3002 |
| UI storybook (vite)  | packages/ui        | 3003 |
| Landing (next)       | apps/landing       | 3004 |
| Emails               | packages/emails    | 3005 |
| Docmost              | System             | 3006 |
| API server           | services/server    | 4000 |
| Peer server          | services/server    | 4001 |
| Messenger            | services/messenger | 4002 |
| Deployer             | services/deployer  | 4003 |
| Echo                 | services/echo      | 4004 |
| Studio               | services/studio    | 4005 |
| Kafka UI             | System             | 4006 |
| Lens                 | services/lens      | 4007 |
| Jobs                 | services/jobs      | N/A  |
| PostgreSQL           | System             | 5432 |
| Redis                | System             | 6379 |
| Kafka                | System             | 9092 |

## Payment

- [Fawry docs](https://developer.fawrystaging.com/docs-home)
- [Fawry POS emulator](https://developer.fawrystaging.com/public/pay-order/index.php)
- [Fawry staging login](https://atfawry.fawrystaging.com/be-login/auth/login)

## LiveKit

We are using [livekit](https://livekit.io/) as our real-time media server. Make sure to install [likevit-server](https://docs.livekit.io/home/self-hosting/local/) and the [livekit-cli](https://docs.livekit.io/home/cli/cli-setup/).

## Important values

- "LiteSpace Dev Updates" Telegram channel id: -4520756689
- "LiteSpace Prod Updates" Telegram channel id: -4808826370
