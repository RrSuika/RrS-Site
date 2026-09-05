---
title: Studio Electrical Safety & Optimization
date: 2026-05-14
description: "Home workshop electrical analysis: 9 risk factors identified, star-topology distribution system implemented."

type: lab
category: Electrical Engineering
cover: cover.png

tags:
  - Electrical Safety
  - Power Distribution
  - Workshop Design
  - NEN 1010
  - Risk Assessment

tools:
  - Distribution Board
  - Circuit Breakers
  - RCD
  - Power Distribution Units

featured: true

lang: en

translationKey: studio-electrical-optimization
---

![Workspace Overview](./1.png)

# Overview

When I started welding in the same room as my computers, I knew I was asking for trouble. The lights would flicker when the compressor kicked on. Power strips were daisy-chained in ways I'd rather not describe. And somewhere in the back of my mind I knew the setup had problems: I just hadn't sat down to figure out exactly what they were.

This project is the result of finally doing that. I mapped out every outlet, every device, every extension cord in my workshop, and what I found wasn't pretty: nine distinct safety risks, from an ungrounded welding machine to a fire hazard I'd been casually ignoring for months.

I'm in **the Netherlands**, so everything here is grounded in **NEN 1010**: the Dutch implementation of European wiring regulations. If you're in a different country, your voltage standards and panel structures will differ, but the principles around topology, circuit separation, and overcurrent protection are universal.

# What I Wanted to Achieve

- Actually map out where power flows in my workshop
- Find every safety risk I'd been walking past without noticing
- Identify which devices were the real power hogs
- Design a solution that was both safe and actually doable (not a theoretical "rewire the house" plan)
- Implement physical circuit separation between heavy machinery and sensitive electronics

# How a Dutch Home Electrical System Works

For context: in Dutch homes, the distribution board (_groepenkast_) lives in the meter cupboard. Power comes in from the grid and hits these protection layers in order:

- **Main Fuse & Main Switch:** Kills everything if you need to
- **Residual Current Device (RCD):** Detects leakage current and trips before you get electrocuted
- **Circuit Breakers:** Split the installation into groups; heavy consumers get their own dedicated circuit
- **Grounding:** The safety net that gives fault current somewhere safe to go

![Distribution Board Structure](./2.png)

The Dutch grid, in the wiring guide's terminology, is a TN-C-S system: the network delivers the phases plus a combined neutral-earth conductor (PEN), which the meter cupboard splits into neutral and earth, backed by a local earth stake. That split is what the whole groepenkast builds on, and it is also what makes RCD protection possible at all: earth-leakage detection only works in networks where neutral and earth are connected, like TN or TT.

An RCD works by comparing the current in the phase and neutral conductors and opening the circuit within 25–40ms when the difference exceeds 5–30mA, faster than an electric shock can push a heart into ventricular fibrillation. The same device hides behind several names: RCCB, GFCI, GFI, safety switch. One practical side effect: equipment with a small amount of standing earth leakage, like surge-protected power strips and old fridge compressors, can trip an RCD unpredictably. When an RCD trips for no obvious reason, those are the usual suspects.

## Circuit Breakers: 1P vs. 2P

This distinction matters more than people realize:

- **1P Breaker:** Cuts the circuit, but the appliance stays connected through the neutral wire (N). There's still a path.
- **2P / 1P+N Breaker:** Cuts **both** conductors: phase and neutral. Full isolation. If you're working on something downstream, this is what you want.

![1P vs 2P Breaker](./4.png)

## Trip Characteristics

Breakers protect against overload and short circuits, but not all breakers are the same. The common curve types (**B, C, D, K, Z, MA**) differ in how many times the rated current they'll allow through before tripping on a magnetic fault. Equipment with high inrush (motors, welders, compressors) can nuisance-trip a B-curve breaker that's technically "correctly" sized, which is how people end up doing dumb things to bypass protection.

![Trip Characteristics](./3.png)

# What Can Go Wrong in a Home Workshop

## Cable Sizing

The cross-section of a cable determines how much current that cable can carry safely. Things that eat into your margin:

![Hard vs Stranded Wire](./5.png)
![Wire Comparison](./6.png)

