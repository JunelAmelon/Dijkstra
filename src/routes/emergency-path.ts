import { Request, Response, Router } from "express";
import { performance } from "node:perf_hooks";
import { Graph } from "../graph/graph";
import { dijkstra } from "../algorithms/dijkstra";
import { dijkstraNaive } from "../algorithms/dijkstra-naive";

/**
 * Routeur de l'endpoint de routage d'urgence (UC-C01).
 *
 * Le graphe est INJECTÉ à la construction du routeur (inversion de
 * dépendance) : le handler ne sait pas d'où viennent les données —
 * réseau de test, base de données, fichier — ce qui le rend testable
 * et remplaçable sans modification.
 */

/** Registre des implémentations disponibles (benchmark via l'API). */
const ALGORITHMS = {
  heap: dijkstra,
  naive: dijkstraNaive,
} as const;

type AlgorithmName = keyof typeof ALGORITHMS;

/** Corps de requête attendu — tous les champs revalidés au runtime. */
interface EmergencyPathRequest {
  start?: unknown;
  target?: unknown;
  algorithm?: unknown;
}

/**
 * Construit le routeur Express pour `POST /emergency-path`.
 * @param graph le maillage de pistes du site sur lequel router.
 */
export function createEmergencyPathRouter(graph: Graph): Router {
  const router = Router();

  router.post("/emergency-path", (req: Request, res: Response) => {
    const body = (req.body ?? {}) as EmergencyPathRequest;
    const { start, target, algorithm = "heap" } = body;

    // --- Validation des entrées : 400 si la requête est mal formée ---
    if (typeof start !== "string" || start.length === 0) {
      return res
        .status(400)
        .json({ error: `"start" est requis (chaîne non vide)` });
    }
    if (typeof target !== "string" || target.length === 0) {
      return res
        .status(400)
        .json({ error: `"target" est requis (chaîne non vide)` });
    }
    if (algorithm !== "heap" && algorithm !== "naive") {
      return res
        .status(400)
        .json({ error: `"algorithm" doit valoir "heap" ou "naive"` });
    }

    // --- Calcul : seul l'algorithme est chronométré (pas le JSON/HTTP) ---
    try {
      const t0 = performance.now();
      const result = ALGORITHMS[algorithm as AlgorithmName](
        graph,
        start,
        target,
      );
      const computeTimeMs = Number((performance.now() - t0).toFixed(3));

      // Cible inaccessible : la requête est valide, le résultat est
      // "aucun itinéraire" — on le signale explicitement dans le JSON.
      if (result === null) {
        return res.status(200).json({
          start,
          target,
          reachable: false,
          path: [],
          totalCost: null,
          unit: "meters",
          algorithm,
          computeTimeMs,
        });
      }

      return res.status(200).json({
        start,
        target,
        reachable: true,
        path: result.path,
        totalCost: result.totalCost,
        unit: "meters",
        algorithm,
        computeTimeMs,
      });
    } catch (error) {
      // Sommet inconnu dans le graphe : la ressource demandée n'existe pas.
      return res.status(404).json({ error: (error as Error).message });
    }
  });

  return router;
}
