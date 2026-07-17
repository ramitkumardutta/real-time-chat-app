# Real-Time Chat Application

A full-stack chat application built with Node.js, Express, Socket.IO, MongoDB, and React.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## Features

- **Real-time chat** — low-latency messaging powered by Socket.IO
- **JWT authentication** — secure login and protected backend routes
- **Online/offline presence** — live status updates for connected users
- **Status visibility control** — set online visibility for 1 hour, 5 hours, or default 24 hours; status auto-disables after the selected duration and remains visible only to friends in the selected time zone
- **Conversation history** — message persistence in MongoDB
- **Robust connection handling** — supports duplicate socket reconnections
- **React frontend** — modern UI with Vite and component-based state management

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Backend | Express.js |
| Database | MongoDB |
| Real-time | Socket.IO |
| Auth | JWT |
| Frontend | React / Vite |

---

## Project Structure

```
chat_app/
├── backend/
│   ├── package.json
│   └── src/
│       ├── controllers/
│       ├── lib/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── index.js
├── frontened/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── constants/
│       ├── lib/
│       ├── pages/
│       └── store/
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or newer
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
git clone https://github.com/ramitkumardutta/real-time-chat-app.git
cd chat_app
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd ../frontened
npm install
npm run dev
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/verify-email` | Verify email before password reset |
| POST | `/api/auth/reset-password` | Reset password with hashed value |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/:id` | Get conversation history |
| POST | `/api/messages/send/:id` | Send a message |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users for the sidebar |

---

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `sendMessage` | Client → Server | Send a new message |
| `newMessage` | Server → Client | Receive a new message |
| `getOnlineUsers` | Server → Client | Broadcast the online user list |

---

## Password Reset Flow

- **Frontend (`frontened/src/pages/Forget_PasswordPage.jsx`)**
  - User enters their email and clicks **Verify Email**.
  - The app POSTs to `/api/auth/verify-email`.
  - If the email is valid, the UI reveals the password reset field.
  - The user submits a new password to `/api/auth/reset-password`.
  - On success, the app confirms the reset and redirects to login.

- **Backend (`backend/src/controllers/auth.controller.js`)**
  - `verifyEmail` checks whether the email exists in the database.
  - `resetPassword` hashes the new password with bcrypt and stores the updated password.

- **Notes**
  - Passwords are hashed server-side before storage.
  - The current reset flow uses simple email verification, not a token-based email reset. For production, add time-limited reset tokens and email delivery.

---

## Design Notes

- **Socket.IO real-time communication** — keeps clients and server synchronized without polling.
- **JWT stateless authentication** — avoids session storage and simplifies scaling.
- **MongoDB persistence** — stores users and messages for chat history.
- **Connection resilience** — handles duplicate or interrupted socket sessions cleanly.

---

## Author

**Ramit Kumar Dutta**  
[LinkedIn](https://linkedin.com/in/ramitkumardutta) • [GitHub](https://github.com/ramitkumardutta)
