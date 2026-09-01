---
title: Light Diffusion Test Platform

date: 2026-04-20

description: Designed a desktop optical test platform to systematically evaluating the optical and visual properties of different materials; turning subjective CMF decisions into  repeatable and measurable comparisons.

type: projects

category: CMF & Optical Testing

cover: 03-final-platform-3d.png

tags:
  - Industrial Design
  - CMF
  - Material Testing
  - Light Diffusion
  - Optical Measurement

tools:
  - Arduino
  - LED Strip (PWM Controlled)
  - Laboratory Lift Stand
  - Precision Stepper Driver
  - Oxygen-Free Copper Wire

featured: true

lang: en

translationKey: light-diffusion-test-platform
---

# The Problem

Here's something that happens all the time in product design: you're picking a translucent material for a lamp shade, a diffuser panel, or a display cover, and trying to guess which material looks the best. Hold the sample up to the light, squint a bit, maybe hold it next to another sample, and "yeah, this one looks about right."

The trouble is two materials that look identical under room light can behave completely differently once they're backlit. Surface finish, thickness, internal structure; they all affect how light moves through the material, and renderings can only get you so far. At a certain point, you have to see it with your own eyes.

So I built a test platform. Not because I wanted to spend weeks on an apparatus, but because every CMF decision I made after that would be backed by data instead of intuition.

# Measurable factors

Four optical properties, each directly relevant to product design decisions:

| Property                   | What It Tells You                                   | Why It Matters for Design                                |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| **Transmission**           | How much light gets through the material            | Brightness of backlit displays, LED indicator visibility |
| **Diffusion**              | How evenly the light scatters after passing through | Hotspot elimination, uniformity of illuminated surfaces  |
| **Reflection**             | How the material surface bounces incident light     | Surface finish selection, glare management               |
| **Luminance Distribution** | Brightness variation across the illuminated area    | Visual comfort, light guide performance                  |

Beyond the measurement goals, I had a handful of practical requirements that turned out to be just as important as the optical ones:

- <strong style="color:var(--accent)">Repeatable positioning</strong>: If I can't place samples at consistent distances from the light source, the result will be meaningless.
- <strong style="color:var(--accent)">Adjustable brightness</strong>: Materials look different at 10% brightness vs 100%. The light source needs to cover that range.
- <strong style="color:var(--accent)">Ambient light control</strong>: Optical measurements in a sunlit room are creating noise. The test environment has to minimize external interference.
- <strong style="color:var(--accent)">Quick sample swapping</strong>: If changing materials takes five minutes, I won't run enough comparisons to learn anything useful.
- <strong style="color:var(--accent)">Visual output</strong>: I need to see the results, not just log numbers. Side-by-side visual comparison is half the point.

# Design & Build

![Concept Design](./02-concept-design.png)

## Platform Architecture

The platform is a vertical measurement stand: light source at the bottom, adjustable sample stage in the middle, observation from above. The layout is basically a stripped-down optical bench; nothing I didn't need, nothing that gets in the way.

<div class="side-by-side">
  <div><img src="./04-final-render.png" alt="Final Render" /><p>Final 3D Render</p></div>
  <div><img src="./05-concept-sketch.png" alt="Concept Sketch" /><p>Concept Sketch</p></div>
</div>

### Key Components

- <strong style="color:var(--accent)">Light source</strong>: LED strip, goes from barely glowing to full output.
- <strong style="color:var(--accent)">Lift stand</strong>: The height adjustment lets me precisely control the distance between the light source and the material.
- <strong style="color:var(--accent)">Frame</strong>: Laser-cut structural panels, spray-painted matte black and absorbs stray ambient light and kills internal reflections.
- <strong style="color:var(--accent)">PWM Controller</strong>: Use PWM to control the LED strip’s dutycycle to adjust its brightness.
- <strong style="color:var(--accent)">Power delivery</strong>: Oxygen-free copper wire 0.5mm². Rated for 2A with headroom.

## Fabrication Process

