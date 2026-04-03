const express = require('express')
const cors = require("cors");
require("dotenv").config();

require("./config/db");
const app = express()

app.use(cors());
app.use(express.json())

// Routes
const feedbackRoutes = require("./routes/feedbackRoutes");
const constituencyRoutes = require("./routes/constituencyRoutes");
const workerRoutes = require("./routes/workerRoutes");
const taskRoutes = require("./routes/taskRoutes");

app.use("/api/feedback", feedbackRoutes);
app.use("/api/constituencies", constituencyRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send({message: "Digital Democracy Backend is running"})
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});