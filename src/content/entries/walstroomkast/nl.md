---
title: "Walstroomkast"
spineTitle: "WALSTROOMKAST"
date: 2026-06-15
dateLabel: "Jun 15"
description: "Een walstroomoplossing voor Nederlandse binnenvaartschepen; accu's vangen de pieken op zodat een beperkte netaansluiting van 3×80A een vraag van 3×250A aankan, in een modulaire kast die meegroeit."
type: projects
category: Industrieel Product Ontwerp / Elektrotechniek
cover: cover.webp
tags:
  - Industrieel Ontwerp
  - Elektrotechniek
  - Modulair Ontwerp
  - Materiaalonderzoek
  - Schaalmodel
  - Ergonomie
tools:
  - SolidWorks
  - Arduino / RFID
  - Technische tekeningen
  - BOM
  - Vergelijkend materiaalonderzoek
collaboration: team
featured: true
lang: nl
translationKey: walstroomkast
---

# Achtergrond

Binnenvaartschepen mogen niet meer op de dieselgenerator draaien als ze afgemeerd liggen; ze moeten op walstroom. De vraag van een schip is groot en schommelt sterk, met pieken tot 3×250A. De kade levert maar 3×80A, ruim drie keer te weinig.

Dit was een project van Hogeschool Rotterdam, met Endenburg als opdrachtgever. Met vijf man: mijn ontwerppartner en ik als de twee studenten Industrieel Product Ontwerpen, en drie studenten Elektrotechniek voor de elektrotechnische verificatie en deliverables. Mijn partner en ik hadden tijdens onze stage bij ZOEM Bike al samen een complete fietsbak voor een schildersbakfiets gebouwd, dus we hielden dezelfde werkverdeling aan. Ik deed het onderzoek, de materiaalanalyse, het opschrijven van de conclusies als ontwerpkeuzes, en de documentatie, het visuele werk en de eindpresentatie; mijn partner deed vooral het 3D-modelleren, de renders en de technische tekeningen.

# Ontwerpvraag

De opdracht aan de fysieke kant was een modulaire kast die een piek van 3×250A aankan op een netaansluiting van 3×80A, en die kan meegroeien met de vraag.

Het project stelde vijf kritische succesfactoren op, en elke ontwerpkeuze daarna moest daaraan kunnen voldoen:

| Kritische succesfactor | Waar het om vraagt |
| --- | --- |
| Veiligheid en normconformiteit | Voldoet aan de relevante elektrische en maritieme normen |
| Elektrische capaciteit | Betrouwbare output bij een beperkte input |
| Weerbestendigheid | Corrosieweerstand, IP-classificatie en bevestiging geschikt voor een havenomgeving |
| Gebruiksvriendelijkheid en onderhoudsgemak | Componenten eenvoudig bereikbaar, vervangbare modules, duidelijke diagnostiek |
| Modulair | Moet uitbreidbaar zijn voor toekomstige wijzigingen |

