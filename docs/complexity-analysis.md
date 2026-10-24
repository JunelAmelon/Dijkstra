# Note d'analyse de complexité — Dijkstra (Projet QueenBee, UC-C01)

**Objet** : démonstration formelle de la complexité temporelle des deux
implémentations de l'algorithme de Dijkstra réalisées pour le calcul
d'itinéraire d'urgence, et comparaison expérimentale mesurée.

**Notations** : `|V|` = nombre de sommets, `|E|` = nombre d'arêtes.
Graphe pondéré non orienté à poids strictement positifs, représenté par
liste d'adjacence.

---

## 1. Version avec tas binaire min : O((|V| + |E|) log |V|)

### Déroulement des coûts

| Opération | Nb d'exécutions | Coût unitaire | Total |
|---|---|---|---|
| Initialisation de `dist` | \|V\| | O(1) | O(\|V\|) |
| `insert` dans le tas | ≤ \|E\| + 1 (une par relaxation réussie + la source) | O(log \|V\|)* | O(\|E\| log \|V\|) |
| `extractMin` | ≤ \|E\| + 1 (autant que d'insertions) | O(log \|V\|) | O(\|E\| log \|V\|) |
| Test de relaxation (parcours des voisins) | chaque arête examinée ≤ 2 fois (non orienté) | O(1) | O(\|E\|) |
| Reconstruction du chemin | 1 | O(\|V\|) | O(\|V\|) |

\* La taille du tas reste bornée par O(|E|) ≤ O(|V|²), donc chaque
opération coûte O(log |V|²) = O(2 log |V|) = **O(log |V|)**.

**Total** : O(|V|) + O(|E| log |V|) + O(|E| log |V|) + O(|E|) + O(|V|)
        = **O((|V| + |E|) log |V|)**

### Suppression paresseuse (lazy deletion)

Quand une meilleure distance est trouvée pour un sommet déjà présent
dans le tas, une nouvelle entrée est insérée au lieu de modifier
l'ancienne ; les entrées périmées sont ignorées à l'extraction
(`d > dist.get(node)`). Le nombre d'insertions reste borné par |E|,
donc la borne asymptotique est identique à celle d'un tas indexé avec
`decrease-key`, sans structure supplémentaire.

---

## 2. Version naïve sans tas : O(|V|²)

### Déroulement des coûts

| Opération | Nb d'exécutions | Coût unitaire | Total |
|---|---|---|---|
| Initialisation | \|V\| | O(1) | O(\|V\|) |
| Recherche du minimum par balayage | \|V\| itérations | O(\|V\|) | **O(\|V\|²)** |
| Relaxation des voisins | chaque arête ≤ 2 fois | O(1) | O(\|E\|) |
| Reconstruction | 1 | O(\|V\|) | O(\|V\|) |

**Total** : O(|V|) + O(|V|²) + O(|E|) + O(|V|) = **O(|V|² + |E|)**
soit **O(|V|²)** pour tout graphe connexe (|E| ≥ |V| − 1 et |E| ≤ |V|²).

Le goulot d'étranglement est la recherche linéaire du minimum, répétée
|V| fois. Le tas binaire ramène cette opération de O(|V|) à O(log |V|).

---

## 3. Application au cas QueenBee : maillage de pistes (graphe creux)

Un réseau de pistes d'un site est un graphe **creux** : chaque carrefour
ne rejoint qu'un petit nombre de voisins, donc |E| ≈ k·|V| avec k petit
(degré moyen ~4).

- Version tas : O((|V| + k|V|) log |V|) = **O(|V| log |V|)**
- Version naïve : **O(|V|²)**

L'écart entre les deux croît donc comme |V| / log |V| : il est modeste
sur un seul site (~50 ruches) mais devient déterminant dès que le
maillage grandit (agrégation multi-sites, pistes inter-sites).

---

## 4. Comparaison expérimentale mesurée

**Protocole** : graphes connexes générés déterministement (seed = 42),
degré moyen 4, poids uniformes 10–500 m. Temps moyen sur 10 à 50
exécutions selon la taille, après un tour de chauffe JIT. Même graphe,
même départ (N0), même cible (N{n-1}) pour les deux versions.
Machine : Node.js v24, Windows.

| \|V\| | \|E\| | Tas binaire (ms) | Naïf (ms) | Rapport |
|------:|------:|-----------------:|----------:|--------:|
|   100 |   200 |            0,406 |     0,524 |   ×1,3 |
|   250 |   500 |            0,179 |     1,414 |   ×7,9 |
|   500 |  1000 |            0,428 |     6,822 |  ×15,9 |
|  1000 |  2000 |            1,312 |    38,773 |  ×29,6 |
|  2000 |  4000 |            1,157 |    96,978 |  ×83,8 |
|  4000 |  8000 |            0,886 |    60,493 |  ×68,3 |

### Lecture des résultats

- **Version naïve** : le temps suit bien une croissance quadratique
  (×4–6 quand |V| double), conforme à O(|V|²). La baisse observée
  à |V| = 4000 s'explique par l'arrêt anticipé : la cible N3999 est
  extraite plus tôt que N1999 sur ce graphe particulier — le temps
  dépend du nombre de sommets réellement extraits, pas seulement de |V|.
- **Version tas** : le temps reste quasi constant (< 2 ms) sur toute la
  plage — cohérent avec O(|V| log |V|) sur graphe creux, où log |V|
  croît très lentement (log₂ 4000 ≈ 12).
- Le rapport passe de ×1,3 à ~×70–80 : sur un petit graphe la
  différence est négligeable (la constante du tas domine), mais elle
  devient rédhibitoire à grande échelle — ce qui justifie
  l'implémentation du tas exigée par le sujet.

### Limites de la mesure

Mesures bruitées par le JIT et le GC de V8 (visibles sur les petites
tailles, ex. |V|=100 > |V|=250 en version tas) ; l'arrêt anticipé rend
le temps dépendant de la position de la cible. Les ordres de grandeur
restent néanmoins conformes aux complexités théoriques démontrées.

---

## 5. Conclusion

| | Tas binaire | Naïf |
|---|---|---|
| Extraction du minimum | O(log \|V\|) | O(\|V\|) |
| Mise à jour d'une distance | O(log \|V\|) (insertion) | O(1) |
| **Total** | **O((\|V\|+\|E\|) log \|V\|)** | **O(\|V\|²)** |
| Graphe creux (\|E\|≈k\|V\|) | O(\|V\| log \|V\|) | O(\|V\|²) |
| Mesuré à \|V\|=4000 | ~0,9 ms | ~60–97 ms |

La version avec tas binaire min est retenue pour l'endpoint
`/api/v1/routing/emergency-path` : elle garantit un temps de réponse
compatible avec l'exigence de performance du projet (< 500 ms p95)
même sur des maillages très au-delà de la taille d'un site réel.
