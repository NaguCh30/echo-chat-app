# Echo 

Echo is a real-time one-to-one chat application built using the MERN stack.
It focuses on clean UI, real-time communication, and scalable backend architecture.

---

## Live Demo

Frontend: https://echo-chat.vercel.app  
Backend: https://echo-backend-025u.onrender.com

---

## Features

- User authentication using JWT
- Add contacts using email
- Real-time one-to-one messaging (Socket.IO)
- Message delivery & seen indicators
- Edit contact nickname
- Block / unblock contacts
- Clear chat history
- Delete contact (both sides)
- Mobile-first responsive UI
- Keyboard-safe chat layout (mobile optimized)

---

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- Socket.IO Client
- CSS (custom, mobile-first)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Socket.IO
- JWT Authentication

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## Project Structure
echo-chat-app/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket.js
│   ├── index.js
│   ├── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vercel.json
│   ├── package.json
│
├── .gitignore


---

## Environment Variables

### Backend (.env)
PORT=10000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

### Frontend (.env)
VITE_API_URL=your_backend_url
VITE_SOCKET_URL=your_backend_url

### Run Locally
### Backend
cd backend
npm install
npm run dev
### Frontend
cd frontend
npm install
npm run dev

### Future Enhancements
- Media & file sharing
- Voice messages
- Online / typing indicators
- End-to-end encryption
- Forgot password flow

### Author
- Developed by Nagu Chavala
- This project was built as a hands-on full-stack learning experience.
