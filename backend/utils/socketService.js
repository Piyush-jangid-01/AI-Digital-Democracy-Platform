const logger = require("./logger");

let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on("join_admin", () => {
      socket.join("admin_room");
      logger.info(`Admin joined: ${socket.id}`);
    });

    socket.on("join_constituency", (constituency_id) => {
      socket.join(`constituency_${constituency_id}`);
      logger.info(`Client joined constituency ${constituency_id}`);
    });

    socket.on("disconnect", () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  logger.info("Socket.io initialized");
  return io;
};

const emitNewFeedback = (feedback) => {
  if (io) {
    io.to("admin_room").emit("new_feedback", {
      type: "NEW_FEEDBACK",
      data: feedback,
      timestamp: new Date()
    });
  }
};

const emitNegativeFeedback = (feedback) => {
  if (io) {
    io.to("admin_room").emit("negative_feedback_alert", {
      type: "NEGATIVE_ALERT",
      data: feedback,
      timestamp: new Date()
    });
  }
};

const emitEscalatedIssue = (issue) => {
  if (io) {
    io.to("admin_room").emit("escalated_issue", {
      type: "ESCALATION_ALERT",
      data: issue,
      timestamp: new Date()
    });
  }
};

const emitTaskUpdate = (task) => {
  if (io) {
    io.to("admin_room").emit("task_updated", {
      type: "TASK_UPDATE",
      data: task,
      timestamp: new Date()
    });
  }
};

const emitAnalyticsUpdate = (analytics) => {
  if (io) {
    io.to("admin_room").emit("analytics_updated", {
      type: "ANALYTICS_UPDATE",
      data: analytics,
      timestamp: new Date()
    });
  }
};

module.exports = {
  initSocket,
  emitNewFeedback,
  emitNegativeFeedback,
  emitEscalatedIssue,
  emitTaskUpdate,
  emitAnalyticsUpdate
};