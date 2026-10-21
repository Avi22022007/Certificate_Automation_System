const express = require("express");
const cors = require("cors");

const applicationRoutes = require("./routes/applicationRoutes");
const officerRoutes = require("./routes/officerRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "certificate-automation-backend"
  });
});

app.use("/api", applicationRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;