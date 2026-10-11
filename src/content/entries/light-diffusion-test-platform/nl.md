---
title: Testplatform voor lichtdiffusie

date: 2026-04-20

description: Een optisch desktop-testplatform om de optische en visuele eigenschappen van verschillende materialen systematisch te evalueren, zodat subjectieve CMF-beslissingen herhaalbare en meetbare vergelijkingen worden.

type: projects

category: CMF & Optisch Testen

cover: 03-final-platform-3d.png

tags:
  - Industrieel Ontwerp
  - CMF
  - Materiaaltesten
  - Lichtdiffusie
  - Optische Meting

tools:
  - Arduino
  - LED-strip (PWM-gestuurd)
  - Laboratoriumheftafel
  - Precisie-stappenmotordriver
  - Zuurstofvrij koperdraad

featured: true

lang: nl

translationKey: light-diffusion-test-platform
---

# Achtergrond

Dit gebeurt voortdurend in productontwerp: je kiest een doorschijnend materiaal voor een lampenkap, een diffuserpaneel of een displayafdekking, en je probeert te raden welk materiaal er het beste uitziet. Je houdt het sample tegen het licht, knijpt je ogen een beetje toe, houdt het misschien naast een ander sample en denkt: "ja, deze ziet er ongeveer goed uit".

Het probleem is dat twee materialen die er onder kamerlicht identiek uitzien, zich totaal anders kunnen gedragen zodra ze van achteren worden belicht. Oppervlakteafwerking, dikte, interne structuur: ze beïnvloeden allemaal hoe licht door het materiaal beweegt, en renders brengen je maar tot zover. Op een gegeven moment moet je het met eigen ogen zien.

Dus bouwde ik een testopstelling, zodat elke CMF-beslissing daarna op een vaste procedure zou rusten.

# Eisen

Vier optische eigenschappen, elk direct relevant voor productontwerpbeslissingen:

| Eigenschap              | Wat het je vertelt                                    | Invloed op ontwerp                                                                         |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Transmissie**         | Hoeveel licht er door het materiaal heen komt         | Helderheid van displays die van achteren belicht worden, zichtbaarheid van LED-indicatoren |
| **Diffusie**            | Hoe gelijkmatig het licht verstrooit na het passeren  | Hotspots elimineren, uniformiteit van belichte oppervlakken                                |
| **Reflectie**           | Hoe het materiaaloppervlak invallend licht weerkaatst | Keuze van oppervlakteafwerking, tegengaan van verblinding                                  |
| **Luminantieverdeling** | Helderheidsvariatie over het belichte oppervlak       | Visueel comfort, prestaties van lichtgeleiders                                             |

Naast de meetdoelen had ik een handvol praktische eisen, en die bleken net zo zwaar te wegen als de optische. <strong style="color:var(--accent)">Reproduceerbare positionering</strong> stond voorop: als ik samples niet op een consistente afstand van de lichtbron krijg, betekent niets van wat ik daarna meet nog iets. <strong style="color:var(--accent)">Instelbare helderheid</strong> was nodig omdat een materiaal op 10% en datzelfde materiaal op 100% twee verschillende objecten zijn, dus de bron moet het hele bereik dekken. <strong style="color:var(--accent)">Beheersing van omgevingslicht</strong> stond niet ter discussie, want optische metingen in een zonverlichte kamer zijn vooral ruis. <strong style="color:var(--accent)">Snel samples wisselen</strong>, want bij vijf minuten per wissel zou ik nooit genoeg vergelijkingen doen om er iets van te leren. En <strong style="color:var(--accent)">visuele output</strong>, omdat twee materialen naast elkaar zien de helft van het werk is.

# Ontwerp & maken

![Conceptontwerp](./02-concept-design.png)

## Platformarchitectuur

De opstelling is een verticaal meetstatief: lichtbron onderaan, verstelbaar sampleplatform in het midden, observatie van bovenaf. De lay-out is in feite een uitgeklede optische bank: niets wat ik niet nodig had, niets wat in de weg zit.

<div class="side-by-side">
  <div><img src="./04-final-render.png" alt="Finale render" /><p>Finale 3D-render</p></div>
  <div><img src="./05-concept-sketch.png" alt="Conceptschets" /><p>Conceptschets</p></div>
