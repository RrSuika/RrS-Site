---
title: "AI-Assisted Personal Website: From One Page to a Complex Database"
spineTitle: "BUILD A PERSONAL WEBSITE"
date: 2026-05-19
dateLabel: "May 19"
description: "Learning to build and deploy a personal website with AI. A record of the iterations, lessons learned, and what AI can do versus what still needs a human."
type: projects
category: "AI Collaboration & Web Design"
cover: cover.webp
tags:
  - AI Collaboration
  - Personal Website
  - Iteration
  - Design Process
  - Beginner Guide
tools:
  - AI Assistant
  - HTML / CSS / JavaScript
  - WebGL / Shader
  - GitHub Pages
gallery:
  - file: "v1-1.webp"
    title: V1 · First-generation website
  - file: "v1-2.webp"
    title: V1 · First-generation website
  - file: "v1-3.webp"
    title: V1 · First-generation website
  - file: "v2.webp"
    title: V2 · Neural network + hacker terminal
  - file: "v3.webp"
    title: V3 · Starfield + black hole (current version)
featured: false
wip: false
lang: en
translationKey: ai-assisted-personal-website
---

# Background

I built this site together with AI, and it never behaved like a one-click website generator. The split was the same every time: I decide why the site exists, who it is for, what matters and what to leave out; AI turns those decisions into drafts, code, alternatives and clearer explanations; I test, look, delete, revise, and carry the result.

The site has gone through three iterations so far: V1 to make it exist, V2 to give it a personality, V3 to give it a world. What follows is the timeline of what I did, what went wrong, where AI helped, and what it still cannot replace.

<div class="project-gallery-slot"></div>

# Timeline overview

| Stage | What I wanted most | Key additions | Biggest takeaway | Biggest problem |
| --- | --- | --- | --- | --- |
| V1 | A site that opens and can be read | Basic personal site: home, about, projects, contact | Ship first, polish later | It looked like a puzzle, and the styles clashed. |
| V2 | A site with a memorable identity | Neural network background + hacker terminal | Style can become part of the content | Effects stole attention, hurt performance and readability |
| V3 | A complete visual world | Starfield + black hole + gravitational lensing | Visuals became storytelling, not decoration | Performance, compatibility, credits, beauty vs. readability |
| Now | A site that is steadier, faster, easier to read | Better content, performance and multilingual support | Still documenting and refining | It is not finished |

# The earliest approach

At the very beginning, we only deployed a single page: one file that held the homepage, bio, portfolio and contact information.

My workflow was crude. I copied thousands of lines of code into AI, asked it to add something, and copied the result back to my computer. Two problems showed up quickly. Every change forced AI to re-read the whole file, which wasted time; and the file kept growing until I could no longer find a specific section inside it.

What I actually wanted was a **multilingual site with a personal database and a portfolio** behind it. So I moved to the current architecture, where content, pages, styles and components are managed separately. Changing text no longer means digging through thousands of lines. Every project gets its own folder for articles, covers, version images and translations. Chinese, English and Dutch share one page structure, and the portfolio can keep growing without turning into chaos: to edit a project, I go to its folder.

The cost is real, and it is worth stating plainly. This architecture is more complex than a single-page file, every new project has to follow the folder structure and the frontmatter format, translations are maintained by hand so a language is easily forgotten, a change to global styles can affect every project, and the learning curve is steeper at the start. For long-term maintenance it is still the better trade, and it is what a personal database plus portfolio actually needs.

# V1: Make it exist

## What I did

- Started from `X:\Github\RrS-Personal-Website`;
- Decided on the basic sections: who I am, what I make, how to contact me;
- Put real content in, no empty shell;
- Made sure it could at least open correctly on a computer.

## Problems

1. **I did not know where to start.** A website looks like one big thing, but it is really content, structure, visuals and deployment.
2. **The page looked like a puzzle.** Each section was fine on its own, but together they did not feel like one website.
3. **Mobile layout broke.** Positions that looked fine on desktop squeezed together on a phone.
4. **I did not understand “going live”.** A file on my computer is not a website; it has to be published online.
5. **Writing content was harder than writing code.** Code can be copied or generated, but only I can answer “who am I”.
6. **V1 was too stylised.** I wanted to put everything in at once, so the page became crowded and tiring to read. Not every good-looking element belongs together.

