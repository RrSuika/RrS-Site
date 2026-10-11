---
title: Light Diffusion Test Platform

date: 2026-04-20

description: A desktop optical test platform for systematically evaluating the optical and visual properties of different materials, so CMF decisions rest on repeatable, measurable comparisons.

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

# Background

Picking a translucent material for a lamp shade, a diffuser panel, or a display cover usually comes down to guessing which one looks best. Hold the sample up to the light, squint a bit, maybe hold it next to another sample, and "yeah, this one looks about right."

The trouble is two materials that look identical under room light can behave completely differently once they're backlit. Surface finish, thickness and internal structure all affect how light moves through the material, and renderings can only get you so far. At a certain point, you have to see it with your own eyes.

So I built a test platform, so that every CMF decision after that would rest on a fixed process.

# Requirements

Four optical properties, each directly relevant to product design decisions:

| Property                   | What It Tells You                                   | Why It Matters for Design                                |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| **Transmission**           | How much light gets through the material            | Brightness of backlit displays, LED indicator visibility |
| **Diffusion**              | How evenly the light scatters after passing through | Hotspot elimination, uniformity of illuminated surfaces  |
| **Reflection**             | How the material surface bounces incident light     | Surface finish selection, glare management               |
| **Luminance Distribution** | Brightness variation across the illuminated area    | Visual comfort, light guide performance                  |

Beyond the measurement goals, I had a handful of practical requirements, and they turned out to weigh just as much as the optical ones. <strong style="color:var(--accent)">Repeatable positioning</strong> came first: if I can't place samples at consistent distances from the light source, nothing I measure afterwards means anything. <strong style="color:var(--accent)">Adjustable brightness</strong> mattered because a material at 10% and that same material at 100% are two different objects, so the source has to cover the whole range. <strong style="color:var(--accent)">Ambient light control</strong> was non-negotiable, since optical measurements taken in a sunlit room are mostly noise. <strong style="color:var(--accent)">Quick sample swapping</strong>, because at five minutes per changeover I would never run enough comparisons to learn anything. And <strong style="color:var(--accent)">visual output</strong>, because seeing two materials side by side is half the point.

# Design & Build

![Concept Design](./02-concept-design.png)

## Platform Architecture

The platform is a vertical measurement stand: light source at the bottom, adjustable sample stage in the middle, observation from above. The layout is basically a stripped-down optical bench: nothing I didn't need, nothing that gets in the way.

<div class="side-by-side">
  <div><img src="./04-final-render.png" alt="Final Render" /><p>Final 3D Render</p></div>
  <div><img src="./05-concept-sketch.png" alt="Concept Sketch" /><p>Concept Sketch</p></div>
</div>

### Key Components

- <strong style="color:var(--accent)">Light source</strong>: LED strip, goes from barely glowing to full output.
- <strong style="color:var(--accent)">Lift stand</strong>: The height adjustment lets me precisely control the distance between the light source and the material.
- <strong style="color:var(--accent)">Frame</strong>: Laser-cut structural panels, spray-painted matte black and absorbs stray ambient light and kills internal reflections.
- <strong style="color:var(--accent)">PWM Controller</strong>: Use PWM to control the LED strip’s dutycycle to adjust its brightness.
- <strong style="color:var(--accent)">Power delivery</strong>: Oxygen-free copper wire 0.5mm², comfortably above the 2A the strip draws.

## Fabrication Process

<div class="process-scroll" id="process-scroll">
  <div class="process-track" id="process-track" data-copies="3" data-unique="10">
    <div class="step"><img src="./06-3d-modeling.png" alt="3D Modeling" /><span>STEP 1: 3D Modeling</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="Laser Cutting" /><span>STEP 2: Laser Cutting</span></div>
    <div class="step"><img src="./08-test-build.png" alt="Test Build" /><span>STEP 3: Test Build</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="Surface Finish" /><span>STEP 4: Surface Finish</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="Subassembly" /><span>STEP 5: Subassembly</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="Circuit Soldering" /><span>STEP 6: Circuit Soldering</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="Circuit Verification" /><span>STEP 7: Circuit Verification</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="Polarity Check" /><span>STEP 8: Polarity Check</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="Subassembly" /><span>STEP 9: Final Assembly</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="Circuit Testing" /><span>STEP 10: Circuit Testing</span></div>
    <div class="step"><img src="./06-3d-modeling.png" alt="3D Modeling" /><span>STEP 1: 3D Modeling</span></div>
    <div class="step"><img src="./07-laser-cutting.png" alt="Laser Cutting" /><span>STEP 2: Laser Cutting</span></div>
    <div class="step"><img src="./08-test-build.png" alt="Test Build" /><span>STEP 3: Test Build</span></div>
    <div class="step"><img src="./09-surface-finish.png" alt="Surface Finish" /><span>STEP 4: Surface Finish</span></div>
    <div class="step"><img src="./10-subassembly-1.png" alt="Subassembly" /><span>STEP 5: Subassembly</span></div>
    <div class="step"><img src="./11-circuit-soldering.png" alt="Circuit Soldering" /><span>STEP 6: Circuit Soldering</span></div>
    <div class="step"><img src="./12-circuit-verification.png" alt="Circuit Verification" /><span>STEP 7: Circuit Verification</span></div>
    <div class="step"><img src="./13-polarity-check.png" alt="Polarity Check" /><span>STEP 8: Polarity Check</span></div>
    <div class="step"><img src="./14-subassembly-2.png" alt="Subassembly" /><span>STEP 9: Final Assembly</span></div>
    <div class="step"><img src="./15-circuit-testing.png" alt="Circuit Testing" /><span>STEP 10: Circuit Testing</span></div>
    <div class="step"><img src="./06-3d-modeling.png" alt="3D Modeling" /><span>STEP 1: 3D Modeling</span></div>
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

