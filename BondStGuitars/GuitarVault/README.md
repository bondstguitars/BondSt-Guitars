# GuitarVault

GuitarVault is a modern full‑stack web application for buying and selling guitars. It features a responsive React user interface backed by a Node/Express API and a PostgreSQL database. Guitars can be browsed, filtered and managed with rich metadata and high‑quality images stored in Google Cloud Storage. The project was originally built for the Replit platform but has been refactored to run on any Node environment and includes an updated visual theme inspired by New York City's music scene.

## Features

- **React + TypeScript UI** powered by Vite for a fast development experience.  A custom design system built with Tailwind CSS, Radix UI and shadcn/ui provides accessible, polished components.  Real‑time search and filtering are handled via TanStack Query (React Query).
- **Express API** written in TypeScript using ES modules.  All data access goes through Drizzle ORM for type‑safe SQL queries against a PostgreSQL database (configured for Neon Serverless by default).
- **Image uploads** via Uppy with storage in Google Cloud Storage.  Signed URLs are generated server‑side using the official `@google-cloud/storage` client.  Access control lists (ACLs) allow you to mark uploads as public or private.
- **Session management** via express‑session and connect‑pg‑simple to persist user state in the database.
- **NYC Rock Scene theme** replacing the original warm brown/orange palette.  A new set of CSS variables defines dark backgrounds, high contrast text and bold red and purple accents reminiscent of neon lights and club posters.
- **Production‑ready** configuration with optional security and performance middleware (Helmet for security headers and compression for gzip responses).  All sensitive credentials are provided via environment variables.

## Getting Started

### Prerequisites

1. **Node.js** 18 or later
2. **PostgreSQL database** (the schema is defined in `shared/schema.ts`).  You can use [Neon](https://neon.tech/) or any other Postgres provider.  Set the connection string via `DATABASE_URL`.
3. **Google Cloud project and service account** with access to Cloud Storage.  Follow these steps:
   - Create a new Cloud Storage bucket for storing guitar images.  Decide on two directories: one for public objects (`PUBLIC_OBJECT_SEARCH_PATHS`) and one for private uploads (`PRIVATE_OBJECT_DIR`).  These can be the same bucket or separate buckets/directories.
   - Create a service account with the **Storage Object Admin** role and download its JSON key.  Save the key file somewhere safe and point the `GOOGLE_APPLICATION_CREDENTIALS` environment variable at it when starting the server.
   - Optionally set `GOOGLE_CLOUD_PROJECT` or `GCLOUD_PROJECT` to your Google Cloud project ID.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your‑username/guitar-vault.git
cd guitar-vault/GuitarVault
npm install
```

### Environment Variables

The server uses several environment variables.  Create a `.env` file in the `GuitarVault` directory (or set these variables in your deployment platform):

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (e.g. from Neon). |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Comma‑separated list of directories in your Cloud Storage bucket that should be publicly searchable for images.  Example: `/my‑bucket/public`. |
| `PRIVATE_OBJECT_DIR` | Directory in your Cloud Storage bucket where uploads should be stored privately.  Example: `/my‑bucket/private`. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Absolute path to your service account JSON key for Google Cloud Storage. |
| `GOOGLE_CLOUD_PROJECT` or `GCLOUD_PROJECT` | (Optional) Your Google Cloud project ID. |
| `PORT` | Port for the Express server (defaults to `5000`). |
| `SESSION_SECRET` | A secret string for signing session cookies. |

### Development

To run the app locally in development mode with hot reloading for both client and server:

```bash
NODE_ENV=development npm run dev
```

In development the Vite dev server is used for the React client and the Express API runs concurrently.  Tailwind CSS will rebuild styles on the fly.  Open your browser at `http://localhost:5173` to view the site.

### Build & Production

To create a production build and start the server:

```bash
npm run build
NODE_ENV=production npm start
```

The build script will compile the client into static files and bundle the Express server into the `dist` directory.  In production the same Express process serves both the API and the static client on the port specified by `PORT`.

### Deployment

You can deploy GuitarVault on any platform that supports Node.js, such as Railway, Render, Fly.io or DigitalOcean App Platform.  The process generally looks like this:

1. **Provision your database** and obtain a connection string (`DATABASE_URL`).
2. **Create a Cloud Storage bucket** and service account as described above.  Set `PUBLIC_OBJECT_SEARCH_PATHS` and `PRIVATE_OBJECT_DIR` accordingly.
3. **Set environment variables** for the platform: `DATABASE_URL`, `GOOGLE_APPLICATION_CREDENTIALS` (either by mounting the JSON file or embedding the credentials in the variable), `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`, `PORT`, `SESSION_SECRET` and optionally `GOOGLE_CLOUD_PROJECT`.
4. **Deploy from GitHub** or a tarball.  Many platforms can automatically build and start the app using the `npm run build` and `npm start` scripts.
5. **Add a custom domain** and configure HTTPS through your hosting provider if desired.

### Customising the Theme

The colour palette is defined via CSS variables in `client/src/index.css`.  To tweak the palette, edit the values under the overridden `:root` and `.dark` sections near the bottom of that file.  New definitions override the original warm palette using CSS cascade rules, so you can adjust colours without deleting the original variables.

### Testing

Unit tests or integration tests are not included, but you can add your own using your preferred framework (Jest, Vitest, etc.).  Ensure that critical server functions (database queries, storage uploads) are covered before deploying to production.

## License

This project is open‑sourced under the MIT License.  See the `LICENSE` file for details.