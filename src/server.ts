import { createApp } from "./app";
import { buildTrailNetwork } from "./graph/trail-network";

/**
 * Point d'entrée du backend QueenBee (routing d'urgence).
 *
 * En production, le maillage de pistes serait chargé depuis la base
 * du site ; pour ce TP on utilise le réseau de test documenté.
 */
const PORT = Number(process.env.PORT ?? 3000);

const graph = buildTrailNetwork();
const app = createApp(graph);

app.listen(PORT, () => {
  console.log(
    `QueenBee routing API — http://localhost:${PORT}` +
      ` (${graph.nodeCount} sommets, ${graph.edgeCount} pistes)`,
  );
});
