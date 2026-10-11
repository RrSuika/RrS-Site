---
title: "Electronics Fundamentals: Self-Study Notes"
date: 2026-05-14
description: "Start here if electronics still feels like magic. What voltage and current actually are, why a lamp lights up the instant you flip the switch, and what each part on a circuit board is doing."

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

I wanted to look at a circuit board and say what each part is doing. These are the notes I built up from zero. By the end you should be able to say why an LED needs a resistor in front of it, what a capacitor does that a resistor cannot, and why the current into a point equals the current out.

> **Note:** Images are for educational and self-study purposes only.

## The Water Analogy: A Decent Starting Point

The fastest way to get a feel for the three basic quantities is a water pipe.

- **Voltage (V):** the push, in volts. Like water pressure.
- **Current (I):** how much charge flows past a point per second, in amps. Like litres per second.
- **Resistance (R):** how much something fights the flow, in ohms. Like a narrow pipe.

> **Ohm's Law: V = I × R**

Read it as: same resistance, more voltage means more current. Same voltage, more resistance means less current. The water picture is not perfect, but it is close enough.

## Deeper Understanding: What Actually Happens When You Flip a Switch

Flip a switch and the bulb lights up at once. So the electrons must race from the battery to the bulb at the speed of light, right? They do not. This was the most counterintuitive thing I learned.

### Why the light comes on instantly if the electrons crawl

A copper wire is already full of free electrons. They sit between the metal's atoms, like water in a full pipe.

Apply a voltage and those electrons start to drift, but they keep bumping into the metal's atoms. Their net speed is only tens of micrometres per second, slower than a snail.

So why does the light come on at once? Because the energy does not travel inside the electrons. It travels as an electric field, which spreads through the whole circuit almost immediately, at 60 to 90 percent of light speed. Every electron in the wire is pushed at the same moment.

What we call electricity is mostly the field moving, not the electrons.

### So what is voltage, really?

A battery uses chemical energy to push negative charge to one end and positive charge to the other. That separation sets up an electric field through the circuit. As charge moves through it, the field does work. Voltage is that work divided by the amount of charge.

## Kirchhoff's Laws

These two rules come from two things that cannot be created or destroyed: charge and energy. They are the most useful facts in circuit analysis.

## Kirchhoff's Current Law (KCL)

### Why the current going in equals the current coming out

Take any point where wires meet. The current flowing in must equal the current flowing out. Charge cannot pile up there: if more flowed in than out, negative charge would build up, and charges of the same kind push each other away. That push drives the extra charge straight back out. So the rule holds exactly.

## Kirchhoff's Voltage Law (KVL)

### Why the voltages around a loop cancel out

A battery is like a lift for charge: it spends chemical energy to raise charge to a higher energy level. Flowing through the rest of the circuit, that charge gives the energy away, mostly as heat. By the time it returns to the battery, nothing is left. So the voltage rises and drops around a closed loop cancel out exactly.

## Resistor

![Carbon Film Resistor Cross-Section](./18.jpg)

A resistor is the simplest part in electronics: it makes current harder to push through. Two uses: limiting current so an LED does not burn out, and splitting a voltage into a smaller one.

### What is inside a resistor?

1. **A ceramic rod.** The solid core.
2. **A carbon film.** A thin carbon layer on the rod. This is what resists.
3. **A spiral cut.** A laser cuts a groove into the film. A short, wide path resists less; a long, thin path resists more.
4. **End caps and legs.** Metal caps on both ends, with wire legs welded to them.
5. **Paint and stripes.** Insulating paint, plus coloured stripes that code the value.

The value depends on the material and the shape: a long thin path resists more than a short wide one. The film material also decides how much the value drifts when it warms up, and how much electrical noise the resistor adds.

![Resistor Color Bands](./21.png)

### Why does an LED need a resistor?

![Current Limiting: With Resistor vs LED Burnt by Excess Current](./17.png)

An LED is a lamp made from a semiconductor. Left on its own it pulls as much current as the supply can give, until it destroys itself. A resistor in series sets the current to a safe value.

**Picking the resistor for one LED:**
Say the LED wants 3V and 13.5mA (thousandths of an amp), and you feed it from 5V.

- The resistor has to take the difference: 5V - 3V = 2V.
- Resistance is volts divided by amps: 2V ÷ 0.0135A = 148Ω. Use the nearest standard value, 150Ω.

One more check: the resistor turns that 2V into heat. That is about 27mW, and an ordinary ¼W resistor handles ten times that.