</div>

### Belangrijkste onderdelen

- <strong style="color:var(--accent)">Lichtbron</strong>: LED-strip, gaat van nauwelijks gloeiend tot volledige output.
- <strong style="color:var(--accent)">Heftafel</strong>: met de hoogteverstelling kan ik de afstand tussen de lichtbron en het materiaal nauwkeurig regelen.
- <strong style="color:var(--accent)">Frame</strong>: lasergesneden structuurpanelen, matzwart gespoten, absorbeert strooilicht en elimineert interne reflecties.
- <strong style="color:var(--accent)">PWM-controller</strong>: gebruik PWM om de dutycycle van de LED-strip te regelen en zo de helderheid aan te passen.
- <strong style="color:var(--accent)">Voedingsleiding</strong>: zuurstofvrij koperdraad 0.5 mm². Geschikt voor 2 A met marge.

## Fabricageproces

<div class="process-scroll" id="process-scroll">
  <div class="process-track" id="process-track" data-copies="3" data-unique="10">
    <div class="step"><img src="./06-3d-modelling.png" alt="3D-modelleren" /><span>STAP 1: 3D-modelleren</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="Lasersnijden" /><span>STAP 2: Lasersnijden</span></div>
    <div class="step"><img src="./08-test-build.png" alt="Testopbouw" /><span>STAP 3: Testopbouw</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="Oppervlakteafwerking" /><span>STAP 4: Oppervlakteafwerking</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="Subassemblage" /><span>STAP 5: Subassemblage</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="Circuit solderen" /><span>STAP 6: Circuit solderen</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="Circuitverificatie" /><span>STAP 7: Circuitverificatie</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="Polariteitscontrole" /><span>STAP 8: Polariteitscontrole</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="Subassemblage" /><span>STAP 9: Eindassemblage</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="Circuittest" /><span>STAP 10: Circuittest</span></div>
    <div class="step"><img src="./06-3d-modelling.png" alt="3D-modelleren" /><span>STAP 1: 3D-modelleren</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="Lasersnijden" /><span>STAP 2: Lasersnijden</span></div>
    <div class="step"><img src="./08-test-build.png" alt="Testopbouw" /><span>STAP 3: Testopbouw</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="Oppervlakteafwerking" /><span>STAP 4: Oppervlakteafwerking</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="Subassemblage" /><span>STAP 5: Subassemblage</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="Circuit solderen" /><span>STAP 6: Circuit solderen</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="Circuitverificatie" /><span>STAP 7: Circuitverificatie</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="Polariteitscontrole" /><span>STAP 8: Polariteitscontrole</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="Subassemblage" /><span>STAP 9: Eindassemblage</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="Circuittest" /><span>STAP 10: Circuittest</span></div>
    <div class="step"><img src="./06-3d-modelling.png" alt="3D-modelleren" /><span>STAP 1: 3D-modelleren</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="Lasersnijden" /><span>STAP 2: Lasersnijden</span></div>
    <div class="step"><img src="./08-test-build.png" alt="Testopbouw" /><span>STAP 3: Testopbouw</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="Oppervlakteafwerking" /><span>STAP 4: Oppervlakteafwerking</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="Subassemblage" /><span>STAP 5: Subassemblage</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="Circuit solderen" /><span>STAP 6: Circuit solderen</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="Circuitverificatie" /><span>STAP 7: Circuitverificatie</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="Polariteitscontrole" /><span>STAP 8: Polariteitscontrole</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="Subassemblage" /><span>STAP 9: Eindassemblage</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="Circuittest" /><span>STAP 10: Circuittest</span></div>
  </div>
</div>

# Materiaaltesten

Ik testte een reeks doorschijnende en transparante materialen die vaak voorkomen in productbehuizingen, diffusers en lichtgeleiders:

### Testmateriaalmatrix

