require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");


const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");
const { initSocket } = require("./socket");
const requestRoutes = require("./routes/request.routes");
const contactRoutes = require("./routes/contact.routes");

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

connectDB();
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/contacts", contactRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend running 🚀" });
});

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
