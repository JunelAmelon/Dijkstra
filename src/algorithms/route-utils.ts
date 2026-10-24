import { Graph } from "../graph/graph";

/**
 * Éléments partagés par les deux implémentations de Dijkstra
 * (avec tas binaire et naïve). Factorisés pour garantir que les
 * deux versions diffèrent UNIQUEMENT par la structure de priorité —
 * condition nécessaire pour un benchmark honnête.
 */

/** Résultat du calcul d'itinéraire. */
export interface RouteResult {
  /** Suite ordonnée des nœuds à parcourir, de `start` à `target`. */
  path: string[];
  /** Coût total cumulé du trajet (mètres). */
  totalCost: number;
}

/**
 * Vérifie que les deux extrémités existent dans le graphe.
 * @throws Error si l'un des sommets est inconnu — erreur d'entrée,
 *         à ne pas confondre avec une cible inaccessible (retour null).
 */
export function assertEndpointsExist(
  graph: Graph,
  start: string,
  target: string,
): void {
  if (!graph.hasNode(start)) {
    throw new Error(`Sommet de départ inconnu : "${start}"`);
  }
  if (!graph.hasNode(target)) {
    throw new Error(`Sommet cible inconnu : "${target}"`);
  }
}

/**
 * Reconstruit la suite ordonnée des nœuds en remontant la table des
 * prédécesseurs depuis `target` jusqu'à `start`.
 * Complexité : O(longueur du chemin) — négligeable devant l'exploration.
 */
export function reconstructPath(
  prev: Map<string, string>,
  start: string,
  target: string,
): string[] {
  const path: string[] = [];
  let current: string | undefined = target;

  while (current !== undefined) {
    path.unshift(current);
    if (current === start) {
      break;
    }
    current = prev.get(current);
  }

  return path;
}