# Onderzoek en ideegeneratie

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">Normen</div>
<div class="tab-item">Bestaande kasten</div>
<div class="tab-item">Kastopbouw</div>
<div class="tab-item">Mogelijke oplossingen</div>
<div class="tab-item">Uitbreidbaarheid</div>
</div>
<div class="tab-panel tab-image">
<h4>Normen</h4>
<img src="./research-documentation.webp" alt="Onderzoek naar normen en documentatie" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>De randvoorwaarden en afwegingen komen uit de relevante technische documenten. De IP-waarden, het coatingsysteem, de aardverspreidingsweerstand, de montagehoogte en de componentconfiguratie zijn daaruit gehaald.</p>
</div>
<div class="tab-panel tab-image">
<h4>Bestaande kasten</h4>
<img src="./research-existing-web.webp" alt="Overzicht van bestaande walstroomkasten" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>We zijn begonnen met het naast elkaar leggen van de walstroomkasten die al in gebruik zijn: hoe ze hun aansluitingen indelen, hoe ze bescherming regelen en hoe het bedieningsvlak eruitziet. Deze stap scheidde de aanpakken die de branche al bewezen heeft van de dingen die we zelf moesten uitproberen.</p>
</div>
<div class="tab-panel tab-image">
<h4>Kastopbouw</h4>
<div class="side-by-side">
<div><p>De kast valt van binnen naar buiten uiteen in vier lagen:</p>
<ul>
<li><strong>Behuizing</strong>: frame, profielen, ribben, pakking, deur, driepuntsluiting, scharnier, power sockets</li>
<li><strong>Bescherming</strong>: corrosie, mechanische botsing, IP-beschermingsgraad, aarding, ventilatie</li>
<li><strong>Elektronica</strong>: transformator, omvormer, microcontroller, sensor, BMS, batterijen, RFID, LED</li>
<li><strong>Uitbreidingsvakken</strong>: gereserveerd voor modulaire groei</li>
</ul>
</div>
<div><img src="./research-cabinet-build-up.webp" alt="Onderzoek naar de kastopbouw: vier lagen van binnen naar buiten" style="width:100%; border-radius:8px; display:block; margin:0;" /></div>
</div>
</div>
<div class="tab-panel tab-image">
<h4>Mogelijke oplossingen</h4>
<img src="./research-possible-solutions.webp" alt="Onderzoek naar mogelijke oplossingen" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>We hebben de technische en structurele routes die konden werken op een rij gezet en ze één voor één doorgenomen: welke zijn maakbaar op deze maat en in deze omgeving, en welke vallen af op kosten of levertijd.</p>
</div>
<div class="tab-panel tab-image">
<h4>Uitbreidbaarheid</h4>
<img src="./ideation-expandability.webp" alt="Onderzoek naar uitbreidbaarheid" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>Dit ging over de richtingen waarin de kast later kan groeien: capaciteit, vormgeving en functies die eraan vast kunnen.</p>
</div>
</div>

We zijn eerst de normdocumentatie doorgegaan, hebben daarna de walstroomkasten geanalyseerd die al in gebruik zijn en vervolgens de mogelijke gebruikersscenario's en de variabelen daarbinnen op een rij gezet. Vier variabelen bepalen de configuratie:

1. **Vermogen**: het benodigde kVA bepaalt de configuratie.
2. **Aansluiting**: direct gekoppeld aan een transformator, of rechtstreeks op het net.
3. **Scheepstype**: kleine en grote vrachtschepen vragen een verschillende hoeveelheid vermogen.
4. **Interfaces**: het type aansluitingen en de benodigde ampères op de kast volgen uit de scenario's hierboven.

## Onderzoek naar materialen en montage

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">Frame-oplossingen</div>
<div class="tab-item">Verbindingen</div>
<div class="tab-item">Uitbreidbaarheid</div>
</div>
<div class="tab-panel tab-image">
<h4>Frame-oplossingen</h4>
<img src="./solutions-frame.webp" alt="Vijf frame-oplossingen" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<table class="mat-table">
<thead><tr><th>Oplossing</th><th>Voordelen</th><th>Nadelen</th></tr></thead>
<tbody>
<tr><td>Geperforeerde profielen / Strut Channel<br />(25mm pitch)</td><td><span class="plus">+</span>flexibele plaatsing van onderdelen<br /><span class="plus">+</span>modulair uitbreidbaar<br /><span class="plus">+</span>standaard onderdelen, goed leverbaar</td><td><span class="minus">−</span>lastig af te dichten</td></tr>
<tr><td>Profielsysteem</td><td><span class="plus">+</span>hoge stijfheid en mechanische sterkte<br /><span class="plus">+</span>standaard onderdelen, goed leverbaar<br /><span class="plus">+</span>modulair uitbreidbaar</td><td><span class="minus">−</span>beperkte afdichting</td></tr>
<tr><td>Glasvezelversterkte kunststof profielen</td><td>—</td><td><span class="minus">−</span>korte levensduur<br /><span class="minus">−</span>beperkte betrouwbaarheid in de gebruiksomgeving</td></tr>
<tr><td>Sandwichpaneel met tongue &amp; groove</td><td>—</td><td><span class="minus">−</span>beperkt uitbreidbaar<br /><span class="minus">−</span>onvoldoende afdichting</td></tr>
<tr><td>Modular pipe &amp; rail</td><td>—</td><td><span class="minus">−</span>te veel knooppunten<br /><span class="minus">−</span>onvoldoende afdichting</td></tr>
<tr class="verdict"><td colspan="3"><strong>Keuze:</strong> geperforeerde profielen met 25mm pitch, met een zijkantafdichting en een dakkap voor de afdichting.</td></tr>
</tbody>
</table>
</div>
<div class="tab-panel tab-image">
<h4>Verbindingen</h4>
<img src="./solutions-connections.webp" alt="Onderzoek naar verbindingen" style="max-width:100%; border-radius:8px; display:block; margin:0 0 8px;" />
<p>De modules worden tussen een boven- en onderlaag ingeklemd, en de losse kastmodules worden links en rechts aan elkaar verbonden. Een extra module betekent dus een nieuwe boven- en onderlaag: de onderlaag moet het gewicht dragen, en de bovenlaag, feitelijk het dak, moet waterdicht blijven.</p>
<p><strong>Keuze:</strong> inklemmen tussen een boven- en onderlaag, met de modules zijdelings aan elkaar. Een doorlopende schil dicht beter af dan een volledig modulaire paneelopbouw.</p>
</div>
<div class="tab-panel tab-image">
<h4>Uitbreidbaarheid</h4>
<img src="./studies-expandability.webp" alt="Opties voor uitbreidbaarheid" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p><strong>Batterijen</strong>: een interne accu vangt stroompieken en grote energievraag op; een aparte externe ingang is er voor noodstroom of een generator.</p>
<p><strong>Vormgeving</strong>: in de stad een natuurlijke uitstraling (plantenbak, rustige kleuren) om op te gaan in de omgeving; in een havenomgeving blijft het functionele industriële karakter behouden.</p>
<p><strong>Modulair</strong>: een 5G-mast voor toekomstige drones en autonome voertuigen in de haven; een noodstroompunt voor het opladen van kleine apparaten zoals telefoons.</p>
<p><strong>Keuze:</strong> alle drie de richtingen, batterijen, vormgeving en modulariteit.</p>
</div>
</div>

