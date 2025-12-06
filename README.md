# IS-Media - Full-Stack Social Media Platform

A complete social media application with real-time chat, posts, stories, user interactions, and friends suggestions built with Node.js backend with raw SQL and React frontend.

## 📱 Features

### **Backend (Node.js/Express)**

-   **Authentication**: JWT-based auth with email verification & password reset
-   **Social Features**: Posts, comments, likes, tags, and stories
-   **Real-time Chat**: WebSocket-based messaging with conversations
-   **User Management**: Friends suggestions, follow/unfollow, blocking, and tagging
-   **Media Handling**: Cloudinary integration for image/video uploads
-   **Email Service**: Nodemailer for notifications and verification

### **Frontend - Social App (React/Vite)**

-   **Feed**: Infinite scroll posts with likes and comments
-   **Stories**: 24-hour temporary stories
-   **Profile**: User profiles with followers/following
-   **Responsive Design**: SCSS styling with dark mode support

### **Frontend - Chat App (React/Vite)**

-   **Real-time Messaging**: Socket.io for instant communication
-   **Conversations**: DM and group chat support
-   **Search**: Find users and conversations
-   **Notifications**: Sound alerts for new messages

## 🏗️ Tech Stack

**Backend**

-   Node.js, Express
-   MySQL2 with raw SQL queries
-   Socket.io for real-time
-   JWT authentication
-   Cloudinary (media storage)
-   Nodemailer (email service)

**Frontend - Social**

-   React 18, Vite
-   SCSS modules
-   Context API (state management)
-   Axios (API calls)

**Frontend - Chat**

-   React 18, Vite
-   Tailwind CSS
-   Zustand (state management)
-   Socket.io client

## 🚀 Quick Start

### **Backend Setup**

```bash
cd IS-Media/backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
# Server runs on http://localhost:5000
```

### **Frontend - Social App**

```bash
cd IS-Media/frontend/social
npm install
npm run dev
# App runs on http://localhost:3000
```

### **Frontend - Chat App**

```bash
cd IS-Media/frontend/chat
npm install
npm run dev
# App runs on http://localhost:4000
```

## ⚙️ Environment Variables

**Backend `.env` file:**

```env
FRONTEND_URL=
MYSQL_HOST=
MYSQL_USER='
MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRES_IN=900
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=86400
OTP_EXPIRES_IN=900
RESET_PASSWORD_EXPIRES_IN=1800
NODEMAILER_USER=
NODEMAILER_PASS=
EMAIL_SENDER=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
DISPOSABLE_EMAIL_CHECKER_API_KEY=
```

## 📸 Screenshots

**Social App**

![Registration Page](https://github.com/thesolom/IS-Media/blob/master/assets/screenshots/Social-Registration.png 'Registration Page')
![Login Page](https://github.com/thesolom/IS-Media/blob/master/assets/screenshots/Social-Login.png 'Login Page')
![Home Page](https://github.com/thesolom/IS-Media/blob/master/assets/screenshots/Social-Home.png 'Home Page')
![Dark Mode Home Page](https://github.com/thesolom/IS-Media/blob/master/assets/screenshots/Social-Dark-Mode.png 'Dark Mode Home Page')
![Post with Comments](https://github.com/thesolom/IS-Media/blob/master/assets/screenshots/Social-Post-with-Comments.png 'Post with Comments')
![Profile Page](https://github.com/thesolom/IS-Media/blob/master/assets/screenshots/Social-Profile.png 'Profile Page')
![Updating Profile](https://github.com/thesolom/IS-Media/blob/master/assets/screenshots/Social-Updating-Profile.png 'Updating Profile')

**Chat App**

![Chat App](https://github.com/TheSolom/IS-Media/blob/master/assets/screenshots/Chat-app.png)

## 📁 Project Structure

```
IS-Media/
├── backend/           # Node.js/Express API
│   ├── src/
│   │   ├── configs/       # Configuration files
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database schemas
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── Validations/   # Input validation schemas
│   │   ├── Templates/     # Email templates
│   │   ├── middlewares/   # Auth & error handling
│   │   └── utils/         # Helper functions
│   ├── app.js             # App entry point
│   ├── server.js          # Server entry point
│   └── socket.js          # WebSocket server
├── frontend/
│   ├── chat/              # Real-time chat app
│   │   ├── src/components/
│   │   ├── src/hooks/     # Custom React hooks
│   │   └── src/zustand/   # State management
│   └── social/            # Social media app
│       ├── src/components/
│       ├── src/pages/     # React pages
│       └── src/context/   # Context providers
```
