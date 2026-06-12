/* ============================================================
   L'ARBITRE DE KICKBALL — moteur.js
   Logique de l'application : navigation, suivi de maîtrise,
   statistiques par catégorie, quiz et partie simulée.

   Principe de maîtrise (hybride scripté / aléatoire / systématique) :
   - une situation bien jugée est marquée « maîtrisée » et
     n'est plus jamais reproposée (jusqu'à réinitialisation) ;
   - une situation mal jugée est reproposée tant qu'elle
     n'est pas réussie.
   La progression est conservée dans localStorage.
   ============================================================ */

const Moteur = (() => {

  const MANCHES_MAX = 2;          // nombre de manches d'une partie simulée
  const MAX_POINTS_DEMI = 5;      // article 8 : maximum 5 points par demi-manche

  /* ---------- Persistance ---------- */

  const CLE_MAITRISE = "kb_maitrise";
  const CLE_STATS = "kb_stats";

  function lire(cle, defaut) {
    try {
      const brut = localStorage.getItem(cle);
      return brut ? JSON.parse(brut) : defaut;
    } catch (e) { return defaut; }
  }
  function ecrire(cle, valeur) {
    try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch (e) { /* mode privé, etc. */ }
  }

  let maitrise = lire(CLE_MAITRISE, {});            // { idScenario: true }
  let stats = lire(CLE_STATS, {});                  // { cat: { ok: n, total: n } }

  function estMaitrise(s) { return !!maitrise[s.id]; }

  function enregistrerReponse(scenario, correcte) {
    const c = stats[scenario.cat] || { ok: 0, total: 0 };
    c.total++;
    if (correcte) c.ok++;
    stats[scenario.cat] = c;
    ecrire(CLE_STATS, stats);
    if (correcte) {
      maitrise[scenario.id] = true;
      ecrire(CLE_MAITRISE, maitrise);
    }
  }

  function reinitialiserTout() {
    maitrise = {}; stats = {};
    ecrire(CLE_MAITRISE, maitrise);
    ecrire(CLE_STATS, stats);
    allerAccueil();
  }

  function reinitialiserCategorie(cat) {
    SCENARIOS.filter(s => s.cat === cat).forEach(s => delete maitrise[s.id]);
    delete stats[cat];
    ecrire(CLE_MAITRISE, maitrise);
    ecrire(CLE_STATS, stats);
    allerQuiz();
  }

  /* ---------- Utilitaires ---------- */

  function melanger(tableau) {
    const t = tableau.slice();
    for (let i = t.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [t[i], t[j]] = [t[j], t[i]];
    }
    return t;
  }

  function $(id) { return document.getElementById(id); }

  function montrerVue(id) {
    ["vue-accueil", "vue-quiz-cat", "vue-question", "vue-fin"].forEach(v =>
      $(v).classList.toggle("masque", v !== id)
    );
    window.scrollTo(0, 0);
  }

  function echapper(texte) {
    const div = document.createElement("div");
    div.textContent = texte;
    return div.innerHTML;
  }

  /* ---------- Rendu du terrain (SVG) ---------- */

  function svgTerrain(coureurs) {
    const buts = [
      { x: 330, y: 165, occupe: coureurs[0] },   // 1er but
      { x: 200, y: 45,  occupe: coureurs[1] },   // 2e but
      { x: 70,  y: 165, occupe: coureurs[2] }    // 3e but
    ];
    let svg = `<svg viewBox="0 0 400 320" role="img" aria-label="État du terrain : position des coureurs">
      <path d="M200 285 L70 165 L200 45 L330 165 Z" fill="#eef3ea" stroke="#1d6f4e" stroke-width="1.5" stroke-dasharray="5 4"/>
      <line x1="200" y1="285" x2="48" y2="145" stroke="#9aa794" stroke-width="1"/>
      <line x1="200" y1="285" x2="352" y2="145" stroke="#9aa794" stroke-width="1"/>
      <circle cx="200" cy="170" r="13" fill="#f7efdd" stroke="#c99a3c" stroke-width="1.5"/>
      <text x="200" y="174" text-anchor="middle" font-size="10" fill="#854f0b" font-family="inherit">L</text>
      <rect x="188" y="273" width="24" height="24" rx="4" transform="rotate(45 200 285)" fill="#ffffff" stroke="#1d6f4e" stroke-width="1.5"/>
      <text x="200" y="312" text-anchor="middle" font-size="11" fill="#5f655c" font-family="inherit">Marbre</text>`;
    const noms = ["1er but", "2e but", "3e but"];
    const posTexte = [[330, 198], [200, 22], [70, 198]];
    buts.forEach((b, i) => {
      svg += `<rect x="${b.x - 12}" y="${b.y - 12}" width="24" height="24" rx="4" transform="rotate(45 ${b.x} ${b.y})"
                fill="${b.occupe ? "#fbe9e3" : "#ffffff"}" stroke="${b.occupe ? "#d0421b" : "#1d6f4e"}" stroke-width="1.5"/>`;
      if (b.occupe) {
        svg += `<circle cx="${b.x}" cy="${b.y}" r="7" fill="#d0421b"/>`;
      }
      svg += `<text x="${posTexte[i][0]}" y="${posTexte[i][1]}" text-anchor="middle" font-size="11" fill="#5f655c" font-family="inherit">${noms[i]}${b.occupe ? " — coureur" : ""}</text>`;
    });
    svg += `</svg>`;
    return svg;
  }

  /* ---------- Statistiques (accueil) ---------- */

  function pourcentage(cat) {
    const c = stats[cat];
    if (!c || c.total === 0) return null;
    return Math.round((c.ok / c.total) * 100);
  }

  function rendreStatsAccueil() {
    const total = SCENARIOS.length;
    const acquis = SCENARIOS.filter(estMaitrise).length;
    let html = `<h2>Votre progression</h2>
      <p>${acquis} situation${acquis > 1 ? "s" : ""} maîtrisée${acquis > 1 ? "s" : ""} sur ${total}.</p>`;
    html += Object.keys(CATEGORIES).map(cat => {
      const scen = SCENARIOS.filter(s => s.cat === cat);
      const m = scen.filter(estMaitrise).length;
      const p = pourcentage(cat);
      const classe = p === null ? "" : (p >= 80 ? "fort" : (p < 60 ? "faible" : ""));
      return `<div class="ligne-stat">
        <div>
          <div>${echapper(CATEGORIES[cat].nom)}</div>
          <div class="discret">${m}/${scen.length} maîtrisées</div>
        </div>
        <div class="pourcentage ${classe}">${p === null ? "—" : p + " %"}</div>
      </div>`;
    }).join("");
    html += `<button class="bouton-secondaire" onclick="if(confirm('Effacer toute la progression ?')) Moteur.reinitialiserTout()">Réinitialiser toute la progression</button>`;
    $("stats-accueil").innerHTML = html;
  }

  /* ---------- Navigation ---------- */

  function allerAccueil() {
    contexte = null;
    rendreStatsAccueil();
    montrerVue("vue-accueil");
  }

  function quitterQuestion() {
    if (contexte && contexte.type === "quiz") allerQuiz();
    else allerAccueil();
  }

  /* ============================================================
     MODE QUIZ
     ============================================================ */

  function allerQuiz() {
    contexte = null;
    const liste = $("liste-categories");
    liste.innerHTML = Object.keys(CATEGORIES).map(cat => {
      const scen = SCENARIOS.filter(s => s.cat === cat && s.modes.includes("quiz"));
      const m = scen.filter(estMaitrise).length;
      const p = pourcentage(cat);
      const pct = scen.length ? Math.round((m / scen.length) * 100) : 0;
      return `<button class="bouton-cat" onclick="Moteur.demarrerQuiz('${cat}')">
        <div>
          <div class="nom-cat">${echapper(CATEGORIES[cat].nom)}</div>
          <div class="ref-cat">${echapper(CATEGORIES[cat].ref)}${p !== null ? " · taux de réussite " + p + " %" : ""}</div>
        </div>
        <div class="jauge">
          ${m}/${scen.length} maîtrisées
          <div class="jauge-barre"><div class="jauge-rempli" style="width:${pct}%"></div></div>
        </div>
      </button>`;
    }).join("");
    montrerVue("vue-quiz-cat");
  }

  function demarrerQuiz(cat) {
    const file = melanger(SCENARIOS.filter(s =>
      s.cat === cat && s.modes.includes("quiz") && !estMaitrise(s)
    ));
    if (file.length === 0) {
      finCategorie(cat, true);
      return;
    }
    contexte = { type: "quiz", cat, file, reussites: 0, tentatives: 0 };
    prochaineQuestionQuiz();
  }

  function prochaineQuestionQuiz() {
    if (contexte.file.length === 0) {
      finCategorie(contexte.cat, false);
      return;
    }
    const scenario = contexte.file[0];
    rendreQuestion(scenario, null);
  }

  function finCategorie(cat, dejaAcquise) {
    const c = CATEGORIES[cat];
    let html;
    if (dejaAcquise) {
      html = `<h2>Catégorie déjà maîtrisée</h2>
        <p>Vous avez déjà réussi toutes les situations de « ${echapper(c.nom)} ». Bravo, l'arbitre !</p>`;
    } else {
      html = `<h2>Catégorie maîtrisée !</h2>
        <p>Toutes les situations de « ${echapper(c.nom)} » sont maintenant réussies
        (${contexte.reussites} bonnes réponses en ${contexte.tentatives} tentatives cette séance).</p>`;
    }
    html += `<button class="bouton-suite" onclick="Moteur.allerQuiz()">Choisir une autre catégorie</button>
      <button class="bouton-secondaire" onclick="Moteur.reinitialiserCategorie('${cat}')">Réinitialiser cette catégorie pour la refaire</button>`;
    $("fin-contenu").innerHTML = html;
    montrerVue("vue-fin");
  }

  /* ============================================================
     MODE PARTIE SIMULÉE
     ============================================================ */

  let partie = null;

  function lancerPartie() {
    partie = {
      manche: 1,
      demi: 0,                    // 0 = haut (visiteurs au bâton), 1 = bas (receveurs)
      retraits: 0,
      coureurs: [false, false, false],
      score: [0, 0],              // [visiteurs, receveurs]
      ptsDemi: 0,
      dernierId: null,
      reussites: 0,
      tentatives: 0,
      transition: null            // "demi" | "fin" si un changement est dû après ce jeu
    };
    contexte = { type: "partie" };
    prochainJeu();
  }

  function scenariosJouables() {
    const e = partie;
    const compatibles = SCENARIOS.filter(s => {
      if (!s.modes.includes("partie")) return false;
      if (s.id === e.dernierId) return false;
      if (s.pre === "coureurAuMoinsUn") return e.coureurs.some(Boolean);
      if (s.pre === "aucunCoureur") return !e.coureurs.some(Boolean);
      return true; // "toujours"
    });
    const nonMaitrises = compatibles.filter(s => !estMaitrise(s));
    return nonMaitrises.length ? nonMaitrises : compatibles;
  }

  function prochainJeu() {
    const choix = scenariosJouables();
    const scenario = choix[Math.floor(Math.random() * choix.length)];
    partie.dernierId = scenario.id;
    rendreQuestion(scenario, partie);
  }

  /* Applique au jeu la conséquence de la BONNE décision
     (la partie suit toujours le règlement, même si l'apprenti s'est trompé). */
  function appliquerEffet(effet) {
    const e = partie;
    let recit = [];

    function avancerCoureurs(n) {
      let pts = 0;
      const nouveaux = [false, false, false];
      for (let b = 2; b >= 0; b--) {
        if (e.coureurs[b]) {
          const dest = b + n;
          if (dest >= 3) pts++; else nouveaux[dest] = true;
        }
      }
      e.coureurs = nouveaux;
      return pts;
    }

    function marquer(pts) {
      if (pts <= 0) return;
      const restant = MAX_POINTS_DEMI - e.ptsDemi;
      const accordes = Math.min(pts, restant);
      e.ptsDemi += accordes;
      e.score[e.demi === 0 ? 0 : 1] += accordes;
      if (accordes > 0) recit.push(accordes === 1 ? "Un point est marqué !" : accordes + " points sont marqués !");
      if (pts > accordes) recit.push("Le maximum de 5 points par demi-manche est atteint : les points supplémentaires ne comptent pas (article 8).");
    }

    switch (effet.type) {
      case "rien":
        break;
      case "retraitBotteur":
        e.retraits++;
        recit.push("Retrait n° " + e.retraits + ".");
        break;
      case "retraitCoureurTete": {
        for (let b = 2; b >= 0; b--) {
          if (e.coureurs[b]) { e.coureurs[b] = false; break; }
        }
        e.retraits++;
        recit.push("Le coureur est retiré — retrait n° " + e.retraits + ".");
        break;
      }
      case "retraitBotteurAvance": {
        e.retraits++;
        recit.push("Le botteur-coureur est retiré au 1er but — retrait n° " + e.retraits + ".");
        if (e.retraits < 3) marquer(avancerCoureurs(1));
        break;
      }
      case "botteurSauf": {
        const buts = effet.buts || 1;
        marquer(avancerCoureurs(buts));
        if (buts >= 4) marquer(1);
        else e.coureurs[buts - 1] = true;
        break;
      }
      case "coureurTeteAvance": {
        for (let b = 2; b >= 0; b--) {
          if (e.coureurs[b]) {
            e.coureurs[b] = false;
            if (b + 1 >= 3) marquer(1); else e.coureurs[b + 1] = true;
            break;
          }
        }
        break;
      }
    }

    if (e.retraits >= 3) {
      recit.push("Trois retraits : changement de côté !");
      e.transition = "demi";
    } else if (e.ptsDemi >= MAX_POINTS_DEMI) {
      recit.push("Cinq points dans la demi-manche : changement de côté (article 8) !");
      e.transition = "demi";
    }

    return recit;
  }

  function changerDemiManche() {
    const e = partie;
    e.retraits = 0;
    e.coureurs = [false, false, false];
    e.ptsDemi = 0;
    e.transition = null;
    if (e.demi === 0) {
      e.demi = 1;
    } else {
      e.demi = 0;
      e.manche++;
      if (e.manche > MANCHES_MAX) {
        finPartie();
        return false;
      }
    }
    return true;
  }

  function finPartie() {
    const e = partie;
    const [v, r] = e.score;
    let resultat;
    if (v > r) resultat = "Victoire des Visiteurs " + v + " à " + r + ".";
    else if (r > v) resultat = "Victoire des Receveurs " + r + " à " + v + ".";
    else resultat = "Match nul " + v + " à " + r + ".";
    const taux = e.tentatives ? Math.round((e.reussites / e.tentatives) * 100) : 0;
    $("fin-contenu").innerHTML = `<h2>Fin de la partie</h2>
      <p>${resultat}</p>
      <p>Votre arbitrage : <strong>${e.reussites} bonnes décisions sur ${e.tentatives}</strong> (${taux} %).</p>
      <p class="discret">Les situations réussies ne reviendront plus ; les autres vous attendent à la prochaine partie.</p>
      <button class="bouton-suite" onclick="Moteur.lancerPartie()">Arbitrer une nouvelle partie</button>
      <button class="bouton-secondaire" onclick="Moteur.allerAccueil()">Retour à l'accueil</button>`;
    montrerVue("vue-fin");
  }

  function rendreTableau() {
    const e = partie;
    const pastilles = [0, 1, 2].map(i =>
      `<span class="point-retrait${i < e.retraits ? " actif" : ""}"></span>`).join("");
    $("zone-tableau").innerHTML = `<div class="tableau">
      <div class="bloc"><span class="etiquette">Manche</span><span class="valeur">${e.manche}<span style="font-size:13px"> / ${MANCHES_MAX} — ${e.demi === 0 ? "haut" : "bas"}</span></span></div>
      <div class="bloc"><span class="etiquette">Visiteurs</span><span class="valeur">${e.score[0]}</span></div>
      <div class="bloc"><span class="etiquette">Receveurs</span><span class="valeur">${e.score[1]}</span></div>
      <div class="bloc"><span class="etiquette">Retraits</span><span class="retraits-pts">${pastilles}</span></div>
      <div class="bloc"><span class="etiquette">Points / demi-manche</span><span class="valeur">${e.ptsDemi}<span style="font-size:13px"> / ${MAX_POINTS_DEMI}</span></span></div>
    </div>`;
  }

  /* ============================================================
     RENDU D'UNE QUESTION (commun quiz / partie)
     ============================================================ */

  let contexte = null;        // { type: "quiz", cat, file, ... } ou { type: "partie" }
  let scenarioCourant = null;

  function rendreQuestion(scenario, etatPartie) {
    scenarioCourant = scenario;
    $("bouton-quitter").textContent = contexte.type === "quiz"
      ? "\u2190 Quitter (retour aux cat\u00e9gories)"
      : "\u2190 Abandonner la partie";

    if (etatPartie) {
      rendreTableau();
      $("zone-terrain").innerHTML = svgTerrain(etatPartie.coureurs);
      $("zone-terrain").classList.remove("masque");
      $("zone-tableau").classList.remove("masque");
    } else {
      $("zone-tableau").innerHTML = "";
      $("zone-terrain").innerHTML = "";
    }

    const c = CATEGORIES[scenario.cat];
    $("question-ref").textContent = c.nom + " · " + c.ref;
    $("question-texte").textContent = scenario.situation;
    $("question-verdict").innerHTML = "";

    $("question-options").innerHTML = scenario.options.map((opt, i) =>
      `<button class="bouton-option" onclick="Moteur.repondre(${i})">${echapper(opt)}</button>`
    ).join("");

    montrerVue("vue-question");
  }

  function repondre(index) {
    const s = scenarioCourant;
    const correcte = index === s.bonne;
    enregistrerReponse(s, correcte);

    const boutons = $("question-options").querySelectorAll(".bouton-option");
    boutons.forEach((b, i) => {
      b.disabled = true;
      if (i === s.bonne) b.classList.add("correcte");
      else if (i === index) b.classList.add("fautive");
    });

    let recit = [];
    if (contexte.type === "partie") {
      partie.tentatives++;
      if (correcte) partie.reussites++;
      recit = appliquerEffet(s.effet || { type: "rien" });
      rendreTableau();
      $("zone-terrain").innerHTML = svgTerrain(partie.coureurs);
    } else {
      contexte.tentatives++;
      if (correcte) {
        contexte.reussites++;
        contexte.file.shift();                       // maîtrisée : retirée de la file
      } else {
        contexte.file.push(contexte.file.shift());   // reproposée plus tard
      }
    }

    const entete = correcte ? "Bonne décision, l'arbitre !" : "Mauvaise décision";
    let html = `<div class="verdict ${correcte ? "bon" : "mauvais"}">
      <div class="entete-verdict">${entete}</div>
      <p>${echapper(s.explication)}</p>`;
    if (recit.length) {
      html += `<p><strong>${recit.map(echapper).join(" ")}</strong></p>`;
    }
    if (!correcte && contexte.type === "quiz") {
      html += `<p class="discret">Cette situation vous sera reproposée jusqu'à ce qu'elle soit réussie.</p>`;
    }
    html += `<button class="bouton-suite" onclick="Moteur.suite()">${contexte.type === "partie" ? "Jeu suivant" : "Question suivante"}</button></div>`;
    $("question-verdict").innerHTML = html;
    $("question-verdict").querySelector(".bouton-suite").focus();
  }

  function suite() {
    if (contexte.type === "partie") {
      if (partie.transition === "demi") {
        if (!changerDemiManche()) return;   // false = fin de partie affichée
      }
      prochainJeu();
    } else {
      prochaineQuestionQuiz();
    }
  }

  /* ---------- Initialisation ---------- */

  document.addEventListener("DOMContentLoaded", allerAccueil);

  return {
    allerAccueil, allerQuiz, demarrerQuiz, lancerPartie,
    repondre, suite, quitterQuestion,
    reinitialiserTout, reinitialiserCategorie
  };

})();
