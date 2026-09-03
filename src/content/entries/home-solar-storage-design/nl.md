---
title: "Circuitontwerp: zonnepaneelsysteem voor thuis"
date: 2026-09-03
description: "DIY off-grid zonne-opslag: 600 W draagbare panelen, 2×12V LiFePO4 in serie voor 24 V, 6-poorts MPPT met interne bus voor LED-verlichting en een zuivere sinus-omvormer. Ontwerpfase, bouw in uitvoering."

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

| Eis | Doel |
| --- | --- |
| Nachtverlichting | LED, 50W × 8h = 400Wh per nacht |
| Opslag | 2 × 12V 100Ah LiFePO4 in serie = 24 V (~2,5 kWh, uitbreidbaar) |
| Zonnepanelen | 2 × 300 W draagbare semi-flexibele panelen (laagvermogen-fase; dakpanelen zijn de latere upgrade voor hoge belasting) |
| 230 V reserve | 24 V × 100 A ≈ 2400 W theoretisch vermogen (kortstondig, zie §04) |
| Inkoop | Zonnepanelen + accu lokaal; al het andere uit het buitenland |

# Ontwerpproces

## 01 Onderzoek: De spannings-matchingsregel

De kernregel komt van MPPT-laadregelaars: ze starten pas met laden wanneer de paneelspanning de accuspanning +5 V overschrijdt, en hebben grofweg accuspanning +1 V nodig om door te laden. De gekozen 300 W semi-flexibele kampeerpanelen draaien op 20Vmp, te laag om zelfstandig een 24 V-accu op te laden; in serie leveren ze 40Vmp / 50Voc, ruim boven elke 12 V- of 24 V-drempel en zelfs bij −20 °C ver onder de 100 V-limiet van de regelaar.

De verbinding tussen MPPT en accu gebruikt 16 mm² kabel, begrensd door de maximale 16 mm² klemmaat van de MPPT; ideaal zou 25 mm² zijn voor voldoende veiligheidsmarge.

Wat de markt betreft: 12 V-accu's domineren de Nederlandse camper- en botenmarkt, dus de opslag werd 2 × 12V 100Ah. Kabeldiktes, zekeringplaatsing en laadparameters zijn gecontroleerd aan de hand van Victron-handleidingen, de Wiring Unlimited-gids en gedocumenteerde DIY-projecten.

## 02 Systeemarchitectuur

![Systeemarchitectuur-diagram](./solar-concept-design.png)

De regelaar is een 6-poorts MPPT (PV / BAT / LOAD), dus de bus zit ingebouwd in de regelaar: het paneel gaat op PV, de accu bereikt de BAT-poorten via een 2P DC-automaat en de lasten hangen direct aan de LOAD-poorten; geen externe bus nodig. Op elk moment geldt: accustroom = laststroom − zonnestroom. De accu is het enige bidirectionele apparaat en vangt overschot of tekort automatisch op.

De twee 12 V-accu's staan in **serie** voor 24 V: zo blijft de omvormertak in de 100 A-klasse (24 V × 100 A = 2400 W theoretisch). Parallelschakelen op 12 V zou 200 A vragen, meer dan de MPPT aankan. Elke accu heeft een ingebouwde BMS.

## 03 Kernbeslissingen

| Onderdeel | Beslissing | Waarom |
| --- | --- | --- |
| Accu | 2 × 12V 100Ah LiFePO4 in serie = 24 V (100 A BMS elk, ingebouwd) | Serie houdt de omvormertak in de 100 A-klasse (24V×100A=2400W); zelfde model & batch; controleer of de BMS serie ondersteunt |
| Panelen | 2 × 300 W semi-flex in serie | Draagbaarheid eerst; serie is verplicht voor 20 V-panelen; dakpanelen zijn de latere upgrade |
| Regelaar | 6-poorts MPPT (PV / BAT / LOAD) | Laaduitgang ingebouwd, de bus zit in de regelaar; BAT-klemmen maximaal 16 mm² |
| Omvormer | Zuivere sinus-omvormer (24 V-ingang) | 2400 W theoretisch, kortstondig |
| Beveiliging | DC-specifieke niet-gepolariseerde automaten + isolatieschakelaar | Automaten gedimensioneerd op kabelcapaciteit; alleen DC, AC-automaten kunnen DC-vlambogen niet doven |

## 04 Rendementsschatting: de 230 V-keten

Elke conversiestap neemt een hap uit de energie. Typische rendementen op dit vermogensniveau:

| Stap | Typisch rendement |
| --- | --- |
| MPPT DC-DC-conversie | 92–95% |
| LiFePO4 laad + ontlaad cyclus | ~95% |
| Zuivere sinus-omvormer DC→AC | 88–93% |

De hele keten vermenigvuldigd (paneel → accu → omvormer → 230 V):

**0,94 × 0,95 × 0,90 ≈ 80%**

Reken in de praktijk op **77–84% end-to-end** (typisch ~80%). Ter vergelijking: de LED-tak slaat de omvormer over (≈90% via MPPT + accu), daarom draait verlichting rechtstreeks op DC en blijft 230 V een reserve: elke kWh door de omvormerketen laat ongeveer een vijfde achter.