### How do two resistors make a smaller voltage?

Put two resistors in a row and the voltage splits between them. The bigger resistor takes the bigger share. That is how you make a smaller voltage out of a bigger one.

### Can an LED Work as a Resistor?

No. A resistor follows a simple rule: double the voltage, double the current. An LED does not. Below a certain voltage it conducts almost nothing, and just above it the current shoots up. That is why you cannot treat one as the other.

### How do you tell which of two voltages is bigger?

![Voltage Comparator Schematic 1](./23.png)
![Voltage Comparator Schematic 2](./22.png)

### Which resistor should I buy?

![Resistor Types Overview](./extra.png)

There are several kinds: carbon film, metal film, wire-wound for high power, and tiny surface-mount chips for factory boards. Four things matter: how much power it can burn, how close its real value is to the printed one, how much it drifts when it warms up, and how much noise it adds. For analog circuits I default to metal film.

### What to remember about resistors

![Resistor Summary](./20.png)

## Capacitor

![Capacitor Overview 1](./27.png)
![Capacitor Overview 2](./28.png)

A capacitor stores energy in the electric field between two plates. Think of it as a buffer: it fills when there is spare voltage and empties when the voltage sags. Current only flows while the voltage across it changes, so it passes fast changes and blocks steady ones. That is why it smooths supplies and sets timing intervals.

## Inductor

![Inductor Overview](./29.png)

An inductor is a coil of wire. It stores energy in a magnetic field and fights any change in current. Its rule mirrors the capacitor: the voltage across it depends on how fast the current through it changes. Coils and capacitors are the two halves of most filters.

### How do a coil and a capacitor smooth a supply?

![Rectifier Bridge with Inductor 1](./24.png)
![Rectifier Bridge with Inductor 2](./25.png)

In a power supply they work as a team. The bridge rectifier turns AC (current that keeps reversing) into DC (current that flows one way), but the result is bumpy. The coil flattens the bumps in the current, and the capacitor flattens the bumps in the voltage.

The same happens at battery scale. An inverter pulls current from a battery in pulses, 100 times a second. In the cable, those pulses become a wobbling voltage, because the cable resists the current. Short, thick cable keeps the wobble small. Victron sets the alarm at 2.25V RMS on a 24V system, and RMS is a kind of average for a wobbling voltage.

## Diode

![Diode Overview](./30.png)

A diode is a one-way valve for current. It conducts from one leg, the anode, to the other, the cathode, and blocks the reverse direction. A silicon diode costs about 0.7V to pass; a Schottky diode, built for a smaller drop, costs 0.2 to 0.4V. Diodes turn AC into DC and protect against a battery connected the wrong way round.

### How four diodes turn AC into DC

![Rectifier Bridge: Diode Application](./26.png)

Wire four diodes in a ring and you get a bridge rectifier. Whichever way the AC swings, two conduct, so the current leaves in the same direction every time. A capacitor after it smooths the bumps. Almost every linear supply starts this way.

## Transistor

🚧 _Coming soon: transistor content in progress._

## MOSFET

🚧 _Coming soon: MOSFET content to follow._

## Linear vs Switching Power Supplies

![Linear vs Switching PSU Overview](./31.png)

A power supply turns what comes from the wall or the battery into the steady low voltage your circuit needs. There are two ways.

- **Linear supply**: a transformer lowers the voltage, then a chip burns off the rest as heat. Simple and quiet, but wasteful.
- **Switching supply (SMPS)**: the voltage is chopped into high-frequency pulses, transformed, then smoothed. More parts, but far less heat and much smaller.

### What is inside a 230V to 12V supply?

![SMPS Analysis 1](./32.png)
![SMPS Analysis 2](./33.png)
![SMPS Analysis 3](./34.png)

Walking through a real schematic stage by stage is the fastest way to see how the pieces fit: the mains filter, the bridge rectifier, the switching chip, the transformer, the output rectifier, and the feedback loop that keeps the output steady.

## Practical Skills

![Practical Skills Overview](./35.png)

The skills that matter are physical: building a circuit on a breadboard, soldering, using a multimeter, reading a schematic, and hunting down a fault. Theory only gets you so far. The day I found a loose ground wire with a multimeter, a lot of theory suddenly clicked.

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
19. [Victron Wiring Unlimited](https://www.victronenergy.com/upload/documents/The_Wiring_Unlimited_book/43562-Wiring_Unlimited-pdf-en.pdf)
