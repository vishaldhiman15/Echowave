# EchoWave

EchoWave is a Spotify-inspired music app with original branding and layout.

## Stack
- Backend: Node.js, Express, MongoDB, Cloudinary
- Frontend: HTML, Tailwind (CDN), vanilla JS

## Structure
- server: API and static hosting
- web: static frontend

## Setup
1. cd server
2. npm install
3. cp .env.example .env
4. npm run seed
5. npm run dev

Open http://localhost:4000

## Notes
- If you see `EADDRINUSE` on port `4000`, another server is already running. Stop it (Ctrl+C in the other terminal) or run on a different port, e.g. `PORT=4001 npm run dev`.
- Uploads: if Cloudinary env vars are not set, `/api/upload/image` and `/api/upload/audio` will store files locally under `server/uploads/` and serve them from `/uploads/...`.

## Demo account
After seeding, you can log in with:
- Email: user@echowave.local
- Password: password123

## API
- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (Bearer token)
- GET /api/artists
- GET /api/albums
- GET /api/tracks
- GET /api/tracks/mine (Bearer token)
- GET /api/tracks/liked (Bearer token)
- POST /api/tracks (Bearer token)
- POST /api/tracks/:id/like (Bearer token)
- DELETE /api/tracks/:id/like (Bearer token)
- GET /api/playlists
- GET /api/search?q=QUERY
- POST /api/upload/image (Bearer token)
- POST /api/upload/audio (Bearer token)

## Deployment
When deploying to a hosting service like Railway or Heroku, you must set the following environment variables in the service's configuration:
- `MONGODB_URI`: The connection string for your MongoDB database.
- `JWT_SECRET`: A long, random string used for signing authentication tokens.
- `CLOUDINARY_CLOUD_NAME` (optional): Your Cloudinary cloud name.
- `CLOUDINARY_API_KEY` (optional): Your Cloudinary API key.
- `CLOUDINARY_API_SECRET` (optional): Your Cloudinary API secret.

If the Cloudinary variables are not provided, the application will fall back to storing uploads on the local filesystem, which may not be suitable for all hosting environments.