<div class="process-scroll" id="process-scroll">
  <div class="process-track" id="process-track" data-copies="3" data-unique="10">
    <div class="step"><img src="./06-3d-modelling.png" alt="3D Modelling" /><span>STEP 1: 3D Modelling</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="Laser Cutting" /><span>STEP 2: Laser Cutting</span></div>
    <div class="step"><img src="./08-test-build.png" alt="Test Build" /><span>STEP 3: Test Build</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="Surface Finish" /><span>STEP 4: Surface Finish</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="Subassembly" /><span>STEP 5: Subassembly</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="Circuit Soldering" /><span>STEP 6: Circuit Soldering</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="Circuit Verification" /><span>STEP 7: Circuit Verification</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="Polarity Check" /><span>STEP 8: Polarity Check</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="Subassembly" /><span>STEP 9: Final Assembly</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="Circuit Testing" /><span>STEP 10: Circuit Testing</span></div>
    <div class="step"><img src="./06-3d-modelling.png" alt="3D Modelling" /><span>STEP 1: 3D Modelling</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="Laser Cutting" /><span>STEP 2: Laser Cutting</span></div>
    <div class="step"><img src="./08-test-build.png" alt="Test Build" /><span>STEP 3: Test Build</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="Surface Finish" /><span>STEP 4: Surface Finish</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="Subassembly" /><span>STEP 5: Subassembly</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="Circuit Soldering" /><span>STEP 6: Circuit Soldering</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="Circuit Verification" /><span>STEP 7: Circuit Verification</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="Polarity Check" /><span>STEP 8: Polarity Check</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="Subassembly" /><span>STEP 9: Final Assembly</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="Circuit Testing" /><span>STEP 10: Circuit Testing</span></div>
    <div class="step"><img src="./06-3d-modelling.png" alt="3D Modelling" /><span>STEP 1: 3D Modelling</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="Laser Cutting" /><span>STEP 2: Laser Cutting</span></div>
    <div class="step"><img src="./08-test-build.png" alt="Test Build" /><span>STEP 3: Test Build</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="Surface Finish" /><span>STEP 4: Surface Finish</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="Subassembly" /><span>STEP 5: Subassembly</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="Circuit Soldering" /><span>STEP 6: Circuit Soldering</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="Circuit Verification" /><span>STEP 7: Circuit Verification</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="Polarity Check" /><span>STEP 8: Polarity Check</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="Subassembly" /><span>STEP 9: Final Assembly</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="Circuit Testing" /><span>STEP 10: Circuit Testing</span></div>
  </div>
</div>

# Material Testing

I tested a range of translucent and transparent materials that show up frequently in product enclosures, diffusers, and light guides:

### Test Materials

| Material                    | Type                   | Key Characteristic                                                       |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------ |
| **Translucent PLA**         | 3D-printed             | Layer-line scattering, cheap for prototyping                             |
| **Translucent PETG**        | 3D-printed             | Better clarity than PLA, stronger layer adhesion                         |
| **Acrylic Sheet**           | Laser Cut              | Great optical clarity, scratch-resistant, lots of surface finish options |
| **AB Epoxy Resin Plate**    | Cast resin             | High transparency, smooth surface, glass alternative                     |
| **PC Light Diffuser Sheet** | Extruded polycarbonate | Purpose-built for diffusion, prismatic surface texture                   |

Each material went through multiple configurations — different thicknesses, different surface finishes, different distances from the light source — so I could see how material choice actually affects the final visual output.

# Controllable Variables

The whole point of building this thing instead of just holding materials up to a lamp was to change one thing at a time. Systematic A/B testing is only possible if you can lock every variable except the one you're studying.

<div class="variables-grid">

- <strong style="color:var(--accent)">Light Intensity</strong> : set via the PWM controller, from barely visible to full blast
- <strong style="color:var(--accent)">Material Type</strong> : PLA, PETG, Acrylic, AB Epoxy, PC Diffuser
- <strong style="color:var(--accent)">Material Color</strong> : Natural, white, and tinted variants of PETG and acrylic
- <strong style="color:var(--accent)">Material Thickness</strong> : Single layer, stacked layers, different sheet gauges
- <strong style="color:var(--accent)">Surface Finish</strong> : Raw print, sanded (80–5000 grit), polished, textured
- <strong style="color:var(--accent)">Diffusion Distance</strong> : The gap between light source and sample, adjusted via the lift table

</div>

# Design Iterations

The platform didn't arrive fully formed. I did three iterations, and each version fixed something the previous one got wrong.

![Iteration Comparison](./01-iteration-comparison.png)

|                          | V1 — Single LED                                         | V2 — LED Strip                                              | V3 — LED Strip + PWM                                                                     |
| ------------------------ | ------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| <strong>Method</strong>  | Hand-soldered                                           | Copper foil tape                                            | PWM controller                                                                           |
| <strong>Issues</strong>  | <span style="color:#e53935">✕</span> Soldering too slow | <span style="color:#e53935">✕</span> Tape unsuitable for 2A | <span style="color:var(--terminal-green)">✓</span> Brightness adjustable                 |
|                          | <span style="color:#e53935">✕</span> Light effect poor  | <span style="color:#e53935">✕</span> No brightness control  | <span style="color:var(--terminal-green)">✓</span> Diffuse reflection from dark surfaces |
| <strong>Verdict</strong> | <span style="color:#e53935">✕ Discarded</span>          | <span style="color:#e53935">✕ Discarded</span>              | <span style="color:var(--terminal-green)">✓ Final</span>                                 |

