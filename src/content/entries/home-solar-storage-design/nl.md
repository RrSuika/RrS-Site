---
title: "Circuitontwerp: zonnepaneelsysteem voor thuis"
date: 2026-09-03
description: "DIY off-grid zonne-opslag: 600 W draagbare panelen, 2×12V LiFePO4 in serie voor 24 V, 6-poorts MPPT met interne bus voor LED-verlichting en een zuivere sinus-omvormer."

type: projects
category: Elektrotechniek
cover: cover.webp

tags:
  - Electronics
  - Solar Power
  - Off-Grid
  - LiFePO4
  - BOM

tools:
  - MPPT-regelaar
  - LiFePO4-accu
  - DC-schakelaars
  - Zuivere sinus-omvormer

wip: true

lang: nl

translationKey: home-solar-storage-design
---

# Overzicht

Dit is een DIY-project: een zonne-opslagsysteem rond laagvermogen flexibele panelen. In de huidige vorm draait het op off-grid LED-verlichting. Als het systeem later groeit, of huishoudelijke apparaten met hoog verbruik moet voeden, worden de panelen vervangen door vaste dakpanelen.

Het interessantste technische probleem hier is een spannings-matchingsregel: een accu kan alleen worden opgeladen als de werkspanning van het paneel ruim boven de accuspanning ligt. Die ene regel bepaalt vrijwel alles stroomafwaarts: paneelconfiguratie, accuspanning, keuze van de regelaar. Alles in dit ontwerp volgt daaruit.

# Eisen

| Eis              | Doel                                                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| Nachtverlichting | LED, 50W × 8h = 400Wh per nacht                                                                                       |
| Opslag           | 2 × 12V 100Ah LiFePO4 in serie = 24 V (~2,5 kWh, uitbreidbaar)                                                        |
| Zonnepanelen     | 2 × 300 W draagbare semi-flexibele panelen (laagvermogen-fase; dakpanelen zijn de latere upgrade voor hoge belasting) |
| 230 V reserve    | 24 V × 100 A ≈ 2400 W theoretisch vermogen (kortstondig, zie §04)                                                     |
| Inkoop           | Zonnepanelen + accu lokaal; al het andere uit het buitenland                                                          |

# Ontwerpproces

## 01 Onderzoek: De spannings-matchingsregel

De kernregel komt van MPPT-laadregelaars: ze starten pas met laden wanneer de paneelspanning de accuspanning +5 V overschrijdt, en hebben grofweg accuspanning +1 V nodig om door te laden. De gekozen 300 W semi-flexibele kampeerpanelen draaien op 20Vmp, te laag om zelfstandig een 24 V-accu op te laden; in serie leveren ze 40Vmp / 50Voc, ruim boven elke 12 V- of 24 V-drempel en zelfs bij −20 °C ver onder de 100 V-limiet van de regelaar.

De verbinding tussen MPPT en accu gebruikt 16 mm² kabel, begrensd door de maximale 16 mm² klemmaat van de MPPT; ideaal zou 25 mm² zijn voor voldoende veiligheidsmarge.

Wat de markt betreft: 12 V-accu's domineren de Nederlandse camper- en botenmarkt, dus de opslag werd 2 × 12V 100Ah. Kabeldiktes, zekeringplaatsing en laadparameters zijn gecontroleerd aan de hand van Victron-handleidingen, de Wiring Unlimited-gids en gedocumenteerde DIY-projecten.

## 02 Systeemarchitectuur

![Systeemarchitectuur-diagram](./solar-concept-design.png)

De regelaar is een 6-poorts MPPT (PV / BAT / LOAD), dus de bus zit ingebouwd in de regelaar: het paneel gaat op PV, de accu bereikt de BAT-poorten via een 2P DC-automaat en de lasten hangen direct aan de LOAD-poorten; geen externe bus nodig. Op elk moment geldt: accustroom = laststroom − zonnestroom. De accu is het enige bidirectionele apparaat en vangt overschot of tekort automatisch op.

De twee 12 V-accu's staan in **serie** voor 24 V: zo blijft de omvormertak in de 100 A-klasse (24 V × 100 A = 2400 W theoretisch). Parallelschakelen op 12 V zou 200 A vragen, meer dan de MPPT aankan. Elke accu heeft een ingebouwde BMS.

### Spanningsval-check: de omvormertak

