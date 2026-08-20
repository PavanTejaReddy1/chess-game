# Chess Game

**Live demo: [chess-game-ashy-ten.vercel.app](https://chess-game-ashy-ten.vercel.app/)**

A real-time multiplayer chess web application where players can register, create game rooms, play against each other with a live clock, chat during games, and track their stats on a global leaderboard.

## Features

- **Multiplayer rooms** — create a room and share a 6-character code for your opponent to join
- **Guest play** — jump straight into a game without an account; guests get a random UUID identity stored locally
- **Live chess** — server-side move validation via `chess.js`; the board syncs in real time over Socket.IO
- **5-minute clock** — server-authoritative countdown timer with smooth client-side display
- **In-game chat** — players can message each other during the game (last 100 messages kept per room)
- **Elo rating** — standard Elo formula (K=32) recalculates both players' ratings after every ranked game
- **Leaderboard** — top 50 players ranked by wins, with your own row highlighted
- **Profile page** — view your rating, win/loss/draw record, streaks, and update your avatar (uploaded to Cloudinary)
- **JWT auth** — access tokens (15 min) and refresh tokens (7 days) stored as HttpOnly cookies, with automatic silent refresh

## Tech Stack

### Frontend

| | |
|---|---|
| Framework | React 19 |
| Build | Vite 7 |
| Routing | React Router DOM v7 |
| State | Redux Toolkit + React Redux |
| HTTP | Axios (with auto-refresh interceptor) |
| Real-time | Socket.IO client v4 |
| Chess UI | `@gustavotoyota/react-chessboard` |
| Chess logic | `chess.js` v1 |
| Styling | Tailwind CSS v4 |
| Notifications | react-toastify + notistack |

### Backend

| | |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 9 |
| Real-time | Socket.IO v4 |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` |
| File uploads | Multer + Cloudinary |
| Chess logic | `chess.js` v1 (server-side validation) |

## Project Structure

```
chess-game/
├── backend/
│   ├── controllers/
│   │   ├── user.controller.js      # Auth: login, signup, logout, refresh, fetchMe
│   │   └── leaderboard.controller.js
│   ├── middlewares/
│   │   └── verifyAuth.js           # JWT cookie verification
│   ├── models/
│   │   ├── user.model.js           # User schema with Elo stats
│   │   └── game.model.js           # Completed game records
│   ├── routes/
│   │   ├── auth.router.js
│   │   └── leaderboard.routes.js
│   ├── utilities/
│   │   └── upload.js               # Multer + Cloudinary config
│   └── index.js                    # Express app, Socket.IO server, all socket event handlers
└── frontend/
    └── src/
        ├── api/client.js           # Axios instance with refresh interceptor
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoutes.jsx
        ├── pages/
        │   ├── Home.jsx            # Landing page
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Guest.jsx           # Guest identity setup
        │   ├── Lobby.jsx           # Create or join a room
        │   ├── Room.jsx            # Live chess game
        │   ├── Leaderboard.jsx
        │   └── Profile.jsx
        ├── slices/authSlice.js     # Redux auth state + async thunks
        ├── socket.js               # Socket.IO client singleton
        └── store.js                # Redux store
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Cloudinary account (for avatar uploads)

### Environment Variables

Create `backend/.env`:

```env
PORT=4000
MONGODB_URL=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
```

### Running Locally

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:4000`.

## API Routes

### Auth — `/api/v1/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/login` | Login with email + password; sets HttpOnly cookies |
| `POST` | `/signup` | Register a new account; sets HttpOnly cookies |
| `POST` | `/logout` | Clears auth cookies |
| `POST` | `/refresh` | Issues a new access token from the refresh cookie |
| `GET` | `/me` | Returns the current authenticated user |

### Leaderboard — `/api/v1/leaderboard`

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Top 50 users sorted by wins (auth required) |

### Upload — `/api/v1/upload`

| Method | Path | Description |
|---|---|---|
| `POST` | `/` | Upload avatar image to Cloudinary (auth required) |

## Socket Events

### Client → Server

| Event | Args | Description |
|---|---|---|
| `room:create` | — | Create a new room and get back a room code |
| `room:join` | `roomCode` | Join an existing room |
| `room:leave` | `roomCode` | Leave a room |
| `game:state` | `roomCode` | Fetch current FEN + clock state |
| `game:move` | `roomCode, from, to, promotion` | Submit a chess move |
| `chat:send` | `roomCode, text` | Send a chat message |
| `chat:history` | `roomCode` | Fetch message history |

### Server → Client

| Event | Payload | Trigger |
|---|---|---|
| `room:presence` | Room state | Player joins, leaves, or room is created |
| `game:update` | `{ fen, turn, whiteId, blackId, lastMove }` | After each valid move |
| `clock:update` | `{ whiteMs, blackMs, active, roomCode }` | After each move |
| `game:over` | `{ result, reason, winnerColor, winnerName }` | Checkmate, draw, or timeout |
| `chat:message` | `{ id, userId, name, text, createdAt }` | After a chat message is sent |

## Deployment

The frontend is configured for **Vercel** — `vercel.json` includes a catch-all SPA rewrite so React Router handles all routes client-side.

The backend is stateful (in-memory room state + persistent Socket.IO connections) so it needs a Node-compatible host that keeps the process alive, such as **Render** or **Railway**. Set `NODE_ENV=production` and all the environment variables listed above.

> **Note:** Active game rooms are stored in memory. A server restart will clear all ongoing games.

## Known Limitations

- Rooms are in-memory only — no reconnection recovery if the server restarts mid-game
- Pawn promotion always defaults to queen
- Socket.IO is configured for long-polling only (no WebSocket upgrade)
- The resign feature is modeled in the database but not yet implemented in the UI