### V1: Single LED — Manual Solder

I was planning on hand-soldering individual LEDs to the board. It was the obvious first approach, and it was wrong in exactly the ways you'd expect.

- <span style="color:#e53935">**Issue:**</span> Hand-soldering twenty LEDs is tedious and inconsistent. Each joint has slightly different resistance, so each LED glows a tiny bit differently. For a test platform, "tiny bit differently" is fatal.
- <span style="color:#e53935">**Issue:**</span> A single-point light source creates uneven illumination across the sample. If the light isn't uniform to begin with, you can't tell whether the diffusion pattern you're seeing is from the material or from the source.

### V2: LED Strip — Copper Foil Tape

I swapped the individual LEDs for a uniform LED strip and used copper foil tape for the electrical connections. Better, but new problems.

- <span style="color:#e53935">**Issue:**</span> Copper foil tape is convenient and looks clean, but it can't handle 2A. I ran the numbers on cross-sectional area and realized this was a fire hazard waiting to happen. Prototype aesthetics don't count for much when your wiring is undersized.
- <span style="color:#e53935">**Issue:**</span> Fixed brightness. No matter what material or distance I was testing, the light output was the same. Different scenarios need different illumination levels, and I had no way to adjust.

### V3: LED Strip + PWM Controller (Current Version)

This is the one that stuck:

- <span style="color:var(--terminal-green)">**Upgrade:**</span> Replaced copper tape with oxygen-free copper wire 0.5mm². Properly rated for 2A with margin to spare.
- <span style="color:var(--terminal-green)">**Upgrade:**</span> PWM controller for full-range brightness adjustment. Now I can test at anywhere in between; and get the same reading every time.
- <span style="color:var(--terminal-green)">**Upgrade:**</span> Painted the interior frame matte black. Ambient light and internal reflections had been silently contaminating every reading.

# What the Platform Delivers

The finished design gives me a reliable, repeatable environment for comparing how materials handle light:

- <strong style="color:var(--accent)">Side-by-side material comparison</strong> under identical lighting — no more "I think this one looks better"
- <strong style="color:var(--accent)">Surface finish evaluation</strong> — how does sanding, polishing, or texturing change the way light moves through?
- <strong style="color:var(--accent)">Thickness vs transmission analysis</strong> — how much does doubling the sheet thickness actually reduce brightness?
- <strong style="color:var(--accent)">Controlled brightness sweeps</strong> — see how materials behave across the full dimming range, not just at one setting
- <strong style="color:var(--accent)">Visual documentation</strong> of light distribution patterns I can reference on future projects

![Final Platform](./03-final-platform-3d.png)

## What Building It Taught Me

Beyond the CMF data, building this platform drilled in a few principles that apply to pretty much any design-build project:

- <strong style="color:var(--accent)">Current ratings are important</strong>: The copper tape was a concrete reminder that prototyping materials need to be evaluated against their actual electrical loads. It doesn't matter how clean the build looks if the wiring is undersized. Safety specs aren't negotiable.
- <strong style="color:var(--accent)">Your environment is part of your instrument</strong>: Optical measurements live and die by ambient light control. That matte black paint job; which took maybe twenty minutes; improved measurement consistency more than any other single change. Sometimes the simplest fix has the biggest impact.
- <strong style="color:var(--accent)">Isolate one variable at a time or you're just guessing</strong>: The ability to change material, thickness, finish, or distance independently is what turns this from "holding things up to a lamp" into actual testing. Systematic comparison only works if you can hold everything steady except the one thing you're studying.
- <strong style="color:var(--accent)">Tools pay for themselves across projects</strong>: Spending time on a proper test platform feels slow at first, but every future CMF decision involving translucent materials now references real measurements instead of squinting and hoping.

## Future improvements

- <strong style="color:var(--accent)">Replace manual PWM control with calibrated digital control</strong>: The current setup relies on a manually adjusted PWM controller, which is sufficient for exploratory testing but introduces some variation in light intensity between measurements. A microcontroller could generate precisely defined PWM signals and store repeatable intensity settings, making it possible to reproduce identical lighting conditions across tests. This would improve the reliability of the data and make comparisons between materials more rigorous.