De Wiring Unlimited-gids heeft een rekenvoorbeeld dat bijna precies dit systeem is: een 2400 W-omvormer op een 24 V-accu. De getallen zijn hier direct toepasbaar. 16 mm² koperkabel komt uit op R = ρ × l / A = 1,7 × 10⁻⁸ × 1,5 / (16 × 10⁻⁶) = 1,6 mΩ per 1,5 m kabel. Bij de geplande accu-naar-omvormer-afstand van 1–2 m (hier 1,5 m gerekend) is de hele lus, plus en min, 3,2 mΩ, en bij de 100 A van de omvormer:

- Spanningsval: V = I × R = 100 × 0,0032 = 0,32 V, dat is 1,3% van 24 V
- Kabelwarmte: P = I² × R = 100² × 0,0032 = 32 W

De gids adviseert onder 2,5% spanningsval te blijven (0,6 V bij 24 V), dus 16 mm² op 1,5 m voldoet. Op 3 m haalt dezelfde kabel 2,7%, en daar komt de "ideaal 25 mm²"-opmerking uit §01 vandaan: 25 mm² op 1,5 m zou ongeveer 0,2 V schelen. De omvormertak is de enige plek in dit systeem waar kabelweerstand er echt toe doet. De MPPT-accutak voert alleen laadstroom (600 W ÷ ~27 V ≈ 22 A), 1 m 16 mm² valt daar ongeveer 0,05 V, dus de 16 mm²-klemlimiet van de MPPT is aan die kant geen issue.

### Serie of parallel: wat de gids zegt

De seriekeuze past ook bij het advies van de gids over grote accubanken. Die raadt af om grote banken uit veel parallelle 12 V-strings op te bouwen, met een maximum van 3 à 4 parallelle strings, omdat bedradingsverschillen plus kleine verschillen in interne weerstand (typisch 3–10 mΩ) onbalans veroorzaken. Stroom kiest altijd de weg met de minste weerstand, dus de accu het dichtst bij de aansluitpunten krijgt de zwaarste belasting en gaat het eerst stuk. Twee accu's in serie ontwijken dat probleem. Serie brengt een eigen balanceervraag mee (weer die verschillen in interne weerstand), die wordt opgelost door de ingebouwde BMS van elke accu, met beide accu's volledig opgeladen vóór de eerste serieschakeling (§05).

## 03 Kernbeslissingen

| Onderdeel   | Beslissing                                                       | Waarom                                                                                                                       |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Accu        | 2 × 12V 100Ah LiFePO4 in serie = 24 V (100 A BMS elk, ingebouwd) | Serie houdt de omvormertak in de 100 A-klasse (24V×100A=2400W); zelfde model & batch; controleer of de BMS serie ondersteunt |
| Panelen     | 2 × 300 W semi-flex in serie                                     | Draagbaarheid eerst; serie is verplicht voor 20 V-panelen; dakpanelen zijn de latere upgrade                                 |
| Regelaar    | 6-poorts MPPT (PV / BAT / LOAD)                                  | Laaduitgang ingebouwd, de bus zit in de regelaar; BAT-klemmen maximaal 16 mm²                                                |
| Omvormer    | Zuivere sinus-omvormer (24 V-ingang)                             | 2400 W theoretisch, kortstondig                                                                                              |
| Beveiliging | DC-specifieke niet-gepolariseerde automaten + isolatieschakelaar | Automaten gedimensioneerd op kabelcapaciteit; alleen DC, AC-automaten kunnen DC-vlambogen niet doven                         |

## 04 Rendementsschatting: de 230 V-keten

Elke conversiestap neemt een hap uit de energie. Typische rendementen op dit vermogensniveau:

| Stap                          | Typisch rendement |
| ----------------------------- | ----------------- |
| MPPT DC-DC-conversie          | 92–95%            |
| LiFePO4 laad + ontlaad cyclus | ~95%              |
| Zuivere sinus-omvormer DC→AC  | 88–93%            |

De hele keten vermenigvuldigd (paneel → accu → omvormer → 230 V):

**0,94 × 0,95 × 0,90 ≈ 80%**

Reken in de praktijk op **77–84% end-to-end** (typisch ~80%). Ter vergelijking: de LED-tak slaat de omvormer over (≈90% via MPPT + accu), daarom draait verlichting rechtstreeks op DC en blijft 230 V een reserve: elke kWh door de omvormerketen laat ongeveer een vijfde achter.

