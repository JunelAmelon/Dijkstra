import { performance } from "node:perf_hooks";
import { Graph } from "./graph/graph";
import { generateConnectedGraph } from "./graph/random-graph";
import { dijkstra } from "./algorithms/dijkstra";
import { dijkstraNaive } from "./algorithms/dijkstra-naive";
import { RouteResult } from "./algorithms/route-utils";

/**
 * Benchmark : Dijkstra avec tas binaire O((|V|+|E|) log |V|)
 *            vs version naïve O(|V|²).
 *
 * Protocole : graphes connexes creux (degré moyen 4, proche d'un
 * maillage de pistes réel) générés avec une graine fixe ; temps moyen
 * sur plusieurs exécutions après un tour de chauffe pour le JIT.
 * Les deux versions reçoivent EXACTEMENT le même graphe, le même
 * départ et la même cible.
 */

type Algo = (g: Graph, s: string, t: string) => RouteResult | null;

/** Temps moyen en ms sur `runs` exécutions, après un tour de chauffe. */
function measure(
  fn: Algo,
  graph: Graph,
  start: string,
  target: string,
  runs: number,
): number {
  fn(graph, start, target); // chauffe JIT (hors mesure)
  let total = 0;
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    fn(graph, start, target);
    total += performance.now() - t0;
  }
  return total / runs;
}

const SEED = 42;
const AVG_DEGREE = 4; // graphe creux : |E| ≈ 2·|V| (pistes, pas clique)
const SIZES = [100, 250, 500, 1000, 2000, 4000];

console.log(`Benchmark Dijkstra — degré moyen ${AVG_DEGREE}, seed ${SEED}`);
console.log(
  "|V|".padStart(6) +
    "|E|".padStart(8) +
    "tas (ms)".padStart(12) +
    "naïf (ms)".padStart(12) +
    "ratio".padStart(8),
);
console.log("-".repeat(46));

for (const v of SIZES) {
  const graph = generateConnectedGraph(v, AVG_DEGREE, SEED);
  const start = "N0";
  const target = `N${v - 1}`;
  const runs = v <= 500 ? 50 : v <= 2000 ? 20 : 10;

  const heapMs = measure(dijkstra, graph, start, target, runs);
  const naiveMs = measure(dijkstraNaive, graph, start, target, runs);

  console.log(
    String(v).padStart(6) +
      String(graph.edgeCount).padStart(8) +
      heapMs.toFixed(3).padStart(12) +
      naiveMs.toFixed(3).padStart(12) +
      (naiveMs / heapMs).toFixed(1).padStart(8),
  );
}
