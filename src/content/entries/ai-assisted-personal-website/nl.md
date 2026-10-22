---
title: "AI-ondersteunde persoonlijke website: van één pagina naar een complexe database"
spineTitle: "BUILD A PERSONAL WEBSITE"
date: 2026-05-19
dateLabel: "19 mei"
description: "Leren hoe je met AI een persoonlijke website bouwt en live zet. Een verslag van de iteraties, de lessen en wat AI kan doen versus wat mensen moeten doen."
type: lab
category: "AI-samenwerking & webdesign"
cover: cover.webp
tags:
  - AI-samenwerking
  - Persoonlijke website
  - Iteratie
  - Ontwerpproces
  - Gids voor beginners
tools:
  - AI-assistent
  - HTML / CSS / JavaScript
  - WebGL / Shader
  - GitHub Pages
gallery:
  - file: "v1-1.webp"
    title: V1 · Eerste generatie website
  - file: "v1-2.webp"
    title: V1 · Eerste generatie website
  - file: "v1-3.webp"
    title: V1 · Eerste generatie website
  - file: "v2.webp"
    title: V2 · Neuraal netwerk + hackerterminal
  - file: "v3.webp"
    title: V3 · Sterrenveld + zwart gat (huidige versie)
featured: false
wip: false
lang: nl
translationKey: ai-assisted-personal-website
---

# Achtergrond

Ik heb deze site samen met AI gebouwd, en hij heeft zich nooit gedragen als een generator die met één klik een website maakt. De verdeling was elke keer hetzelfde: ik bepaal waarom de site bestaat, voor wie hij is, wat belangrijk is en wat weg mag; AI verandert die beslissingen in schetsen, code, alternatieven en duidelijkere uitleg; ik test, kijk, schrap, herstel en draag het resultaat.

De site heeft tot nu toe drie iteraties gehad: V1 om hem te laten bestaan, V2 om hem een persoonlijkheid te geven, V3 om hem een wereld te geven. Hieronder staat de tijdlijn: wat ik deed, wat fout ging, waar AI hielp en wat het nog steeds niet kan vervangen.

<div class="project-gallery-slot"></div>

# Tijdlijn in één oogopslag

| Fase | Wat ik het liefst wilde | Belangrijkste toevoegingen | Grootste les | Grootste probleem |
| --- | --- | --- | --- | --- |
| V1 | Een site die opent en leesbaar is | Basiswebsite: home, over mij, projecten, contact | Eerst live zetten, daarna perfectioneren | Het leek een puzzel en de stijlen botsten met elkaar. |
| V2 | Een site met een herkenbare identiteit | Neurale achtergrond + hackerterminal | Stijl kan onderdeel van de inhoud worden | Effecten trokken aandacht, prestaties en leesbaarheid leden |
| V3 | Een complete visuele wereld | Sterrenveld + zwart gat + zwaartekrachtlens | Beeld werd verhaal, niet alleen decoratie | Prestaties, compatibiliteit, credits, schoonheid versus leesbaarheid |
| Nu | Een stabielere, snellere en leesbaardere site | Betere inhoud, prestaties en meertaligheid | Nog steeds documenteren en verfijnen | Het is niet af |

# De vroegste aanpak

In het begin zetten we alleen een enkele pagina live: één bestand met de homepage, biografie, het portfolio en contactgegevens.

Mijn werkwijze was simpel. Ik kopieerde duizenden regels code naar AI, vroeg om iets toe te voegen en kopieerde het resultaat terug naar mijn computer. Al snel kwamen er twee problemen boven. Bij elke wijziging moest AI het hele bestand opnieuw lezen, wat tijd kostte; en het bestand bleef groeien tot ik een bepaald stuk niet meer terugvond.

Wat ik echt wilde was een **meertalige site met een persoonlijke database en een portfolio** erachter. Daarom stapte ik over op de huidige architectuur, waarin inhoud, pagina's, stijlen en componenten apart worden beheerd. Tekst aanpassen betekent niet meer zoeken in duizenden regels. Elk project heeft een eigen map voor artikelen, omslag, versiebeelden en vertalingen. Chinees, Engels en Nederlands delen dezelfde paginastructuur, en het portfolio kan blijven groeien zonder in chaos te veranderen: om een project aan te passen ga ik naar die map.

De prijs is reëel en het loont om die gewoon te benoemen. Deze architectuur is complexer dan één los bestand, elk nieuw project moet de mapstructuur en het frontmatter-format volgen, vertalingen worden handmatig bijgehouden dus een taal is snel vergeten, een aanpassing aan algemene stijlen kan alle projecten raken, en de leercurve is in het begin steiler. Voor onderhoud op de lange termijn is het nog steeds de betere ruil, en het is precies wat een persoonlijke database plus portfolio nodig heeft.

