import express, { Express } from "express";
import { Graph } from "./graph/graph";
import { createEmergencyPathRouter } from "./routes/emergency-path";

/**
 * Fabrique l'application Express.
 *
 * Séparée de `server.ts` pour que l'app soit testable sans ouvrir
 * de port réseau, et pour que le graphe soit injecté (le serveur
 * décide quelle topologie utiliser, pas l'app).
 */
export function createApp(graph: Graph): Express {
  const app = express();

  app.use(express.json());

  // Sonde de santé — backend minimal d'exploitation (CDC section 9.1).
  app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1/routing", createEmergencyPathRouter(graph));

  return app;
}
