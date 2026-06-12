/* Test automatisé : simule un apprenti arbitre qui répond
   parfois bien, parfois mal, en mode quiz puis en mode partie. */
const { JSDOM } = require("jsdom");
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const dom = new JSDOM(html, { runScripts: "dangerously", url: "https://exemple.test/" });
const { window } = dom;

// localStorage simulé
const memoire = {};
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: k => (k in memoire ? memoire[k] : null),
    setItem: (k, v) => { memoire[k] = String(v); },
    removeItem: k => { delete memoire[k]; }
  }
});
window.confirm = () => true;

window.eval(
  fs.readFileSync("scenarios.js", "utf8") + "\n" +
  fs.readFileSync("moteur.js", "utf8") + "\n" +
  "window.SCENARIOS = SCENARIOS; window.CATEGORIES = CATEGORIES; window.Moteur = Moteur;"
);
window.document.dispatchEvent(new window.Event("DOMContentLoaded"));

const doc = window.document;
const Moteur = window.Moteur;
let echecs = 0;
function verifier(condition, message) {
  if (!condition) { echecs++; console.log("ÉCHEC : " + message); }
  else console.log("ok — " + message);
}
function visible(id) { return !doc.getElementById(id).classList.contains("masque"); }

/* ----- 1. Accueil ----- */
verifier(visible("vue-accueil"), "la vue accueil s'affiche au chargement");
verifier(doc.getElementById("stats-accueil").textContent.includes("0 situation"),
  "la progression initiale est de 0");

/* ----- 2. Quiz : catégorie 'lancer' jusqu'à maîtrise ----- */
Moteur.allerQuiz();
verifier(visible("vue-quiz-cat"), "la liste des catégories s'affiche");
verifier(doc.querySelectorAll("#liste-categories .bouton-cat").length === 7,
  "7 catégories listées");

Moteur.demarrerQuiz("lancer");
verifier(visible("vue-question"), "une question de quiz s'affiche");

// Stratégie : première réponse volontairement fausse, puis toujours juste.
let premiereFausseFaite = false;
let garde = 0;
while (visible("vue-question") && garde++ < 60) {
  const texte = doc.getElementById("question-texte").textContent;
  const boutons = doc.querySelectorAll("#question-options .bouton-option");
  // retrouver le scénario courant pour connaître la bonne réponse
  const scen = window.SCENARIOS.find(s => s.situation === texte);
  if (!scen) { echecs++; console.log("ÉCHEC : scénario introuvable pour " + texte.slice(0, 40)); break; }
  let choix = scen.bonne;
  if (!premiereFausseFaite) { choix = (scen.bonne + 1) % scen.options.length; premiereFausseFaite = true; }
  boutons[choix].click();
  const verdict = doc.getElementById("question-verdict").textContent;
  verifier(verdict.length > 30, "un verdict explicatif s'affiche (" + scen.id + ")");
  doc.querySelector("#question-verdict .bouton-suite").click();
}
verifier(visible("vue-fin"), "la fin de catégorie s'affiche quand tout est maîtrisé");
verifier(doc.getElementById("fin-contenu").textContent.includes("maîtrisée"),
  "le message de catégorie maîtrisée apparaît");

// La catégorie ne doit plus proposer de questions
Moteur.demarrerQuiz("lancer");
verifier(doc.getElementById("fin-contenu").textContent.includes("déjà"),
  "une catégorie maîtrisée n'est pas reproposée");

// Vérification de la persistance de maîtrise
const maitrise = JSON.parse(memoire["kb_maitrise"]);
const idsLancer = window.SCENARIOS.filter(s => s.cat === "lancer" && s.modes.includes("quiz")).map(s => s.id);
verifier(idsLancer.every(id => maitrise[id]), "toutes les situations 'lancer' sont marquées maîtrisées");

/* ----- 3. Partie simulée complète ----- */
Moteur.lancerPartie();
verifier(visible("vue-question"), "la partie simulée démarre sur une situation");
verifier(doc.getElementById("zone-tableau").textContent.includes("Manche"),
  "le tableau de bord (manche, score, retraits) s'affiche");
verifier(doc.getElementById("zone-terrain").innerHTML.includes("<svg"),
  "le terrain SVG s'affiche");

let jeux = 0, bonnes = 0;
garde = 0;
while (visible("vue-question") && garde++ < 300) {
  const texte = doc.getElementById("question-texte").textContent;
  const scen = window.SCENARIOS.find(s => s.situation === texte);
  if (!scen) { echecs++; console.log("ÉCHEC : scénario de partie introuvable"); break; }
  // répond juste 2 fois sur 3
  const juste = (jeux % 3) !== 2;
  const choix = juste ? scen.bonne : (scen.bonne + 1) % scen.options.length;
  if (juste) bonnes++;
  jeux++;
  doc.querySelectorAll("#question-options .bouton-option")[choix].click();
  doc.querySelector("#question-verdict .bouton-suite").click();
}
verifier(visible("vue-fin"), "la partie se termine après " + jeux + " jeux");
const fin = doc.getElementById("fin-contenu").textContent;
verifier(fin.includes("Fin de la partie"), "l'écran de fin de partie s'affiche");
verifier(fin.includes(bonnes + " bonnes décisions sur " + jeux),
  "le bilan d'arbitrage est exact (" + bonnes + "/" + jeux + ")");
console.log("Extrait du bilan :", fin.replace(/\s+/g, " ").slice(0, 160));

/* ----- 4. Statistiques par catégorie ----- */
Moteur.allerAccueil();
const statsTexte = doc.getElementById("stats-accueil").textContent;
verifier(/%/.test(statsTexte), "les pourcentages par catégorie s'affichent");
const stats = JSON.parse(memoire["kb_stats"]);
verifier(stats.lancer && stats.lancer.total >= 6, "les statistiques 'lancer' sont enregistrées");

/* ----- 5. Réinitialisation ----- */
Moteur.reinitialiserTout();
verifier(doc.getElementById("stats-accueil").textContent.includes("0 situation"),
  "la réinitialisation remet la progression à zéro");

console.log(echecs === 0 ? "\nTOUS LES TESTS PASSENT" : "\n" + echecs + " TEST(S) EN ÉCHEC");
process.exit(echecs === 0 ? 0 : 1);