# V1: Laat het bestaan

## Wat ik deed

- Begon vanuit `X:\Github\RrS-Personal-Website`;
- Bepaalde de basissecties: wie ik ben, wat ik maak, hoe je contact opneemt;
- Zette echte inhoud erin, geen lege schil;
- Zorgde dat het op een computer in elk geval goed opende.

## Problemen

1. **Ik wist niet waar ik moest beginnen.** Een website lijkt één groot ding, maar is eigenlijk inhoud, structuur, beeld en publicatie.
2. **De pagina leek een puzzel.** Elk onderdeel was op zichzelf prima, maar samen voelde het niet als één website.
3. **Mobiel brak.** Posities die op de computer goed stonden, werden op een telefoon samengeperst.
4. **Ik begreep “live zetten” niet.** Een bestand op je computer is nog geen website; het moet online staan.
5. **Inhoud schrijven was moeilijker dan code.** Code kun je kopiëren of genereren, maar “wie ben ik” kan alleen ik beantwoorden.
6. **V1 was te veel gestileerd.** Ik wilde alles tegelijk toevoegen, waardoor de pagina vol en vermoeiend werd. Niet elk mooi element hoort bij elkaar.

## Wat AI deed

- Vertaalde “ik wil een persoonlijke website” naar een concrete paginastructuur;
- Maakte de eerste paginaschets;
- Legde domeinen, hosting, deployment en responsive design uit;
- Hielp stijve Chinese tekst natuurlijker te maken;
- Legde uit wat elke foutmelding ongeveer betekende.

## Wat ik met de hand deed

- Bepaalde voor wie de site is en welke indruk hij moet achterlaten;
- Leverde echte ervaringen, projecten, afbeeldingen en contactgegevens;
- Beoordeelde of de pagina goed voelde;
- Testte op een echte telefoon, niet alleen in een voorbeeld op de computer;
- Besloot dat V1 niet perfect hoefde te zijn.

## Wat ik leerde

> **V1 hoeft niet indrukwekkend te zijn; V1 moet bestaan.**
> Krijg eerst “opent, leesbaar, contacteerbaar” werkend, en praat daarna over stijl.

# V2: Geef het een persoonlijkheid

## Wat ik deed

- Voegde een **neurale netwerkachtergrond** toe bovenop V1;
- Voegde een **hackerterminal** toe voor een “system boot”-gevoel;
- Maakte de donkere achtergrond, typografie, kleuren en beweging consistent;
- Zorgde dat de achtergrond bewoog zonder de inhoud te bedekken.

## Problemen

1. **De effecten zagen er cool uit, maar vroegen veel van de prestaties.** Ventilatoren gingen draaien; oude telefoons haperden.
2. **De achtergrond concurreerde met de inhoud.** Lezers wisten niet of ze naar de terminal of de tekst moesten kijken.
3. **AI-code werkte, maar ik begreep niet waarom.** Als er iets brak, wist ik niet waar ik moest aanpassen.
4. **Contrast was onvoldoende.** Als de achtergrond fel werd, was witte tekst moeilijk leesbaar.
5. **Schermen verschilden enorm.** Hetzelfde effect gedroeg zich anders op breedbeeld, laptop en telefoon.
6. **Neurale netwerken voelden cliché.** Ze suggereren technologie, maar zijn zo vaak gebruikt dat ze niet meer blijven hangen.
7. **De hackerterminal maakte het geheel rommelig.** Terminal, tekst en achtergrond vochten allemaal om aandacht.

## Wat AI deed

- Bood meerdere visuele richtingen, niet één antwoord;
- Genereerde de eerste versie van de bewegende achtergrond en terminalinteractie;
- Legde uit waarom de achtergrond naar achteren moest en de tekst naar voren;
- Stelde lichtere alternatieven voor de prestaties voor;
- Hielp “cool versus leesbaar” om te zetten in duidelijke keuzes.

## Wat ik met de hand deed

- Bepaalde welke effecten bleven en welke weg gingen;
- Zette de beweging lager; liever minder effect dan slechter lezen;
- Testte op echte apparaten, niet alleen op de ontwikkelcomputer;
- Controleerde of elke passage duidelijk was;
- Verwijderde alles wat indrukwekkend leek maar geen echt nut had.

## Wat ik leerde

> **Stijl is herkenbaar zijn zonder in de weg te zitten.**
> De echte vooruitgang van V2 was dat de site een persoonlijkheid kreeg.