## Conceptrichtingen

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">Conceptverkenning</div>
<div class="tab-item">Ontwerpconcept</div>
<div class="tab-item">Eindconcept</div>
</div>
<div class="tab-panel tab-image">
<h4>Conceptverkenning</h4>
<img src="./concept-exploration.webp" alt="Twaalf uitgewerkte concepten" style="max-width:100%; max-height:62% !important; border-radius:8px; display:block; margin:0 0 14px;" />
<p>In deze ronde zijn twaalf verschillende concepten uitgewerkt, over silhouet, moduleverdeling, aansluitindeling en vormentaal, om de mogelijkheden naast elkaar te kunnen leggen.</p>
</div>
<div class="tab-panel tab-image">
<h4>Ontwerpconcept</h4>
<img src="./design-urban-nature.webp" alt="Concept stadsnatuur (AI-gegenereerd)" style="max-width:100%; max-height:62% !important; border-radius:8px; display:block; margin:0 0 14px;" />
<p>Het dak wordt een plantenbak (sedumdak) om het visuele karakter van de kast te verzachten in een openbare stedelijke omgeving.</p>
<p><strong>Structuur:</strong> alleen bovenop de kast, geen uitbreiding naar de zijkanten, een rechthoekige plantenbak. De module zelf moet herkenbaar, vervangbaar en onderhoudsvriendelijk zijn.</p>
<p><strong>Plantkenmerk:</strong> zonbestendig, windbestendig, droogtetolerant, ondiep wortelstelsel, weinig onderhoud.</p>
<p>De planten brengen een natuurlijk karakter in het ontwerp en verzachten het industriële uiterlijk, zodat de kast beter past in de stedelijke openbare ruimte.</p>
<p class="src"><strong>Beeldcredit:</strong> deze afbeelding is <strong>AI-gegenereerd</strong>. Het is een conceptillustratie, geen foto van het gebouwde resultaat.</p>
</div>
<div class="tab-panel tab-image">
<h4>Eindconcept</h4>
<img src="./cad-render-annotated.png" alt="Geannoteerde render van de kast" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<p>Dit is de richting waar het op uitkwam, uitgetekend als volledige kast: vier modulekolommen, met besturing, voeding, meting en de AC/DC-omvorming bovenin en daaronder de veiligheidscomponenten, de controlepanelen en het DC/AC-gedeelte.</p>
</div>
</div>

# Oplossing

## Stroom bufferen

