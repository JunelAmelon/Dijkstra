import { Graph } from "../graph/graph";
import {
  assertEndpointsExist,
  reconstructPath,
  RouteResult,
} from "./route-utils";

/**
 * Dijkstra — version NAÏVE sans file de priorité : O(|V|²).
 *
 * Identique à la version avec tas binaire, sauf que le sommet de
 * distance minimale est trouvé par BALAYAGE LINÉAIRE de tous les
 * sommets non encore visités, à chaque itération :
 *   - |V| itérations × O(|V|) pour trouver le minimum = O(|V|²)
 *   - relaxation des arêtes = O(|E|) au total
 *   - total : O(|V|² + |E|) = O(|V|²) sur graphe connexe
 *
 * Cette implémentation sert de référence pour le benchmark exigé par
 * le sujet : sur des graphes denses ou de grande taille, l'écart avec
 * la version tas O((|V|+|E|) log |V|) devient flagrant.
 */
export function dijkstraNaive(
  graph: Graph,
  start: string,
  target: string,
): RouteResult | null {
  assertEndpointsExist(graph, start, target);

  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  const nodes = graph.nodes();

  for (const node of nodes) {
    dist.set(node, Infinity);
  }
  dist.set(start, 0);

  for (let i = 0; i < nodes.length; i++) {
    // Extraction du minimum par balayage : O(|V|) — c'est ici que la
    // version naïve perd face au tas binaire qui fait la même chose
    // en O(log |V|).
    let current: string | null = null;
    let best = Infinity;
    for (const node of nodes) {
      if (!visited.has(node) && dist.get(node)! < best) {
        best = dist.get(node)!;
        current = node;
      }
    }

    // Tous les sommets restants sont inaccessibles : exploration finie.
    if (current === null) {
      break;
    }
    // La distance de `target` est définitive dès sa sélection.
    if (current === target) {
      break;
    }
    visited.add(current);

    // Relaxation des voisins du sommet courant.
    for (const edge of graph.neighbors(current)) {
      const candidate = best + edge.weight;
      if (candidate < dist.get(edge.node)!) {
        dist.set(edge.node, candidate);
        prev.set(edge.node, current);
      }
    }
  }

  const totalCost = dist.get(target)!;
  if (totalCost === Infinity) {
    return null; // cible inaccessible : graphe non connexe
  }

  return { path: reconstructPath(prev, start, target), totalCost };
}