- **Material:** Copper, aluminum, or the awful CCA (Copper Clad Aluminum) that looks like copper but isn't
- **Core type:** Solid wire vs. stranded: they behave differently under load
- **Length:** Longer run = more resistance = more voltage drop under load
- **Ambient temperature:** Heat dissipation drops when the cable's in a hot environment
- **Cable density:** Multiple cables bundled in conduit trap heat against each other
- **Short-circuit current:** The cable has to survive the thermal stress of a fault long enough for the breaker to trip

![Cable Cross-Section Reference](./7.png)

### The Voltage Drop Math

"longer cable = more voltage drop" The wiring guide's version applied to the 10m circuit runs in this workshop at a 16A load:

| 10m run, full loop             | 2.5mm²       | 4mm²         |
| ------------------------------ | ------------ | ------------ |
| R = ρ × l / A                  | 136mΩ        | 85mΩ         |
| drop at 16A                    | 2.2V (0.95%) | 1.4V (0.59%) |
| drop at 30A inrush             | 4.1V         | 2.6V         |
| cable heat at 16A (P = I² × R) | 35W          | 22W          |

The upgrade cut the drop by roughly 38%. At a steady 16A even 2.5mm² stays inside the guide's 2.5% guidance (5.75V at 230V), but motor start currents are exactly the regime where the difference shows up, and every watt of cable heat is a watt not going to the tool.

## Cord Defects

The stuff you can see if you actually look: damaged outer jacket, discoloration from overheating, kinks or pinch points, and insulation that's gone brittle with age. All of these mean the cable can't do its job safely anymore.

## Operating Environment

Damp or wet spaces make everything more dangerous. The checklist for those areas: proper grounding, adequate IP rating, RCD protection, and a close look at contact points for corrosion.

## Overload, Overvoltage and Short Circuits

This is where most of my problems lived:

- **Simultaneous use:** Multiple hungry devices on one 10A/16A group
- **Long-term heavy load:** Cables heating up hour after hour
- **Daisy-chaining:** Power strip into power strip into power strip: each connection adds resistance and heat. This is how fires start.
- **Poor contacts:** Loose plugs and worn sockets mean high resistance junctions
- **Trapped heat:** Cable reels left coiled during use (I've definitely done this)
- **No surge protection:** One voltage spike away from fried electronics

# The Actual Investigation

![Workspace Topology Schema](./8.png)

I spent an afternoon tracing cables and drawing a proper topology map. It was worse than I expected. The core question I kept asking: if something goes wrong, where does the current actually go, and what's in place to stop it?

![Risk Analysis Overview](./9.png)

## What I Found and How I Fixed It

### Welding Machine Grounding

The welder had no ground connection at all. On a metal-chassis machine drawing 16A, that's a genuinely dangerous situation. **Fix:** I ran a dedicated ground connection back to the main grounding bus in the distribution board.

### Inrush Current

The welder pulls 20–30A on startup: more than the existing circuit was designed for. Even if the breaker held (which it sometimes didn't), it wasn't a safe long-term arrangement. **Fix:** Moved the welder to its own dedicated circuit with appropriately rated protection.

### Trip Characteristics

For equipment with high starting currents, a standard B-curve breaker will nuisance-trip. You need a C or D curve: same nominal rating, but the magnetic trip threshold is higher, so it tolerates inrush without sacrificing overload protection.

![Daisy-Chaining Risk](./10.png)

### Eliminating Daisy-Chaining

I had power strips plugged into other power strips. Each junction adds contact resistance, generates heat, and increases the odds of something failing under load. It's a tree topology where every branch is a potential fire. **Fix:** Switched to a star topology: one high-quality 16A power strip as a central distribution point, with everything radiating from it rather than chaining through each other.

The math behind the heat is P = I² × R. The wiring guide's reference values put a good connection (proper lug, tight clamp) at around 0.06mΩ, a 150A fuse at 0.35mΩ and a 500A shunt at 0.10mΩ. A worn or loose contact is a different league: at 0.1Ω of contact resistance a 10A load burns 10W at a single point (10² × 0.1). Heat loosens the contact further, which raises the resistance, which raises the heat. Each power-strip junction was one more chance for that cycle to start.

### Voltage Dips & EMI

The compressor and angle grinder were on the same circuit as my computer and monitors. Every time a motor started, the voltage would sag and the sensitive electronics would see an EMI spike. Over time, that's how you kill power supplies. **Fix:** Physically separated circuits: heavy machinery on one group, sensitive electronics on another.

![Travel Adapter Issues](./11.png)

### Travel Adapters

I had a few travel adapters in the setup: the kind meant for charging a phone in a hotel, useless for workshop equipment. The contact surfaces are tiny, they're not rated for sustained high current, and they get warm in ways that make me nervous. **Fix:** Replaced every single one with proper European Schuko plugs or industrial-grade power strips.

### Zoning & Circuit Distribution

This was the big structural change: dividing the workshop into a "Machining Zone" and an "Office Zone," each on separate circuits. I also upgraded wiring from 2.5mm² to 4mm² (and 6mm² where I could) to reduce voltage drop under load.

![Direct Connection Recommendation](./12.png)

### Direct Connection

Secondary power strips introduce extra junctions, extra resistance, and extra failure points. Critical equipment now plugs directly into wall sockets. No intermediate strips, no adapters, just a clean path from breaker to device.

### Prevention & Warning Labels

This sounds silly but it matters: I put up actual labels. "Do not start more than one heavy machine at once." "Unroll extension cords fully before use." When you're tired and in the middle of a project, visual reminders at the point of use are worth more than a safety manual you'll never re-read.

![Warning Labels](./13.png)
![Safety Signage Detail](./14.png)

# Conclusion

Nine risk factors, some of which had been sitting there for months while I worked around them. The ungrounded welder was the scariest: that one could have actually hurt someone. The daisy-chained power strips were the most likely to cause a real fire.

The core insight was that my setup was never designed: it had just accumulated. Another power strip here, an extension cord there, until the topology was a mess of serial connections where every link was a liability. Moving to a star topology with physically separated circuits means a fault in one zone doesn't cascade into the others.

# Making It Real

![New Work Zone](./16.png)

I actually did the physical work:

- **Office Zone:** Computers, monitors, network gear: all on one dedicated circuit, physically isolated from the noisy stuff. No more screen flicker when a motor starts.
- **Work Zone:** Welder, compressor, grinders, and other industrial tools moved to a separate room on separate circuits. Heavy loads are contained where they belong, and the fire risk from overloaded circuits dropped substantially.

# Reflection

I'll be honest: before this, I knew enough about electrical safety to be dangerous. I understood breakers and grounding in theory, but I'd never actually traced every connection in my own workspace and asked "what happens if this fails?"

Doing that exercise: drawing the topology, walking the circuits, actually checking what was plugged into what: changed my relationship with the space. You develop a healthy paranoia. You start noticing the coiled extension cord, the warm plug, the adapter that's not quite seated right. That awareness doesn't go away, and honestly, it shouldn't.

# References

1. [How does the connection of a meter box to the main fuse work?](https://saelektroexperts.nl/en/meterkast-problemen/hoe-werkt-de-aansluiting-van-een-meterkast-op-de-hoofdzekering/)
2. [Groepenkast overzicht](https://www.drixes-elektricien.nl/groepenkast/overzicht)
3. [Electrical Safety Systems and Devices](https://texasgateway.org/resource/68-electrical-safety-systems-and-devices)
4. [Types of electrical wires and cables](https://www.mall99.co.ke/types-of-electrical-wires-and-cables/)
5. [Cable size types mm AWG BS conversion guide](https://viox.com/cable-size-types-mm-awg-bs-conversion-guide/)
6. [What is the purpose of neutral disconnect in a circuit breaker?](https://electronics.stackexchange.com/questions/688210/what-is-the-purpose-of-neutral-disconnect-in-a-circuit-breaker)
7. [Aderdikte kennisbank](https://www.elektramat.nl/kennisbank/aderdikte/)
8. [Kabeldoorsnede calculator](https://builder-calc.com/nl/elektronica/kabeldoorsnedecalculator-op-basis-van-vermogen-en-stroom-online-berekening.html)
9. [Victron Wiring Unlimited](https://www.victronenergy.com/upload/documents/The_Wiring_Unlimited_book/43562-Wiring_Unlimited-pdf-en.pdf)