### Waar de verliezen heen gaan: rimpel

De gids noemt nog een verliesmechanisme dat de rendementsketen niet laat zien: rimpel. Een omvormer trekt een fluctuerende DC-stroom uit de accu op tweemaal de netfrequentie (100 Hz op een 50 Hz-net), en elke fluctuatie verschijnt als spanningszwaai over de kabelweerstand. Hoe groter de spanningsval, hoe groter de rimpel. Victron alarmeert op 24 V-systemen boven 2,25 V RMS (hard alarm bij 3,75 V) en noemt dunne of lange accukabels als eerste oorzaak. Met 1,3% spanningsval in de omvormertak blijft de rimpel hier ruim onder het alarmniveau. De fixlijst is dezelfde als bij spanningsval: korte kabels, dik koper, strakke verbindingen. Rimpel veroudert ook de condensatoren van de omvormer en kost acculevensduur, dus het is de moeite waard om opnieuw te checken als de tak ooit langer wordt.

## 05 Beveiliging & veiligheid

- PV-zijde: 20 A 2P niet-gepolariseerde DC-automaat, tevens onderhoudsschakelaar; de MPPT-accuverbinding loopt via een 2P DC-automaat (accu-isolatie). Alle automaten/schakelaars moeten DC-geschikt en niet-gepolariseerd zijn; AC-automaten kunnen DC-vlambogen niet doven.
- LOAD-takken: de LED hangt direct aan de LOAD-poort (via een licht-/tijdschakelaar); de omvormertak loopt via een DC-isolatieschakelaar voor dagelijks aan/uit, die schakelt ook het standby-verbruik uit.
- Bedradingsnormen: de MPPT gebruikt de gangbare groene schroefklemmen, gecombineerd met aderhulzen (geen vertinde draadeinden, soldeerkruip); gesloten kabelogen op M8-bouten (geen open ogen); hydraulische krimp; rood/plus en zwart/min consequent.
- Accu's in serie: zelfde model, zelfde batch; controleer of de BMS serieschakeling ondersteunt; laad beide accu's volledig op vóór het in serie zetten.
- Inbedrijfstelling: polariteit controleren vóór inschakelen; eerst de accu, dan de panelen; laadparameters volgens de LiFePO4 24 V-specificatie.

### Zekeringkeuze: vier criteria

De gids vat zekeringkeuze samen in vier criteria: stroomwaarde, spanningswaarde, onderbrekingsvermogen en snelheid. Twee daarvan zijn hier relevant.

- Snelheid: DC-circuits met capacitieve lasten (een omvormer laadt bij inschakelen zijn ingangscondensatoren op) willen een trage (T) zekering; een snelle zekering trippt op de inschakelstroom.
- Onderbrekingsvermogen: LiFePO4 levert veel hogere kortsluitstromen dan loodzuur, en de zekering moet die foutstroom kunnen onderbreken zonder zelf te barsten. Typische waarden: MEGA-zekeringen 2,5 kA bij 70 V DC, MRBF 2 kA bij 58 V, NH-meszekeringen 25 kA, Class T 200 kA. De 100 A DC-automaat op de MPPT-accuverbinding moet vóór ingebruikname hierop gecontroleerd worden. Voor lithiumsystemen noemt de gids minstens één zekering of automaat met voldoende onderbrekingsvermogen in de DC-lijn een verplichte veiligheidseis.

## 06 Check tegen de Wiring Unlimited-gids

| Check                | Regel uit de gids                                            | Status                                                                                                          |
| -------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Spanningsval omvormertak | max 2,5% (0,6 V bij 24 V)                                | 1,3% bij 1,5 m 16 mm² ✓                                                                                        |
| Accubank             | max 3–4 parallelle strings, let op balans                   | 2 in serie, BMS-balans ✓                                                                                        |
| Zekeringplaatsing    | hoofdzekering dicht bij de accu, elke verbruiker apart gezekerd | 100 A-automaat op de acculijn ✓; de omvormertak heeft nu alleen de isolatieschakelaar, een eigen zekering is een open punt |
| Zekeringsnelheid     | T (traag) voor omvormers                                    | controleren bij inkoop                                                                                          |
| Onderbrekingsvermogen | ≥ maximale kortsluitstroom van de accu                     | 100 A-automaat controleren vóór ingebruikname                                                                    |
| Rimpel               | pre-alarm bij 2,25 V RMS op 24 V                            | 1,3% spanningsval, ruime marge ✓                                                                                |