# V3: Geef het een wereld

## Wat ik deed

- Verschoof het visuele thema van “technologie” naar “kosmos”;
- Voegde NASA punk, neumorfisme en glassmorfisme toe op een retro-futuristische basis;
- Voegde in één zin een **sterrenveld, een zwart gat en zwaartekrachtlens** toe: licht buigt rond het zwarte gat, en sterren, zwart gat en inhoud delen één scène en versterken elkaar;
- Streefde naar een “chimera” die tijd overspant en meerdere technologiestijlen mengt.

## Problemen

1. **Prestaties versus schoonheid.** Hoe realistischer het effect, hoe meer rekenkracht nodig; hoe soepeler het loopt, hoe minder detail mogelijk is.
2. **Parameters zijn extreem gevoelig.** Een kleine verandering in positie, grootte, helderheid of rotatiesnelheid van het zwarte gat maakt van “indrukwekkend” opeens “raar”.
3. **Het zwarte gat steelt de show.** Zodra de achtergrond de hoofdrol krijgt, wordt de tekst een bijrol.
4. **Elk scherm vraagt een andere compositie.** Computer, telefoon, portret en landschap kunnen het zwarte gat niet allemaal op dezelfde plek zetten.
5. **“Mooi” en “leesbaar” vechten vaak.** Sommige beelden zijn prachtig, maar tekst verdwijnt erop.
6. **Credits moeten zorgvuldig worden geregeld.** Als ik andermans beeld of implementatie gebruik, horen bron, link en naam erbij.
7. **Resolutie verandert de compositie volledig.** 2K en 1080p vragen andere posities en witruimte; op mobiel moeten sommige effecten verborgen of vereenvoudigd worden.

## Wat AI deed

- Legde zwaartekrachtlensing in eenvoudige taal uit;
- Stelde parameterranges en debugrichtingen voor;
- Hielp het effect te optimaliseren;
- Stelde fallbackversies voor zwakkere apparaten voor;
- Hielp credits te ordenen en te bepalen wat naamsvermelding nodig had;
- Hielp de tekst te vertalen, ordenen en polijsten.

## Wat ik met de hand deed

- Bepaalde waar het zwarte gat staat, hoe groot het is en hoe het moet voelen;
- Maakte de uiteindelijke keuze tussen schoonheid en leesbaarheid;
- Controleerde elke referentie en behield de maker en link;
- Testte op oudere apparaten, telefoons en verschillende browsers;
- Liet ruimte om animaties te vertragen of uit te zetten, met respect voor het apparaat van de bezoeker;
- Nam verantwoordelijkheid voor de juistheid van de inhoud.

## Wat ik leerde

> **Technische effecten zijn het penseel; de inhoud is het schilderij.**
> AI kan me helpen een sterrenveld en een zwart gat te schilderen, maar ik moet bepalen waarom het er is en voor wie.

# Nu: Blijven itereren

V3 is niet het einde. Op dit moment maak ik de site stabieler op meer apparaten; maak ik de tekst duidelijker en offer ik minder leesbaarheid op aan effecten; documenteer ik het proces zodat het project ook als gids bruikbaar is; houd ik de Chinese, Engelse en Nederlandse tekst gelijk; verzamel ik feedback om te zien wat bezoekers echt willen; en blijf ik schuiven tussen prestaties, esthetiek en inhoud.

Het doel is makkelijker te benoemen dan te halen:

> **Makkelijker te lezen, makkelijker te gebruiken, makkelijker te onderhouden.**

# Valkuilen

| Valkuil | Wat er gebeurde | Optimalisatie |
| --- | --- | --- |
| Code kopiëren en plakken | Duizenden regels heen en weer gekopieerd; traag en steeds omvangrijker | Inhoud, pagina’s, componenten en talen scheiden; een AI-agent in lokale VS Code zetten zodat AI bestanden zelf aanpast en mijn handen vrijmaakt |
| Alles tegelijk toevoegen | V1 had te veel stijlen; informatie zat op elkaar en was moeilijk te lezen | Eerst de leesbaarheid van de tekst beschermen, daarna effecten kiezen |
| Verouderde of rommelige stijl | Neurale netwerken voelden cliché; de hackerterminal trok te veel aandacht | Terug naar één sterrenveldthema |
| Schoonheid boven leesbaarheid | Een felle achtergrond maakte tekst moeilijk leesbaar | Contrast, witruimte en inhoudshiërarchie prioriteit geven |
| AI-code die werkt maar niet begrepen wordt | Als iets brak, wist ik niet waar ik moest zoeken | AI om uitleg van de belangrijkste logica vragen en fallbackversies bewaren |
| Grote verschillen tussen schermen | 2K, 1080p en mobiel zijn volledig andere composities | Apart aanpassen; zware effecten op mobiel verbergen |
| Prestaties versus effect | Realistischere effecten vragen meer rekenkracht | Keuzes maken en vereenvoudigde versies voor zwakke apparaten voorbereiden |

