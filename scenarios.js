/* ============================================================
   L'ARBITRE DE KICKBALL — scenarios.js
   Banque de situations d'arbitrage (données uniquement).
   Référence : Règlement Kickball, Sports Laval (2021).
   https://sportslaval.qc.ca/wp-content/uploads/2021/07/Règlement-Kickball.pdf

   Structure d'un scénario :
   - id          : identifiant unique (sert au suivi de maîtrise)
   - cat         : clé de catégorie (voir CATEGORIES)
   - modes       : ["quiz"] et/ou ["partie"]
   - situation   : texte présenté à l'apprenti arbitre
   - options     : 3 ou 4 choix de décision
   - bonne       : index (0...) de la bonne décision
   - explication : justification avec référence à l'article
   - pre         : (mode partie) condition sur l'état du jeu
                   "toujours" | "coureurAuMoinsUn" | "aucunCoureur"
   - effet       : (mode partie) conséquence appliquée au jeu
                   { type: "rien" | "retraitBotteur" | "retraitCoureurTete"
                         | "retraitBotteurAvance" | "botteurSauf" (buts: 1-4)
                         | "coureurTeteAvance" }
   ============================================================ */

const CATEGORIES = {
  lancer:   { nom: "Le lancer et la règle des 5 lancers", ref: "Articles 5 et 6" },
  botte:    { nom: "Le botté et les fausses balles",      ref: "Articles 5 et 6" },
  retraits: { nom: "Les retraits",                        ref: "Article 6" },
  course:   { nom: "La course sur les buts",              ref: "Articles 5 et 6" },
  pointage: { nom: "Pointage, manches et durée",          ref: "Articles 4 et 8" },
  terrain:  { nom: "Terrain, équipes et positions",       ref: "Articles 1, 2, 3 et 12" },
  jugement: { nom: "Jugement d'arbitre (zones grises)",   ref: "Cas non tranchés par le règlement" }
};