De netspanning komt binnen via de beperkte netaansluiting en wordt gelijkgericht naar DC om het accupakket te laden. De accu's vangen de pieken van het schip op, waarna het DC weer wordt omgezet naar de wisselstroom die het schip nodig heeft. Daartussen zit de meting, beveiliging en monitoring, en alles rond certificering en facturatie volgt de normen die in de haven gelden.

## Modulaire opbouw

De kast is in vier kolommen verdeeld, elke kolom een module. Bovenin zitten de besturing, voeding, meting en de AC/DC-omvorming; daaronder de veiligheidscomponenten, de controlepanelen en het DC/AC-gedeelte.

<div class="showcase">
<div class="show-item"><img src="./scale-model-02.webp" alt="Render van het schaalmodel" /><p>Module A</p></div>
<div class="show-item"><img src="./scale-model-01.webp" alt="Render van het schaalmodel" /><p>Schaalmodel; totaal</p></div>
<div class="show-item"><img src="./scale-model-03.webp" alt="Render van het schaalmodel" /><p>Module B</p></div>
</div>

Het schaalmodel volgt de echte indeling: alle elektronica gemonteerd in een 3D-geprint frame, met module A als het bovenste deel met de hardware en besturing en module B als het onderste deel dat open blijft voor latere uitbreiding.

Het dak is tegelijk een plantenbak, puur om het industriële uiterlijk van de kast te verzachten in een openbare stedelijke omgeving. De modules zijn vervangbaar en onderhoudsvriendelijk, en breiden niet naar de zijkanten uit. De planten moesten zonbestendig, windbestendig, droogtetolerant, ondiep wortelend en onderhoudsarm zijn.

## Materialen en bescherming

| Onderdeel | Keuze |
| --- | --- |
| Behuizing | RVS AISI 316L plaatwerk, ≥ 2mm dik, gelast |
| Bescherming | IP54 buiten, IP20 binnen; IK10 slagvastheid |
| Coating | Minimaal 2 lagen aan binnen- en buitenzijde, laagdikte ≥ 120 µm, geschikt voor C5-omgeving, levensduur > 15 jaar |
| Slot | Driepuntsluiting |
| Aarding | Aardverspreidingsweerstand ≤ 1 Ω; deuren en metalen delen met een soepele aardverbinding aan de behuizing |
| Omgevingstemperatuur | −25 °C tot +40 °C |
| Positie | Altijd boven het lokaal geldende hoogwaterniveau; op pontons of steigers een verhoogde sokkel en alle kabelinvoeren waterdicht afgedicht |

