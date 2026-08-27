import express from "express";
import cors from "cors";
import { getEkadashis, getAvailableYears, getNextEkadashi } from "./ekadashiData.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "ekadashi-api" });
  });

  app.get("/api/ekadashis", (req, res) => {
    const year = req.query.year ? Number(req.query.year) : 2026;
    if (!Number.isInteger(year)) {
      return res.status(400).json({ error: "year must be an integer" });
    }
    const ekadashis = getEkadashis(year);
    res.json({
      year,
      availableYears: getAvailableYears(),
      count: ekadashis.length,
      ekadashis
    });
  });

  app.get("/api/ekadashis/next", (_req, res) => {
    const next = getNextEkadashi(new Date());
    if (!next) {
      return res.status(404).json({ error: "No upcoming Ekadashi in dataset" });
    }
    res.json(next);
  });

  return app;
}
