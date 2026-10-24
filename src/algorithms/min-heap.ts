/**
 * Tas binaire minimal (binary min-heap) implémenté from scratch.
 *
 * Rôle dans Dijkstra : file de priorité qui permet d'extraire en O(log n)
 * l'élément de plus petite priorité (ici : le sommet de distance
 * provisoire minimale). Sans cette structure, l'extraction du minimum
 * coûte O(n) par balayage — c'est la version naïve du benchmark.
 *
 * Représentation : un arbre binaire presque complet stocké dans un
 * tableau. Pour un élément à l'indice i :
 *   - parent      : Math.floor((i - 1) / 2)
 *   - fils gauche : 2 * i + 1
 *   - fils droit  : 2 * i + 2
 * Invariant : chaque parent est <= à ses deux fils (selon le comparateur),
 * donc le minimum est toujours à la racine (indice 0).
 *
 * Conception : le critère de comparaison est injecté au constructeur
 * (inversion de dépendance). Le tas ne sait pas ce qu'il trie — distance,
 * priorité, date — ce qui le rend réutilisable sans modification.
 */

/** Retourne < 0 si `a` sort avant `b`, 0 si équivalents, > 0 sinon. */
export type Comparator<T> = (a: T, b: T) => number;

export class MinHeap<T> {
  /** Tableau contenant les éléments, organisé en arbre binaire implicite. */
  private readonly items: T[] = [];

  /** Fonction de comparaison définissant l'ordre de priorité. */
  private readonly compare: Comparator<T>;

  constructor(compare: Comparator<T>) {
    this.compare = compare;
  }

  /** Nombre d'éléments actuellement dans le tas. */
  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * Consulte le minimum sans le retirer (la racine du tas).
   * Complexité : O(1).
   */
  peek(): T | undefined {
    return this.items[0];
  }

  /**
   * Insère un élément puis le fait remonter jusqu'à sa place.
   * Complexité : O(log n) — au plus la hauteur de l'arbre.
   */
  insert(item: T): void {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  /**
   * Retire et retourne l'élément minimal (la racine).
   * On place le dernier élément à la racine puis on le fait redescendre
   * pour restaurer l'invariant du tas.
   * Complexité : O(log n).
   */
  extractMin(): T | undefined {
    if (this.items.length === 0) {
      return undefined;
    }
    const min = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return min;
  }

  /**
   * Fait remonter l'élément tant qu'il est plus petit que son parent.
   * Utilisé après une insertion en fin de tableau.
   */
  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = MinHeap.parentIndex(current);
      // L'élément est déjà >= à son parent : l'invariant est respecté.
      if (this.compare(this.items[current], this.items[parent]) >= 0) {
        break;
      }
      this.swap(current, parent);
      current = parent;
    }
  }

  /**
   * Fait descendre l'élément tant qu'il est plus grand que l'un de ses
   * fils : il prend la place du plus petit de ses deux fils.
   * Utilisé après une extraction de la racine.
   */
  private bubbleDown(index: number): void {
    let current = index;
    const lastIndex = this.items.length - 1;

    while (true) {
      const left = MinHeap.leftChildIndex(current);
      const right = MinHeap.rightChildIndex(current);
      let smallest = current;

      if (
        left <= lastIndex &&
        this.compare(this.items[left], this.items[smallest]) < 0
      ) {
        smallest = left;
      }
      if (
        right <= lastIndex &&
        this.compare(this.items[right], this.items[smallest]) < 0
      ) {
        smallest = right;
      }
      // Aucun fils n'est plus petit : l'invariant est restauré.
      if (smallest === current) {
        break;
      }
      this.swap(current, smallest);
      current = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const tmp = this.items[i];
    this.items[i] = this.items[j];
    this.items[j] = tmp;
  }

  private static parentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private static leftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private static rightChildIndex(i: number): number {
    return 2 * i + 2;
  }
}