De materialen zijn in twee blokken vergeleken: de plaatkwaliteit voor de behuizing, en het materiaal voor de constructieprofielen.

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">Behuizingsplaat</div>
<div class="tab-item">Constructieprofielen</div>
</div>
<div class="tab-panel tab-image">
<h4>Behuizingsplaat</h4>
<img src="./material-steel-overview.webp" alt="RVS-kwaliteiten vergeleken" style="max-width:100%; border-radius:8px; display:block; margin:0 0 10px;" />
<img src="./material-steel-corrosion.webp" alt="Corrosiemechanisme in een chlorideomgeving" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<table class="mat-table">
<thead><tr><th>Kwaliteit</th><th>Voordelen</th><th>Nadelen</th></tr></thead>
<tbody>
<tr><td>316<br />(plaatwerk + lassen)</td><td><span class="plus">+</span>molybdeen toegevoegd, goede bestendigheid tegen chloridehoudende omgevingen</td><td><span class="minus">−</span>moeilijk te bewerken<br /><span class="minus">−</span>slechte las-, reinigings- of passivatiekwaliteit veroorzaakt nog steeds lokale corrosie<br /><span class="minus">−</span>minder bestendig tegen chloriden dan 316L</td></tr>
<tr><td>316L<br />(plaatwerk + lassen)</td><td><span class="plus">+</span>lager koolstofgehalte dan 316, dus extra corrosiebestendig<br /><span class="plus">+</span>relatief makkelijker te lassen<br /><span class="plus">+</span>goede bestendigheid tegen chloridehoudende omgevingen</td><td><span class="minus">−</span>moeilijk te bewerken<br /><span class="minus">−</span>slechte las- en reinigingskwaliteit veroorzaakt nog steeds lokale corrosie<br /><span class="minus">−</span>duurder dan 316</td></tr>
<tr><td>2205 duplex<br />(plaatwerk + lassen)</td><td><span class="plus">+</span>sterker dan 316L<br /><span class="plus">+</span>uitstekende bestendigheid tegen chloridehoudende omgevingen<br /><span class="plus">+</span>geschikt boven 1000 ppm chlorideconcentratie of boven 60 °C<br /><span class="plus">+</span>gelijke verhoudingen ferriet en austeniet</td><td><span class="minus">−</span>moeilijker te bewerken dan austenitisch RVS zoals 316</td></tr>
<tr class="verdict"><td colspan="3"><strong>Keuze:</strong> 316L. De havenomgeving is chloridehoudend, en de extra marge van 2205 kost zowel geld als bewerkbaarheid die we niet konden verantwoorden.</td></tr>
</tbody>
</table>
</div>
<div class="tab-panel tab-image">
<h4>Constructieprofielen</h4>
<img src="./material-profiles.webp" alt="Profielmaterialen vergeleken" style="max-width:100%; border-radius:8px; display:block; margin:0 0 14px;" />
<table class="mat-table">
<thead><tr><th>Materiaal</th><th>Voordelen</th><th>Nadelen</th></tr></thead>
<tbody>
<tr><td>HDPE<br />(met UV-stabilisatoren; extrusie/spuitgieten)</td><td><span class="plus">+</span>goede corrosiebestendigheid<br /><span class="plus">+</span>hoge slagvastheid<br /><span class="plus">+</span>goedkoop en makkelijk te produceren<br /><span class="plus">+</span>recyclebaar</td><td><span class="minus">−</span>matige UV-bestendigheid<br /><span class="minus">−</span>lage stijfheid, dus niet geschikt als structureel profiel<br /><span class="minus">−</span>kruipt en vervormt op lange termijn onder blijvende belasting<br /><span class="minus">−</span>hoge thermische uitzetting</td></tr>
<tr><td>ASA<br />(extrusie/spuitgieten)</td><td><span class="plus">+</span>goede corrosiebestendigheid<br /><span class="plus">+</span>goede UV-bestendigheid<br /><span class="plus">+</span>beter geschikt voor langdurig buitengebruik dan HDPE<br /><span class="plus">+</span>goede vormstabiliteit en betere warmtebestendigheid dan HDPE</td><td><span class="minus">−</span>lage stijfheid, dus niet dragend<br /><span class="minus">−</span>duurder dan HDPE</td></tr>
<tr><td>GFRP<br />(glasvezelversterkte kunststof; pultrusie)</td><td><span class="plus">+</span>goede UV-bestendigheid en corrosiebestendigheid<br /><span class="plus">+</span>hoge stijfheid, dus geschikt als structureel profiel<br /><span class="plus">+</span>lange levensduur</td><td><span class="minus">−</span>duurder dan HDPE en ASA<br /><span class="minus">−</span>moeilijker te produceren</td></tr>
<tr class="verdict"><td colspan="3"><strong>Keuze:</strong> GFRP-pultrusie. HDPE blijft achter op langdurige UV-belasting en kruip, ook met UV-stabilisator, en ASA is niet stijf genoeg om de constructie te dragen. GFRP wint op veroudering, corrosiebestendigheid, treksterkte en lange-termijn structurele stabiliteit.</td></tr>
</tbody>
</table>
</div>
</div>

# Bouwen

<div class="process-scroll">
  <div class="process-track" data-copies="3" data-unique="3">
    <div class="step"><img src="./step-01-rfid-prototype.jpeg" alt="RFID-prototype" /><span>Stap 1: RFID-autorisatie op breadboard</span></div>
    <div class="step"><img src="./step-02-assembly-testing.jpeg" alt="Bedraden en testen" /><span>Stap 2: Bedraden en testen</span></div>
    <div class="step"><img src="./step-03-scale-model.jpeg" alt="Schaalmodel" /><span>Stap 3: Schaalmodel opbouwen</span></div>
    <div class="step"><img src="./step-01-rfid-prototype.jpeg" alt="RFID-prototype" /><span>Stap 1: RFID-autorisatie op breadboard</span></div>
    <div class="step"><img src="./step-02-assembly-testing.jpeg" alt="Bedraden en testen" /><span>Stap 2: Bedraden en testen</span></div>
    <div class="step"><img src="./step-03-scale-model.jpeg" alt="Schaalmodel" /><span>Stap 3: Schaalmodel opbouwen</span></div>
    <div class="step"><img src="./step-01-rfid-prototype.jpeg" alt="RFID-prototype" /><span>Stap 1: RFID-autorisatie op breadboard</span></div>
    <div class="step"><img src="./step-02-assembly-testing.jpeg" alt="Bedraden en testen" /><span>Stap 2: Bedraden en testen</span></div>
    <div class="step"><img src="./step-03-scale-model.jpeg" alt="Schaalmodel" /><span>Stap 3: Schaalmodel opbouwen</span></div>
  </div>