## What AI did

- Translated “I want a personal website” into a concrete page structure;
- Produced the first page draft;
- Explained domains, hosting, deployment and responsive design;
- Helped make stiff Chinese text sound more natural;
- Explained what each error message meant.

## What I did by hand

- Decided who the site was for and what impression it should leave;
- Provided real experiences, projects, images and contact details;
- Judged whether the page felt right;
- Tested it on a real phone, not only a desktop preview;
- Decided that V1 did not need to be perfect.

## What I learned

> **V1 does not need to be impressive; it needs to exist.**
> Get “opens, readable, contactable” working first, then talk about style.

# V2: Give it a personality

## What I did

- Added a **neural network background** on top of V1;
- Added a **hacker terminal** to create a “system boot” feeling;
- Unified the dark background, typography, colors and motion;
- Made the background move without covering the content.

## Problems

1. **The effects looked cool but used too much performance.** Fans spun up; old phones stuttered.
2. **The background competed with the content.** Readers did not know whether to look at the terminal or the body text.
3. **AI code ran, but I did not understand why.** When it broke, I did not know where to fix it.
4. **Contrast was not enough.** When the background got bright, white text became hard to read.
5. **Screens differed greatly.** The same effect behaved differently on widescreen, laptop and phone.
6. **Neural networks felt cliché.** They suggest technology, but they have been overused and are hard to remember.
7. **The hacker terminal made the page messy.** The terminal, body text and background all competed for attention.

## What AI did

- Offered several visual directions, not a single answer;
- Generated the first version of the animated background and terminal interaction;
- Explained why the background should recede and the text should come forward;
- Proposed lighter alternatives for performance;
- Helped me turn “cool vs. readable” into a list of clear trade-offs.

## What I did by hand

- Decided which effects stayed and which were removed;
- Turned the motion down; better less effect than worse reading;
- Tested on real devices, not only the development computer;
- Checked whether every passage was clear;
- Deleted anything that looked impressive but had no real use.

## What I learned

> **Style is about being memorable without getting in the way.**
> V2’s real progress was that the site began to have a personality.

# V3: Give it a world

## What I did

- Moved the visual theme from “technology” to “cosmos”;
- Added NASA punk, neumorphism and glassmorphism on top of a retro-futuristic base;
- Added a **starfield, a black hole and gravitational lensing** in one sentence: light bends around the black hole, and the stars, black hole and content share one scene and reinforce each other;
- Aimed for a “chimera” that spans time and mixes several technology aesthetics.

## Problems

1. **Performance vs. beauty.** The more realistic the effect, the more computing power it needs; the smoother it is, the less detail it can show.
2. **Parameters are extremely sensitive.** A small change to the black hole’s position, size, brightness or rotation speed turns “impressive” into “strange”.
3. **The black hole steals the show.** Once the background becomes the main character, the body text becomes a supporting actor.
4. **Every screen needs a different composition.** Desktop, phone, portrait and landscape cannot all place the black hole in the same spot.
5. **“Beautiful” and “readable” often fight.** Some frames look great, but text disappears on top of them.
6. **Credits have to be handled properly.** If I reference someone else’s visuals or implementation, I should keep the source, link and attribution.
7. **Resolution changes the composition completely.** 2K and 1080p need different black hole positions and spacing; on mobile, some effects should be hidden or simplified.

## What AI did

- Explained gravitational lensing in simple language;
- Suggested parameter ranges and debugging directions;
- Helped optimize the effect;
- Proposed fallback versions for low-performance devices;
- Helped organize credits and identify what needed attribution;
- Helped translate, organize and polish the text.

## What I did by hand

- Decided where the black hole should sit, how large it should be and how it should feel;
- Made the final trade-off between beauty and readability;
- Checked every reference and kept the author and link;
- Tested on low-end devices, phones and different browsers;
- Left room to slow down or disable animations, respecting the visitor’s device;
- Took responsibility for the truthfulness of the content.

