# Cahier des charges — Indigo LiveOps Analytics Tool (internal)

## 1. But du projet

Outil interne pour Indigo qui permet de **tout télécharger** depuis le Creator
Dashboard d'un jeu Roblox en un coup (au lieu d'exporter chaque métrique en CSV
une par une), de **marquer les updates**, et de **comparer les métriques
avant/après une update** pour que les producers prennent des décisions data-driven.

Cible v1 : usage interne (les jeux d'Indigo), utilisable par plusieurs producers.
Pas de distribution publique au départ.

## 2. Architecture (hybride extension + web app)

Deux composants, volontairement séparés :

- **Extension Chrome (le "grabber")** — MV3, légère. Vit dans la session
  authentifiée `create.roblox.com`. Elle **observe** les appels JSON que le
  dashboard fait déjà (elle ne crée aucune requête, ne lit aucun cookie, ne
  touche jamais au `.ROBLOSECURITY`). Elle transmet les données capturées à la
  web app.
- **Web app (le "cerveau")** — Next.js + Supabase. Stockage, comptes producers,
  base d'updates, moteur de comparaison avant/après, diagnostic IA. C'est ici
  que vit toute la valeur. L'extension est volontairement bête.

Le hybride est ce qui permet le multi-producer : chaque producer installe
l'extension légère, tout le monde se connecte à la même web app.

> Règle de sécurité absolue : on ne demande JAMAIS à un utilisateur de coller son
> cookie `.ROBLOSECURITY`. L'extension fonctionne dans sa session déjà connectée.

## 3. Carte de l'API Roblox (découverte en Phase 0 — VÉRIFIÉE)

Base : `https://apis.roblox.com`. Tous les graphiques de toutes les pages
(Engagement, Retention, Monetization, Acquisition, Funnels, Performance)
tapent le **même** endpoint de données.

### 3.1 Données de métriques (le cœur)
`POST /analytics-query-gateway/v1/metrics/resource/RESOURCE_TYPE_UNIVERSE/id/{universeId}`

Réponse :
```
operation.queryResult.values[]            // une entrée par série
  .breakdownValue[]   { dimension, value } // ex: CohortDay=1, Platform=Phone (vide = série "Total")
  .dataPoints[]       { time, value, status }
```
- `time` = ISO UTC (les points sont datés à 08:00:00Z UTC — important pour
  l'alignement des fuseaux).
- `status` est souvent `DATA_STATUS_INVALID` : cela signifie "non validé /
  estimé", PAS "faux". Les valeurs correspondent au dashboard. Traiter comme
  valide mais flaggable.
- L'identité de la métrique (son nom) n'est PAS dans la réponse — seulement un
  hash dans `operation.path`. Voir §3.5.

### 3.2 Métadonnées / fraîcheur
`POST /analytics-query-gateway/v1/metrics/metadata`
→ liste `{ metric, latestAvailableTime }`. Donne le **nom** des métriques d'un
batch + la dernière date dispo (utile pour savoir quand les données ont mûri).

### 3.3 Benchmarks (percentiles par genre)
`POST /analytics-benchmark/v1/benchmarks/resource/RESOURCE_TYPE_UNIVERSE/id/{universeId}`
→ séries 50e et 90e percentile, taguées `benchmarkType: BENCHMARK_TYPE_GENRE`,
`genre: "simulation"` (genre détecté pour KameHameHa). Permet de calculer
automatiquement "au-dessus/en-dessous du Xe percentile du genre".

### 3.4 Annotations = marqueurs d'updates (natif !)
`GET /analytics-annotations/v1/universes/{universeId}/annotations?annotationType={n}&inclusiveStartUtcTime=...&inclusiveEndUtcTime=...`
→ Roblox a déjà une infra d'annotations (versions, events, updates) sur la
timeline. La feature "marquer les updates" peut lire ces annotations natives
et/ou stocker les siennes par-dessus.

### 3.5 Mapping nom ↔ hash : AUTOMATIQUE, jamais à la main
Chaque métrique a un hash (`operation.path`) qui peut changer côté Roblox.
**Ne jamais maintenir une table de hash en dur.** L'identité de la métrique est
présente dans le **corps de la requête** (que l'interceptor doit capturer — voir
§5.1). Le mapping est donc reconstruit automatiquement à chaque capture et reste
valide même si Roblox change les hash.

### 3.6 Contexte / permissions
`GET /developer-analytics-aggregations/v1/feature-permissions?universeId={id}&...`
→ `userCanViewAnalyticsForUniverse`, accès perf/insights, etc.
À ignorer pour la capture : `translations-cdn.roblox.com`, `barista-feature-flags`,
`product-experimentation-platform` (bruit pur).

### 3.7 Vocabulaire complet des métriques (36, vérifié)
Engagement : DailyActiveUsers, MonthlyActiveUsers, Visits, AverageSessionLengthMinutes,
SessionDurationSecondsAvg, AveragePlayTimeMinutesPerDAU, TotalPlayTimeHours,
TotalSessionsEndedInBucket, PeakConcurrentPlayers.
Monetization : DailyRevenue, PayingUsers, PayingUsersCVR (conversion),
AverageRevenuePerUser (ARPDAU), AverageRevenuePerPayingUser (ARPPU), ItemMonetizationRevenue.
Retention : ForwardD1Retention, ForwardD7Retention, ForwardD30Retention,
DauMauStickiness, DailyCohortRetention, WeeklyCohortRetention.
Funnels : FunnelStepCompletionRate, FunnelStepChurnRate, FunnelStepOverallCompletionRate,
FunnelStepTotalCount, FunnelUserStepCompletionRate, FunnelUserChurnRate,
FunnelUserOverallCompletionRate, FunnelUserTotalCount.
Performance : ServerFrameRateAvg, ClientFpsAvg, ClientFpsP10, ClientCrashRate15m,
ClientCrashCount, ClientMemoryUsageAvg, ClientMemoryUsagePercentageAvg, MemoryUsageAvg,
CpuTimeAvg, CpuCoreUtilization, CoresPerServerAvg, ComputeEfficiency, OomUnexpectedExits.

## 4. Fonctionnalités (4 couches)

1. **Bulk pull** — un clic récupère toutes les métriques d'un jeu sur une plage
   de dates, au lieu d'exporter chaque graphique à la main.
2. **Update markers** — taguer une update (nom, date, contenu : items, prix,
   events). Couche d'annotation propre au tool (+ lecture des annotations Roblox).
3. **Comparaison avant/après** — choisir une update → le tool calcule les deltas
   sur une fenêtre avant vs après, et flague ce qui a bougé.
4. **Diagnostic IA** — envoyer deltas + changelog à Claude (API Anthropic) pour
   générer le compte-rendu post-update au format producer.

Filtres transverses : jeu, plage de dates, catégorie de métrique, granularité
(jour/heure/semaine), benchmark on/off, breakdown (plateforme, âge, etc.).

## 5. Exigences techniques clés

### 5.1 Capture du corps de requête (IMPÉRATIF)
Le dashboard envoie ses POST via des objets `Request` : le corps est dans
`args[0]` (le Request), pas dans `args[1]`. L'interceptor DOIT cloner le Request
et lire son corps, sinon l'identité des métriques est perdue (§3.5).

### 5.2 Le piège de la comparaison : taux vs volume
Ne JAMAIS comparer des métriques de volume pendant une phase de croissance.
KameHameHa explose en DAU → "+300% de revenue après l'update" ne dit rien.
Classer les métriques :
- **Taux** (conversion %, ARPPU, ARPDAU, retention %, completion funnel) →
  comparables, reflètent l'effet réel de l'update.
- **Volume** (revenue, DAU, paying users, sessions) → confondus par la
  croissance ; les afficher mais flagger "le jeu a crû de X% sur la fenêtre".
Avertir aussi quand deux updates tombent dans la même fenêtre (contamination).

### 5.3 Scope = jeux possédés uniquement
Outil interne, sur les données qu'on a le droit de voir. Capture passive
(on lit ce que le dashboard charge). L'énumération active (replay des requêtes
pour tout tirer sans cliquer) est une phase ultérieure, une fois §5.1 en place.

## 6. Modèle de données (Supabase / Postgres)

- `games` — universeId, name, group/owner, genre, acquisition date
- `metric_snapshots` — game_id, metric_name, date, value, granularity, breakdown, status
- `metric_catalog` — metric_name, current_hash, last_seen (auto-maintenu)
- `updates` — game_id, name, ship_date, notes/changelog, producer_id
- `update_items` — change individuel (ex: "Collect All 3R") lié à une update
- `producers` / `users` — comptes + jeux accessibles (RLS par producer)
- `diagnoses` — comptes-rendus IA sauvegardés (historique try → résultat)

## 7. Ordre de build (lean, win-first)

- **Phase 0 — DONE.** Grab prouvé, endpoints mappés, 36 métriques vérifiées vs
  dashboard live. Universe test : KameHameHa = `10192528661`, genre `simulation`.
- **Phase 1** — interceptor capture le request body (§5.1) → mapping auto.
  Web app ingère, stocke, affiche les séries d'un jeu. Tagging manuel des updates.
- **Phase 2** — moteur de comparaison avant/après (avec la logique taux/volume §5.2).
- **Phase 3** — diagnostic IA au format producer.
- **Phase 4** — multi-producer (comptes + vue portfolio sur tous les jeux Indigo).

Démo possible à Nina dès la fin de Phase 1 ; pitch complet à Phase 3.

## 8. Hors scope v1
Distribution publique, e-commerce, données de jeux non possédés, énumération
active à grande échelle. À reconsidérer une fois la v1 interne validée.

## 9. Métriques INDISPENSABLES pour LiveOps + fixes pour les capturer

Le tool n'a pas besoin des 36 métriques pour être utile. Voici le set
**indispensable** pour un diagnostic LiveOps post-update, regroupé par rung du
diagnostic (on diagnostique de bas en haut : hook → repeat play → monetization).
Chaque ligne indique le nom Roblox, ce qu'il sert à diagnostiquer, et son type
(taux = comparable / volume = à contextualiser).

### Rung 1 — Hook / première impression
- `ForwardD1Retention` (taux) — la 1re impression marche-t-elle ?
- `AverageSessionLengthMinutes` (taux) — engagement par session ; détermine aussi
  le bucket de benchmark.
- `ForwardD1Retention` par breakdown `Platform` (taux) — détecter un hook cassé
  sur mobile vs PC.

### Rung 2 — Repeat play / rétention
- `ForwardD7Retention` (taux) — boucle de retour / progression.
- `ForwardD30Retention` (taux) — end-game (souvent 0 sur jeu jeune = normal).
- `DauMauStickiness` (taux) — habitude.
- `DailyActiveUsers` (volume) + `MonthlyActiveUsers` (volume) — taille & momentum
  (à contextualiser, pas à comparer brut en croissance).
- `PeakConcurrentPlayers` (volume) — trafic / charge.

### Rung 3 — Monetization (le cœur du diagnostic d'Indigo)
- `PayingUsersCVR` (taux) — **conversion = la métrique n°1**. Largeur du payant.
- `AverageRevenuePerPayingUser` / ARPPU (taux) — profondeur du payant.
- `AverageRevenuePerUser` / ARPDAU (taux) — conversion × profondeur.
- `PayingUsers` (volume) — nombre de payeurs.
- `DailyRevenue` (volume) — revenue brut (à contextualiser).
- `ItemMonetizationRevenue` par breakdown source (Passes vs Dev Products) — la
  thèse "dev products doivent dominer dans un idle" se vérifie ICI.

### Rung 4 — Funnel d'onboarding (où les joueurs décrochent)
- `FunnelUserStepCompletionRate` + `FunnelUserChurnRate` (taux) — drop par étape.
- `FunnelUserTotalCount` (volume) — taille de cohorte du funnel.

### Garde-fou QA (à surveiller, pas à pitcher)
- `ClientCrashRate15m`, `OomUnexpectedExits`, `ClientMemoryUsageAvg` — santé
  technique, surtout sur mobile bas de gamme (rétention cachée perdue).

### Fixes nécessaires pour capturer ce set proprement

1. **Capturer le corps de requête** (§5.1) — sans ça, on ne peut pas lier le hash
   au nom de façon fiable. Cloner `args[0]` quand c'est un `Request`. C'est LE
   fix bloquant.
2. **Capturer les breakdowns** — plusieurs métriques indispensables ne valent que
   ventilées : retention par `Platform`, revenue par source (Passes/Dev Products),
   funnel par étape. La capture doit conserver `breakdownValue[]` intégralement
   (déjà le cas en passif, à préserver).
3. **Charger chaque page une fois** — engagement, retention, monetization,
   funnels, performance. Le passif ne capture que ce qui s'affiche ; une passe
   sur les 5 pages couvre tout le set indispensable.
4. **Capturer la fraîcheur** (`metrics/metadata` → `latestAvailableTime`) — pour
   ne PAS comparer une update sur des données pas encore mûres (ex: D7 d'une
   cohorte de 3 jours). Le moteur de comparaison doit refuser/flagger ces cas.
5. **Capturer le benchmark genre** (`analytics-benchmark`) — pour donner un verdict
   automatique "au-dessus/en-dessous du 50e/90e percentile simulation".

Si ces 5 fixes sont en place, le tool tire l'intégralité du set indispensable
LiveOps en une passe, avec le mapping nom↔hash automatique et les benchmarks.