</div>

Eerst kregen we de RFID-lezer en de autorisatielogica op een breadboard aan de praat, daarna hebben we de kast bedraad en punt voor punt spanningen en circuits met de multimeter nagelopen, en tot slot het schaalmodel volgens tekening opgebouwd: echte componenten, bedraad in de zones waar ze in de volledige kast zitten, onder spanning getest en afgeregeld voor de eindpresentatie.

# Technische tekeningen

<div class="side-by-side">
  <div><img src="./technical-drawing-top.png" alt="Bovenaanzicht" /><p>Bovenaanzicht</p></div>
  <div><img src="./technical-drawing-full.png" alt="Samenstellingstekening" /><p>Samenstelling</p></div>
</div>

<div class="side-by-side">
  <div><img src="./technical-drawing-front.png" alt="Vooraanzicht" /><p>Vooraanzicht</p></div>
  <div><img src="./cad-render-detail.png" alt="Render van de interne indeling" /><p>Interne indeling</p></div>
</div>

# Toekomstige uitbreidbaarheid

De modulariteit is een deur die open blijft. De centrale unit doet de besturing en de aansluitpunten; is er meer capaciteit nodig, dan klikt er aan de zijkant een identiek gevormde accu-unit tegenaan. Verder kan hetzelfde frame warmteterugwinning, een 5G-mast, een drone-landingsplatform of een externe stroomingang dragen. Bovenop kan het standaard groendak plaatsmaken voor zonnepanelen, om de displays en sensoren op de kast van stroom te voorzien.

# De echte kast

<div class="process-scroll">
  <div class="process-track" data-copies="3" data-unique="5">
    <div class="step"><img src="./photo-front.webp" alt="De kast; vooraanzicht" /><span>Vooraanzicht</span></div>
    <div class="step"><img src="./photo-side.webp" alt="De kast; zijaanzicht" /><span>Zijaanzicht</span></div>
    <div class="step"><img src="./photo-back.webp" alt="De kast; achteraanzicht" /><span>Achteraanzicht</span></div>
    <div class="step"><img src="./photo-door-open-1.webp" alt="De kast; deur open" /><span>Deur open (1)</span></div>
    <div class="step"><img src="./photo-door-open-2.webp" alt="De kast; deur open" /><span>Deur open (2)</span></div>
    <div class="step"><img src="./photo-front.webp" alt="De kast; vooraanzicht" /><span>Vooraanzicht</span></div>
    <div class="step"><img src="./photo-side.webp" alt="De kast; zijaanzicht" /><span>Zijaanzicht</span></div>
    <div class="step"><img src="./photo-back.webp" alt="De kast; achteraanzicht" /><span>Achteraanzicht</span></div>
    <div class="step"><img src="./photo-door-open-1.webp" alt="De kast; deur open" /><span>Deur open (1)</span></div>
    <div class="step"><img src="./photo-door-open-2.webp" alt="De kast; deur open" /><span>Deur open (2)</span></div>
    <div class="step"><img src="./photo-front.webp" alt="De kast; vooraanzicht" /><span>Vooraanzicht</span></div>
    <div class="step"><img src="./photo-side.webp" alt="De kast; zijaanzicht" /><span>Zijaanzicht</span></div>
    <div class="step"><img src="./photo-back.webp" alt="De kast; achteraanzicht" /><span>Achteraanzicht</span></div>
    <div class="step"><img src="./photo-door-open-1.webp" alt="De kast; deur open" /><span>Deur open (1)</span></div>
    <div class="step"><img src="./photo-door-open-2.webp" alt="De kast; deur open" /><span>Deur open (2)</span></div>
  </div>
</div>

# Oplevering en samenwerking

