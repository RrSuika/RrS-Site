---
title: "Electronics Fundamentals: Self-Study Notes"
date: 2026-05-14
description: A structured study log covering voltage and current theory, Kirchhoff's laws, and the principles of basic electronic components including resistors, capacitors, diodes, and power supplies.

type: note
category: Electronics
cover: cover.png

tags:
  - Electronics
  - Fundamentals
  - Analog Circuits
  - Components
  - Self-Study

tools:
  - Circuit Analysis
  - Ohm's Law
  - Kirchhoff's Laws
  - Analog Electronics

featured: true

lang: en

translationKey: electronics-fundamentals-notes
---

# Electronics Fundamentals: My Self-Study Notes

These are the notes I've built up while systematically teaching myself hardware and analog electronics. Starting from the absolute basics: what voltage actually is, how current works, what a resistor looks like inside: with the goal of being able to look at a circuit board and understand what every component is doing. I come back to these notes regularly, and each time I find something new.

> **Note:** Images are for educational and self-study purposes only.

## Voltage and Current

## The Water Analogy: A Decent Starting Point

Before diving into physics equations, use water pipes to build intuition:

- **Voltage (V):** equivalent to water pressure: the "push" that drives charges through a circuit, i.e., the potential energy difference
- **Current (I):** equivalent to water flow rate: the actual movement of charges through the conductor
- **Resistance (R):** equivalent to pipe diameter: narrower pipe, more resistance

> **Ohm's Law: V = I × R**

The analogy isn't perfect (none are), but it's good enough for a working mental model.

## Deeper Understanding: What Actually Happens When You Flip a Switch

Flip a switch, the bulb lights instantly. So electrons must race from the battery to the bulb at light speed, right? No. Completely wrong. This was one of the most counterintuitive things I learned.

### "Snail-Pace" Electrons vs "Light-Speed" Energy

Inside copper wire, free electrons fill the entire metal's crystal lattice, forming what's called an **"electron sea"**: they're already everywhere in the wire.

- **Drift velocity**: apply a voltage, the electric field pushes electrons forward. But they constantly crash into the copper atom lattice, so their net forward speed is incredibly slow: typically only **a few micrometers to millimeters per second**. Slower than a snail.

- **So why does the bulb light instantly?** Because energy isn't carried by the electrons themselves: it's carried by the **electromagnetic field**. The moment the switch closes, the electric field propagates along the wire at **nearly the speed of light** (~3 × 10⁸ m/s). The electrons are already everywhere in the wire; the field gives all of them the push (F = qE) simultaneously, and they all start drifting together.

This was a real "aha moment" for me: electrons barely move, but the field travels at light speed. What we call "electricity" is really field propagation.

### The Essence of Voltage: the Electric Field's Invisible Push

In physics, voltage is **electrical potential difference**. A battery uses chemical energy to forcibly separate positive and negative charges, creating an **electric field** in space. As electrons move through this field, the field does work on them. Voltage is that work, per unit charge.

So voltage isn't some mysterious gas pressure: it's the **"invisible push" the electric field exerts on charges, adding up over distance**.

## Kirchhoff's Laws

These two laws aren't just handy circuit analysis tools. Behind them stand two fundamental conservation laws of the universe: **conservation of charge** and **conservation of energy**.

## Kirchhoff's Current Law (KCL)

### Why Electrons Can't Just Pile Up at a Node

- **Formula**: Σ I_in = Σ I_out
- **The physics**: electrons carry negative charge. According to **Coulomb's Law**, like charges repel each other with enormous force. If more electrons flowed into a node than left, negative charge would accumulate there.
- **Self-correcting mechanism**: the instant charge starts building up, the repulsive force pushes away incoming electrons and accelerates outgoing ones. This microscopic self-balancing happens in nanoseconds. Under steady-state conditions, **no node can hold excess net charge**. What goes in comes out: exactly.

## Kirchhoff's Voltage Law (KVL)

### Why a Full Loop Always Sums to Zero

- **Formula**: Σ V = 0
- **The physics**: in electrostatics and low-frequency circuits, the electric field is a **conservative field** (irrotational). The work done by the field force depends only on the start and end points, not the path taken.

