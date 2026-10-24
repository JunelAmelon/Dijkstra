import { Graph } from "./graph";

/**
 * Générateur de graphes connexes pseudo-aléatoires pour le benchmark.
 *
 * La graine (seed) rend la génération déterministe : les mêmes
 * paramètres produisent toujours le même graphe — indispensable pour
 * que les mesures du rapport soient reproductibles.
 */

/** PRNG mulberry32 : petit générateur pseudo-aléatoire déterministe. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Construit un graphe connexe à `nodeCount` sommets (N0..N{n-1}) de
 * degré moyen `avgDegree`, avec des poids entre 10 et 500 (mètres).
 *
 * Méthode : un arbre couvrant aléatoire garantit d'abord la connexité,
 * puis des arêtes supplémentaires sont tirées jusqu'au degré visé —
 * les doublons sont écartés pour rester sur un graphe simple.
 */
export function generateConnectedGraph(
  nodeCount: number,
  avgDegree: number,
  seed: number,
): Graph {
  const rand = mulberry32(seed);
  const graph = new Graph();
  const usedEdges = new Set<string>();

  // Clé canonique d'une arête non orientée (évite les doublons).
  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const weight = () => 10 + Math.floor(rand() * 490);

  for (let i = 0; i < nodeCount; i++) {
    graph.addNode(`N${i}`);
  }

  // 1) Arbre couvrant : chaque sommet se rattache à un précédent,
  //    ce qui garantit que le graphe est connexe.
  for (let i = 1; i < nodeCount; i++) {
    const j = Math.floor(rand() * i);
    graph.addEdge(`N${i}`, `N${j}`, weight());
    usedEdges.add(edgeKey(`N${i}`, `N${j}`));
  }

  // 2) Arêtes supplémentaires pour atteindre le degré moyen visé.
  const targetEdges = Math.max(
    nodeCount - 1,
    Math.floor((nodeCount * avgDegree) / 2),
  );
  while (graph.edgeCount < targetEdges) {
    const a = Math.floor(rand() * nodeCount);
    const b = Math.floor(rand() * nodeCount);
    if (a === b) continue;
    const key = edgeKey(`N${a}`, `N${b}`);
    if (usedEdges.has(key)) continue;
    usedEdges.add(key);
    graph.addEdge(`N${a}`, `N${b}`, weight());
  }

  return graph;
}
