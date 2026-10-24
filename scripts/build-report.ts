import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Générateur du rapport Word (.docx) pour l'évaluation pratique QueenBee.
 *
 * Le code est lu DIRECTEMENT depuis les fichiers sources à chaque
 * génération : le rapport reste synchronisé avec l'implémentation.
 * Usage : npm run report  ->  TP_Dijkstra_QueenBee.docx à la racine.
 */

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "TP_Dijkstra_QueenBee.docx");

// ---------- Helpers ----------

/** Paragraphe de titre de section. */
function h1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32 })],
  });
}

/** Paragraphe de sous-titre (nom de fichier / sous-section). */
function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26 })],
  });
}

/** Paragraphe de texte normal (11 pt). */
function p(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22 })],
  });
}

/** Bloc de code lu depuis un fichier source : Consolas 9 pt, interligne simple. */
function codeParagraphs(relativePath: string): Paragraph[] {
  const file = path.join(ROOT, relativePath);
  const lines = fs.readFileSync(file, "utf-8").split(/\r?\n/);
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 0, line: 240 },
        shading: { fill: "F5F5F5" },
        children: [
          new TextRun({
            text: line === "" ? " " : line,
            font: "Consolas",
            size: 18,
          }),
        ],
      }),
  );
}

/** Tableau simple : première ligne en gras (en-tête). */
function table(header: string[], rows: string[][]): Table {
  const cell = (text: string, bold = false) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ text, bold, size: 20 })],
        }),
      ],
    });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: header.map((h) => cell(h, true)),
      }),
      ...rows.map((r) => new TableRow({ children: r.map((c) => cell(c)) })),
    ],
  });
}

/** Titre + bloc de code d'un fichier source. */
function fileSection(title: string, relativePath: string): Paragraph[] {
  return [h2(title), ...codeParagraphs(relativePath)];
}

// ---------- Contenu du document ----------