| Materiaal                 | Type                       | Belangrijkste eigenschap                                                        |
| ------------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| **Doorschijnend PLA**     | 3D-geprint                 | Verstrooiing door laaglijnen, goedkoop voor prototyping                         |
| **Doorschijnend PETG**    | 3D-geprint                 | Betere helderheid dan PLA, sterkere laaghechting                                |
| **Acrylaatplaat**         | Lasergesneden              | Grote optische helderheid, krasbestendig, veel opties voor oppervlakteafwerking |
| **AB-epoxyharsplaat**     | Gegoten hars               | Hoge transparantie, glad oppervlak, glasalternatief                             |
| **PC-lichtdiffuserplaat** | Geëxtrudeerd polycarbonaat | Speciaal gemaakt voor diffusie, prismatische oppervlaktetextuur                 |

Elk materiaal doorliep meerdere configuraties (verschillende diktes, verschillende oppervlakteafwerkingen, verschillende afstanden tot de lichtbron), zodat ik kon zien hoe de materiaalkeuze het uiteindelijke visuele resultaat echt beïnvloedt.

# Beheersbare variabelen

Het hele doel van het bouwen van deze testopstelling was dat ik één ding tegelijk kon veranderen. Systematisch A/B-testen is alleen mogelijk als je elke variabele kunt vastzetten behalve degene die je onderzoekt.

<div class="variables-grid">

- <strong style="color:var(--accent)">Lichtintensiteit</strong>: ingesteld via de PWM-controller, van nauwelijks zichtbaar tot volle kracht
- <strong style="color:var(--accent)">Materiaaltype</strong>: PLA, PETG, acrylaat, AB-epoxy, PC-diffuser
- <strong style="color:var(--accent)">Materiaalkleur</strong>: naturel, wit en getinte varianten van PETG en acrylaat
- <strong style="color:var(--accent)">Materiaaldikte</strong>: enkele laag, gestapelde lagen, verschillende plaatdiktes
- <strong style="color:var(--accent)">Oppervlakteafwerking</strong>: ruwe print, geschuurd (korrel 80–5000), gepolijst, getextureerd
- <strong style="color:var(--accent)">Diffusieafstand</strong>: de spleet tussen lichtbron en sample, ingesteld via de heftafel

</div>

# Ontwerpiteraties

Het platform ontstond niet in één keer. Ik heb het drie keer gebouwd, en elke versie loste iets op wat de vorige fout deed.

![Iteratievergelijking](./01-iteration-comparison.png)

|                            | V1: enkele LED                                            | V2: LED-strip                                                 | V3: LED-strip + PWM                                                                             |
| -------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| <strong>Methode</strong>   | Handgesoldeerd                                            | Koperfolietape                                                | PWM-controller                                                                                  |
| <strong>Problemen</strong> | <span style="color:#e53935">✕</span> Solderen te langzaam | <span style="color:#e53935">✕</span> Tape ongeschikt voor 2A  | <span style="color:var(--terminal-green)">✓</span> Helderheid instelbaar                        |
|                            | <span style="color:#e53935">✕</span> Lichteffect matig    | <span style="color:#e53935">✕</span> Geen helderheidsregeling | <span style="color:var(--terminal-green)">✓</span> Diffuse reflectie vanaf donkere oppervlakken |
| <strong>Oordeel</strong>   | <span style="color:#e53935">✕ Afgevallen</span>           | <span style="color:#e53935">✕ Afgevallen</span>               | <span style="color:var(--terminal-green)">✓ Definitief</span>                                   |

### V1: enkele LED, handmatig solderen

Ik was van plan om losse LED's met de hand op de printplaat te solderen. Het was de voor de hand liggende eerste aanpak.

- <span style="color:#e53935">**Probleem:**</span> Twintig LED's met de hand solderen is saai en inconsistent. Elke verbinding heeft een iets andere weerstand, waardoor elke LED een klein beetje anders gloeit. Voor een testplatform is "een klein beetje anders" fataal.
- <span style="color:#e53935">**Probleem:**</span> Een puntvormige lichtbron zorgt voor ongelijkmatige belichting over het sample. Als het licht van meet af aan niet uniform is, kun je niet zien of het diffusiepatroon dat je ziet van het materiaal komt of van de lichtbron.

### V2: LED-strip, koperfolietape

Ik verving de losse LED's door een uniforme LED-strip en gebruikte koperfolietape voor de elektrische verbindingen. Beter, maar nieuwe problemen.

