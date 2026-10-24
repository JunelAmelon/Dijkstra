import { Graph } from "../graph/graph";
import { MinHeap } from "./min-heap";
import {
  assertEndpointsExist,
  reconstructPath,
  RouteResult,
} from "./route-utils";

export { RouteResult } from "./route-utils";

/**
 * Algorithme de Dijkstra : plus court chemin à source unique sur un
 * graphe à poids positifs, avec file de priorité (tas binaire min).
 *
 * Cas d'usage QueenBee (UC-C01) : un coordinateur régional doit rejoindre
 * au plus vite une ruche en alerte critique. Le graphe représente le
 * maillage des pistes du site, le poids d'une arête la distance en mètres.
 *
 * Complexité : O((|V| + |E|) log |V|)
 *   - chaque sommet est extrait du tas au plus une fois utile : |V| × O(log |V|)
 *   - chaque arête déclenche au plus une insertion : |E| × O(log |V|)
 *
 * Suppression paresseuse (lazy deletion) : quand une meilleure distance
 * est trouvée pour un sommet déjà présent dans le tas, on insère une
 * nouvelle entrée au lieu de modifier l'ancienne. Les entrées périmées
 * sont ignorées à l'extraction. Même borne asymptotique qu'un
 * decrease-key, sans structure indexée supplémentaire.
 */

/** Élément stocké dans le tas : un sommet et sa distance provisoire. */
interface HeapEntry {
  node: string;
  dist: number;
}

/**
 * Calcule l'itinéraire optimal entre `start` et `target`.
 *
 * @returns le chemin ordonné et son coût, ou `null` si la cible est
 *          inaccessible (graphe non connexe).
 * @throws Error si `start` ou `target` n'existe pas dans le graphe —
 *         c'est une erreur d'entrée, pas un itinéraire manquant.
 */
export function dijkstra(
  graph: Graph,
  start: string,
  target: string,
): RouteResult | null {
  assertEndpointsExist(graph, start, target);

  // dist : meilleure distance connue depuis `start` (∞ par défaut).
  // prev : prédécesseur de chaque sommet sur le chemin optimal —
  //        c'est cette table qui permet de reconstruire l'itinéraire.
  const dist = new Map<string, number>();
  const prev = new Map<string, string>();

  for (const node of graph.nodes()) {
    dist.set(node, Infinity);
  }
  dist.set(start, 0);

  const heap = new MinHeap<HeapEntry>((a, b) => a.dist - b.dist);
  heap.insert({ node: start, dist: 0 });

  while (!heap.isEmpty()) {
    const { node, dist: d } = heap.extractMin()!;

    // Entrée périmée : une distance plus courte a déjà été insérée
    // pour ce sommet — on ignore celle-ci (suppression paresseuse).
    if (d > dist.get(node)!) {
      continue;
    }

    // La distance de `target` est définitive dès son extraction :
    // arrêt anticipé possible, inutile d'explorer le reste du graphe.
    if (node === target) {
      break;
    }

    // Relaxation : pour chaque voisin, tenter de l'atteindre
    // plus rapidement en passant par le sommet courant.
    for (const edge of graph.neighbors(node)) {
      const candidate = d + edge.weight;
      if (candidate < dist.get(edge.node)!) {
        dist.set(edge.node, candidate);
        prev.set(edge.node, node);
        heap.insert({ node: edge.node, dist: candidate });
      }
    }
  }

  const totalCost = dist.get(target)!;
  if (totalCost === Infinity) {
    return null; // cible inaccessible : graphe non connexe
  }

  return { path: reconstructPath(prev, start, target), totalCost };
}

