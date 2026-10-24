import { describe, expect, it } from "vitest";
import { Graph } from "../src/graph/graph";
import { buildTrailNetwork } from "../src/graph/trail-network";

/**
 * Tests de la structure de graphe (liste d'adjacence non orientée).
 */
describe("Graph", () => {
  it("crée chaque piste dans les deux sens (graphe non orienté)", () => {
    const g = new Graph();
    g.addEdge("A", "B", 3);

    expect(g.neighbors("A")).toEqual([{ node: "B", weight: 3 }]);
    expect(g.neighbors("B")).toEqual([{ node: "A", weight: 3 }]);
  });

  it("rejette un poids nul ou négatif (précondition de Dijkstra)", () => {
    const g = new Graph();
    expect(() => g.addEdge("A", "B", 0)).toThrow();
    expect(() => g.addEdge("A", "B", -5)).toThrow();
  });

  it("retourne une liste vide pour un sommet inconnu", () => {
    const g = new Graph();
    expect(g.neighbors("ZZZ")).toEqual([]);
  });

  it("compte correctement sommets et pistes", () => {
    const g = buildTrailNetwork();
    expect(g.nodeCount).toBe(6); // S, A, B, C, D, R
    expect(g.edgeCount).toBe(10); // 10 pistes bidirectionnelles
  });
});
