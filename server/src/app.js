const express = require("express");
const cors = require("cors");
const db = require("./db");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Rota independente de DB
  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      service: "example-server",
      now: new Date().toISOString()
    });
  });

  // Rota dependente de DB (exemplo: SELECT NOW())
  app.get("/api/db-time", async (req, res) => {
    try {
      const result = await db.query("SELECT NOW() as now");
      res.json({ ok: true, dbTime: result.rows[0].now });
    } catch (err) {
      res.status(500).json({
        ok: false,
        error: "DB_ERROR",
        message: err.message
      });
    }
  });

  return app;
}

module.exports = { createApp };
