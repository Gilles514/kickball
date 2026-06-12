# L'Arbitre de Kickball — simulateur d'entraînement

Application web autonome (HTML/CSS/JavaScript, sans serveur ni dépendance) pour entraîner
un arbitre de kickball au primaire, basée sur le règlement de
[Sports Laval](https://sportslaval.qc.ca/wp-content/uploads/2021/07/R%C3%A8glement-Kickball.pdf).

## Deux modes

- **Quiz règle par règle** : échauffement par catégorie (le lancer, les retraits, la course,
  le pointage, le terrain, les zones grises de jugement).
- **Partie simulée** : une partie de 2 manches dont l'état (manche, retraits, coureurs sur
  les buts, pointage, maximum de 5 points par demi-manche) évolue selon le règlement,
  avec terrain SVG mis à jour à chaque jeu.

## Principe pédagogique

Hybride scripté / aléatoire / systématique : les situations sont tirées au hasard dans une
banque rédigée à la main ; une situation **bien jugée est maîtrisée** et n'est plus jamais
reproposée ; une situation **mal jugée revient** tant qu'elle n'est pas réussie. Un tableau
de bord affiche le taux de réussite par article de règlement. La progression est conservée
dans le `localStorage` du navigateur (bouton de réinitialisation fourni).

## Structure du dépôt

| Fichier        | Rôle |
|----------------|------|
| `index.html`   | Structure de la page et styles (aucune logique) |
| `scenarios.js` | **Données** : la banque de 42 situations, leurs verdicts et explications |
| `moteur.js`    | **Logique** : navigation, maîtrise, statistiques, état de partie, rendu SVG |
| `test.js`      | Test automatisé (facultatif, voir plus bas) |

La séparation données / logique est volontaire : on peut enrichir la banque de scénarios
sans toucher au moteur.

## Déploiement sur GitHub Pages

1. Créer un dépôt et y pousser les fichiers (`index.html` à la racine).
2. Dans le dépôt : *Settings → Pages → Source : Deploy from a branch*,
   branche `main`, dossier `/ (root)`.
3. L'application est servie à `https://<utilisateur>.github.io/<depot>/`.

Aucune étape de compilation : tout fichier modifié et poussé est en ligne en
quelques secondes.

## Ajouter ou modifier une situation

Dans `scenarios.js`, ajouter un objet au tableau `SCENARIOS` :

```js
{
  id: "R8",                       // identifiant unique (suivi de maîtrise)
  cat: "retraits",                // clé existante de CATEGORIES
  modes: ["quiz", "partie"],      // où la situation peut apparaître
  situation: "Texte du cas...",
  options: ["Choix A", "Choix B", "Choix C"],
  bonne: 1,                       // index de la bonne décision
  explication: "Justification avec référence à l'article...",
  // Mode partie seulement :
  pre: "coureurAuMoinsUn",        // "toujours" | "coureurAuMoinsUn" | "aucunCoureur"
  effet: { type: "retraitCoureurTete" }
}
```

Types d'effet interprétés par le moteur : `rien`, `retraitBotteur`,
`retraitCoureurTete`, `retraitBotteurAvance` (retrait forcé, les coureurs avancent),
`botteurSauf` (avec `buts: 1` à `4`), `coureurTeteAvance`.

Pour changer la longueur d'une partie simulée : constante `MANCHES_MAX`
en tête de `moteur.js`.

## Test automatisé (facultatif)

```bash
npm install jsdom
node test.js
```

Le test simule un utilisateur complet : quiz jusqu'à maîtrise d'une catégorie
(avec une erreur volontaire pour vérifier la reproposition), partie simulée entière,
statistiques et réinitialisation.

## Conventions d'arbitrage recommandées

Le règlement de Sports Laval comporte quelques zones grises (traitées dans la
catégorie « Jugement d'arbitre »). Conventions suggérées, à annoncer avant la partie :

- quand le lanceur reprend le ballon dans sa zone, **le jeu s'arrête** (les coureurs
  reviennent à leur but, personne n'est retiré) ;
- le dépassement du **1er but** après l'avoir touché est toléré (sécurité) ;
- un botté faible d'un jeune enfant **n'est pas un amorti** : l'interdiction vise la
  retenue volontaire ;
- on ne lance **jamais** le ballon sur un coureur — la règle la plus souvent
  enfreinte par les enfants habitués au ballon-chasseur.
