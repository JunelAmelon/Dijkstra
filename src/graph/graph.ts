/**
 * Graphe pondéré non orienté représenté par liste d'adjacence.
 *
 * Un sommet = un point du site (accès, carrefour de pistes, ruche).
 * Une arête = une piste praticable entre deux points.
 * Le poids = la distance de la piste en mètres (> 0, requis par Dijkstra).
 *
 * La liste d'adjacence permet de parcourir directement les voisins d'un
 * sommet sans examiner toutes les connexions possibles : c'est la
 * représentation adaptée à Dijkstra avec tas binaire en O((|V|+|E|) log |V|).
 */

export interface Edge {
  node: string;
  weight: number;
}

export class Graph {
  private readonly adjacencyList = new Map<string, Edge[]>();

  addNode(node: string): void {
    if (!this.adjacencyList.has(node)) {
      this.adjacencyList.set(node, []);
    }
  }

  /** Ajoute une piste praticable dans les deux sens (graphe non orienté). */
  addEdge(from: string, to: string, weight: number): void {
    if (weight <= 0) {
      throw new Error(`Le poids d'une arête doit être strictement positif (reçu : ${weight})`);
    }
    this.addNode(from);
    this.addNode(to);
    this.adjacencyList.get(from)!.push({ node: to, weight });
    this.adjacencyList.get(to)!.push({ node: from, weight });
  }

  neighbors(node: string): Edge[] {
    return this.adjacencyList.get(node) ?? [];
  }

  hasNode(node: string): boolean {
    return this.adjacencyList.has(node);
  }

  nodes(): string[] {
    return [...this.adjacencyList.keys()];
  }

  get nodeCount(): number {
    return this.adjacencyList.size;
  }

  /** Nombre de pistes : chaque arête est stockée deux fois (u->v et v->u). */
  get edgeCount(): number {
    let total = 0;
    for (const edges of this.adjacencyList.values()) {
      total += edges.length;
    }
    return total / 2;
  }
}
