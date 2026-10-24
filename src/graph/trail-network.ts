import { Graph } from "./graph";

/**
 * Réseau de pistes fictif d'un site QueenBee (ex : SN-CASA, Casamance).
 *
 * S = position du coordinateur (porte d'accès du site)
 * R = ruche en alerte critique (ex : SN-CASA-014)
 * A, B, C, D = carrefours de pistes / points de passage
 *
 * Poids = distance de la piste en mètres. Chaque liaison est praticable
 * dans les deux sens (choix de modélisation, justifié dans le rapport).
 *
 * Résultat attendu pour S -> R : S -> B -> A -> C -> D -> R = 13 m.
 */
export function buildTrailNetwork(): Graph {
  const graph = new Graph();

  graph.addEdge("S", "A", 4);
  graph.addEdge("S", "B", 2);
  graph.addEdge("B", "A", 1);
  graph.addEdge("A", "C", 5);
  graph.addEdge("B", "C", 8);
  graph.addEdge("B", "D", 10);
  graph.addEdge("C", "D", 2);
  graph.addEdge("C", "R", 6);
  graph.addEdge("D", "R", 3);
  graph.addEdge("A", "R", 12);

  return graph;
}
