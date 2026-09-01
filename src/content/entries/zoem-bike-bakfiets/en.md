---
title: "ZOEM Bike: Modular Cargo Bike Box"
date: 2025-11-15
description: Redesigned a modular cargo box for the ZOEM Bike platform, addressing key user pain points while managing the end-to-end process from material sourcing and factory coordination to assembly and final delivery.

type: projects
category: Industrial Design / Fabrication
cover: cover.png

tags:
  - Industrial Design
  - Sheet Metal
  - Modular Design
  - BOM
  - Ergonomics
  - Fabrication
  - Cargo Bike

tools:
  - SolidWorks
  - Sheet Metal (Bending / Welding)
  - Gas Springs
  - BOM Management
  - Factory Liaison

featured: true

collaboration: team

lang: en

translationKey: zoem-bike-cargo-box
---

# The Assignment

ZOEM Bike is a Dutch cargo bike builder. Our assignment came from one of their clients: a self-employed painter, who ordered a custom cargo box for his ZOEM chassis. The box carries ladders, paint buckets and tools through city traffic every working day. I worked in a two-person project team with another industrial design intern; I was mainly responsible for material analysis and selection, physics calculations and testing, gas spring testing, ergonomic calculations, 3D rendering, preparing the sticker artwork in Photoshop, and the final assembly of the finished product.

The project ran through the full development cycle. We researched existing market solutions, compared the feasibility of different components, and analyzed the client's pain points in the field. Those findings shaped an optimized design that we then produced, installed and delivered to the client at the end of the project.

# Design Goals

The starting point was the current cargo box. Functional, but carrying years of accumulated compromises. The redesign brief came down to five targeted changes:

| Change | Design Rationale |
| --- | --- |
| One side cover instead of two | One lid is more convenient to open than two, and it only needs one lock instead of two different keys. The new box opens from one side only, facing right: when the bike is parked along a street, the painter opens the box from the pavement side rather than into car traffic, which is safer for loading and unloading. |
| Redesigned waterproofing system | Merging two lids into one meant the seal and the entire frame structure had to be redesigned around the new opening. |
| Redesigned structural frame | The lid works together with the hinge and stays under continuous pressure from the gas spring when closed. The lid was reinforced against deformation, and the sheet metal shell was protected from damage during opening and closing, as well as under static load in the closed position. |
| Redesigned hinge mechanism | Stainless steel, built for repeated open/close cycles, waterproof and rust-resistant. It is riveted in place and runs straight along the fixed U-profile steel it mounts to. |
| Lighter materials | Strong where it needs to be strong, light everywhere else: a steel profile frame carries the loads, while an [Alupanel](https://kunststofplatenshop.nl/alupanel-platen/) aluminium composite shell keeps the whole bike light (the same logic as a car's A-pillar versus its body panels), freeing capacity for more cargo. |

<div style="text-align:center; margin:40px auto;">
<img src="./01-old-bike-design.jpg" alt="The existing box design" style="max-width:420px; border-radius:12px; display:block; margin:0 auto;" />
<p style="text-align:center; font-family:var(--font-mono); font-size:var(--text-scale-2xs); letter-spacing:var(--tracking-micro); color:var(--text-tertiary); margin-top:10px;">The client's previous standard box</p>
</div>

### The Finished Product

<div class="showcase">
<div class="show-item"><img src="./03-box-detail-top.jpg" alt="Box detail: top" /><p>Box detail: top</p></div>
<div class="show-item"><img src="./02-redesigned-box.jpg" alt="Redesigned cargo box" /><p>Redesigned box</p></div>
<div class="show-item"><img src="./04-box-detail-bottom.jpg" alt="Box detail: bottom" /><p>Box detail: bottom</p></div>
</div>

# Research & Analysis

Before any CAD work started, the redesign rested on three inputs: research into existing market solutions, a comparison of component options for feasibility and cost, and daily interviews with the painter: the client who would use this box.

### Research Questions

Every design decision had to answer one of these five questions, written down before the first sketch:

1. How do we choose a gas spring that's easy to open and gentle when closing?
2. How can we make daily use more user-friendly?
3. How can the box offer enough functionality?
4. How can it be waterproof from every angle?
5. How can the box be made more attractive?

### Design Details

The client answered our questions directly. The answers below steered several design choices:

- <strong style="color:var(--accent)">Lid weight</strong>: around 10–12 kg, measured in SolidWorks. The gas spring spec starts here.
- <strong style="color:var(--accent)">Opening range</strong>: the user wants the lid to open as far as possible.
- <strong style="color:var(--accent)">Material stock</strong>: 6XXX-series aluminium sheet metal for the lid: combines strength with weldability and takes anodizing well; steel for the frame.
- <strong style="color:var(--accent)">Frame construction</strong>: square steel tube, welded into shape.
- <strong style="color:var(--accent)">Leak history</strong>: the previous design let water in around the hinge; the old solution was over-engineered.
- <strong style="color:var(--accent)">Lid slope</strong>: allowed, not required. Without a slope, rainwater drains off naturally.
- <strong style="color:var(--accent)">Corrosion</strong>: aluminium parts need protection (anodized or galvanized); powder coating is also an option.
- <strong style="color:var(--accent)">Rivets</strong>: the current pop rivets may not be waterproof enough; closed-end blind rivets look better.
- <strong style="color:var(--accent)">Extra</strong>: hide the battery-to-headlight wiring.

### User Profile

- The painter is 1.95 m tall, so reach height drives the ergonomics.
- Comparable lids on this design use relatively thin aluminium sheet.
- Gas springs are worth considering for the lid, since it also carries a 15 kg ladder on top.
- The box stands about 75 cm high.
- The handlebar must sit at the same height as a standard ZOEM handlebar.
- A cargo bike cabin itself carries a fair amount of weight.

<div style="clear:both"></div>

# Material Analysis

### Initial Sketches

<img src="./14-material-notes.jpg" alt="Concept sketches" style="max-width:620px; border-radius:12px; display:block; margin:36px auto;" />

### Material Research & Selection

<div class="info-tabs">
<div class="tab-nav">
<div class="tab-item">Corrosion</div>
<div class="tab-item">Hinge types</div>
<div class="tab-item">Rivet choice</div>
<div class="tab-item">Gas springs</div>
<div class="tab-item">Fastening</div>
<div class="tab-item">Sealing &amp; Waterproofing</div>
<div class="tab-item">Procurement</div>
</div>
<div class="tab-panel active"><h4>Corrosion</h4><p>When aluminium makes contact with stainless steel fasteners, corrosion can occur. This is known as galvanic corrosion. It happens when two materials, an anode and a cathode, come into contact with each other through an electrolyte (rainwater is enough).</p><p><strong>Final choice:</strong> powder coating for both the steel frame and the aluminium parts. Process: sheet metal processed and welded at the factory (our workshop cannot weld aluminium) → shipped back for assembly and testing → holes drilled (after this point no further changes were possible) → sent to another factory for powder coating → shipped back for final assembly. The goal is for any corrosion to stay within acceptable limits over the product's expected service life.</p><p class="src">Source: 1. Why Can't You Use Stainless Steel and Aluminum Together?</p></div>
<div class="tab-panel"><h4>Hinge types</h4><p><strong>Pivot hinge</strong>: 10–15 years service life; hidden design; load capacity; aesthetic.</p><p><strong>Piano hinge</strong>: 60 years service life; evenly distributed weight; load capacity; sturdiness.</p><p><strong>Butt / heavy-duty hinge</strong>: 5–7 years service life; cheap; load capacity.</p><p><strong>Final choice:</strong> stainless steel piano hinge: long service life with load distributed evenly along the full length, satisfying the brief's requirement for stainless, waterproof and rust-resistant hardware. Sponsored by <a href="https://lino-metaal.nl/">Lino Metaalwaren</a>.</p><p class="src">Source: 1. Camax Hardware 2. China industrial hinges factory</p></div>
<div class="tab-panel"><h4>Rivet choice</h4><p>POP closed-end blind rivets offer up to 23% greater tensile strength than POP open-end rivets, and are completely sealed against liquids and gas, even under pressure. Closed-end rivets are available in a variety of rivet/mandrel material combinations.</p><p>Waterproofing was checked against the IPX rating scale: IPX2 (dripping water), IPX4 (splashing water), IPX6 (powerful water jets, 15 psi for 3 minutes, 100 litres per minute), IPX6K (increased pressure), IPX7 (immersion).</p><p><strong>Final choice:</strong> closed-end blind rivets: higher tensile strength and fully sealed against liquids and gas, verified against the IPX scale.</p><p class="src">Source: 1. The Difference Between Open and Closed End Blind Rivets 2. IPX Waterproof Rating Chart (Storyteller Tech)</p></div>
<div class="tab-panel"><h4>Gas springs</h4><p>Suppliers compared: Amatec Technische Veren (standard gas springs with fixed eyes), Tevema, Gasveerwinkel (full range online, including a configurator), and Spring Masters (from stock). A ball hinge (kogelscharnier) was also considered as an alternative mounting option.</p><p><strong>Final choice:</strong> two 250 N gas springs holding the 10–12 kg lid through its full travel; re-selected and verified during final assembly.</p><p class="src">Source: 1. Gasveerwinkel 2. Gasveerexpert 3. Amatec 4. Tevema 5. Spring Masters</p></div>
<div class="tab-panel"><h4>Fastening</h4><p><strong>Well nut</strong>: vibration-resistant, waterproof, corrosion-resistant; limited load capacity, sensitive to wear and loosening, not suitable for heavy work.</p><p><strong>Closed-end blind rivet</strong>: vibration-resistant, waterproof, corrosion-resistant, load capacity; not serviceable, corrosion risk between metals and moisture, weaker than welding.</p><p><strong>Sealing screw</strong>: vibration-resistant, waterproof, corrosion-resistant, load capacity, serviceable; expensive, O-ring service life.</p><p><strong>Final choice:</strong> the square-tube steel frame was welded into shape, the hinge was fixed with rivets as specified in the brief, and the Alupanel shell was riveted to the steel frame. The rivets were tested and confirmed waterproof.</p><p class="src">Source: 1. Well Nuts vs Nutserts 2. What Are Sealing Screws? (ACCU)</p></div>
<div class="tab-panel"><h4>Sealing &amp; Waterproofing</h4><p>Watertightness is built from three layers: waterproof rivets, silicone sealant (glass adhesive) along the seams, and the frame geometry itself: the lid edge is shaped like a roof gutter, so rainwater runs along it and off the sides instead of flowing into the box.</p></div>
<div class="tab-panel"><h4>Procurement</h4><p>Purchased parts: piano hinge; closed-end blind rivets; gas springs; long-pole waterproof lock.</p></div>
</div>

<!-- RESERVED: BOM table (to be added) -->

# Technical Verification

Early in development we tested the feasibility of the riskiest parts of the design, before committing to production:

- <strong style="color:var(--accent)">Gas spring selection</strong>: the lid weighs roughly 10–12 kg. We tested springs that would hold it open comfortably while minimizing mechanical fatigue in the closed state (the position where the spring spends most of its life under load).
- <strong style="color:var(--accent)">Field visit to [Lino Metaalwaren](https://lino-metaal.nl/)</strong>: a visit to a local hardware specialist to understand hinge design options hands-on before specifying our own.

## Design Iterations: Four Versions

The box went through four major versions before the design froze. Each round addressed the problems found in the previous one, left to right, version by version:

<div class="versions-grid">
<div class="version-cell"><img src="./iteration-01.jpg" alt="Version 1: frame and sheet metal" /><h4>Version 1<br />Frame &amp; Sheet Metal</h4><p>Steel frame profiles adjusted to a thinner size.</p><p>Correct steel profile added to the weldment library.</p><p>Sheet metal weld point reduced in size.</p><p>Side rain gutter no longer needed, removed.</p><p>Gap between the lid side and the box enlarged.</p><p>Gas spring tested for the first time.</p></div>
<div class="version-cell"><img src="./iteration-02.jpg" alt="Version 2: first test build" /><h4>Version 2<br />First Test Build</h4><p>First prototype assembled and physically tested.</p><p>Gap between the lid side and the box further enlarged.</p><p>Front side redesigned to match the back (see image).</p><p>Reinforcement added inside the housing.</p></div>
<div class="version-cell"><img src="./iteration-03.jpg" alt="Version 3: hinge and sizing" /><h4>Version 3<br />Hinge &amp; Sizing</h4><p>Switched to a different size of piano hinge.</p><p>Hinge moved to a different mounting location.</p><p>Seal repositioned for better waterproofing.</p><p>Overall weight reduced.</p></div>
<div class="version-cell"><img src="./iteration-04.jpg" alt="Version 4: U-channel and mounting" /><h4>Version 4<br />U-Channel &amp; Mounting</h4><p>U-channel profile introduced for the hinge mount.</p><p>Gas spring tested for the second time.</p><p>New mounting position meant widening the lid to match.</p><p>Larger tolerance distance between lid and box while closing.</p><p>Waterproofing further improved.</p></div>
</div>

## Gas Spring Evaluation

The spring was specified from measurements and verified with a calculation sheet. The final assembly runs two 250 N gas springs to hold the lid through its full travel:

![Gas spring test & calculation](./17-ergonomics-eval.jpg)

<!-- RESERVED: engineering drawings (to be added) -->

# Ergonomics

The spring and the hinge only work if the human does too. Opening height, reach distance and load access were dimensioned against the painter's working posture:

<img src="./16-gas-spring-test.jpg" alt="Ergonomics evaluation" style="max-width:500px; border-radius:12px; display:block; margin:40px auto;" />

# From Sketch to Delivery

![Dismantling the old box](./step-06-dismantle-old-box.jpg)

Together with my teammate I welded the frame, cut the shell panels, dismantled the old box and assembled the new one, testing the gas spring at multiple stages along the way. The gas springs were re-selected for the final assembly: two 250 N units to hold the lid through its full travel, with a healthy safety margin.

From model to metal: the final render and the real thing on the road:

<div class="side-by-side">
  <div><img src="./18-final-assembly-render.png" alt="Final assembly: 3D render" /><p>Final assembly: 3D render</p></div>
  <div><img src="./step-09-test-run.jpg" alt="The real thing on the road" /><p>The real thing: test run</p></div>
</div>

# What I Walked Away With

This was the first project where the end of the process was a customer riding the result.

- <strong style="color:var(--accent)">Sheet metal is a different design language</strong>: bend radii, weld seams and powder coat tolerances all constrain the geometry long before aesthetics enter the conversation. Designing in SolidWorks and building in steel are two very different things.
- <strong style="color:var(--accent)">Design is a language of balance</strong>: every part decision (a hinge, a gas spring, a sheet thickness) weighs cost against service life, workability, lead time and the user's daily experience. The best component on paper is rarely the best component in the product.
- <strong style="color:var(--accent)">Two-person teams need shared reality</strong>: with only two of us, every sketch and every decision had to be legible to the other person immediately. Documentation stopped being a chore and became the only way we stayed synchronized.
- <strong style="color:var(--accent)">Finishing means testing the finished thing</strong>: the final gas springs (two 250 N units) were re-selected after the lid was real. Specifications survive contact with reality only if you re-verify them at the end.
- <strong style="color:var(--accent)">The gas spring force was the real technical puzzle</strong>: the lid weighs about a dozen kilos on its own, but roughly thirty with the ladder on top. Both situations happen every day, and the gap between them is huge, so choosing one spring force was a genuinely complex decision.
- <strong style="color:var(--accent)">Ideal values are only a starting point</strong>: calculating the theoretical Newton force and predicted dimensions of a gas spring is useful, but actually installing one, opening the lid and feeling how it behaves taught me more than any ideal number in a spreadsheet.

*Special thanks to [Lino Metaalwaren](https://lino-metaal.nl/) for sponsoring the stainless steel piano hinge for this project.*