# Stuklijst (BOM)

Inkoopstrategie: de zonnepanelen en de accu komen uit Nederlandse winkels (garantie- en transportlogica); al het andere, MPPT, omvormer, automaten, isolatieschakelaar, kabels, klemmen en toebehoren, via Taobao. Prijzen omgerekend met €1 = ¥7,81. De volledige specificatie met bedradingslijst staat in de projectmap; dit is de compacte versie.

| #   | Onderdeel                           | Specificatie                                                   | Aantal  | Richtprijs   | Bron            |
| --- | ----------------------------------- | -------------------------------------------------------------- | ------- | ------------ | --------------- |
| 1   | Zonnepaneel                         | 300 W semi-flex, ETFE, MC4-kabels                              | 2       | €150–250/st  | Lokaal / Taobao |
| 2   | MPPT-regelaar                       | 6 poorten (PV/BAT/LOAD), BAT-klemmen max 16 mm²                | 1       | ≈ €26,9      | Taobao          |
| 3   | Accu                                | 12V 100Ah LiFePO4, ingebouwde BMS, lage-temperatuurbeveiliging | 2       | €230–280/st  | NL lokaal       |
| 4   | Omvormer                            | Zuivere sinus, 24 V-ingang, ≥2000 W                            | 1       | €102–192     | Taobao          |
| 5   | DC-automaat (PV-zijde)              | 20 A 2P, niet-gepolariseerd, ≥250 V DC                         | 1       | €3,8–10,2    | Taobao          |
| 6   | DC-automaat (MPPT–accuverbinding)   | 100 A 2P, niet-gepolariseerd                                   | 1       | €5,1–12,8    | Taobao          |
| 7   | DC-isolatieschakelaar (omvormertak) | 100–125 A 2P, niet-gepolariseerd                               | 1       | €7,7–19,2    | Taobao          |
| 8   | PV-verlengkabel                     | MC4-aansluitingen, 1–2 m male/female                           | 2–4     | €1,3–3,8     | Taobao          |
| 9   | DC-kabel                            | Puur koper, 2-aderig 16 mm², totaal 5 m                        | 1       | ≈ €20,1      | Taobao          |
| 10  | Kabel kleine lasten                 | 2,5 mm² rood + zwart                                           | 3 m elk | €0,3–0,5/m   | Taobao          |
| 11  | Aderhulzen                          | Koper VE16-18, 16 mm²                                          | 100 st  | ≈ €1,3       | Taobao          |
| 12  | Kabelogen                           | SC16-8, gesloten type, M8                                      | 20 st   | ≈ €3,1       | Taobao          |
| 13  | Krimptang                           | Hydraulische kabeloogtang, 4–120 mm²                           | 1       | ≈ €21,5      | Taobao          |
| 14  | Toebehorenpakket                    | WAGO 221-connectoren, krimpkous, kabelbinders, tape            | 1 pak   | €2,6–5,1     | Taobao          |
| 15  | Accukoffer                          | EVA harde koffer (past 100Ah)                                  | 2       | €3,8–10,2/st | Taobao          |

Budget ≈ €1000–1400 totaal. Bouwfases: (1) eerst onderdelen met lange levertijd bestellen, (2) DC-deel: paneel, automaat, MPPT, accu's, LED, (3) omvormer + isolatieschakelaar, (4) wintertests in het veld, (5) documentatie en demo.

# Huidige status

Klaar: eisen, architectuur, beveiligingsschema, stuklijst (concept). Volgende: inkoop en bouw. De projectdocumentatie wordt naast deze pagina bijgehouden en groeit mee met de bouw.

# Referenties

1. [Victron Wiring Unlimited](https://www.victronenergy.com/upload/documents/The_Wiring_Unlimited_book/43562-Wiring_Unlimited-pdf-en.pdf)
2. [DIY Solar Forum: batterij-bedradingsreview](https://diysolarforum.com/threads/is-this-battery-diagram-ok-24v-400amps.8488/)
3. [Victron SmartSolar MPPT-handleiding (dimensioneerregels)](https://www.manualslib.com/guide/3713518/victron-energy-smartsolar-mppt-100-30-smartsolar-mppt-100-50-manual.html)
