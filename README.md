# LiteSpace

# Project Strucutre

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

## Run the server

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

### Docker

Follow the instractions on how to install [Docker on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) (recommended but feel free to use any linux distro)

# Port Map

| Process              | Location           | Port |
| -------------------- | ------------------ | ---- |
| Web interface (vite) | apps/web           | 3000 |
| Dashboard (vite)     | apps/dashboard     | 3001 |
| Web storybook (vite) | apps/web           | 3002 |
| UI storybook (vite)  | packages/ui        | 3003 |
| Landing (next)       | apps/landing       | 3004 |
| API server           | services/server    | 4000 |
| Peer server          | services/server    | 4001 |
| Messenger            | services/messenger | 4002 |
| PostgreSQL           | System             | 5432 |
| Redis                | System             | 6379 |