const cover: Paragraph[] = [
  new Paragraph({ spacing: { before: 2400 } }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: "Évaluation Pratique — Application Fil Rouge QueenBee",
        bold: true,
        size: 40,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 480 },
    children: [
      new TextRun({
        text: "Algorithme de Dijkstra — Calcul d'itinéraire d'urgence (UC-C01)",
        size: 28,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480 },
    children: [new TextRun({ text: "Étudiant : [Prénom NOM]", size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "Spécialité : Développement / DevOps", size: 24 }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "Établissements : INGETIS / ITIS — Mastère 1", size: 24 }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480 },
    children: [new TextRun({ text: "Novembre 2026", size: 24 })],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

const intro: Paragraph[] = [
  h1("1. Contexte et objectif"),
  p(
    "Dans le projet fil rouge QueenBee (réseau apicole connecté, 8 sites, " +
      "400 ruches), le coordinateur régional doit rejoindre au plus vite une " +
      "ruche en alerte critique (chute de poids, risque d'essaimage, anomalie " +
      "thermique). Ce travail implémente l'algorithme de Dijkstra pour calculer " +
      "l'itinéraire optimal sur le maillage des pistes d'un site, conformément " +
      "au cas d'usage UC-C01.",
  ),
  p(
    "Contraintes respectées : implémentation intégrale sans bibliothèque de " +
      "graphes, file de priorité reposant sur un tas binaire min codé from " +
      "scratch, reconstruction du chemin complet (suite ordonnée des nœuds), " +
      "exposition via un endpoint REST (POST /api/v1/routing/emergency-path) " +
      "et analyse de complexité avec benchmark.",
  ),
  p(
    "Stack : TypeScript / Node.js, Express (API REST), Vitest (tests). " +
      "Le maillage de pistes est modélisé par une liste d'adjacence non " +
      "orientée ; les poids représentent des distances en mètres (tous > 0, " +
      "précondition de Dijkstra).",
  ),
];

const implementation = [
  h1("2. Implémentation de l'algorithme (code source)"),
  p(
    "Le code source complet et commenté est reproduit ci-dessous. " +
      "Structures de données : liste d'adjacence (Graph) et tas binaire " +
      "minimal (MinHeap) implémenté from scratch.",
  ),
  ...fileSection("2.1 Graphe — liste d'adjacence", "src/graph/graph.ts"),
  ...fileSection(
    "2.2 Réseau de pistes du site (jeu de données)",
    "src/graph/trail-network.ts",
  ),
  ...fileSection(
    "2.3 File de priorité — tas binaire minimal",
    "src/algorithms/min-heap.ts",
  ),
  ...fileSection(
    "2.4 Éléments partagés des deux versions",
    "src/algorithms/route-utils.ts",
  ),
  ...fileSection(
    "2.5 Dijkstra avec tas binaire — O((|V|+|E|) log |V|)",
    "src/algorithms/dijkstra.ts",
  ),
  ...fileSection(
    "2.6 Dijkstra naïf sans tas — O(|V|²) (référence du benchmark)",
    "src/algorithms/dijkstra-naive.ts",
  ),
  ...fileSection(
    "2.7 Endpoint REST — POST /api/v1/routing/emergency-path",
    "src/routes/emergency-path.ts",
  ),
  ...fileSection("2.8 Application Express", "src/app.ts"),
  ...fileSection("2.9 Point d'entrée du serveur", "src/server.ts"),
];

const testsSection = [
  h1("3. Jeux de tests & résultats"),
  p(
    "Tests unitaires Vitest : 22 tests couvrant le cas nominal " +
      "(S → R = 13 m, chemin S → B → A → C → D → R), le piège du choix " +
      "glouton, et les cas limites exigés par le sujet — graphe non " +
      "connexe, cycles, départ = arrivée, sommets inconnus, graphe à un " +
      "seul sommet. Un test dédié vérifie l'équivalence des deux " +
      "implémentations (tas et naïve) sur toutes les paires de sommets : " +
      "la version naïve sert d'oracle de correction.",
  ),
  p("Résultat : npm test → 22/22 tests passent."),
  ...fileSection("3.1 Tests du tas binaire", "tests/min-heap.test.ts"),
  ...fileSection("3.2 Tests de la structure de graphe", "tests/graph.test.ts"),
  ...fileSection("3.3 Tests de Dijkstra", "tests/dijkstra.test.ts"),
];

const analysis = [
  h1("4. Note d'analyse de complexité"),
  p(
    "Notations : |V| = nombre de sommets, |E| = nombre d'arêtes. Graphe " +
      "pondéré non orienté à poids strictement positifs, liste d'adjacence.",
  ),

  h2("4.1 Version avec tas binaire : O((|V|+|E|) log |V|)"),
  table(
    ["Opération", "Nb d'exécutions", "Coût unitaire", "Total"],
    [
      ["Initialisation de dist", "|V|", "O(1)", "O(|V|)"],
      [
        "insert dans le tas",
        "≤ |E| + 1 (une par relaxation réussie)",
        "O(log |V|)",
        "O(|E| log |V|)",
      ],
      ["extractMin", "≤ |E| + 1", "O(log |V|)", "O(|E| log |V|)"],
      ["Relaxation (voisins)", "chaque arête ≤ 2 fois", "O(1)", "O(|E|)"],
      ["Reconstruction du chemin", "1", "O(|V|)", "O(|V|)"],
    ],
  ),
  p(
    "Total : O(|V|) + O(|E| log |V|) + O(|E|) + O(|V|) = O((|V|+|E|) log |V|). " +
      "La taille du tas est bornée par O(|E|) ≤ O(|V|²), donc chaque opération " +
      "coûte O(log |V|²) = O(log |V|).",
  ),
  p(
    "Suppression paresseuse : quand une meilleure distance est trouvée pour " +
      "un sommet déjà dans le tas, une nouvelle entrée est insérée et les " +
      "entrées périmées sont ignorées à l'extraction. Le nombre d'insertions " +
      "reste borné par |E| : même borne asymptotique qu'un decrease-key, sans " +
      "structure indexée.",
  ),

  h2("4.2 Version naïve : O(|V|²)"),
  table(
    ["Opération", "Nb d'exécutions", "Coût unitaire", "Total"],
    [
      ["Initialisation", "|V|", "O(1)", "O(|V|)"],
      ["Recherche du minimum (balayage)", "|V| itérations", "O(|V|)", "O(|V|²)"],
      ["Relaxation", "chaque arête ≤ 2 fois", "O(1)", "O(|E|)"],
      ["Reconstruction", "1", "O(|V|)", "O(|V|)"],
    ],
  ),
  p(
    "Total : O(|V|) + O(|V|²) + O(|E|) + O(|V|) = O(|V|² + |E|) = O(|V|²) " +
      "pour un graphe connexe. Le goulot d'étranglement est la recherche " +
      "linéaire du minimum répétée |V| fois ; le tas la ramène de O(|V|) " +
      "à O(log |V|).",
  ),

  h2("4.3 Cas QueenBee : maillage de pistes (graphe creux)"),
  p(
    "Un réseau de pistes est un graphe creux : chaque carrefour ne rejoint " +
      "que quelques voisins, donc |E| ≈ k·|V| avec k petit (degré moyen ~4). " +
      "La version tas devient O(|V| log |V|) contre O(|V|²) pour la naïve : " +
      "l'écart croît comme |V| / log |V|.",
  ),

  h2("4.4 Comparaison expérimentale mesurée"),
  p(
    "Protocole : graphes connexes générés déterministement (seed = 42), " +
      "degré moyen 4, poids uniformes 10–500 m. Temps moyen sur 10 à 50 " +
      "exécutions après chauffe JIT ; même graphe, départ et cible pour les " +
      "deux versions. Node.js v24, Windows. Rejouable : npm run benchmark.",
  ),
  table(
    ["|V|", "|E|", "Tas binaire (ms)", "Naïf (ms)", "Rapport"],
    [
      ["100", "200", "0,406", "0,524", "×1,3"],
      ["250", "500", "0,179", "1,414", "×7,9"],
      ["500", "1000", "0,428", "6,822", "×15,9"],
      ["1000", "2000", "1,312", "38,773", "×29,6"],
      ["2000", "4000", "1,157", "96,978", "×83,8"],
      ["4000", "8000", "0,886", "60,493", "×68,3"],
    ],
  ),
  p(
    "Lecture : la version naïve croît quadratiquement (×4 à ×6 quand |V| " +
      "double), conforme à O(|V|²) ; la baisse à |V| = 4000 provient de " +
      "l'arrêt anticipé (la cible est extraite plus tôt sur ce graphe). La " +
      "version tas reste sous 2 ms sur toute la plage — cohérent avec " +
      "O(|V| log |V|) sur graphe creux. Mesures bruitées par le JIT/GC de V8 " +
      "sur les petites tailles, mais les ordres de grandeur confirment la " +
      "théorie.",
  ),

  h2("4.5 Conclusion"),
  table(
    ["", "Tas binaire", "Naïf"],
    [
      ["Extraction du minimum", "O(log |V|)", "O(|V|)"],
      ["Mise à jour d'une distance", "O(log |V|)", "O(1)"],
      ["Total", "O((|V|+|E|) log |V|)", "O(|V|²)"],
      ["Graphe creux (|E| ≈ k|V|)", "O(|V| log |V|)", "O(|V|²)"],
      ["Mesuré à |V| = 4000", "~0,9 ms", "~60–97 ms"],
    ],
  ),
  p(
    "La version avec tas binaire est retenue pour l'endpoint " +
      "/api/v1/routing/emergency-path : temps de réponse très inférieur à " +
      "l'exigence de performance du projet (< 500 ms p95), même sur des " +
      "maillages bien plus grands qu'un site réel.",
  ),
];

// ---------- Assemblage ----------

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
  },
  sections: [
    {
      children: [...cover, ...intro, ...implementation, ...testsSection, ...analysis],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT, buffer);
  const ko = Math.round(buffer.length / 1024);
  console.log(`Rapport généré : ${OUTPUT} (${ko} Ko)`);
});