# Websitecompatibiliteit

Resolutie is een van de meest onderschatte problemen in dit project.

Hetzelfde zwarte gat kan op een 2K-scherm precies goed lijken, op 1080p te groot worden en op een telefoon de tekst bedekken of de pagina laten haperen.

Dus pas ik grootte, positie en helderheid apart aan voor 2K en 1080p, bepaal ik op mobiel welke effecten het behouden waard zijn en welke verborgen of verminderd moeten worden, en bouwde ik een debugvenster om de weergave op 2K en 1080p handmatig af te stellen. Het punt is om één effect niet meer op elk apparaat te forceren.

> **Beoordeel het effect op het apparaat, niet in het abstracte.** Een compositie die op 2K werkt, is niet de compositie die op een telefoon werkt.

# Wat AI en mensen doen

| Gebied | AI kan | Een mens moet |
| --- | --- | --- |
| Richting | Veel opties geven | De uiteindelijke keuze maken |
| Inhoud | Schetsen, uitbreiden, herschrijven, vertalen | Echte ervaringen, foto’s en meningen leveren |
| Beeld | Kleuren, layout en beweging voorstellen | Beoordelen of het mooi en passend is |
| Code | Een eerste versie schrijven, fouten vinden en uitleggen | Bepalen of het bruikbaar is en echte apparaten testen |
| Tekst | Polijsten, AI-toon verminderen, stem verenigen | Feiten controleren en een eigen stem bewaren |
| Prestaties | Optimalisaties voorstellen | Ervaren hoe het voelt op oude telefoons en trage netwerken |
| Auteursrecht | Referenties en bronvermelding ordenen | Toestemming controleren en verantwoordelijkheid nemen |
| Onderhoud | Updatelijsten genereren | Blijven updaten, reageren en keuzes maken |

> **AI versnelt het werk; het neemt geen enkele beslissing.**
> Het gaat sneller dan ik, maar het kan niet zeggen wat dit is, waarom het bestaat of wie ervoor verantwoordelijk is.

# Gids voor beginners

1. **Schrijf eerst inhoud, ontwerp daarna.**  
   Een website is de container; inhoud is het water. Bepaal wat je wilt zeggen voordat je bepaalt hoe het eruitziet.

2. **V1 hoeft alleen live te gaan, niet te imponeren.**  
   Als het opent, leesbaar is en contact mogelijk maakt, ben je al verder dan veel sites die eeuwig worden herzien.

3. **Behandel AI als een stagiair, niet als een baas.**  
   Het is goed in schetsen maken, maar jij bent verantwoordelijk voor beoordeling, keuzes en het eindresultaat.

4. **Denk bij effecten aan leesbaarheid en artisticiteit.**  
   Steelt het de show? Past het bij het thema? Ziet het er in dark en light mode goed uit? Loopt de layout in andere talen in de war?

5. **Test altijd op een echte telefoon en een oud apparaat.**  
   Jouw computer is niet het apparaat van de bezoeker. Openen, leesbaar en soepel is belangrijker dan cool.

6. **Inspiratie mag, blind kopiëren niet.**  
   Als je andermans code, beeld of ideeën gebruikt, bewaar de credit en controleer toestemming. Publiek werk vraagt extra zorg.

7. **Wijzig kleine details één voor één; maak een back-up voor grote wijzigingen.**  
   Het grootste risico bij iteratie is een “grote herschrijving” waarna niemand weet welke stap iets brak.

# Credits / referenties

De visuals zijn niet uit het niets ontstaan. Deze bronnen gaven belangrijke referenties en inspiratie:

- **Sterrenveld-referentie**: [OpenAI GPT-6 Astra-pagina](https://openai.com/index/gpt-6-astra/)
- **Zwart gat-implementatie**: [Shadertoy (lstSRS)](https://www.shadertoy.com/view/lstSRS)
- **Zwaartekrachtlens-referentie**: [BH+disk](https://guitrj.github.io/BH+disk/)
- **Cassetteplank-referentie**: het rek met cassettebandjes waar je in de Agent Story-hoofdstukken van Zenless Zone Zero een verhaal kiest ([officiële site](https://zenless.hoyoverse.com/en-us/)). Het eindresultaat wijkt inmiddels ver van het origineel af; de beweging van de bandjes komt daarvandaan.
- **Intro-referentie**: de opening op de site van Arknights: Endfield ([officiële site](https://endfield.gryphline.com/en-us/)). De kleuren, de layout en het rustige tempo van de readout komen daarvandaan; alle elementen en teksten zijn opnieuw geschreven.

> Opmerking: dit zijn referenties voor inspiratie, beeld en implementatie-ideeën. Verschillende Shadertoy-werken kunnen verschillende licenties hebben; controleer altijd de notities van de originele maker.

# Inspiratiesites

Er zijn veel referentiesites, en zonder plan verdwaal je snel. Ik heb ze op doel gesorteerd.

## Eerst een stijl kiezen

| Site | Wat het in één zin is | Inspiratie |
| --- | --- | --- |
| [Land-book](https://land-book.com) | Galerij met goed ontworpen websites | Algemene stijl, kleur, typografie en witruimte |
| [Siteinspire](https://www.siteinspire.com) | Doorzoekbare bibliotheek met webdesigncases | Specifieke sferen: donker, minimalistisch, technologisch |
| [Lapa Ninja](https://www.lapa.ninja) | Grote verzameling landingspagina’s en templates | Veel first-screenrichtingen in één oogopslag |
| [One Page Love](https://onepagelove.com) | Showcase voor one-pagesites | Hoe je in één pagina een heel verhaal vertelt |
| [Awwwards Nominees](https://www.awwwards.com/websites/nominees/) | Genomineerd werk van een wereldwijde webdesignprijs | Nieuwste creativiteit, interactie en technische grenzen |

## Daarna beweging zoeken

| Site | Wat het in één zin is | Inspiratie |
| --- | --- | --- |
| [Motionsites.ai](https://motionsites.ai/) | Bibliotheek met motion- en interactieve webinspiratie | Scrollen, overgangen, muisinteractie |
| [Landing.love](https://www.landing.love/) | Hoogwaardige voorbeelden van landingspagina-beweging | Hero-secties, knopfeedback, scrollritme |

## Dan implementatie en componenten zoeken

| Site | Wat het in één zin is | Inspiratie |
| --- | --- | --- |
| [Shadertoy](https://www.shadertoy.com/) | Open community voor shaders en realtime-effecten | Sterrenvelden, zwarte gaten, gloed, vloeistoffen |
| [21st.dev Community Components](https://21st.dev/community/components) | Communitybibliotheek met moderne UI-componenten | Knoppen, kaarten, navigatie, geanimeerde componenten |
| [lieflat-charts](https://github.com/zyhdf5/lieflat-charts) | Open-source iconen en grafieken met consistente stijl | Een uniforme iconen- en grafische stijl |

## Tot slot de tekst polijsten

| Site | Wat het in één zin is | Inspiratie |
| --- | --- | --- |
| [lieflat-less-ai-tone](https://github.com/zyhdf5/lieflat-less-ai-tone) | Tool/project om “AI-toon” in teksten te verminderen | Teksten menselijker en natuurlijker maken |

## Mijn gebruiksvoorstel

1. **Eerst Land-book / Siteinspire**: bepaal de algemene stijl;
2. **Daarna Motionsites / Landing.love**: bepaal het bewegingritme;
3. **Dan Shadertoy / 21st.dev**: zoek concrete effecten en componenten;
4. **Tot slot lieflat-less-ai-tone**: haal de AI-toon uit de tekst;
5. **Gebruik Awwwards / One Page Love / Lapa Ninja als aanvulling**: bewaar telkens 2–3 referenties; surf niet tijdens het bouwen.

> Een kleine herinnering: inspiratiesites zijn een menu, geen takenlijst.  
> Kies 2–3 referenties die echt passen; anders blijf je kijken en begin je nooit te bouwen.

# Wat ik heb geleerd

Deze site groeide van een eenvoudige persoonlijke homepage naar een neuraal netwerk en hackerterminal, en daarna naar een sterrenveld, zwart gat en zwaartekrachtlens.

De visuals zijn alleen het zichtbare deel. Wat het proces me echt leerde, is dat AI me over de drempel van "ik kan niet programmeren" kan tillen, en dat smaak, oordeel, inhoud en verantwoordelijkheid daarna nog steeds bij mij liggen. Een website blijkt een doorlopend verslag van iteratie.

AI maakt uitvoering goedkoop, en precies daarom wordt oordeel waardevol.

> **AI maakt ideeën sneller; ik maak ze de moeite waard.**