## 05 Beveiliging & veiligheid

- PV-zijde: 20 A 2P niet-gepolariseerde DC-automaat, tevens onderhoudsschakelaar; de MPPT-accuverbinding loopt via een 2P DC-automaat (accu-isolatie). Alle automaten/schakelaars moeten DC-geschikt en niet-gepolariseerd zijn; AC-automaten kunnen DC-vlambogen niet doven.
- LOAD-takken: de LED hangt direct aan de LOAD-poort (via een licht-/tijdschakelaar); de omvormertak loopt via een DC-isolatieschakelaar voor dagelijks aan/uit, die schakelt ook het standby-verbruik uit.
- Bedradingsnormen: de MPPT gebruikt de gangbare groene schroefklemmen, gecombineerd met aderhulzen (geen vertinde draadeinden, soldeerkruip); gesloten kabelogen op M8-bouten (geen open ogen); hydraulische krimp; rood/plus en zwart/min consequent.
- Accu's in serie: zelfde model, zelfde batch; controleer of de BMS serieschakeling ondersteunt; laad beide accu's volledig op vóór het in serie zetten.
- Inbedrijfstelling: polariteit controleren vóór inschakelen; eerst de accu, dan de panelen; laadparameters volgens de LiFePO4 24 V-specificatie.

# Stuklijst (BOM)

Inkoopstrategie: de zonnepanelen en de accu komen uit Nederlandse winkels (garantie- en transportlogica); al het andere, MPPT, omvormer, automaten, isolatieschakelaar, kabels, klemmen en toebehoren, via Taobao. Prijzen omgerekend met €1 = ¥7,81. De volledige specificatie met bedradingslijst staat in de projectmap; dit is de compacte versie.

| # | Onderdeel | Specificatie | Aantal | Richtprijs | Bron |
| --- | --- | --- | --- | --- | --- |
| 1 | Zonnepaneel | 300 W semi-flex, ETFE, MC4-kabels | 2 | €150–250/st | Lokaal / Taobao |
| 2 | MPPT-regelaar | 6 poorten (PV/BAT/LOAD), BAT-klemmen max 16 mm² | 1 | ≈ €26,9 | Taobao |
| 3 | Accu | 12V 100Ah LiFePO4, ingebouwde BMS, lage-temperatuurbeveiliging | 2 | €230–280/st | NL lokaal |
| 4 | Omvormer | Zuivere sinus, 24 V-ingang, ≥2000 W | 1 | €102–192 | Taobao |
| 5 | DC-automaat (PV-zijde) | 20 A 2P, niet-gepolariseerd, ≥250 V DC | 1 | €3,8–10,2 | Taobao |
| 6 | DC-automaat (MPPT–accuverbinding) | 100 A 2P, niet-gepolariseerd | 1 | €5,1–12,8 | Taobao |
| 7 | DC-isolatieschakelaar (omvormertak) | 100–125 A 2P, niet-gepolariseerd | 1 | €7,7–19,2 | Taobao |
| 8 | PV-verlengkabel | MC4-aansluitingen, 1–2 m male/female | 2–4 | €1,3–3,8 | Taobao |
| 9 | DC-kabel | Puur koper, 2-aderig 16 mm², totaal 5 m | 1 | ≈ €20,1 | Taobao |
| 10 | Kabel kleine lasten | 2,5 mm² rood + zwart | 3 m elk | €0,3–0,5/m | Taobao |
| 11 | Aderhulzen | Koper VE16-18, 16 mm² | 100 st | ≈ €1,3 | Taobao |
| 12 | Kabelogen | SC16-8, gesloten type, M8 | 20 st | ≈ €3,1 | Taobao |
| 13 | Krimptang | Hydraulische kabeloogtang, 4–120 mm² | 1 | ≈ €21,5 | Taobao |
| 14 | Toebehorenpakket | WAGO 221-connectoren, krimpkous, kabelbinders, tape | 1 pak | €2,6–5,1 | Taobao |
| 15 | Accukoffer | EVA harde koffer (past 100Ah) | 2 | €3,8–10,2/st | Taobao |

Budget ≈ €1000–1400 totaal. Bouwfases: (1) eerst onderdelen met lange levertijd bestellen, (2) DC-deel: paneel, automaat, MPPT, accu's, LED, (3) omvormer + isolatieschakelaar, (4) wintertests in het veld, (5) documentatie en demo.

# Huidige status

Klaar: eisen, architectuur, beveiligingsschema, stuklijst (concept). Volgende: inkoop en bouw. De projectdocumentatie wordt naast deze pagina bijgehouden en groeit mee met de bouw.

# Referenties

1. [Victron Wiring Unlimited](https://www.victronenergy.com/upload/documents/The_Wiring_Unlimited_book/43562-Wiring_Unlimited-pdf-en.pdf)
2. [DIY Solar Forum: batterij-bedradingsreview](https://diysolarforum.com/threads/is-this-battery-diagram-ok-24v-400amps.8488/)
3. [Victron SmartSolar MPPT-handleiding (dimensioneerregels)](https://www.manualslib.com/guide/3713518/victron-energy-smartsolar-mppt-100-30-smartsolar-mppt-100-50-manual.html)
