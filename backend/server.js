const express = require('express')
const cors = require("cors");
const http = require("http");
require("dotenv").config();

require("./config/db");
const app = express()
const server = http.createServer(app);

const { initSocket } = require("./utils/socketService");
initSocket(server);

app.use(cors());
app.use(express.json())

const { verifyToken } = require("./middleware/authMiddleware");
const { generalLimiter, authLimiter, feedbackLimiter } = require("./middleware/rateLimitMiddleware");
const { errorHandler, requestLogger } = require("./middleware/errorMiddleware");
const { startScheduler } = require("./utils/scheduler");

app.use(requestLogger);
app.use(generalLimiter);

const feedbackRoutes = require("./routes/feedbackRoutes");
const constituencyRoutes = require("./routes/constituencyRoutes");
const workerRoutes = require("./routes/workerRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const voterRoutes = require("./routes/voterRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const escalationRoutes = require("./routes/escalationRoutes");
const segmentationRoutes = require("./routes/segmentationRoutes");
const predictiveRoutes = require("./routes/predictiveRoutes");
const socialMediaRoutes = require("./routes/socialMediaRoutes");

app.use("/api/feedback", feedbackLimiter, feedbackRoutes);
app.use("/api/constituencies", verifyToken, constituencyRoutes);
app.use("/api/workers", verifyToken, workerRoutes);
app.use("/api/tasks", verifyToken, taskRoutes);
app.use("/api/users/login", authLimiter);
app.use("/api/users", userRoutes);
app.use("/api/voters", verifyToken, voterRoutes);
app.use("/api/surveys", verifyToken, surveyRoutes);
app.use("/api/analytics", verifyToken, analyticsRoutes);
app.use("/api/escalation", escalationRoutes);
app.use("/api/segmentation", segmentationRoutes);
app.use("/api/predictive", predictiveRoutes);
app.use("/api/social", socialMediaRoutes);

app.use(errorHandler);

startScheduler();

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send({ message: "Digital Democracy Backend is running" })
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});