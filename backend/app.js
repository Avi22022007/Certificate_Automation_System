const express = require("express");
const cors = require("cors");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "certificate-automation-backend" });
});

app.use("/api", applicationRoutes);

module.exports = app;