Each material went through multiple configurations: different thicknesses, different surface finishes, different distances from the light source: so I could see how material choice actually affects the final visual output.

# Controllable Variables

The whole point of building this thing was to change one thing at a time. Systematic A/B testing is only possible if you can lock every variable except the one you're studying.

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

|                          | V1: Single LED                                         | V2: LED Strip                                              | V3: LED Strip + PWM                                                                     |
| ------------------------ | ------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| <strong>Method</strong>  | Hand-soldered                                           | Copper foil tape                                            | PWM controller                                                                           |
| <strong>Issues</strong>  | <span style="color:#e53935">✕</span> Soldering too slow | <span style="color:#e53935">✕</span> Tape unsuitable for 2A | <span style="color:var(--terminal-green)">✓</span> Brightness adjustable                 |
|                          | <span style="color:#e53935">✕</span> Light effect poor  | <span style="color:#e53935">✕</span> No brightness control  | <span style="color:var(--terminal-green)">✓</span> Diffuse reflection from dark surfaces |
| <strong>Verdict</strong> | <span style="color:#e53935">✕ Discarded</span>          | <span style="color:#e53935">✕ Discarded</span>              | <span style="color:var(--terminal-green)">✓ Final</span>                                 |

### V1: Single LED: Manual Solder

I was planning on hand-soldering individual LEDs to the board. It was the obvious first approach, and it was wrong in exactly the ways you'd expect.

- <span style="color:#e53935">**Issue:**</span> Hand-soldering twenty LEDs is tedious and inconsistent. Each joint has slightly different resistance, so each LED glows a tiny bit differently. For a test platform, "tiny bit differently" is fatal.
- <span style="color:#e53935">**Issue:**</span> A single-point light source creates uneven illumination across the sample. If the light isn't uniform to begin with, you can't tell whether the diffusion pattern you're seeing is from the material or from the source.

### V2: LED Strip, Copper Foil Tape

I swapped the individual LEDs for a uniform LED strip and used copper foil tape for the electrical connections. Better, but new problems.

- <span style="color:#e53935">**Issue:**</span> Copper foil tape is convenient and looks clean, but it is thin, and every connection in it is adhesive rather than metal. That is not a dependable way to carry 2A: the copper may survive it, the joints are where the heat collects. I worked the numbers through and realized this was a fire hazard waiting to happen.
- <span style="color:#e53935">**Issue:**</span> Fixed brightness. No matter what material or distance I was testing, the light output was the same. Different scenarios need different illumination levels, and I had no way to adjust.

### V3: LED Strip + PWM Controller (Current Version)

This is the one that stuck:

- <span style="color:var(--terminal-green)">**Upgrade:**</span> Replaced the tape with oxygen-free copper wire 0.5mm², which puts real metal at every joint and sits comfortably above the 2A the strip draws.
- <span style="color:var(--terminal-green)">**Upgrade:**</span> PWM controller for full-range brightness adjustment. Now I can test at any level in between and get the same reading every time.
- <span style="color:var(--terminal-green)">**Upgrade:**</span> Painted the interior frame matte black. Ambient light and internal reflections had been silently contaminating every reading.

# Result

The finished design gives me a reliable, repeatable environment for comparing how materials handle light. <strong style="color:var(--accent)">Side-by-side material comparison</strong> under identical lighting retires the old "I think this one looks better". I can work through <strong style="color:var(--accent)">surface finish evaluation</strong> and see what sanding, polishing or texturing does to the way light moves through. I can run a <strong style="color:var(--accent)">thickness versus transmission analysis</strong> and find out what doubling the sheet actually costs in brightness. I can do <strong style="color:var(--accent)">controlled brightness sweeps</strong> and watch a material across the full dimming range. And every run leaves <strong style="color:var(--accent)">visual documentation</strong> of the light distribution that I can pull up on the next project.

![Final Platform](./03-final-platform-3d.png)

# What I Learned

Beyond the CMF data, building this platform drilled in a few principles that apply to pretty much any design-build project:

<strong style="color:var(--accent)">Current ratings are important</strong>: the copper tape was a concrete reminder that prototyping materials have to be judged against their actual electrical loads, and that a clean-looking build means nothing if the wiring is undersized. <strong style="color:var(--accent)">Your environment is part of your instrument</strong>: optical measurements live and die by ambient light control, and twenty minutes with a can of matte black paint improved measurement consistency more than any other single change. <strong style="color:var(--accent)">Isolate one variable at a time</strong>, or you are just guessing, because being able to change material, thickness, finish or distance independently is exactly what turns holding things up to a lamp into an experiment. And <strong style="color:var(--accent)">tools pay for themselves across projects</strong>: the platform felt slow to build, but every CMF decision involving translucent materials now starts from real measurements instead of squinting and hoping.

## Future improvements

<strong style="color:var(--accent)">Replace manual PWM control with calibrated digital control</strong>. The setup relies on a manually adjusted PWM controller, which is fine for exploratory testing but leaves some variation in light intensity between measurements. A microcontroller could generate precisely defined PWM signals and store repeatable intensity settings, so the same lighting conditions could be reproduced across tests. That would make the data more reliable and comparisons between materials more rigorous.