Opgeleverd zijn een schaalmodel (alle elektronica op de echte plek in een 3D-geprint frame), het volledige SolidWorks-model, technische tekeningen en de documentatie, waarmee we de zonering en de constructie van de kast demonstreerden.

Het project sloot nooit helemaal aan op wat de opdrachtgever verwachtte. De eerste weken zijn opgegaan aan wachten op aanvullende informatie en gebruikersscenario's; toen eenmaal duidelijk werd dat zij een elektrotechnische berekening wilden en dat dit soort opdrachten buiten het industrieel ontwerpen valt, waren de twee richtingen al uit elkaar gelopen. Na overleg met beide coaches hebben we het project omgevormd tot onze eigen ontwerpvraag: een modulair uitbreidbare walstroomkast. Achteraf de juiste keuze, en vanaf dat punt sloot het project pas echt aan op onze leerdoelen.

# Wat ik van dit project heb geleerd

- <strong style="color:var(--accent)">Materiaalonderzoek telt pas als het een keuze wordt</strong>: 316, 316L en 2205 duplex naast elkaar, HDPE tegen GFRP, het moet allemaal uitkomen op "dus dit wordt het". Het onderzoek zelf is niet het lastige; de conclusie tot een keuze maken die je kunt verdedigen wel.
- <strong style="color:var(--accent)">Normen zijn ontwerpinput, geen achtergrondinformatie</strong>: IP-waarden, IK10, C5-coating, 1 Ω aarding, montagehoogte. Die bepaalden hoe de kast eruit kon zien.
- <strong style="color:var(--accent)">Krijg je de informatie niet, beslis dan toch</strong>: de duurste les van dit project. De richting van de opdrachtgever bleef onduidelijk en wij wachtten te lang. De volgende keer zet ik vooraf een deadline op de essentiële informatie en kies ik daarna een andere route of herschrijf ik de opdracht.
- <strong style="color:var(--accent)">Multidisciplinair werken draait om de juiste vragen stellen</strong>: ik kon de redenering van de elektrotechniekstudenten volgen omdat ik de basis in mijn POW-cursus had opgepikt, genoeg om te vragen naar warmteontwikkeling, rendement van transformatoren en de keuze van een voeding.
- <strong style="color:var(--accent)">Ik wil een hybride ontwerper zijn</strong>: dit project duwde me een stap weg van vormgeving en concept en richting het technische vlak. Ik wil me verder blijven verdiepen in elektrische veiligheid, embedded systems en basiselektronica.

## Bronnen

### Materialen en constructie

**Behuizingsplaat**

1. [Identificatie van roestvrij staal 304 versus 316 · Gids (2026)](https://oceanplayer.com/nl/304-vs-316-stainless-steel-identification-guide-2026/)
2. [AISI 316 vs 316L Stainless Steel, Difference of SS316 & SS316L Properties Composition Yield Strength Density](https://www.theworldmaterial.com/difference-ss316-vs-ss316l-stainless-steel/)
3. [Duplex roestvrij staal 2205 - Eigenschappen, Toepassingen & Voordelen - LangHe Industry Co., Ltd.](https://langhe-industry.com/nl/duplex-stainless-steel-2205/)

**Constructieprofielen**

1. [ABS & ASA Extrusions - Condale Plastics](https://www.condaleplastics.com/materials/material-selection/abs-asa-extrusions/)
2. [Glass Fiber Reinforced Polymer (GFRP) | Definition, Advantage](https://petronthermoplast.com/everything-you-need-to-know-about-glass-fiber-reinforced-polymer-gfrp/)
3. [HDPE vs FRP Pipe：Strength, Lifespan, Density Comparative](https://www.ganglongfiberglass.com/hdpe-vs-frp-pipe/#UV_Resistance)

### Plantenbak (groendak)

1. [10 tips: ik wil een sedumdak en nu? – SedumSpecialist](https://www.sedumspecialist.nl/blog/10-tips-ik-wil-een-sedumdak-en-nu/)
2. [Sedum mix voor groendak in de zon: 15 soorten – Groenpalet Shop](https://groenpalet-shop.be/shop/sedums/inpot/sedum-mix-groendak-zon-15-soorten/)
3. [Sedumdak voor- en nadelen: een eerlijk overzicht - GROEN Dichterbij](https://www.groendichterbij.nl/sedumdak-voor-en-nadelen/)