- **The energy picture**: think of the power source as a "charge elevator": it consumes chemical energy to lift electrons from low potential to high potential. As electrons flow through resistors, they give up all that potential energy through collisions with the atomic lattice, converting it into **heat** or **light**. By the time an electron returns to the battery's negative terminal, all the energy it gained has been surrendered. Energy can't be created or destroyed: that's KVL at its core.

## Basic Electronic Components

## Resistor

![Carbon Film Resistor Cross-Section](./18.jpg)

Resistors are passive components whose job is to impede current flow. Two main uses: current limiting (so your LED doesn't burn out) and voltage division (creating reference levels).

### Inside a Carbon Film Resistor

1. **Ceramic core**: a solid rod of high-grade ceramic (insulator): the structural foundation.
2. **Carbon film layer**: a thin layer of pure carbon deposited on the ceramic surface. This is the actual resistive material.
3. **Helical groove**: a spiral is laser-cut into the carbon film. Shorter, wider spiral = lower resistance; longer, thinner = higher resistance. The spiral geometry sets the value.
4. **End caps and leads**: metal caps press-fit onto both ends, tinned copper leads welded to the caps.
5. **Protective coating and color bands**: insulating lacquer with colored stripes encoding the resistance value and tolerance.

![Resistor Color Bands](./21.png)

### LED Current Limiting

![Current Limiting: With Resistor vs LED Burnt by Excess Current](./17.png)

Probably the first resistor circuit everyone builds: LED + series resistor. Without the resistor, the LED pulls as much current as the supply can give until it destroys itself.

### Voltage Divider

In a series circuit, voltage drop across each resistor is proportional to its resistance (bigger R = larger share of the voltage).

**Practical calculation: sizing a series resistor for an LED:**
LED operates at 3V, draws 13.5mA (0.0135A), using a 5V supply.

- V_drop = V_source - V_LED = 5V - 3V = 2V
- R = V_drop / I = 2V / 0.0135A = 148.15Ω → **use a 150Ω resistor**

### Can an LED Work as a Resistor?

No. An LED is a diode: it's nonlinear. A resistor follows Ohm's law (current proportional to voltage). An LED's I-V curve is exponential: below the forward voltage it barely conducts; above it, current skyrockets. You can't replace it with a fixed resistance.

### Practical Case: Voltage Comparator

![Voltage Comparator Schematic 1](./23.png)
![Voltage Comparator Schematic 2](./22.png)

### Resistor Types

![Resistor Types Overview](./extra.png)

There's quite a variety: carbon film, metal film, wire-wound, SMD chip resistors, potentiometers (variable resistors). Selection depends on power rating, tolerance, temperature coefficient, and noise requirements. I default to metal film for analog circuits: lower noise than carbon film and better temperature stability.

### Resistor Summary

![Resistor Summary](./20.png)

## Capacitor

![Capacitor Overview 1](./27.png)
![Capacitor Overview 2](./28.png)

Capacitors store energy in an electric field between two conductive plates separated by a dielectric (insulator). Used for filtering, decoupling, timing circuits, and energy storage. Key formula: I = C × dV/dt; current through a capacitor is proportional to the rate of voltage change.

## Inductor

![Inductor Overview](./29.png)

Inductors store energy in a magnetic field when current flows through them. It's a coil of wire, typically wound around a magnetic core. Its defining behavior: it resists changes in current. Key formula: V = L × dI/dt; voltage across an inductor is proportional to the rate of current change.

### Practical Case: Rectifier Bridge LC Filter

![Rectifier Bridge with Inductor 1](./24.png)
![Rectifier Bridge with Inductor 2](./25.png)

In power supply circuits, inductors and capacitors work together as LC filters. After the bridge rectifier converts AC to pulsating DC, the inductor suppresses ripple current and the capacitor smooths the voltage. The resulting DC is much cleaner than filtering with a capacitor alone.

## Diode

![Diode Overview](./30.png)

Diodes only let current flow in one direction: anode to cathode. They're the foundation of rectification (AC→DC), reverse-polarity protection, and all kinds of signal processing. Forward voltage drop: ~0.7V for silicon diodes, ~0.2-0.4V for Schottky diodes.

### Practical Case: Rectifier Bridge

![Rectifier Bridge: Diode Application](./26.png)

Four diodes arranged as a bridge rectifier convert AC to pulsating DC. The capacitor after the bridge smooths it into something usable. This is the front end of basically every linear power supply.

## Transistor

🚧 _Coming soon: transistor content in progress._

## MOSFET

🚧 _Coming soon: MOSFET content to follow._

## Linear vs Switching Power Supplies

![Linear vs Switching PSU Overview](./31.png)

Power supplies convert input power into regulated DC output. Two main topologies:

- **Linear supply**: transformer → rectifier → filter cap → linear regulator. Simple, low noise, but inefficient: excess voltage all becomes heat.
- **Switching supply (SMPS)**: high-frequency switching → transformer → rectification → feedback control. More complex, but far more efficient and much smaller.

### Practical Case: 230V → 12V Switching Power Supply

![SMPS Analysis 1](./32.png)
![SMPS Analysis 2](./33.png)
![SMPS Analysis 3](./34.png)

Walking through an SMPS schematic stage by stage: input filtering, bridge rectifier, switching controller, transformer, output rectification, feedback loop: is a great way to understand real power supply design.

## Practical Skills

![Practical Skills Overview](./35.png)

The hands-on skills I'm building: breadboarding circuits, soldering, using a multimeter correctly, reading schematics, basic troubleshooting. Theory only takes you so far: the moment you find that loose ground connection with a multimeter, a lot of theory suddenly clicks.

## References

1. [LED Resistor Calculator](https://www.budgetronics.eu/nl/led-weerstand-calculator/c-7)
2. [Resistor Heat Calculator](https://a2zcalculators.com/science-and-engineering-calculators/resistor-heat-calculator)
3. [Pull-Up and Pull-Down Resistors](https://www.circuitbasics.com/pull-up-and-pull-down-resistors/)
4. [LM393 Voltage Comparator Datasheet | TI.com](https://www.ti.com/product/LM393#features)
5. [How to Build a Voltage Comparator Circuit Using an LM393](https://www.learningaboutelectronics.com/Articles/LM393-voltage-comparator-circuit.php)
6. [LC Filter Calculator](https://www.omnicalculator.com/physics/lc-filter)
7. [Voltage and Current Explained](https://www.ariat-tech.com/blog/comprehensive-overview-of-voltage-and-current.html)
8. [25 Types of Capacitors & Their Uses](https://www.etechnophiles.com/types-of-capacitors/)
9. [Linear Regulated Power Supply Block Diagram & Circuit Diagram](https://www.hackatronic.com/linear-regulated-power-supply-block-diagram-circuit-diagram/)
10. [How to Build a Linear Power Supply](https://www.circuitbasics.com/linear-power-supplies/)
11. [Power Supply Basics: Part 1](https://mcitransformer.com/power-supply-basics-part-1-unregulated-linear-regulated-linear/)
12. [Isolated vs Non-Isolated Power Supplies](https://resources.altium.com/p/isolated-vs-non-isolated-power-supplies-right-choice-without-fail)
13. [Gallium Nitride Power Devices in Power Electronics](https://www.mdpi.com/1996-1073/16/9/3894)
14. [How Mobile Phone Chargers Work | SMPS](https://www.youtube.com/watch?v=F2dCS5qOE8A)
15. [Modular AC Line EMI Filters Explained](https://passive-components.eu/modular-ac-line-emi-filters-explained/)
16. [Bridge Rectifier With Capacitor Filter](https://www.voltagelab.com/bridge-rectifier-with-capacitor-filter/)
17. [Understanding Carbon Film Resistors](https://www.utmel.com/blog/categories/resistor/understanding-of-carbon-film-resistors)
18. [Resistor Color Codes: Color Band Meanings](https://www.te.com/en/products/passive-components/resistors/intersection/resistor-color-codes.html)