## What I learned

> **Technical effects are the brush; the content is the painting.**
> AI can help me paint a starfield and a black hole, but I must decide why it is there and who it is for.

# Now: Keep iterating

V3 is not the end. At the moment I am making the site stable on more devices; making the body text clearer and giving up less readability for effects; documenting the process so the project also works as a guide; keeping the Chinese, English and Dutch text in step; collecting feedback to see what visitors actually want; and continuing to balance performance against aesthetics and content.

The next goal is easier to state than to hit:

> **Easier to read, easier to use, easier to maintain.**

# Pitfalls

| Pitfall | What happened | Optimisation |
| --- | --- | --- |
| Copy-pasting code | Thousands of lines copied back and forth; slow and increasingly bloated | Separate content, pages, components and languages; deploy an AI agent in local VS Code so AI can edit files directly and free up my hands |
| Adding everything at once | V1 had too many styles; information crowded together and was hard to read | Protect body text first, then decide on effects |
| Outdated or messy style | Neural networks felt cliché; the hacker terminal stole attention | Converge on one starfield theme |
| Beauty over readability | Bright backgrounds made text hard to read | Prioritise contrast, whitespace and content hierarchy |
| AI code that runs but is not understood | When it failed, I did not know where to fix it | Ask AI to explain key logic and keep fallback versions |
| Big differences between screens | 2K, 1080p and mobile are completely different compositions | Adjust each separately; hide expensive effects on mobile |
| Performance vs. effect | More realistic effects need more performance | Make trade-offs and prepare simplified versions for weak devices |

# Website compatibility

Resolution is one of the most underrated problems in this project.

The same black hole may look just right on a 2K screen, too large on a 1080p screen, and on a phone it can cover the text or make the page stutter.

So I adjust the black hole’s size, position and brightness separately for 2K and 1080p, I decide on mobile which effects are worth keeping and which should be hidden or reduced, and I built a debug window so its 2K and 1080p appearance can be tuned by hand. The point is to stop forcing one effect onto every device.

> **Judge the effect on the device, not in the abstract.** A composition that works at 2K is not the composition that works on a phone.

# What AI and humans do

| Area | AI can do | A human must do |
| --- | --- | --- |
| Direction | Offer many options | Choose the final one |
| Content | Outline, expand, rewrite, translate | Provide real experiences, photos and opinions |
| Visuals | Suggest colors, layout and motion | Judge whether it looks good and fits |
| Code | Write a first version, find errors, explain errors | Decide whether to use it and test real devices |
| Copy | Polish, reduce AI tone, unify voice | Check facts and keep a personal voice |
| Performance | Suggest optimisations | Experience the site on old phones and slow networks |
| Copyright | Organize references and attribution formats | Confirm permissions and take responsibility |
| Maintenance | Generate update checklists | Keep updating, replying and making trade-offs |

> **AI accelerates the work; it does not decide anything.**
> It moves faster than I do, but it cannot say what this is, why it exists, or who is responsible for it.

# Beginner guide

1. **Write content first, then design.**  
   A website is the container; content is the water. Decide what to say before deciding how it looks.

2. **V1 only needs to ship, not to impress.**  
   If it opens, can be read and lets people contact you, it is already ahead of many sites that are forever being revised.

3. **Treat AI as an intern, not a boss.**  
   It is good at producing drafts, but you are responsible for judgement, trade-offs and the final result.

4. **When adding effects, consider readability and artistry.**  
   Will it steal the show? Does it match the theme? Does it look good in both dark and light mode? Will the layout break in other languages?

5. **Always test on a real phone and an old device.**  
   Your computer is not your visitor’s device. Opening, readable and smooth matters more than cool.

6. **Reference, do not copy blindly.**  
   If you use someone else’s code, visuals or ideas, keep credit and confirm permission. Public work especially needs care.

7. **Change small details one at a time; back up before big changes.**  
   The biggest risk in iteration is a “big rewrite” after which nobody knows which step broke it.

# Credits / references

The visuals did not appear from nowhere. These sources gave me important references and inspiration:

- **Starfield reference**: [OpenAI GPT-6 Astra page](https://openai.com/index/gpt-6-astra/)
- **Black hole implementation reference**: [Shadertoy (lstSRS)](https://www.shadertoy.com/view/lstSRS)
- **Gravitational lensing reference**: [BH+disk](https://guitrj.github.io/BH+disk/)
- **Cassette shelf reference**: the tape shelf you pick a story from in Zenless Zone Zero’s Agent Story chapters ([official site](https://zenless.hoyoverse.com/en-us/)). The finished visuals have moved a long way from the original; the way the tapes move is what I took from it.
- **Intro sequence reference**: the opening animation on the Arknights: Endfield site ([official site](https://endfield.gryphline.com/en-us/)). The palette, the layout and the readout-style entrance pacing come from there; every element and all of the copy were rewritten.

> Note: these are references for inspiration, visuals and implementation ideas. Different Shadertoy works may use different licences; always check the original author’s notes.

# Inspiration sites

There are many reference sites, and browsing them without a plan quickly becomes overwhelming. I sorted them by purpose.

## Decide on a style first

| Site | What it is in one sentence | What inspiration it gives |
| --- | --- | --- |
| [Land-book](https://land-book.com) | A gallery of well-designed websites | Overall style, color, typography and whitespace |
| [Siteinspire](https://www.siteinspire.com) | A searchable library of web design cases | Specific moods: dark, minimal, technological |
| [Lapa Ninja](https://www.lapa.ninja) | A large collection of landing pages and templates | Many first-screen directions at a glance |
| [One Page Love](https://onepagelove.com) | A showcase dedicated to one-page sites | How to tell a whole story in one page |
| [Awwwards Nominees](https://www.awwwards.com/websites/nominees/) | Nominated work from a global web design award | The latest creativity, interaction and technical boundaries |

## Then look for motion

| Site | What it is in one sentence | What inspiration it gives |
| --- | --- | --- |
| [Motionsites.ai](https://motionsites.ai/) | A library of motion and interactive web inspiration | Scrolling, transitions, mouse interaction |
| [Landing.love](https://www.landing.love/) | High-quality landing page motion examples | Hero sections, button feedback, scroll rhythm |

## Then look for implementation and components

| Site | What it is in one sentence | What inspiration it gives |
| --- | --- | --- |
| [Shadertoy](https://www.shadertoy.com/) | An open community for shaders and real-time effects | Starfields, black holes, glows, fluids |
| [21st.dev Community Components](https://21st.dev/community/components) | A community library of modern UI components | Buttons, cards, navigation, animated components |
| [lieflat-charts](https://github.com/zyhdf5/lieflat-charts) | Open-source icons and charts with a consistent look | A unified icon and graphic style |

## Finally, polish the words

| Site | What it is in one sentence | What inspiration it gives |
| --- | --- | --- |
| [lieflat-less-ai-tone](https://github.com/zyhdf5/lieflat-less-ai-tone) | A tool/project for reducing “AI tone” in writing | Making copy sound more human and natural |

## My order of use

1. **Land-book / Siteinspire first**: decide the overall style;
2. **Motionsites / Landing.love next**: decide the motion rhythm;
3. **Then Shadertoy / 21st.dev**: find concrete effects and components;
4. **Finally use lieflat-less-ai-tone**: remove the AI tone from the copy;
5. **Use Awwwards / One Page Love / Lapa Ninja to fill gaps**: save only 2–3 references at a time; do not browse while building.

> A small reminder: inspiration sites are a menu, not a to-do list.  
> Pick 2–3 references that truly fit; otherwise you will keep looking and never start building.

# What I Learned

This site grew from a simple personal homepage into a neural network and hacker terminal, and then into a starfield, black hole and gravitational lensing.

The visuals are only the visible part. What the process actually taught me is that AI can carry me across the threshold of not knowing how to code, and that once I am across, taste, judgement, content and responsibility are still mine. A website turns out to be an ongoing record of iteration.

AI makes execution cheap, which is exactly what makes judgement valuable.

> **AI makes ideas faster; I make them worth doing.**