const SCENARIOS = [

  /* ---------- LE LANCER ---------- */
  {
    id: "L1", cat: "lancer", modes: ["quiz", "partie"],
    situation: "Le lanceur envoie le ballon, qui bondit deux fois avant d'arriver au marbre. Le botteur le laisse passer sans tenter de botter.",
    options: [
      "Le lancer compte : c'est le 1er des 5 lancers permis.",
      "Le lancer est invalide (ballon bondissant) : il ne compte pas, on relance.",
      "Le botteur est retiré pour avoir refusé de botter."
    ],
    bonne: 1,
    explication: "Le règlement exige que le ballon roule jusqu'au botteur. « Un lancer à l'extérieur de cette zone ou bondissant n'est pas valide » : il ne compte donc pas dans les 5 lancers. Demandez simplement au lanceur de recommencer en faisant rouler le ballon.",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "L2", cat: "lancer", modes: ["quiz", "partie"],
    situation: "Le botteur en est à son 5e lancer valide. Il tente de botter, rate complètement le ballon, qui passe dans la zone.",
    options: [
      "Il a droit à un 6e lancer de courtoisie.",
      "Le botteur est retiré : il n'a pas réussi à botter après 5 lancers.",
      "On recommence le compte à zéro."
    ],
    bonne: 1,
    explication: "Article 6 : « le botteur n'a pas réussi à botter la balle après 5 lancers » est un retrait. La seule exception est un 5e lancer botté en fausse balle, qui donne une chance ultime de reprise.",
    pre: "toujours", effet: { type: "retraitBotteur" }
  },
  {
    id: "L3", cat: "lancer", modes: ["quiz", "partie"],
    situation: "Sur son 5e lancer, le botteur botte le ballon... en fausse balle (c'est sa première fausse balle).",
    options: [
      "Le botteur est retiré : 5 lancers, c'est terminé.",
      "Le botteur a droit à une chance ultime de reprise : on lance un 6e ballon.",
      "La fausse balle annule tout : on repart à zéro lancer."
    ],
    bonne: 1,
    explication: "Règle du 5 lancers : « Un botteur a droit à 5 lancers, avec une chance ultime de reprise si le cinquième lancer est une fausse balle. » Il reçoit donc un lancer supplémentaire.",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "L4", cat: "lancer", modes: ["quiz", "partie"],
    situation: "Le lanceur fait rouler le ballon, mais celui-ci passe à environ un mètre et demi à côté du marbre. Le botteur ne bouge pas.",
    options: [
      "Le lancer compte quand même dans les 5 lancers.",
      "Le lancer est hors de la zone du botteur (environ 1 mètre de largeur) : il est invalide et ne compte pas.",
      "C'est une fausse balle pour le botteur."
    ],
    bonne: 1,
    explication: "« La largeur de la zone du botteur est d'environ 1 mètre. Un lancer à l'extérieur de cette zone ou bondissant n'est pas valide. » Un lancer invalide ne pénalise pas le botteur : on relance.",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "L5", cat: "lancer", modes: ["quiz", "partie"],
    situation: "Impatient, le botteur s'avance et botte le ballon alors qu'il roule encore à environ 3 mètres du marbre.",
    options: [
      "Le botté est valide si le ballon part en territoire des bonnes balles.",
      "Le botté est invalide : le botteur doit attendre que le ballon soit à moins d'un mètre du marbre. On reprend le lancer.",
      "Le botteur est immédiatement retiré."
    ],
    bonne: 1,
    explication: "Article 5 : « Le botteur doit attendre que le ballon soit à moins d'un mètre du marbre avant de botter le ballon. » Un botté prématuré ne compte pas : on reprend le lancer (et on rappelle gentiment la règle à l'enfant).",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "L6", cat: "lancer", modes: ["quiz"],
    situation: "Question de règlement : à combien de lancers valides un botteur a-t-il droit avant d'être retiré ?",
    options: ["3 lancers", "4 lancers", "5 lancers", "Aucune limite"],
    bonne: 2,
    explication: "Le botteur a droit à 5 lancers valides, avec une chance ultime de reprise si le 5e lancer est botté en fausse balle. C'est plus généreux que les 3 prises du baseball : adapté aux jeunes."
  },

  /* ---------- LE BOTTÉ ET LES FAUSSES BALLES ---------- */
  {
    id: "B1", cat: "botte", modes: ["quiz", "partie"],
    situation: "Le ballon arrive au marbre. Surpris, le botteur le frappe avec la main et le ballon part loin au champ. Il s'élance vers le 1er but.",
    options: [
      "Le jeu est valide : le ballon est en jeu.",
      "Le botté est invalide : on doit botter avec la jambe ou le pied. Le coup ne compte pas, on reprend le lancer.",
      "Le botteur est retiré pour avoir touché le ballon avec la main."
    ],
    bonne: 1,
    explication: "Article 5 : « Le botteur qui se trouve dans la zone de frappe doit botter le ballon avec la jambe ou le pied. » Un contact avec la main n'est pas un botté : ballon mort, on reprend. Le règlement de Sports Laval ne prévoit pas de retrait pour ce geste.",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "B2", cat: "botte", modes: ["quiz", "partie"],
    situation: "Un botteur habile retient volontairement son botté et pose à peine le pied sur le ballon, qui roule doucement à 2 mètres devant le marbre — un amorti parfait. Il file vers le 1er but.",
    options: [
      "Bien joué : le jeu continue.",
      "Les amortis ne sont pas permis : le botté est annulé et on reprend le lancer.",
      "C'est automatiquement une fausse balle."
    ],
    bonne: 1,
    explication: "Article 5 : « Les amortis ne sont pas permis. » Le règlement ne précise pas la sanction ; la pratique courante est d'annuler le jeu et de reprendre le lancer. Annoncez cette convention aux deux équipes avant la partie pour éviter les contestations.",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "B3", cat: "botte", modes: ["quiz", "partie"],
    situation: "Le ballon botté retombe et s'immobilise à environ 2 mètres du marbre, à l'intérieur du cercle tracé autour de celui-ci. C'est la première fois pour ce botteur.",
    options: [
      "Le ballon est en jeu : le botteur peut courir.",
      "C'est une fausse balle (zone de 3 mètres autour du marbre) : on la compte, et on reprend le lancer.",
      "Le botteur est retiré sur-le-champ."
    ],
    bonne: 1,
    explication: "Article 1 : « La zone de fausse-balle a un rayon de 3 mètres à partir du marbre. » Un ballon qui reste dans cette zone est une fausse balle. À la 3e fausse balle, le botteur sera retiré (article 6).",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "B4", cat: "botte", modes: ["quiz", "partie"],
    situation: "Le botteur vient de botter sa 3e fausse balle de la présence au marbre.",
    options: [
      "On continue : seules les prises comptent.",
      "Le botteur est retiré : trois fausses balles entraînent le retrait.",
      "Il a droit à une dernière chance de reprise."
    ],
    bonne: 1,
    explication: "Article 6 : un joueur est retiré « si le botteur botte trois fausses balles ». La chance ultime de reprise n'existe que pour un 5e lancer botté en fausse balle, pas pour une 3e fausse balle.",
    pre: "toujours", effet: { type: "retraitBotteur" }
  },
  {
    id: "B5", cat: "botte", modes: ["quiz", "partie"],
    situation: "Le botteur envoie un superbe ballon en hauteur vers le champ centre. Le voltigeur de centre l'attrape au vol avant qu'il ne touche le sol. Un coureur était parti du 1er but.",
    options: [
      "Le botteur est sauf puisque le ballon est allé loin.",
      "Le botteur est retiré (ballon attrapé au vol) et le coureur doit revenir à son but.",
      "Le botteur ET le coureur sont automatiquement retirés."
    ],
    bonne: 1,
    explication: "Article 6 : retrait « si le ballon botté par le joueur est attrapé au vol par l'équipe en défensive ». Le coureur, lui, doit revenir à son but : il n'est retiré que si la défensive touche son but avec le ballon avant son retour (principe du retour au but, simplifié au primaire).",
    pre: "toujours", effet: { type: "retraitBotteur" }
  },
  {
    id: "B6", cat: "botte", modes: ["quiz"],
    situation: "Question de règlement : combien de fausses balles entraînent le retrait du botteur ?",
    options: ["2 fausses balles", "3 fausses balles", "4 fausses balles", "Les fausses balles ne comptent jamais"],
    bonne: 1,
    explication: "Article 6 : trois fausses balles = retrait. Souvenez-vous des deux compteurs distincts par botteur : 5 lancers valides au maximum, et 3 fausses balles au maximum."
  },

  /* ---------- LES RETRAITS ---------- */
  {
    id: "R1", cat: "retraits", modes: ["quiz", "partie"],
    situation: "Un coureur file du 2e vers le 3e but. L'arrêt-court ramasse le ballon et le LANCE sur le coureur, qu'il atteint dans le dos. Toute la défensive crie « Retiré ! ».",
    options: [
      "Le coureur est retiré : il a été touché par le ballon.",
      "Le coureur est SAUF : il est interdit de lancer le ballon sur un coureur. On le déclare sauf au but visé et on rappelle la règle.",
      "Le coureur retourne à son but de départ."
    ],
    bonne: 1,
    explication: "Article 5 : « Les joueurs de champ peuvent retirer le coureur en transportant le ballon et en le touchant, mais jamais en lançant le ballon sur le coureur. » C'est LA grande différence avec le kickball adulte (et avec le ballon-chasseur !). Au primaire, cette règle protège les enfants. C'est l'erreur défensive la plus fréquente : attendez-vous à la siffler souvent.",
    pre: "coureurAuMoinsUn", effet: { type: "coureurTeteAvance" }
  },
  {
    id: "R2", cat: "retraits", modes: ["quiz", "partie"],
    situation: "Le botteur frappe un ballon au sol vers l'arrêt-court, qui le ramasse, court au 1er but et touche le coussin avec le ballon en main avant l'arrivée du botteur-coureur.",
    options: [
      "Le coureur est sauf : il faut toucher le coureur lui-même.",
      "Le botteur-coureur est retiré : le ballon est arrivé au but avant lui et il ne peut pas revenir au marbre.",
      "Le jeu est à reprendre."
    ],
    bonne: 1,
    explication: "Article 6 : retrait « si le ballon arrive avant le coureur à un but et qu'il ne puisse revenir à son but précédent ». Le botteur-coureur ne peut jamais « revenir » au marbre : c'est le retrait forcé classique au 1er but. Pas besoin de toucher le coureur dans ce cas.",
    pre: "toujours", effet: { type: "retraitBotteurAvance" }
  },
  {
    id: "R3", cat: "retraits", modes: ["quiz", "partie"],
    situation: "Un coureur est coincé entre le 1er et le 2e but. Le deuxième-but, ballon en main, court vers lui et le touche à l'épaule avec le ballon.",
    options: [
      "Le coureur est retiré : touché par un joueur qui transporte le ballon.",
      "Le coureur est sauf : on ne peut pas toucher un coureur.",
      "Le coureur retourne au 1er but sans pénalité."
    ],
    bonne: 0,
    explication: "Article 6 : retrait « si le coureur est touché par un joueur qui a le ballon ». C'est la manière correcte de retirer un coureur entre deux buts : transporter le ballon et toucher le coureur (jamais le lancer sur lui).",
    pre: "coureurAuMoinsUn", effet: { type: "retraitCoureurTete" }
  },
  {
    id: "R4", cat: "retraits", modes: ["quiz", "partie"],
    situation: "Le lanceur prépare son lancer. Avant même que le ballon ne soit botté, le coureur du 1er but s'élance vers le 2e but pour le « voler ».",
    options: [
      "C'est permis s'il arrive au 2e but avant le ballon.",
      "Le coureur est retiré : il est interdit de quitter son but avant le botté.",
      "On lui donne un avertissement et il revient au 1er but, sans plus."
    ],
    bonne: 1,
    explication: "Article 5 : « Il n'est pas permis de s'éloigner du but ni de voler un but. Le coureur doit demeurer sur le but jusqu'à ce que la balle soit bottée sous peine d'être retiré. » Le règlement est strict : c'est un retrait. En contexte de fête, vous pouvez convenir d'un avertissement à la première infraction — mais annoncez-le avant la partie.",
    pre: "coureurAuMoinsUn", effet: { type: "retraitCoureurTete" }
  },
  {
    id: "R5", cat: "retraits", modes: ["quiz", "partie"],
    situation: "Sur un relais entre le voltigeur et le deuxième-but, le ballon lancé frappe ACCIDENTELLEMENT un coureur en pleine course. La défensive réclame le retrait.",
    options: [
      "Le coureur est retiré : il a été touché par le ballon.",
      "Le coureur est sauf : seul un toucher avec le ballon EN MAIN retire un coureur. Le jeu continue.",
      "Le jeu est arrêté et tout le monde revient à son but."
    ],
    bonne: 1,
    explication: "La logique de l'article 5 s'applique : un coureur ne peut être retiré « jamais en lançant le ballon sur le coureur », que le lancer soit volontaire ou non. Un contact accidentel sur un relais ne retire personne : le jeu continue normalement.",
    pre: "coureurAuMoinsUn", effet: { type: "rien" }
  },
  {
    id: "R6", cat: "retraits", modes: ["quiz"],
    situation: "Question de règlement : combien de retraits faut-il pour que l'équipe à l'attaque passe à la défensive ?",
    options: ["2 retraits", "3 retraits", "4 retraits", "Quand tous les joueurs ont botté"],
    bonne: 1,
    explication: "Article 6 : « L'équipe à l'attaque passe à la défensive lorsqu'elle cumule trois retraits. » (Variante fête d'école fréquente : tout le monde botte avant de changer de côté — à convenir d'avance si vous l'adoptez.)"
  },
  {
    id: "R7", cat: "retraits", modes: ["quiz"],
    situation: "Question de règlement : parmi ces situations, laquelle n'est PAS un retrait selon le règlement de Sports Laval ?",
    options: [
      "Le ballon botté est attrapé au vol.",
      "Le coureur quitte son but avant le botté.",
      "Le coureur est atteint par un ballon lancé sur lui.",
      "Le botteur botte trois fausses balles."
    ],
    bonne: 2,
    explication: "Lancer le ballon sur un coureur ne retire jamais personne au primaire — c'est même interdit. Les trois autres situations sont des retraits prévus à l'article 6."
  },

  /* ---------- LA COURSE SUR LES BUTS ---------- */
  {
    id: "C1", cat: "course", modes: ["quiz", "partie"],
    situation: "Pendant que le lanceur s'apprête à lancer, le coureur du 2e but garde un pied à 2 mètres du coussin « pour prendre de l'avance », comme au baseball.",
    options: [
      "C'est permis tant qu'il ne court pas.",
      "C'est interdit : le coureur doit demeurer SUR le but jusqu'au botté, sous peine d'être retiré.",
      "C'est permis seulement au 2e but."
    ],
    bonne: 1,
    explication: "Article 5 : « Il n'est pas permis de s'éloigner du but [...]. Le coureur doit demeurer sur le but jusqu'à ce que la balle soit bottée sous peine d'être retiré. » Contrairement au baseball, aucune avance n'est tolérée. En pratique au primaire : un rappel verbal rapide avant de sévir.",
    pre: "coureurAuMoinsUn", effet: { type: "retraitCoureurTete" }
  },
  {
    id: "C2", cat: "course", modes: ["quiz", "partie"],
    situation: "Botté au sol. Le botteur-coureur s'élance vers le 1er but... déjà occupé par un coéquipier qui hésite à partir. Les deux risquent de se retrouver sur le même coussin.",
    options: [
      "Deux coureurs peuvent partager un but.",
      "Le coureur du 1er but est FORCÉ d'avancer au 2e : le botteur devenant coureur, son but précédent n'est plus disponible.",
      "Le botteur doit retourner au marbre et rebotter."
    ],
    bonne: 1,
    explication: "C'est la logique du but forcé (article 6 : un coureur est retiré si le ballon arrive au but « et qu'il ne puisse revenir à son but précédent »). Quand le botteur court au 1er but, le coureur qui s'y trouve perd son droit au coussin et doit avancer. Un seul coureur par but : guidez-les de la voix, les petits oublient souvent de partir !",
    pre: "coureurAuMoinsUn", effet: { type: "botteurSauf", buts: 1 }
  },
  {
    id: "C3", cat: "course", modes: ["quiz", "partie"],
    situation: "Un coureur quitte le 2e but vers le 3e, voit que le troisième-but va recevoir le ballon, et rebrousse chemin. Il retouche le 2e but (resté libre) avant que la défensive ne puisse le toucher.",
    options: [
      "Il est retiré : on n'a pas le droit de reculer.",
      "Il est sauf : il a pu revenir à son but précédent, qui était libre.",
      "Il est sauf, mais perd le droit d'avancer au prochain botté."
    ],
    bonne: 1,
    explication: "Article 6 : le retrait sur ballon au but ne s'applique que si le coureur « ne puisse revenir à son but précédent ». S'il peut revenir et que le but est libre, il est sauf. Reculer pour se réfugier est donc permis.",
    pre: "coureurAuMoinsUn", effet: { type: "rien" }
  },
  {
    id: "C4", cat: "course", modes: ["quiz"],
    situation: "Question de règlement : pourquoi utilise-t-on un coussin DOUBLE au 1er but ?",
    options: [
      "Pour que le but soit plus visible.",
      "Pour la sécurité : le coureur prend la moitié extérieure, le défenseur la moitié intérieure, ce qui évite les collisions.",
      "Pour permettre à deux coureurs d'occuper le but."
    ],
    bonne: 1,
    explication: "Article 1 : « Le coussin double sera utilisé au 1er but. » C'est le but où les collisions sont les plus probables (le défenseur attend le ballon pendant que le coureur arrive à pleine vitesse). Chacun sa moitié : pensez à l'expliquer aux enfants avant la partie."
  },
  {
    id: "C5", cat: "course", modes: ["partie"],
    situation: "Botté franc au sol entre le 3e but et l'arrêt-court. Le botteur-coureur atteint le 1er but clairement avant le relais de la défensive. Aucun contact, aucun incident.",
    options: [
      "Coureur sauf au 1er but : le jeu est bon.",
      "Coureur retiré : le ballon a touché le sol.",
      "Botté à reprendre."
    ],
    bonne: 0,
    explication: "Rien à signaler : botté valide, coureur plus rapide que le relais, il est sauf. Une bonne partie de l'arbitrage consiste aussi à reconnaître les jeux parfaitement légaux et à laisser jouer.",
    pre: "toujours", effet: { type: "botteurSauf", buts: 1 }
  },
  {
    id: "C6", cat: "course", modes: ["partie"],
    situation: "Magnifique botté en flèche par-dessus le voltigeur de gauche ! Le ballon roule loin. Le botteur-coureur passe le 1er but et atteint le 2e but avant le retour du ballon. Les autres coureurs avancent d'autant.",
    options: [
      "Double valide : coureur sauf au 2e but.",
      "Le coureur ne peut prendre qu'un but à la fois.",
      "Le ballon est mort dès qu'il dépasse les voltigeurs."
    ],
    bonne: 0,
    explication: "Aucune règle ne limite le nombre de buts franchis sur un même botté : tant que le ballon est en jeu, le coureur avance à ses risques. Le jeu ne s'arrête que lorsque le lanceur reprend le ballon en sa possession dans sa zone.",
    pre: "toujours", effet: { type: "botteurSauf", buts: 2 }
  },
  {
    id: "C7", cat: "course", modes: ["partie"],
    situation: "Botté énorme jusqu'au fond du champ ! Pendant que les voltigeurs courent après le ballon, le botteur-coureur fait le tour complet des buts et franchit le marbre. La défensive n'a jamais pu le menacer.",
    options: [
      "Circuit valide : un point est marqué.",
      "Le tour complet sur un seul botté est interdit.",
      "Le point ne compte que si le ballon sort du terrain."
    ],
    bonne: 0,
    explication: "Article 8 : « Un point est accordé lorsqu'un des membres de l'équipe complète le tour des buts. » Le circuit « intérieur » est parfaitement valide. Vérifiez simplement que le coureur a bien touché chaque but au passage.",
    pre: "toujours", effet: { type: "botteurSauf", buts: 4 }
  },

  /* ---------- POINTAGE, MANCHES ET DURÉE ---------- */
  {
    id: "P1", cat: "pointage", modes: ["quiz"],
    situation: "L'équipe à l'attaque déchaînée vient de marquer son 5e point de la demi-manche, et il n'y a toujours pas 3 retraits. Un autre coureur s'apprête à franchir le marbre.",
    options: [
      "Les points continuent de s'accumuler tant qu'il n'y a pas 3 retraits.",
      "Maximum de 5 points par demi-manche : on arrête là et on change de côté.",
      "On efface les points et on recommence la manche."
    ],
    bonne: 1,
    explication: "Article 8 : « Maximum de 5 points par ½ manche. » Cette règle de clémence évite les manches interminables et les écarts humiliants. Dès le 5e point, changez de côté même sans 3 retraits.",
  },
  {
    id: "P2", cat: "pointage", modes: ["quiz"],
    situation: "Le chronomètre indique 30 minutes pile. Le lanceur vient tout juste de lâcher le ballon vers le botteur. Faut-il siffler la fin immédiatement ?",
    options: [
      "Oui : 30 minutes, tout s'arrête net.",
      "Non : le jeu est « en cours » dès que la balle quitte la main du lanceur. On termine ce jeu, puis la partie est finie.",
      "On joue une manche supplémentaire complète."
    ],
    bonne: 1,
    explication: "Article 4 : « La fin du jeu en cours au bout de 30 minutes détermine la fin du match » et « le jeu est considéré comme en cours lorsque la balle quitte la main du lanceur. » On laisse donc le jeu se terminer avant de siffler la fin.",
  },
  {
    id: "P3", cat: "pointage", modes: ["quiz"],
    situation: "Question de règlement : comment détermine-t-on quelle équipe commence en défensive ?",
    options: [
      "L'équipe la plus jeune commence à botter.",
      "Un pile ou face avant la partie détermine l'équipe receveur et l'équipe visiteur.",
      "L'arbitre décide selon son humeur."
    ],
    bonne: 1,
    explication: "Article 4 : « Un “pile ou face” avant la partie déterminera qui sera l'équipe receveur et l'équipe visiteur. » Prévoyez une pièce de monnaie dans votre poche d'arbitre !"
  },
  {
    id: "P4", cat: "pointage", modes: ["quiz"],
    situation: "Question de règlement : quand un point est-il accordé ?",
    options: [
      "Chaque fois qu'un coureur atteint le 3e but.",
      "Lorsqu'un joueur complète le tour des buts et franchit le marbre.",
      "Chaque fois que le botteur atteint le 1er but."
    ],
    bonne: 1,
    explication: "Article 8 : « Un point est accordé lorsqu'un des membres de l'équipe complète le tour des buts. » Marbre → 1er → 2e → 3e → marbre, dans l'ordre et en touchant chaque but."
  },
  {
    id: "P5", cat: "pointage", modes: ["quiz"],
    situation: "Question de règlement : quelle est la durée d'une partie selon le règlement de Sports Laval ?",
    options: ["20 minutes", "30 minutes", "45 minutes", "7 manches complètes"],
    bonne: 1,
    explication: "Article 4 : « La partie est d'une durée de 30 minutes. » Pour votre fête d'école, c'est vous (ou l'horaire des rotations d'activités) qui fixez la durée — mais 30 minutes est un bon repère."
  },

  /* ---------- TERRAIN, ÉQUIPES ET POSITIONS ---------- */
  {
    id: "T1", cat: "terrain", modes: ["quiz"],
    situation: "Question de règlement : quelle est la distance entre les buts ?",
    options: ["10 mètres", "15 mètres (45 pieds)", "20 mètres", "27 mètres comme au baseball"],
    bonne: 1,
    explication: "Article 1 : « Les buts sont à 15 mètres (45 pieds) les uns des autres. » Pour des élèves du 1er cycle, n'hésitez pas à réduire à 10-12 mètres : des petites jambes sur 15 mètres, ça fait beaucoup de retraits forcés."
  },
  {
    id: "T2", cat: "terrain", modes: ["quiz"],
    situation: "Question de règlement : quel équipement est obligatoire pour les joueurs ?",
    options: [
      "Des gants de baseball",
      "Des souliers de course",
      "Un casque protecteur",
      "Des protège-tibias"
    ],
    bonne: 1,
    explication: "Article 2 : « Le port de souliers de course est obligatoire. » Le matériel se résume à : 1 ballon de kickball, 3 buts et 1 marbre. Vérifiez les chaussures des élèves avant de commencer (les sandales de fête d'école sont l'ennemi de l'arbitre)."
  },
  {
    id: "T3", cat: "terrain", modes: ["quiz", "partie"],
    situation: "Avant le botté, le troisième-but s'avance jusqu'à 3 mètres DEVANT le lanceur pour intimider le botteur.",
    options: [
      "C'est une tactique défensive permise.",
      "C'est interdit : les joueurs défensifs doivent être positionnés derrière le lanceur. Replacez le joueur avant le lancer.",
      "Le botteur obtient automatiquement le 1er but."
    ],
    bonne: 1,
    explication: "Article 12 : « Les joueurs en défensive peuvent se placer n'importe où sur le terrain. La seule restriction est qu'ils doivent être positionnés derrière le lanceur. » (Le receveur, derrière le marbre, est l'exception évidente.) Pas de pénalité prévue : on replace le joueur et on joue.",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "T4", cat: "terrain", modes: ["quiz", "partie"],
    situation: "Dès que le ballon quitte sa main, le lanceur fonce vers le marbre pour être prêt à cueillir un amorti, avant même le botté.",
    options: [
      "C'est permis : le ballon est lancé.",
      "C'est interdit : le lanceur doit demeurer sur sa plaque jusqu'à ce que la balle soit bottée.",
      "C'est permis seulement s'il y a des coureurs sur les buts."
    ],
    bonne: 1,
    explication: "Article 12 : « Le lanceur sera placé sur la plaque du lanceur et doit y demeurer jusqu'à ce que la balle soit bottée. » Faites reprendre le lancer si le lanceur quitte sa plaque trop tôt.",
    pre: "toujours", effet: { type: "rien" }
  },
  {
    id: "T5", cat: "terrain", modes: ["quiz"],
    situation: "Question de règlement : combien de joueurs le règlement prévoit-il en défensive sur le terrain ?",
    options: ["9 joueurs", "10 joueurs", "12 joueurs", "Autant qu'on veut"],
    bonne: 2,
    explication: "Article 3 : « Il y a 12 joueurs à la défensive sur le terrain » (minimum de 12 joueurs par équipe, et tous les joueurs doivent botter). En fête d'école, adaptez librement au nombre d'élèves présents — l'important est que tout le monde joue."
  },
  {
    id: "T6", cat: "terrain", modes: ["quiz"],
    situation: "Question de règlement : quelles sont les positions défensives nommées par le règlement ?",
    options: [
      "Lanceur, receveur, 1er-but, 2e-but, arrêt-court, 3 voltigeurs (+ joueurs de champ supplémentaires)",
      "Gardien, défenseurs, attaquants",
      "Lanceur et 11 joueurs libres"
    ],
    bonne: 0,
    explication: "Article 5 : un lanceur, un receveur, un premier-but, un deuxième-but, un arrêt-court, un voltigeur de gauche, de centre et de droite, « et d'autres joueurs de champ extérieur selon le nombre de joueurs ». Curiosité : le troisième-but n'est pas nommé dans la liste — un oubli probable du règlement, ajoutez-le sans hésiter."
  },

  /* ---------- JUGEMENT D'ARBITRE (ZONES GRISES) ---------- */
  {
    id: "J1", cat: "jugement", modes: ["quiz", "partie"],
    situation: "ZONE GRISE — Un coureur est entre le 2e et le 3e but quand le lanceur reprend le ballon en sa possession, dans sa zone. Le règlement liste cette situation sous « les retraits ». Que faites-vous ?",
    options: [
      "Lecture stricte : le coureur hors but est retiré.",
      "Interprétation recommandée : le jeu en cours prend fin (ballon mort). Le coureur retourne au dernier but touché, personne n'est retiré.",
      "Le coureur peut continuer de courir librement."
    ],
    bonne: 1,
    explication: "Le règlement de Sports Laval classe maladroitement ce cas sous les retraits. Dans les règlements de référence (WAKA), le retour du ballon au lanceur dans sa zone met simplement FIN AU JEU : les coureurs retournent à leur but. C'est l'interprétation la plus sûre et la plus juste pour des enfants. Annoncez votre convention avant la partie : « quand le lanceur a le ballon, le jeu est arrêté ».",
    pre: "coureurAuMoinsUn", effet: { type: "rien" }
  },
  {
    id: "J2", cat: "jugement", modes: ["quiz"],
    situation: "ZONE GRISE — Le botteur-coureur sprinte, touche le 1er but et, emporté par son élan, le dépasse de plusieurs mètres. Le défenseur le touche avec le ballon pendant qu'il revient tranquillement vers le coussin.",
    options: [
      "Retrait : il n'était plus sur son but.",
      "Tolérance recommandée : laisser le coureur dépasser le 1er but sans risque (comme au baseball), tant qu'il revient directement au coussin. C'est plus sécuritaire.",
      "Le coureur doit aller au 2e but puisqu'il a dépassé le 1er."
    ],
    bonne: 1,
    explication: "Le règlement de Sports Laval ne traite pas ce cas. Exiger qu'un enfant lancé à pleine vitesse s'arrête PILE sur le coussin est dangereux (chutes, collisions) — c'est exactement pourquoi le baseball permet de dépasser le 1er but. Recommandation : tolérez le dépassement du 1er but (et seulement celui-là), et annoncez-le avant la partie."
  },
  {
    id: "J3", cat: "jugement", modes: ["quiz"],
    situation: "ZONE GRISE — Un petit botteur du 1er cycle frappe le ballon de toutes ses forces... mais le ballon ne roule que de 4 mètres, juste hors de la zone de fausse balle. La défensive crie « Amorti ! Interdit ! ».",
    options: [
      "Botté annulé : tout botté court est un amorti.",
      "Le botté est valide : l'amorti est un geste VOLONTAIRE de retenue. Un botté faible mais franc d'un enfant de 7 ans n'est pas un amorti.",
      "Le botteur est retiré."
    ],
    bonne: 1,
    explication: "L'interdiction des amortis vise l'intention de retenir son botté, pas la faiblesse du botté. Au 1er cycle, beaucoup de bottés seront courts sans aucune intention tactique : laissez jouer. Critère pratique : l'enfant a-t-il fait un mouvement de botté complet ? Si oui, c'est valide.",
  },
  {
    id: "J4", cat: "jugement", modes: ["quiz"],
    situation: "ZONE GRISE — Le jour de la fête, une « équipe » n'a que 9 élèves alors que le règlement exige un minimum de 12 joueurs. Que faites-vous ?",
    options: [
      "L'équipe est disqualifiée, l'activité est annulée.",
      "On adapte : on joue à 9 contre 9 en réduisant les positions de champ extérieur. L'esprit de la fête prime sur la lettre du règlement.",
      "On force des élèves d'une autre activité à venir jouer."
    ],
    bonne: 1,
    explication: "Le minimum de 12 joueurs (article 3) vise les ligues organisées. Pour une fête d'école, l'arbitre adapte : moins de voltigeurs, ou des équipes asymétriques avec rotation. Règle d'or de l'arbitre scolaire : sécurité d'abord, plaisir ensuite, règlement enfin.",
  },
  {
    id: "J5", cat: "jugement", modes: ["quiz"],
    situation: "ZONE GRISE — Deux élèves contestent bruyamment votre décision et la partie s'enlise. Quelle est la meilleure posture d'arbitre en contexte scolaire ?",
    options: [
      "Revenir sur la décision pour calmer le jeu.",
      "Expliquer la décision en une phrase, avec le sourire, puis relancer le jeu rapidement. La décision de l'arbitre est finale, mais elle s'explique.",
      "Exclure les deux élèves de l'activité."
    ],
    bonne: 1,
    explication: "Aucun règlement ne couvre ça, mais c'est la compétence d'arbitre la plus utile en fête d'école : décider vite, expliquer brièvement (« le ballon est arrivé avant toi, c'est un retrait, beau sprint quand même ! ») et relancer le jeu. Un jeu qui repart vite éteint 90 % des contestations d'enfants."
  },

  /* ---------- LE RETOUR AU BUT (TAG-UP) ---------- */
  {
    id: "C8", cat: "course", modes: ["quiz", "partie"],
    situation: "Un coureur est au 2e but. Le botteur envoie un ballon haut vers le champ ; le voltigeur de centre l'attrape au vol. Sans attendre, le coureur du 2e était déjà parti vers le 3e dès le contact du botté ; il atteint le 3e but. La défensive relaie le ballon au 2e but (que le coureur a quitté) et le touche avec le ballon.",
    options: [
      "Le coureur est sauf au 3e but : il y est arrivé.",
      "Le coureur est retiré : sur une attrapée au vol, il doit d'abord retoucher son but de départ avant de pouvoir avancer.",
      "Le jeu est annulé et le coureur revient au 2e but sans pénalité."
    ],
    bonne: 1,
    explication: "Règle de l'attrapé au vol (tag-up) : sur un ballon capté de volée, un coureur déjà engagé doit revenir toucher son but de départ APRÈS la capture avant de filer. Comme il était parti trop tôt et n'a pas retouché le 2e, la défensive le retire en touchant ce but (retrait forcé sur tag-up manqué). Sports Laval ne nomme pas cette règle ; le document des cadets canadiens la formule clairement, et elle s'adapte bien au primaire si vous l'annoncez d'avance.",
    pre: "coureurAuMoinsUn", effet: { type: "retraitCoureurTete" }
  },
  {
    id: "C9", cat: "course", modes: ["quiz", "partie"],
    situation: "Coureur au 2e but. Le botteur frappe un ballon haut, attrapé au vol par l'arrêt-court. Cette fois, le coureur reste sur le 2e but, attend la capture, retouche le coussin, PUIS s'élance vers le 3e qu'il atteint avant le relais.",
    options: [
      "Le coureur est retiré : on ne peut pas avancer sur une attrapée.",
      "Le coureur est sauf au 3e but : il a correctement retouché son but après la capture avant d'avancer.",
      "Le botteur ET le coureur sont retirés."
    ],
    bonne: 1,
    explication: "C'est le tag-up exécuté correctement. Le botteur est bien retiré (ballon attrapé au vol), mais le coureur a le droit d'avancer à ses risques une fois qu'il a retouché son but après la capture. Avancer ainsi s'appelle « avancer sur le ballon attrapé » : parfaitement légal.",
    pre: "coureurAuMoinsUn", effet: { type: "coureurTeteAvance" }
  },

  /* ---------- CONTRASTE ENTRE RÈGLEMENTS ---------- */
  {
    id: "J6", cat: "jugement", modes: ["quiz"],
    situation: "ZONE GRISE — Un parent qui a déjà arbitré au kickball adulte vous reproche, devant les élèves, de ne pas accorder le retrait quand un défenseur atteint un coureur en lui lançant le ballon dessus. « Partout ailleurs, ça compte ! » Que répondez-vous ?",
    options: [
      "Il a raison, vous changez votre décision pour le reste de la partie.",
      "Vous maintenez : au primaire (règlement Sports Laval), on ne lance jamais le ballon sur un coureur. C'est une adaptation de sécurité propre aux jeunes, même si le kickball adulte (WAKA, cadets) l'autorise sous la taille.",
      "Vous arrêtez la partie en attendant l'avis de la direction."
    ],
    bonne: 1,
    explication: "Le parent n'a pas tort... pour le kickball adulte : WAKA et le règlement des cadets canadiens autorisent bel et bien de retirer un coureur en l'atteignant d'un ballon lancé sous la taille. Mais le règlement de Sports Laval, conçu pour le primaire, l'interdit expressément — précisément pour protéger les enfants. Connaître les deux versions vous permet de tenir votre décision avec assurance : ce n'est pas une erreur, c'est une règle adaptée à l'âge des joueurs.",
  }
];
