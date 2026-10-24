import { describe, expect, it } from "vitest";
import { buildTrailNetwork } from "../src/graph/trail-network";
import { Graph } from "../src/graph/graph";
import { dijkstra } from "../src/algorithms/dijkstra";
import { dijkstraNaive } from "../src/algorithms/dijkstra-naive";

/**
 * Tests de l'algorithme de Dijkstra — cas nominaux, cas limites
 * (graphe non connexe, cycles, départ = arrivée) et équivalence
 * entre la version tas binaire et la version naïve.
 */

describe("Dijkstra — cas nominaux", () => {
  const graph = buildTrailNetwork();

  it("trouve l'itinéraire optimal S -> R (13 m)", () => {
    const result = dijkstra(graph, "S", "R");

    expect(result).not.toBeNull();
    expect(result!.totalCost).toBe(13);
    // Le chemin complet ordonné doit être restitué, pas seulement le coût.
    expect(result!.path).toEqual(["S", "B", "A", "C", "D", "R"]);
  });

  it("fonctionne dans le sens inverse (graphe non orienté)", () => {
    const result = dijkstra(graph, "R", "S");

    expect(result!.totalCost).toBe(13);
    expect(result!.path).toEqual(["R", "D", "C", "A", "B", "S"]);
  });
});

describe("Dijkstra — piège du choix glouton", () => {
  const graph = buildTrailNetwork();

  it("ne choisit pas simplement la liaison la plus proche du départ", () => {
    // Depuis B, la piste directe vers C coûte 8 m alors que passer
    // par A ne coûte que 1 + 5 = 6 m. Dijkstra doit comparer, pas deviner.
    const result = dijkstra(graph, "S", "C");

    expect(result!.totalCost).toBe(8);
    expect(result!.path).toEqual(["S", "B", "A", "C"]);
  });

  it("préfère un détour moins cher à une piste directe coûteuse", () => {
    // A -> R direct = 12 m, mais A -> C -> D -> R = 5 + 2 + 3 = 10 m.
    const result = dijkstra(graph, "A", "R");

    expect(result!.totalCost).toBe(10);
    expect(result!.path).toEqual(["A", "C", "D", "R"]);
  });
});

describe("Dijkstra — cas limites", () => {
  it("départ = arrivée : chemin trivial de coût 0", () => {
    const graph = buildTrailNetwork();
    const result = dijkstra(graph, "S", "S");

    expect(result).toEqual({ path: ["S"], totalCost: 0 });
  });

  it("cible inaccessible (graphe non connexe) : retourne null", () => {
    const graph = buildTrailNetwork();
    graph.addNode("ISOLE"); // sommet sans aucune piste

    expect(dijkstra(graph, "S", "ISOLE")).toBeNull();
    expect(dijkstra(graph, "ISOLE", "R")).toBeNull();
  });

  it("deux composantes connexes séparées : null dans les deux sens", () => {
    const graph = new Graph();
    graph.addEdge("A", "B", 1); // composante 1
    graph.addEdge("C", "D", 1); // composante 2, jamais reliée

    expect(dijkstra(graph, "A", "D")).toBeNull();
    expect(dijkstra(graph, "D", "A")).toBeNull();
  });

  it("sommet inconnu : lève une erreur d'entrée", () => {
    const graph = buildTrailNetwork();

    expect(() => dijkstra(graph, "ZZZ", "R")).toThrow(/inconnu/);
    expect(() => dijkstra(graph, "S", "ZZZ")).toThrow(/inconnu/);
  });

  it("graphe à un seul sommet", () => {
    const graph = new Graph();
    graph.addNode("SEUL");

    expect(dijkstra(graph, "SEUL", "SEUL")).toEqual({
      path: ["SEUL"],
      totalCost: 0,
    });
  });

  it("graphe avec cycle : termine et trouve le bon coût", () => {
    // Triangle : le cycle ne doit ni boucler ni fausser le résultat.
    const graph = new Graph();
    graph.addEdge("A", "B", 1);
    graph.addEdge("B", "C", 1);
    graph.addEdge("C", "A", 5); // piste directe plus chère que le détour

    const result = dijkstra(graph, "A", "C");
    expect(result!.totalCost).toBe(2); // A -> B -> C
    expect(result!.path).toEqual(["A", "B", "C"]);
  });
});

describe("Dijkstra — équivalence tas binaire vs version naïve", () => {
  it("produit des résultats identiques sur toutes les paires de sommets", () => {
    const graph = buildTrailNetwork();
    graph.addNode("ISOLE"); // inclut le cas non connexe

    for (const start of graph.nodes()) {
      for (const target of graph.nodes()) {
        const heap = dijkstra(graph, start, target);
        const naive = dijkstraNaive(graph, start, target);

        expect(heap, `${start} -> ${target}`).toEqual(naive);
      }
    }
  });

  it("distances symétriques dans les deux sens (non orienté)", () => {
    const graph = buildTrailNetwork();

    for (const a of graph.nodes()) {
      for (const b of graph.nodes()) {
        const ab = dijkstra(graph, a, b)?.totalCost ?? Infinity;
        const ba = dijkstra(graph, b, a)?.totalCost ?? Infinity;
        expect(ab, `${a} <-> ${b}`).toBe(ba);
      }
    }
  });
});
