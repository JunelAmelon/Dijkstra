import { describe, expect, it } from "vitest";
import { MinHeap } from "../src/algorithms/min-heap";

/**
 * Tests du tas binaire min : la file de priorité qui donne à Dijkstra
 * sa complexité O((|V|+|E|) log |V|).
 */
describe("MinHeap", () => {
  it("extrait les éléments dans l'ordre croissant", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    [9, 3, 7, 1, 8, 2, 5].forEach((n) => heap.insert(n));

    const extracted: number[] = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin()!);
    }

    expect(extracted).toEqual([1, 2, 3, 5, 7, 8, 9]);
  });

  it("gère les doublons sans perdre d'élément", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    [4, 4, 1, 1].forEach((n) => heap.insert(n));

    expect(heap.size).toBe(4);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(1);
    expect(heap.extractMin()).toBe(4);
    expect(heap.extractMin()).toBe(4);
    expect(heap.isEmpty()).toBe(true);
  });

  it("peek consulte le minimum sans le retirer", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    heap.insert(5);
    heap.insert(2);

    expect(heap.peek()).toBe(2);
    expect(heap.size).toBe(2); // peek ne consomme pas l'élément
  });

  it("extractMin sur un tas vide retourne undefined", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    expect(heap.extractMin()).toBeUndefined();
    expect(heap.peek()).toBeUndefined();
  });

  it("trie selon le comparateur injecté (objets avec priorité)", () => {
    // Même forme que les entrées utilisées dans Dijkstra.
    const heap = new MinHeap<{ node: string; dist: number }>(
      (a, b) => a.dist - b.dist,
    );
    heap.insert({ node: "A", dist: 4 });
    heap.insert({ node: "B", dist: 2 });
    heap.insert({ node: "C", dist: 10 });

    expect(heap.extractMin()!.node).toBe("B");
    expect(heap.peek()!.node).toBe("A");
  });

  it("reste correct avec insertions et extractions entrelacées", () => {
    const heap = new MinHeap<number>((a, b) => a - b);
    heap.insert(10);
    heap.insert(1);
    expect(heap.extractMin()).toBe(1);
    heap.insert(0); // inséré après une extraction
    heap.insert(5);

    expect(heap.extractMin()).toBe(0);
    expect(heap.extractMin()).toBe(5);
    expect(heap.extractMin()).toBe(10);
  });
});