- <span style="color:#e53935">**Probleem:**</span> Koperfolietape is handig en ziet er netjes uit, maar het is dun, en elke verbinding erin is lijm in plaats van metaal. Dat is geen betrouwbare manier om 2A te voeren: het koper overleeft het misschien, de warmte hoopt zich op in de overgangen. Ik rekende het door en zag dat dit een brandgevaar was dat stond te gebeuren.
- <span style="color:#e53935">**Probleem:**</span> Vaste helderheid. Welk materiaal of welke afstand ik ook testte, de lichtopbrengst bleef hetzelfde. Verschillende scenario's vragen om verschillende lichtniveaus, en ik had geen manier om bij te stellen.

### V3: LED-strip + PWM-controller (huidige versie)

Dit is de versie die is gebleven:

- <span style="color:var(--terminal-green)">**Upgrade:**</span> De tape vervangen door zuurstofvrij koperdraad 0.5 mm²: echt metaal in elke overgang, en ruim boven de 2 A die de strip trekt.
- <span style="color:var(--terminal-green)">**Upgrade:**</span> PWM-controller voor helderheidsregeling over het volledige bereik. Nu kan ik elk niveau daartussen testen en krijg ik elke keer dezelfde meting.
- <span style="color:var(--terminal-green)">**Upgrade:**</span> Het binnenframe matzwart geschilderd. Omgevingslicht en interne reflecties hadden stilletjes elke meting vervuild.

# Resultaat

De afgebouwde opstelling geeft me een betrouwbare, reproduceerbare omgeving om te vergelijken hoe materialen met licht omgaan. <strong style="color:var(--accent)">Zij-aan-zij materiaalvergelijking</strong> onder identieke belichting maakt "ik denk dat deze er beter uitziet" overbodig. Ik kan <strong style="color:var(--accent)">oppervlakteafwerkingen beoordelen</strong> en zien wat schuren, polijsten of textureren doet met de weg die het licht aflegt. Ik kan een <strong style="color:var(--accent)">analyse van dikte versus transmissie</strong> doen en meten wat een verdubbeling van de plaatdikte werkelijk aan helderheid kost. Ik kan <strong style="color:var(--accent)">gecontroleerde helderheidssweeps</strong> draaien en een materiaal over het hele dimbereik volgen. En elke run laat <strong style="color:var(--accent)">visuele documentatie</strong> van de lichtverdeling achter waar ik bij het volgende project naar terugverwijs.

![Eindplatform](./03-final-platform-3d.png)

# Wat ik heb geleerd

Naast de CMF-data heeft het bouwen van dit platform een paar principes erin gestampt die op vrijwel elk ontwerp-bouwproject van toepassing zijn:

<strong style="color:var(--accent)">Stroomwaarden zijn belangrijk</strong>: de koperfolietape was een concrete herinnering dat prototypematerialen tegen hun werkelijke elektrische belasting moeten worden beoordeeld, en dat een nette build niets betekent als de bedrading ondergedimensioneerd is. <strong style="color:var(--accent)">Je omgeving is onderdeel van je instrument</strong>: optische metingen staan of vallen met de beheersing van omgevingslicht, en twintig minuten met een spuitbus matzwart deden meer voor de meetconsistentie dan welke andere afzonderlijke ingreep ook. <strong style="color:var(--accent)">Isoleer één variabele tegelijk</strong>, anders ben je gewoon aan het gokken, want materiaal, dikte, afwerking of afstand onafhankelijk kunnen veranderen is precies wat dingen voor een lamp houden in een experiment verandert. En <strong style="color:var(--accent)">gereedschap verdient zich terug over projecten heen</strong>: het platform bouwen voelde traag, maar elke CMF-beslissing met doorschijnende materialen begint nu bij echte metingen in plaats van turen en hopen.

## Toekomstverbeteringen

<strong style="color:var(--accent)">Vervang handmatige PWM-sturing door gekalibreerde digitale sturing</strong>. De opstelling leunt op een handmatig ingestelde PWM-controller, wat volstaat voor verkennend testen maar enige variatie in lichtintensiteit tussen metingen laat staan. Een microcontroller kan nauwkeurig gedefinieerde PWM-signalen genereren en herhaalbare intensiteitsinstellingen opslaan, zodat dezelfde lichtomstandigheden tussen tests te reproduceren zijn. Dat maakt de data betrouwbaarder en de vergelijking tussen materialen strenger.
