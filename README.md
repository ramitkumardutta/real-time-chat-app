# Real-Time Chat Application

A scalable, full-stack real-time messaging system built with Node.js and Socket.IO, supporting 50+ simultaneous WebSocket connections with zero message loss.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## Features

- **Real-time messaging** — low-latency message delivery using WebSockets (Socket.IO)
- **JWT authentication** — secure login with protected routes
- **Online/offline presence** — live user status indicators
- **Persistent chat history** — messages stored and retrieved from MongoDB
- **Fault-tolerant connections** — handles duplicate connections and network interruptions gracefully
- **Scalable architecture** — supports 50+ concurrent WebSocket connections with zero message loss

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| Real-time | Socket.IO |
| Auth | JWT (JSON Web Tokens) |
| Frontend | React.js |

---

## Project Structure

```
real-time-chat-app/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       └── index.js
├── frontened/
│   └── src/
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ramitkumardutta/real-time-chat-app.git
cd real-time-chat-app
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontened
npm install
npm run dev
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/logout` | Logout user |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:id` | Get conversation history |
| POST | `/api/messages/send/:id` | Send a message |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (for sidebar) |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `sendMessage` | Client → Server | Send a new message |
| `newMessage` | Server → Client | Receive a message |
| `getOnlineUsers` | Server → Client | Broadcast online user list |

---

## Key Design Decisions

- **WebSocket over polling** — chose Socket.IO for persistent, bidirectional connections to minimize latency vs HTTP long-polling
- **JWT stateless auth** — no server-side session storage, scales horizontally without shared session state
- **MongoDB for messages** — flexible document schema handles variable message types; indexed on `conversationId` for fast history retrieval
- **Fault tolerance** — duplicate connection handling prevents ghost users; reconnection logic maintains session continuity on network drops

---

## Author

**Ramit Kumar Dutta**  
[LinkedIn](https://linkedin.com/in/ramitkumardutta) • [GitHub](https://github.com/ramitkumardutta)
