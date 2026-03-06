# 🌍 TripSync – Real-Time Collaborative Travel Checklist

TripSync is a production-ready, real-time synchronized travel planning system. It is a full-stack Next.js and Node.js application built to help groups seamlessly pack and prepare for trips with instant socket-based updates.

## 🚀 Features

- **Real-Time Sync**: Socket.io powered instant updates across all active users.
- **Trip Creation & Joining**: Auto-generated 6-character short codes for easy sharing.
- **Collaborative Dashboard**: See what everyone is doing instantly.
- **Item Assignment & Categories**: Organize your packing list smoothly.
- **Live Progress Updates**: Visual progress bar tracking packing status.

## 🏗 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Zustand (Store), Framer Motion (Animations), Tailwind CSS, Shadcn UI (Radix Primitives).
- **Backend**: Node.js, Express.js, Socket.io.
- **Database**: MongoDB (Mongoose ORM).

## 📂 Project Structure

- `/client` - Next.js frontend application.
- `/server` - Node.js Express & Socket.io backend.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas Cluster URL)

### Environment Variables

**Backend (`/server/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/tripsync
CLIENT_URL=http://localhost:3000
```

**Frontend (`/client/.env.local` optional):**
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:5000
```

### Installation

1. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🌐 Usage

1. **Start down the runway**: Head over to `http://localhost:3000`.
2. **Create a Trip**: Generate a brand new Trip ID.
3. **Share & Join**: Send the Trip ID to your friends. They can join directly from the Join page.
4. **Collaborate**: Start adding and checking off items!

## 🤝 Contributing

Contributions, issues and feature requests are welcome!
