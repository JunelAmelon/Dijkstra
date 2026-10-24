# QueenBee — Routage d'urgence (Dijkstra)

Évaluation pratique — application fil rouge **QueenBee** (INGETIS/ITIS, Mastère 1).
Spécialité **Développement / DevOps** — cas d'usage **UC-C01** : calcul de
l'itinéraire optimal d'un coordinateur régional vers une ruche en alerte
critique, sur le maillage des pistes d'un site.

Implémentation intégrale de l'**algorithme de Dijkstra** avec **tas binaire
min** codé from scratch — aucune bibliothèque de graphes.

## Stack

TypeScript / Node.js · Express (API REST) · Vitest (tests)

## Structure

```
src/
├── graph/
│   ├── graph.ts            # liste d'adjacence non orientée
│   ├── trail-network.ts    # réseau de pistes du site (jeu de test)
│   └── random-graph.ts     # générateur déterministe (benchmark)
├── algorithms/
│   ├── min-heap.ts         # tas binaire min (file de priorité)
│   ├── dijkstra.ts         # Dijkstra avec tas — O((|V|+|E|) log |V|)
│   ├── dijkstra-naive.ts   # version naïve — O(|V|²) (benchmark)
│   └── route-utils.ts      # éléments partagés des deux versions
├── routes/
│   └── emergency-path.ts   # POST /api/v1/routing/emergency-path
├── app.ts                  # application Express
├── server.ts               # point d'entrée
└── benchmark.ts            # comparaison mesurée tas vs naïf
tests/                      # tests unitaires Vitest (22 tests)
docs/complexity-analysis.md # note d'analyse de complexité
scripts/build-report.ts     # générateur du rapport Word (.docx, non versionné)
```

## API

`POST /api/v1/routing/emergency-path`

```json
// Requête
{ "start": "S", "target": "R", "algorithm": "heap" }

// Réponse
{
  "start": "S", "target": "R",
  "reachable": true,
  "path": ["S", "B", "A", "C", "D", "R"],
  "totalCost": 13,
  "unit": "meters",
  "algorithm": "heap",
  "computeTimeMs": 0.468
}
```

`algorithm` : `heap` (défaut) ou `naive`. Erreurs : `400` entrée invalide,
`404` sommet inconnu, `200` + `reachable: false` si cible inaccessible.

`GET /api/v1/health` → `{ "status": "ok" }`

## Commandes

```bash
npm install        # dépendances
npm run dev        # serveur en mode watch (tsx)
npm test           # tests unitaires (Vitest)
npm run benchmark  # benchmark tas vs naïf (graphes seedés)
npm run report     # génère TP_Dijkstra_QueenBee.docx (ignoré par git)
npm run typecheck  # vérification TypeScript
```

## Analyse de complexité

| | Tas binaire | Naïf |
|---|---|---|
| Extraction du minimum | O(log \|V\|) | O(\|V\|) |
| **Total** | **O((\|V\|+\|E\|) log \|V\|)** | **O(\|V\|²)** |

Démonstration complète et mesures : `docs/complexity-analysis.md`.
