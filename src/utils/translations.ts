import type { Language } from "./i18n";

export const translations = {
  en: {
    meta: {
      description:
        "RrSuika Studio, the portfolio of a multidisciplinary maker: industrial design, embedded systems, electronics notes and visual art.",
    },

    lensTune: {
      title: "GRAVITATIONAL LENS // TUNE",
      groups: {
        position: "POSITION",
        disk: "DISK",
        motion: "MOTION",
        lensing: "LENSING",
        field: "FIELD",
      },
      keysDual: "←→ first axis · ↑↓ second axis",
      keysSingle: "←→ / ↑↓ value",
      footer:
        "drag header to move · TAB next · H rings · COPY / C copy · R reset · ESC close",
      inactive: "LENS INACTIVE — desktop (≥769px) + dark mode required",
      copy: "COPY ⧉",
      copied: "COPIED ✓ paste it to the AI / global.css §10",
      copyBlocked: "COPY BLOCKED — snippet is in the console",
      reset: "RESET TO CSS DEFAULTS",
      keyPrefix: "KEY",
      escClose: "ESC close",
      debug: {
        outerEdge: "OUTER EDGE",
        outerMid: "OUTER / MIDDLE",
        midInner: "MIDDLE / INNER",
        ring: "BLACK-HOLE RING",
        diskInner: "DISK INNER",
        diskOuter: "DISK OUTER",
        photonBand: "PHOTON BAND",
      },
      off: "off",
      labels: {
        cx: "LENS CENTRE · X / Y",
        rOuter: "OUTER LAYER · R",
        rMid: "MIDDLE LAYER · R",
        rInner: "INNER LAYER · R",
        rRing: "BLACK-HOLE RING · R",
        diskMove: "DISK · MOVE X/Y",
        diskInner: "DISK · INNER W/H",
        diskOuter: "DISK · OUTER W/H",
        diskTilt: "DISK · TILT",
        diskFeather: "DISK · FEATHER",
        speedOuter: "OUTER SPEED",
        speedMid: "MIDDLE SPEED",
        innerEase: "INNER SLOWDOWN",
        swirl: "CLOCKWISE SWIRL",
        bulge: "LENS BULGE",
        stretch: "LENS STRETCH",
        density: "FIELD DENSITY",
        gapBoost: "RING GAP BOOST",
        photonBand: "PHOTON BAND W/SIZE",
        cyPx: "LENS CENTRE · Y OFFSET px",
      },
      desc: {
        cx: "Lens / black-hole centre. ←→ horizontal, ↑↓ vertical. Every layer and the disk are centred on it — line the crosshair up with the video's black hole first.",
        rOuter: "Outer starfield edge; stars fade in here. ←→ / ↑↓ change the radius — bigger = a wider field.",
        rMid: "Outer / middle boundary. ←→ / ↑↓ change the radius — larger = thinner middle layer, wider outer field.",
        rInner: "Middle / inner boundary, where the inward slowdown starts. ←→ / ↑↓ change the radius.",
        rRing: "Black-hole ring radius; nothing is drawn inside it (pure black). Align it to the video's black-hole edge first.",
        diskMove: "Move the whole accretion-disk ellipse relative to the black hole. ←→ left/right, ↑↓ up/down.",
        diskInner: "Disk inner edge: ←→ horizontal half-width, ↑↓ vertical half-height (independent of the outer edge). Stars inside the disk are hidden.",
        diskOuter: "Disk outer edge: ←→ horizontal half-width, ↑↓ vertical half-height. Stars fade out at this edge.",
        diskTilt: "Ellipse rotation in degrees. Negative = right side up (the video is about -15°). ←→ / ↑↓ both adjust it.",
        diskFeather: "Width of the fade in/out band at the disk edges. ←→ / ↑↓ both adjust it; 0 = hard cut.",
        speedOuter: "Outer-layer inward speed (viewport heights / second). Lower = slower.",
        speedMid: "Middle-layer inward speed; higher = faster.",
        innerEase: "Inner slowdown exponent. Higher = it only slows right next to the ring.",
        swirl: "Clockwise spiral speed at the ring (∝ rRing/r). 0 = no swirl; negative reverses it.",
        bulge: "How far stars are pushed outward near the ring (Einstein-ring bulge).",
        stretch: "Tangential stretch near the ring (1 = no distortion). Stars in the photon band stay circular.",
        density: "Star-count multiplier. Lower it if the frame rate drops.",
        gapBoost: "Brightness multiplier for the small stars in the circular band just outside the black-hole ring.",
        photonBand: "Circular band of small stars just outside the black-hole ring: ←→ band width, ↑↓ star-size multiplier (smaller = denser/finer).",
        cyPx: "Absolute pixel offset of the centre's Y (paired with cy-vh). Rarely needed.",
      },
    },


    nav: {
      home: "HOME",
      projects: "PROJECTS",
      lab: "LAB",
      art: "ART",
      notes: "NOTES",
      about: "ABOUT",
    },

    common: {
      year: "Year",
      type: "Type",
      category: "Category",
      tools: "Tools",
      contents: "Contents",
      code: {
        copy: "Copy code",
        copied: "Copied",
        expand: "Show code",
        collapse: "Hide code",
        lines: "lines",
      },
    },

    language: {
      code: "TRANSLATION // UNAVAILABLE",
      unavailable: "No Chinese version available",
      description: "This project is currently only available in English",
    },

    card: {
      projectNode: "PRJ_NODE //",
      online: "● ONLINE",
      wip: "◐ WIP",
      team: "/TEAMWORK/",
      imageStream: "IMAGE_STREAM // ACTIVE",
      category: "CATEGORY:",
      archive: "ARCHIVE:",
    },

    detail: {
      wip: "DESIGN FINALIZED — PROCUREMENT & BUILD PENDING",
    },

    hero: {
      title: {
        line1: "FUNCTIONAL",
        line2: "AESTHETICS",
      },
      cassette: "[ DESIGN_DATABASE // LOADED ]",
      description: {
        line1:
          "Bridge the gap between TECH and AESTHETICS",
        line2: "Pairing artistic intuition with a research-driven mindset",
      },
      button: "ACCESS PROJECT DATABASE",
    },

    featured: {
      tag: "PROJECT_DATABASE // FEATURED_ARCHIVE",
      title: "Selected Projects",
      description: "> ACCESSING_DESIGN_AND_ENGINEERING_RECORDS...",
      total: "TOTAL_FILES:",
      active: "ACTIVE",
    },

    explore: {
      projects: {
        header: "MODULE_01 // WORKS",
        title: "PROJECTS",
        description: "WORKSPACE/DESIGN",
        access: "ACCESS_DATABASE >",
      },
      lab: {
        header: "MODULE_02 // EXPERIMENTS",
        title: "LAB",
        description: "TESTS/PROTOTYPING",
        access: "OPEN_MODULE >",
      },
      art: {
        header: "MODULE_03 // VISUAL",
        title: "ART",
        description: "VISUAL_ARTWORKS",
        access: "OPEN_ARCHIVE >",
      },
      notes: {
        header: "MODULE_04 // KNOWLEDGE",
        title: "NOTES",
        description: "STUDY_NOTES",
        access: "LOAD_DOCUMENTS >",
      },
    },

    latest: {
      header: "SYS.LOG // RECENT_ACTIVITY_STREAM",
      type: "TYPE:",
      updated: "UPDATED",
    },

    aboutPreview: {
      header: "PERSONNEL_DOSSIER // PROFILE_MODULE",
      operator: "OPERATOR",
      status: "● ACTIVE DESIGNER // MAKER",
      location: "LOCATION: ROTTERDAM // NL",
      field: "FIELD: DESIGN + TECHNOLOGY",
      access: "ACCESS FULL DOSSIER >",
    },

    footer: {
      system: "FOOTER_NODE // TERMINATION_SEQUENCE",
      status: "SYS_STATUS:",
      online: "ONLINE",
      identity:
        "Industrial Design × Embedded Systems × Creative Making",
      location: "LOCATION:",
      statusLabel: "STATUS:",
      operational: "OPERATIONAL",
      version: "VERSION:",
      uplink: "DATA_UPLINK",
      github: "GitHub",
      email: "Email",
      pixiv: "Pixiv",
      about: "About",
      copyright: "ALL CORE DATA PACKETS INTEGRATED",
    },

    sections: {
      lab: {
        title: "Lab",
        description: "Experiments, electronics and prototypes.",
      },
      projects: {
        title: "Projects",
        description: "Industrial design and product development.",
      },
      art: {
        title: "Art",
        description: "Illustration, visual experiments and artwork.",
      },
      notes: {
        title: "Notes",
        description: "Research, learning and technical notes.",
      },
      about: {
        pageTag: "PERSONNEL_DOSSIER // PROFILE_MODULE",
        pageStatus: "● SYSTEM_ACTIVE",
        eyebrow: "RrSuika STUDIO // DESIGNER + MAKER + ARTIST",
        title: "About ME",
        introTitle: "BETWEEN\nMAKING\nDESIGN\nART",
        subtitle: "Industrial designer & maker based in Rotterdam, bridging technical thinking with visual creativity.",
        description:
          "I am an industrial product designer and digital artist with a strong interest in making things real.",
        introText:
          "My work sits somewhere between design, engineering and visual art. I enjoy taking an idea from a sketch or concept, researching references, developing the form, building a prototype and eventually turning it into something physical and functional.",
        identity: {
          title: "DESIGNER // MAKER // ARTIST",
          text:
            "I'm most comfortable somewhere between a designer and a maker: I care deeply about aesthetics, but I also want to understand how things work, how they're made and how different technologies can be combined into a complete object.",
          second:
            "Industrial design is my main professional direction, while illustration and visual work remain an important part of who I am.",
        },
        dossier: {
          header: "PERSONNEL_DOSSIER // ABOUT_MODULE",
          operator: "OPERATOR",
          role: "INDUSTRIAL + PRODUCT DESIGNER",
          status: "● ACTIVE DESIGNER // MAKER",
          locationLabel: "LOCATION",
          location: "ROTTERDAM // NL",
          fieldLabel: "FIELD",
          field: "AESTHETICS + DESIGN + TECHNOLOGY",
          focusLabel: "CURRENT_FOCUS",
          focus:
            "Industrial design, embedded systems, electronics, prototyping, visual communication and experimental making",
          skillsLabel: "SKILLS",
          skills: [
            "3D Modeling & Printing",
            "Prototyping & Testing",
            "Sketching & Drawing",
            "Industrial / Product Design",
            "CMF Design",
            "Electronics & Embedded Systems",
            "Illustration & Visual Design",
            "AI-Assisted Workflow",
          ],
          interestsLabel: "INTERESTS",
          interests: [
            "Hiking",
            "Cycling",
            "Reading",
            "Drawing",
            "Electronics Engineering",
            "Fabrication",
          ],
          softwareLabel: "SOFTWARE",
        },
        philosophy: {
          header: "PERSONAL_PROTOCOL // DESIGN_PHILOSOPHY",
          title: "STANDING\nON THE\nSHOULDERS\nOF GIANTS",
          text:
            "Design is never created in isolation. I believe in learning from what already exists, studying references, understanding the work of others and combining those accumulated ideas into something new.",
          second:
            "I enjoy the process of connecting knowledge from different fields and using it to create things that I could not have made from a single discipline alone.",
          mottoLabel: "PERSONAL_MOTTO",
          motto: "FAKE IT TILL YOU MAKE IT.",
          mottoText:
            "Being willing to step into unfamiliar territory, learn what's needed and keep building until the idea becomes real.",
        },
        approach: {
          description: "",
          research: {
            title: "RESEARCH",
            description:
              "Study references, materials, mechanisms and existing solutions before deciding how something should be made.",
          },
          concept: {
            title: "CONCEPT",
            description:
              "Use sketches, illustration, visual references and concept design to explore what an object could become.",
          },
          build: {
            title: "BUILD",
            description:
              "Turn ideas into CAD models, electronics, 3D-printed parts and physical prototypes as early as possible.",
          },
          refine: {
            title: "REFINE",
            description:
              "Test, modify and iterate until aesthetics, function, usability and manufacturability begin to work together.",
          },
        },
        workflow: {
          header: "CREATIVE_PIPELINE // IDEA_TO_OBJECT",
          concept: {
            title: "01 // CONCEPT",
            description:
              "Idea generation, sketching, illustration and visual exploration.",
          },
          design: {
            title: "02 // DESIGN",
            description:
              "Form development, CAD modelling, CMF thinking and technical research.",
          },
          prototype: {
            title: "03 // PROTOTYPE",
            description:
              "3D printing, fabrication, electronics and physical experimentation.",
          },
          system: {
            title: "04 // SYSTEM",
            description:
              "Combine hardware, software and mechanical components into something functional.",
          },
          iteration: {
            title: "05 // ITERATE",
            description:
              "Test the result, identify problems and continue improving the object.",
          },
        },
        capabilities: {
          header: "RrSuika_CAPABILITY_MATRIX",
          industrial: {
            title: "Industrial\nProduct Design",
            description:
              "Product development, form exploration, CAD modelling, material research, CMF and physical prototyping.",
          },
          mechanical: {
            title: "CMF Design",
            description:
              "Color, material and finish, covering glossy, matte, metallic, plastic, leather, textured and other common surface treatments.",
          },
          electronics: {
            title: "Electronics",
            description:
              "Electrical fundamentals, electronics, Arduino, ESP32 and the integration of electronic components into physical products.",
          },
          embedded: {
            title: "Embedded Systems",
            description:
              "Exploring microcontrollers, sensors, actuators and software-driven physical interaction, with AI-assisted development as part of the workflow.",
          },
          fabrication: {
            title: "Fabrication",
            description:
              "FDM 3D printing, material testing, laser cutting, basic welding and hands-on fabrication.",
          },
          visual: {
            title: "Illustration\nVisual Design",
            description:
              "Digital illustration, concept art, poster design, visual communication and aesthetic development.",
          },
          software: {
            title: "Digital Tools",
            description:
              "SolidWorks, KeyShot, Photoshop and Clip Studio Paint, with previous experience in Blender.",
          },
          teaching: {
            title: "Teaching Art",
            description:
              "I sometimes teach beginners how to draw. Teaching helps me organise what I know into clearer systems, while revisiting and strengthening my own understanding.",
          },
        },
        journey: {
          header: "PROCESS_LOG // DEVELOPMENT_PATH",
          title:
            "TO THE GALAXY AND\u00A0BEYOND",
          nodes: {
            hardware: "START",
            design: "INTERSECTION",
            maker: "PRACTICE",
            technology: "NEXT STAGE",
          },
          text:
            "My path did not begin with industrial design. I initially explored hardware engineering, but eventually realised that I wanted a field where technical thinking and visual creativity could coexist.",
          second:
            "Industrial and product design became a natural middle ground: a discipline where form, function, materials, manufacturing and visual communication are all part of the same process.",
          third:
            "Today, I am gradually moving toward the technical side again. Electronics, embedded systems, mechanical properties, material testing and fabrication have become increasingly important parts of my learning and personal projects.",
          fourth:
            "I'd rather understand how different technologies fit together and how they can become part of a complete, usable product than memorise every component parameter.",
        },
        current: {
          header: "CURRENT_RESEARCH // 2026",
          modules: {
            design: {
              title: "COMPOSITION / GRAPHIC DESIGN / AESTHETICS",
            },
            technology: {
              title: "ELECTRONICS / EMBEDDED SYSTEMS / ELECTRICAL",
            },
            making: {
              title: "3D PRINTING / FABRICATION",
            },
            visual: {
              title: "ILLUSTRATION / CONCEPT DESIGN",
            },
            ai: {
              title: "AI-ASSISTED WORKFLOW",
            },
          },
          design:
            "Composition, graphic design, aesthetics and visual systems.",
          technology:
            "Electronics, embedded systems, Arduino, ESP32 and electrical fundamentals.",
          making:
            "3D printing, materials, fabrication and physical prototyping.",
          visual:
            "Illustration, character drawing, concept design and visual communication.",
          ai:
            "AI-assisted coding and technical workflows, using AI as an implementation tool while keeping human judgement, taste and direction at the centre.",
        },
        future: {
          header: "NEXT_ITERATION // FUTURE_DIRECTION",
          text:
            "I want industrial design to remain my main professional direction while continuing to develop as a maker and illustrator.",
          second:
            "In the long term, I want to become increasingly capable of taking an idea all the way from concept and visual development to electronics, software, mechanical structure, sourcing and a finished physical prototype.",
          third:
            "At the same time, I want to keep drawing and visual work as a second identity rather than let technical work replace it.",
        },
        closing:
          "The goal is simple: take ideas seriously enough to build them, and stay curious enough to keep making new ones...",
        annex: {
          header: "STYLE_GENEALOGY // DESIGN_ORIGINS_RECORD",
          status: "RECORD_STATUS: UNCLASSIFIED // SHARED_FOR_CURIOSITY",
          intro:
            "I loveeeees retro-futurism!! When everything around us gets flattened into minimalism and cold, clinical design, people get quantified and products lose their emotion and personality. Just like people who love Y2K or get drawn into the Backrooms; I'm curious about how style evolved from the Cold War era through the end of the last century. It's a traceable, constantly-mutating aesthetic that keeps reshaping itself with the society and culture around it. That's what fascinates me.",
          styleIndex: "// STYLE_INDEX // THE MAIN DIALECTS THIS SITE SPEAKS",
          styles: [
            {
              code: "STYLE_01 // BAUHAUS_&_DE_STIJL",
              era: "1919–1933",
              body:
                "Primary-color triad as design grammar: the overlapping red/yellow/blue dots in the navbar, the tri-color bars beside the headline. Geometry as a moral framework.",
              refs: "Bauhaus Dessau · Mondrian compositions · Moholy-Nagy typography",
            },
            {
              code: "STYLE_02 // SWISS_INTERNATIONAL",
              era: "1950s–60s",
              body:
                "Systematic grids, numbered modules, uppercase micro-labels. Copy written like instrument markings: MODULE_01, ENTRY_001, DATA_UPLINK.",
              refs: "Josef Müller-Brockmann, Grid Systems in Graphic Design",
            },
            {
              code: "STYLE_03 // CASSETTE_FUTURISM",
              era: "1970s–80s",
              body:
                "Green phosphor, scanlines, magnetic tape, barcodes, boot terminals. The CRT is the site's true material: every screen here is a warmed-up monitor.",
              refs: "Alien (1979) · 2001: A Space Odyssey · Soviet Soyuz panels",
            },
            {
              code: "STYLE_04 // NASA_PUNK",
              era: "1960s",
              body:
                "Mission-control telemetry: lat/lon coordinates, LED segment meters, hex grid, particle networks. The page reads itself like an instrument panel.",
              refs: "Apollo Mission Control · AGC readouts · Arknights: Lone Trail UI",
            },
            {
              code: "STYLE_05 // CYBERPUNK_TERMINAL",
              era: "1980s–90s",
              body:
                "Dark screen + green system logs, the hacker-terminal mood. The accidental fifth dialect: it arrived with the dark theme and never left.",
              refs: "Blade Runner · The Matrix",
            },
            {
              code: "STYLE_06 // NEUMORPHIC_GLASS",
              era: "2020s–now",
              body:
                "Frosted-glass cards floating over paper, neumorphic buttons pressed out of the background with soft double shadows and inner highlights. This site's light mode: the project cards blur what's behind them, the ACCESS button is moulded from the paper itself.",
              refs: "Apple visionOS glass · Windows Fluent/Acrylic · Figma neumorphism wave",
            },
          ],
          worksIndex: "// WORKS_INDEX // VISUAL WORKS ON THE SAME FREQUENCY",
          works: [
            {
              title: "Arknights: Lone Trail",
              note: "cold research stations and launch bases, instrument-panel storytelling",
            },
            {
              title: "Reverse: 1999",
              note: "retro-futurism tangled with the occult",
            },
            {
              title: "Atomic Heart",
              note: "Soviet futurism and machine aesthetics in first person",
            },
            {
              title: "Fallout series",
              note: "the atom-punk benchmark: CRT terminals and wasteland optimism",
            },
            {
              title: "Alien (1979) · 2001: A Space Odyssey",
              note: "the cinematic source code of cassette futurism",
            },
            {
              title: "Blade Runner · The Matrix",
              note: "where dark screens and green logs became pop culture",
            },
          ],
        },
      },
    },

    system: {
      status: "SYS_STATUS:",
      online: "ONLINE",
    },

    skillMap: {
      hubs: [
        { name: "INDUSTRIAL DESIGN", skills: ["RESEARCH", "SKETCHING", "3D MODELING", "PROTOTYPING", "SOURCING", "CMF"] },
        { name: "AESTHETICS", skills: [] },
        { name: "CAD & MODELLING", skills: ["SOLIDWORKS", "BLENDER"] },
        { name: "3D PRINTING", skills: ["FDM", "SLA", "PLA", "PETG", "ABS", "ASA", "TPU", "RESIN"] },
        { name: "SOLDERING & WELDING", skills: ["THROUGH-HOLE", "SMD", "MIG"] },
        { name: "RENDERING", skills: ["KEYSHOT"] },
        { name: "DIGITAL DRAWING", skills: ["CONCEPT ART", "ILLUSTRATION", "TEACHING ART"] },
        { name: "IMAGE EDITING", skills: ["PHOTOSHOP", "CLIP STUDIO", "DAVINCI RESOLVE"] },
        { name: "GRAPHIC DESIGN", skills: ["POSTERS", "VISUAL ART", "ART TRENDS"] },
        { name: "EMBEDDED SYSTEMS", skills: ["ESP32", "ARDUINO", "SENSORS"] },
        { name: "ELECTRICAL SYSTEMS", skills: ["BASIC CIRCUITS", "ELECTRICAL THEORY", "LED SYSTEMS"] },
      ],
    },
  },

  zh: {
    meta: {
      description:
        "RrSuika Studio，多学科创客作品集：工业设计、嵌入式系统、电子学笔记与视觉艺术。",
    },

    lensTune: {
      title: "引力透镜 // 调参",
      groups: {
        position: "位置",
        disk: "吸积盘",
        motion: "运动",
        lensing: "透镜",
        field: "密度",
      },
      keysDual: "←→ 第一轴 · ↑↓ 第二轴",
      keysSingle: "←→ / ↑↓ 调值",
      footer:
        "拖标题栏移动 · TAB 下一个 · H 参考圈 · COPY / C 复制 · R 复位 · ESC 关闭",
      inactive: "透镜未启用 —— 需要桌面端（≥769px）+ 暗色模式",
      copy: "复制 ⧉",
      copied: "已复制 ✓ 粘贴给 AI / global.css §10",
      copyBlocked: "复制被拦截 —— 片段已打印到控制台",
      reset: "已恢复 CSS 默认值",
      keyPrefix: "键",
      escClose: "ESC 关闭",
      debug: {
        outerEdge: "外层边缘",
        outerMid: "外层 / 中层",
        midInner: "中层 / 内层",
        ring: "黑洞外圈",
        diskInner: "盘内边界",
        diskOuter: "盘外边界",
        photonBand: "光子带",
      },
      off: "屏幕外",
      labels: {
        cx: "中心 · X / Y",
        rOuter: "外层 · 半径",
        rMid: "中层 · 半径",
        rInner: "内层 · 半径",
        rRing: "黑洞外圈 · 半径",
        diskMove: "吸积盘 · 移动 X/Y",
        diskInner: "吸积盘 · 内边界 宽/高",
        diskOuter: "吸积盘 · 外边界 宽/高",
        diskTilt: "吸积盘 · 倾角",
        diskFeather: "吸积盘 · 羽化",
        speedOuter: "外层速度",
        speedMid: "中层速度",
        innerEase: "内层减速",
        swirl: "顺时针旋进",
        bulge: "透镜 · 外推",
        stretch: "透镜 · 切向拉伸",
        density: "星空密度",
        gapBoost: "圈间亮度",
        photonBand: "光子带 宽/大小",
        cyPx: "中心 · Y 像素偏移",
      },
      desc: {
        cx: "透镜 / 黑洞中心。←→ 水平、↑↓ 垂直。所有分层与吸积盘都以它为圆心 —— 先把十字准星对准视频里黑洞的中心。",
        rOuter: "外层星空的外边界，星星从这里淡入。←→ / ↑↓ 都改半径；越大，外场越辽阔。",
        rMid: "外层与中层的分界。←→ / ↑↓ 都改半径；调大 = 中层变窄、外场变大。",
        rInner: "中层与内层的分界，也是“越靠近越慢”的减速区起点。←→ / ↑↓ 都改半径。",
        rRing: "黑洞外圈半径，圈内完全不画星星（纯黑）。←→ / ↑↓ 都改半径 —— 先把它对齐视频里黑洞的边缘。",
        diskMove: "吸积盘椭圆环整体平移（相对黑洞中心）。←→ 左右、↑↓ 上下。",
        diskInner: "吸积盘内边界：←→ 横向半轴、↑↓ 纵向半轴（与内/外边界各自独立）。盘内的星星被遮住。",
        diskOuter: "吸积盘外边界：←→ 横向半轴、↑↓ 纵向半轴（与内边界独立）。星星到这里按羽化带宽淡出。",
        diskTilt: "椭圆倾角（度）。负值 = 右高左低（视频里约 -15°）。←→ / ↑↓ 都调它。",
        diskFeather: "吸积盘边缘淡出 / 淡入的过渡带宽。←→ / ↑↓ 都调它；0 = 硬切。",
        speedOuter: "外层内流速度（视口高 / 秒）。越小越“非常缓慢”。←→ / ↑↓ 都调它。",
        speedMid: "中层内流速度，越大越快。←→ / ↑↓ 都调它。",
        innerEase: "内层减速曲线指数。越大 = 越靠近黑洞圈才骤然变慢。",
        swirl: "顺时针旋进角速度（黑洞圈处，∝ rRing/r）。0 = 不旋，负值反向。",
        bulge: "靠近黑洞圈时把星星向外推的幅度（爱因斯坦环的凸起）。",
        stretch: "靠近黑洞圈时沿切向拉长成弧的倍数。1 = 不变形。光子带内的星星保持圆形。",
        density: "星星数量倍率。掉帧就调小。",
        gapBoost: "黑洞圈外那圈小星星的亮度倍率（越大越亮）。",
        photonBand: "黑洞圈外的圆形小星星带：←→ 带宽、↑↓ 星星大小倍率（越小越细密）。",
        cyPx: "中心 Y 的绝对像素偏移（配合 cy-vh），一般不用动。",
      },
    },


    nav: {
      home: "首页",
      projects: "项目",
      lab: "实验室",
      art: "艺术",
      notes: "笔记",
      about: "关于",
    },

    common: {
      year: "年份",
      type: "类型",
      category: "分类",
      tools: "工具",
      contents: "目录",
      code: {
        copy: "复制代码",
        copied: "已复制",
        expand: "展开代码",
        collapse: "收起代码",
        lines: "行",
      },
    },

    language: {
      code: "TRANSLATION // UNAVAILABLE",
      unavailable: "暂无英文版本",
      description: "当前项目仅提供中文版本",
    },

    card: {
      projectNode: "项目节点 //",
      online: "● 在线",
      wip: "◐ 进行中",
      team: "/协作/",
      imageStream: "图像流 // ACTIVE",
      category: "分类:",
      archive: "档案:",
    },

    detail: {
      wip: "设计已定稿 —— 采购与搭建进行中",
    },

    hero: {
      title: {
        line1: "FUNCTIONAL",
        line2: "AESTHETICS",
      },
      cassette: "[ 设计数据库 // 已加载 ]",
      description: {
        line1:
          "结合主观审美和系统化思维，在技术与美学之间建立连接",
        line2:
          "视觉上的优雅，建立在严谨的技术与可落地的执行之上",
      },
      button: "访问项目数据库",
    },

    featured: {
      tag: "项目数据库 // 精选档案",
      title: "精选项目",
      description: "> 正在访问设计与工程记录...",
      total: "文件总数:",
      active: "活跃",
    },

    explore: {
      projects: {
        header: "模块_01 // 项目",
        title: "项目",
        description: "制造与设计档案",
        access: "访问数据库 >",
      },
      lab: {
        header: "模块_02 // 实验",
        title: "实验室",
        description: "测试与原型开发",
        access: "打开模块 >",
      },
      art: {
        header: "模块_03 // 视觉",
        title: "艺术",
        description: "视觉艺术作品",
        access: "打开档案 >",
      },
      notes: {
        header: "模块_04 // 知识",
        title: "笔记",
        description: "学习笔记记录",
        access: "加载文档 >",
      },
    },

    latest: {
      header: "系统日志 // 最近活动流",
      type: "类型:",
      updated: "已更新",
    },

    aboutPreview: {
      header: "个人档案 // 资料模块",
      operator: "操作员",
      status: "● 活跃设计师 // 创客",
      location: "位置: 鹿特丹 // 荷兰",
      field: "领域: 设计 + 技术",
      access: "访问完整档案 >",
    },

    footer: {
      system: "页脚节点 // 终止序列",
      status: "系统状态:",
      online: "在线",
      identity: "工业设计 × 嵌入式系统 × 创意制造",
      location: "位置:",
      statusLabel: "状态:",
      operational: "运行中",
      version: "版本:",
      uplink: "数据上行链路",
      github: "GitHub",
      email: "邮箱",
      pixiv: "P站",
      about: "关于",
      copyright: "所有核心数据包已整合",
    },

    sections: {
      lab: {
        title: "实验室",
        description: "电子、实验与原型项目",
      },
      projects: {
        title: "项目",
        description: "工业设计与产品开发",
      },
      art: {
        title: "艺术",
        description: "插画、视觉实验与艺术作品",
      },
      notes: {
        title: "笔记",
        description: "研究、学习与技术记录",
      },

      about: {
        pageTag: "个人档案 // 资料模块",
        pageStatus: "● 系统运行中",
        eyebrow: "RrSuika STUDIO // 设计师 + 创客 + 画师",
        title: "关于我",

        introTitle: "设计\n工程\n艺术",
        subtitle: "工业设计师 & 创客，现居鹿特丹，把技术思维和视觉创造力结合到一起。",
        description: "我的创作处于设计、工程与视觉艺术之间",
        introText:
          "我喜欢把一个想法从草图或概念一路推进：找参考、研究材料与结构，推敲造型、建 3D 模型，再做出原型，最终把它变成一个看得见、摸得着、真正能工作的东西",

        identity: {
          title: "DESIGNER // MAKER // ARTIST",
          text:
            "在设计师与创客之间，我最自在：我很在意美感，但也想搞懂一个东西是怎么工作的、怎么被制造出来的，以及不同领域的技术如何被组合成一个完整的产品",
          second:
            "工业及产品设计是我目前主要的职业方向，而插画、概念设计与视觉创作，始终是我没有放下的另一重身份",
        },

        dossier: {
          header: "个人档案 // 关于模块",
          operator: "操作员",
          role: "工业及产品设计师",
          status: "● 活跃设计师 // 创客",
          locationLabel: "位置",
          location: "鹿特丹 // 荷兰",
          fieldLabel: "领域",
          field: "美学 + 设计 + 技术",
          focusLabel: "当前方向",
          focus:
            "工业产品设计、嵌入式系统、电子、电工基础、原型制作、视觉表达与动手实验",
          skillsLabel: "技能",
          skills: [
            "3D 建模与打印",
            "原型制作与测试",
            "素描与绘画",
            "工业及产品设计",
            "CMF 设计",
            "电子与嵌入式系统",
            "插画与视觉设计",
            "AI 辅助工作流",
          ],
          interestsLabel: "兴趣爱好",
          interests: [
            "徒步",
            "骑行",
            "阅读",
            "绘画",
            "电子电气工程",
            "制造加工",
          ],
          softwareLabel: "软件",
        },

        philosophy: {
          header: "个人准则 // 设计理念",
          title: "站在巨人\n的肩膀上",
          text:
            "设计从来都要站在前人的基础上：研究前人的作品、寻找优秀的参考，敢于接受他人的看法和批判，再把积累下来的知识与想法重新组合成自己的东西",
          second:
            "我很享受把不同领域的知识连接起来的过程：一个概念可以来自绘画与视觉设计，造型可以通过 CAD 实现，结构可以用机械知识解决，最后再靠电子系统和制造技术让它真正运行起来",
          mottoLabel: "个人信条",
          motto: "FAKE IT TILL YOU MAKE IT.",
          mottoText:
            "相信自己能做到，直到自己真的做到。从未知到已知，就像探险家一样学习了解掌握新的知识，点亮新的技能。而好奇心和行动力，是最有价值的特质！",
        },

        approach: {
          description: "",
          research: {
            title: "研究",
            description:
              "寻找参考，研究材料、结构、机构与现有解决方案，在决定怎么做之前先弄清问题与限制",
          },
          concept: {
            title: "概念",
            description:
              "通过草图、绘画、插画、视觉参考与概念设计，探索一个物件可能成为的样子",
          },
          build: {
            title: "构建",
            description:
              "尽早把想法变成 CAD 模型、电子系统、3D 打印件与实体原型",
          },
          refine: {
            title: "迭代",
            description:
              "不断测试、修改，再迭代，直到美学、功能、使用体验与可制造性开始彼此配合",
          },
        },

        capabilities: {
          header: "RrSuika 能力矩阵",
          industrial: {
            title: "工业及产品设计",
            description:
              "产品开发、造型探索、CAD 建模、材料研究、CMF 与实体原型制作",
          },
          mechanical: {
            title: "CMF 设计",
            description:
              "颜色、材料与表面处理的设计研究，涵盖高光、哑光、金属、塑料、皮革、纹理等常见材质表现与搭配",
          },
          electronics: {
            title: "电子",
            description:
              "电工基础、电子系统、Arduino、ESP32，以及把电子元件整合进实体产品",
          },
          embedded: {
            title: "嵌入式系统",
            description:
              "探索微控制器、传感器、执行器与软件驱动的实体交互，并将 AI 辅助开发融入个人工作流",
          },
          fabrication: {
            title: "制造加工",
            description:
              "FDM 3D 打印、材料测试、激光切割、基础焊接，以及各种动手制作",
          },
          visual: {
            title: "插画与视觉设计",
            description:
              "数字绘画、角色绘画、概念设计、海报设计、视觉表达与美学探索",
          },
          software: {
            title: "数字工具",
            description:
              "SolidWorks、KeyShot、Photoshop、Clip Studio Paint、DaVinci Resolve",
          },
          teaching: {
            title: "绘画教学",
            description:
              "偶尔也会教新手画画。教学能帮我把会的东西整理成更清晰的体系，同时也让我重新回顾、巩固自己的理解"
          },
        },

        journey: {
          header: "PROCESS_LOG // DEVELOPMENT_PATH",
          title: "技能树",
          nodes: {
            hardware: "起点",
            design: "交汇点",
            maker: "实践",
            technology: "下一阶段",
          },
          text:
            "我最开始接触的是硬件工程，后来发现自己更希望进入一个能同时容纳技术思维与视觉创造的领域",
          second:
            "工业及产品设计最终成了一个很自然的交汇点：造型、功能、材料、制造与视觉表达，都在同一个设计过程里",
          third:
            "而现在，我又在逐渐向技术方向靠近。电子、嵌入式系统、机械结构、材料测试与制造，在我的学习与个人项目里占的比重越来越大",
          fourth:
            "我并不想成为那种把每个元件参数都背下来的纯技术专家。我更感兴趣的是理解不同技术之间如何协作，以及怎么把它们组合成一个完整、可用的产品",
        },

        current: {
          header: "当前研究 // 2026",
          modules: {
            design: {
              title: "构成 / 平面设计 / 美学",
            },
            technology: {
              title: "电子 / ESP32 / 电工",
            },
            making: {
              title: "3D PRINT / FABRICATION",
            },
            visual: {
              title: "插画 / 概念设计",
            },
            ai: {
              title: "AI 辅助工作流",
            },
          },
          design: "构成、平面设计、美学与视觉系统",
          technology: "电子、嵌入式系统、Arduino、ESP32 与电工基础",
          making: "3D 打印、材料、制造加工与实体原型",
          visual: "插画、角色绘画、概念设计与视觉表达",
          ai: "AI 辅助编程和技术工作流，让 AI 负责实现层面的工作，而审美、判断与方向仍然由人来把握",
        },

        future: {
          header: "下一阶段 // 未来方向",
          text: "工业设计是主线任务，同时还有创客与插画师这两个支线",
          second:
            "长期来看，我希望自己能越来越完整地把一个想法做到底;从概念与视觉开发，一路到电子、软件、机械结构、采购与制造，最终成为一个成熟的独立设计师",
          third:
            "与此同时，我也希望继续画画，让视觉创作作为自己的另一种身份留下来",
        },

        closing:
          "目标其实很简单：认真对待每一个值得实现的想法，同时保持足够的好奇心，继续创造新的东西",
        annex: {
          header: "风格谱系 // 设计起源档案",
          status: "档案状态：已解密: 出于好奇",
          intro:
            "我超爱复古未来主义！！当身边的一切都被极简和性冷淡风格处理时，人被量化，产品也失去了情感和个性。就像有人喜欢千禧年美学、有人着迷后室一样，我好奇的是从冷战时期一路到上世纪末的风格演变;那是一条可以追溯、不断变化的审美线索，随着当代社会与文化不断生长，令人着迷。",
          styleIndex: "// STYLE_INDEX // 这个网站参考的设计语言",
          styles: [
            {
              code: "STYLE_01 // BAUHAUS_&_DE_STIJL",
              era: "1919–1933",
              body:
                "三原色当作设计语法：导航栏里重叠的红黄蓝圆点、标题旁的三色竖条。这是最早的现代主义设计语言，也是这个网站的视觉起点。",
              refs: "包豪斯德绍 · 蒙德里安构成 · 莫霍利-纳吉的字体实验",
            },
            {
              code: "STYLE_02 // SWISS_INTERNATIONAL",
              era: "1950s–60s",
              body:
                "系统化的网格、编号模块，还有大写微标签。文案写得像仪表铭牌;MODULE_01、ENTRY_001、DATA_UPLINK。",
              refs: "约瑟夫·米勒-布罗克曼《平面设计中的网格系统》",
            },
            {
              code: "STYLE_03 // CASSETTE_FUTURISM",
              era: "1970s–80s",
              body:
                "绿色磷光、扫描线、磁带、条形码、开机终端。画面里隐藏起来的 CRT 扫描线质感。",
              refs: "《异形》(1979) · 《2001太空漫游》 · 苏联联盟号控制面板",
            },
            {
              code: "STYLE_04 // NASA_PUNK",
              era: "1960s",
              body:
                "任务控制台的遥测数据：经纬度坐标、LED 段式仪表、六边形网格、粒子网络。页面读起来就像一块仪器面板。",
              refs: "阿波罗任务控制中心 · AGC 读数屏 · 明日方舟：孤星 UI",
            },
            {
              code: "STYLE_05 // CYBERPUNK_TERMINAL",
              era: "1980s–90s",
              body:
                "黑底绿字的系统日志、黑客终端氛围。意外混入的第五种视觉语言，帅到我了",
              refs: "《银翼杀手》 · 《黑客帝国》",
            },
            {
              code: "STYLE_06 // NEUMORPHIC_GLASS",
              era: "2020s–至今",
              body:
                "磨砂玻璃卡片浮在纸面上，新拟态按钮像从背景里被挤出来：柔和的深浅双阴影、内高光。这个网站亮色模式里的项目卡片和 ACCESS 按钮就是它。",
              refs: "Apple visionOS 玻璃 · Windows Fluent/Acrylic · Figma 新拟态风潮",
            },
          ],
          worksIndex: "// WORKS_INDEX // 同频的视觉作品",
          works: [
            {
              title: "明日方舟：孤星",
              note: "冷调科研机构与航天基地，仪表盘式的界面叙事",
            },
            {
              title: "重返未来：1999",
              note: "复古未来与神秘学交织的视觉语言",
            },
            {
              title: "原子之心",
              note: "苏联未来主义与机器美学的第一人称呈现",
            },
            {
              title: "辐射（Fallout）系列",
              note: "原子朋克标杆;CRT 终端与废土乐观主义",
            },
            {
              title: "《异形》(1979) · 《2001太空漫游》",
              note: "卡带未来主义的影像源头",
            },
            {
              title: "《银翼杀手》 · 《黑客帝国》",
              note: "暗色屏幕与绿色日志，从这里走进流行文化",
            },
          ],
        },
      },
    },

    system: {
      status: "系统状态:",
      online: "在线",
    },

    skillMap: {
      hubs: [
        { name: "工业产品设计", skills: ["调研", "手绘草图", "三维建模", "原型制作", "采购对接", "CMF"] },
        { name: "美学", skills: [] },
        { name: "CAD 建模", skills: ["SolidWorks", "Blender"] },
        { name: "3D 打印", skills: ["FDM", "SLA", "PLA", "PETG", "ABS", "ASA", "TPU", "树脂"] },
        { name: "焊接", skills: ["直插焊接", "贴片焊接", "MIG 焊接"] },
        { name: "渲染", skills: ["KeyShot"] },
        { name: "数字绘画", skills: ["概念艺术", "插画", "绘画教学"] },
        { name: "图像处理", skills: ["Photoshop", "Clip Studio", "DaVinci"] },
        { name: "平面设计", skills: ["海报", "视觉艺术", "艺术趋势"] },
        { name: "嵌入式系统", skills: ["ESP32", "Arduino", "传感器"] },
        { name: "电气系统", skills: ["基础电路", "电工理论", "LED 系统"] },
      ],
    },
  },

  nl: {
    meta: {
      description:
        "RrSuika Studio, portfolio van een multidisciplinaire maker: industrieel ontwerp, embedded systems, notities over elektronica en visuele kunst.",
    },

    lensTune: {
      title: "GRAVITATIONAL LENS // AFSTELLEN",
      groups: {
        position: "POSITIE",
        disk: "SCHIJF",
        motion: "BEWEGING",
        lensing: "LENS",
        field: "DICHTHEID",
      },
      keysDual: "←→ eerste as · ↑↓ tweede as",
      keysSingle: "←→ / ↑↓ waarde",
      footer:
        "sleep de kop om te verplaatsen · TAB volgende · H ringen · COPY / C kopiëren · R reset · ESC sluiten",
      inactive: "LENS INACTIEF — desktop (≥769px) + donkere modus nodig",
      copy: "KOPIEER ⧉",
      copied: "GEKOPIEERD ✓ plak in de AI / global.css §10",
      copyBlocked: "KOPIËREN GEBLOKKEERD — fragment staat in de console",
      reset: "TERUGGEZET NAAR CSS-STANDAARD",
      keyPrefix: "TOETS",
      escClose: "ESC sluiten",
      debug: {
        outerEdge: "BUITENRAND",
        outerMid: "BUITEN / MIDDEN",
        midInner: "MIDDEN / BINNEN",
        ring: "ZWARTE-GAT-RING",
        diskInner: "SCHIJF BINNEN",
        diskOuter: "SCHIJF BUITEN",
        photonBand: "FOTONENBAND",
      },
      off: "buiten",
      labels: {
        cx: "MIDDEN · X / Y",
        rOuter: "BUITENSTE LAAG · R",
        rMid: "MIDDELSTE LAAG · R",
        rInner: "BINNENSTE LAAG · R",
        rRing: "ZWARTE-GAT-RING · R",
        diskMove: "SCHIJF · VERPLAATSEN X/Y",
        diskInner: "SCHIJF · BINNENRAND W/H",
        diskOuter: "SCHIJF · BUITENRAND W/H",
        diskTilt: "SCHIJF · KANTELING",
        diskFeather: "SCHIJF · FADE-BAND",
        speedOuter: "SNELHEID BUITEN",
        speedMid: "SNELHEID MIDDEN",
        innerEase: "AFREMMEN BINNEN",
        swirl: "SPIRAAL (KLOKSGEWIJS)",
        bulge: "LENS · BOLLING",
        stretch: "LENS · REK",
        density: "STERDICHTHEID",
        gapBoost: "HELDERHEID RINGGAT",
        photonBand: "FOTONENBAND B/G",
        cyPx: "MIDDEN · Y-OFFSET px",
      },
      desc: {
        cx: "Midden van de lens / het zwarte gat. ←→ horizontaal, ↑↓ verticaal. Alle lagen en de schijf zijn erop gecentreerd — zet het kruis eerst op het zwarte gat in de video.",
        rOuter: "Buitenrand van het sterrenveld; hier faden de sterren in. ←→ / ↑↓ veranderen de straal — groter = wijder veld.",
        rMid: "Grens buitenste / middelste laag. ←→ / ↑↓ veranderen de straal — groter = dunnere middenlaag.",
        rInner: "Grens middelste / binnenste laag, waar het afremmen begint. ←→ / ↑↓ veranderen de straal.",
        rRing: "Straal van de zwarte-gat-ring; daarbinnen wordt niets getekend (puur zwart). Lijn hem eerst uit op de rand in de video.",
        diskMove: "Verschuif de accretieschijf-ellips ten opzichte van het zwarte gat. ←→ links/rechts, ↑↓ omhoog/omlaag.",
        diskInner: "Binnenrand van de schijf: ←→ horizontale halve breedte, ↑↓ verticale halve hoogte (onafhankelijk van de buitenrand). Sterren in de schijf worden verborgen.",
        diskOuter: "Buitenrand van de schijf: ←→ horizontale halve breedte, ↑↓ verticale halve hoogte. Sterren faden hier uit.",
        diskTilt: "Rotatie van de ellips in graden. Negatief = rechterkant omhoog (video ≈ -15°). ←→ / ↑↓ passen beide aan.",
        diskFeather: "Breedte van de fade-band aan de schijfr anden. ←→ / ↑↓ passen beide aan; 0 = harde rand.",
        speedOuter: "Naar binnen gaande snelheid van de buitenste laag (viewporthoogtes / seconde). Lager = langzamer.",
        speedMid: "Snelheid van de middelste laag; hoger = sneller.",
        innerEase: "Exponent van het afremmen in de binnenste laag. Hoger = pas vlak bij de ring langzamer.",
        swirl: "Kloksgewijze spiraalsnelheid bij de ring (∝ rRing/r). 0 = geen spiraal; negatief keert om.",
        bulge: "Hoe ver sterren bij de ring naar buiten worden geduwd (Einstein-ring).",
        stretch: "Tangentiële uitrekking bij de ring (1 = geen vervorming). Sterren in het fotonenband blijven rond.",
        density: "Vermenigvuldiger voor het aantal sterren. Lager bij haperingen.",
        gapBoost: "Helderheidsfactor voor de kleine sterren in de cirkelvormige band net buiten de zwarte-gat-ring.",
        photonBand: "Cirkelvormige band met kleine sterren net buiten de zwarte-gat-ring: ←→ bandbreedte, ↑↓ groottefactor (kleiner = fijner/dichter).",
        cyPx: "Absolute pixel-offset van het midden op de Y-as (samen met cy-vh). Zelden nodig.",
      },
    },


    nav: {
      home: "HOME",
      projects: "PROJECTEN",
      lab: "LAB",
      art: "ART",
      notes: "NOTITIES",
      about: "ABOUT ME",
    },

    common: {
      year: "Jaar",
      type: "Type",
      category: "Categorie",
      tools: "Gereedschap",
      contents: "Inhoud",
      code: {
        copy: "Code kopiëren",
        copied: "Gekopieerd",
        expand: "Code tonen",
        collapse: "Code verbergen",
        lines: "regels",
      },
    },

    language: {
      code: "TRANSLATION // UNAVAILABLE",
      unavailable: "Deze pagina is nog niet vertaald",
      description: "Bekijk de beschikbare taalversies",
    },

    card: {
      projectNode: "PRJ_NODE //",
      online: "● ONLINE",
      wip: "◐ WIP",
      team: "/TEAMWERK/",
      imageStream: "IMAGE_STREAM // ACTIEF",
      category: "CATEGORIE:",
      archive: "ARCHIEF:",
    },

    detail: {
      wip: "ONTWERP AFGEROND — INKOOP & BOUW LOPEN NOG",
    },

    hero: {
      title: {
        line1: "FUNCTIONAL",
        line2: "AESTHETICS",
      },
      cassette: "[ DESIGN_DATABASE // GELADEN ]",
      description: {
        line1:
          "TECHNIEK en ESTHETISCH ontwerp verbinden door middel",
        line2: "van artistieke intuïtie en een onderzoekende aanpak",
      },
      button: "PROJECTDATABASE OPENEN",
    },

    featured: {
      tag: "PROJECT_DATABASE // FEATURED_ARCHIEF",
      title: "Uitgelichte projecten",
      description: "> ONTWERP- EN ENGINEERINGGEGEVENS WORDEN GELADEN...",
      total: "TOTAAL_BESTANDEN:",
      active: "ACTIEF",
    },

    explore: {
      projects: {
        header: "MODULE_01 // WERKEN",
        title: "PROJECTEN",
        description: "WORKSPACE/DESIGN",
        access: "DATABASE OPENEN >",
      },
      lab: {
        header: "MODULE_02 // EXPERIMENTEN",
        title: "LAB",
        description: "TESTS/PROTOTYPING",
        access: "MODULE OPENEN >",
      },
      art: {
        header: "MODULE_03 // VISUEEL",
        title: "ART",
        description: "VISUELE_KUNSTWERKEN",
        access: "ARCHIEF OPENEN >",
      },
      notes: {
        header: "MODULE_04 // KENNIS",
        title: "NOTITIES",
        description: "STUDIE/TECHNISCHE_NOTITIES",
        access: "DOCUMENTEN LADEN >",
      },
    },

    latest: {
      header: "SYS.LOG // RECENTE_ACTIVITEITEN",
      type: "TYPE:",
      updated: "UP-TO-DATE",
    },

    aboutPreview: {
      header: "PERSONEELSDOSSIER // PROFIELMODULE",
      operator: "OPERATOR",
      status: "● ACTIEVE ONTWERPER // MAKER // KUNSTENAAR",
      location: "LOCATIE: ROTTERDAM // NL",
      field: "VAKGEBIED: ONTWERP + TECHNOLOGIE",
      access: "VOLLEDIG DOSSIER OPENEN >",
    },

    footer: {
      system: "FOOTER_NODE // BEËINDIGINGSSEQUENTIE",
      status: "SYS_STATUS:",
      online: "ONLINE",
      identity:
        "Industrieel Ontwerp × Embedded Systems × Creatief Maken",
      location: "LOCATIE:",
      statusLabel: "STATUS:",
      operational: "OPERATIONEEL",
      version: "VERSIE:",
      uplink: "DATA_UPLINK",
      github: "GitHub",
      email: "E-mail",
      pixiv: "Pixiv",
      about: "About ME",
      copyright: "ALLE KERNDATAPAKKETTEN GEÏNTEGREERD",
    },

    sections: {
      lab: {
        title: "Lab",
        description: "Experimenten, elektronica en prototypes.",
      },
      projects: {
        title: "Projecten",
        description: "Industrieel ontwerp en productontwikkeling.",
      },
      art: {
        title: "Art",
        description: "Illustratie, visuele experimenten en kunstwerken.",
      },
      notes: {
        title: "Notities",
        description: "Onderzoek, leren en technische notities.",
      },
      about: {
        pageTag: "PERSONEELSDOSSIER // PROFIELMODULE",
        pageStatus: "● SYSTEEM_ACTIEF",
        eyebrow: "RrSuika STUDIO // ONTWERPER + MAKER + KUNSTENAAR",
        title: "About ME",
        introTitle: "TUSSEN\nMAKEN\nDESIGN\nKUNST",
        subtitle: "Industrieel ontwerper & maker in Rotterdam, op het snijvlak van technisch denken en visuele creativiteit.",
        description:
          "Ik ben industrieel productontwerper en digitaal kunstenaar, met een sterke interesse in het maken van echte dingen.",
        introText:
          "Mijn werk zit ergens tussen design, engineering en visuele kunst. Ik werk graag een idee uit vanaf een schets of concept: referenties zoeken, de vorm ontwikkelen, een prototype bouwen en er uiteindelijk iets fysieks en functioneels van maken.",
        identity: {
          title: "DESIGNER // MAKER // ARTIST",
          text:
            "Ik voel me het meest op mijn plek ergens tussen ontwerper en maker. Ik geef veel om esthetiek, maar wil ook begrijpen hoe dingen werken, hoe ze worden gemaakt en hoe verschillende technologieën gecombineerd kunnen worden tot een compleet object.",
          second:
            "Industrieel ontwerp is mijn belangrijkste professionele richting, terwijl illustratie en visueel werk een belangrijk deel van wie ik ben blijven.",
        },
        dossier: {
          header: "PERSONEELSDOSSIER // ABOUT_MODULE",
          operator: "OPERATOR",
          role: "INDUSTRIEEL + PRODUCTONTWERPER",
          status: "● ACTIEVE ONTWERPER // MAKER",
          locationLabel: "LOCATIE",
          location: "ROTTERDAM // NL",
          fieldLabel: "VAKGEBIED",
          field: "ESTHETIEK + ONTWERP + TECHNOLOGIE",
          focusLabel: "HUIDIGE_FOCUS",
          focus:
            "Industrieel ontwerp, embedded systems, elektronica, prototypen, visuele communicatie en experimenteel bouwen",
          skillsLabel: "VAARDIGHEDEN",
          skills: [
            "3D-modelleren & printen",
            "Prototypen & testen",
            "Schetsen & tekenen",
            "Industrieel & productontwerp",
            "CMF-design",
            "Elektronica & embedded systems",
            "Illustratie & visueel ontwerp",
            "AI-ondersteunde workflow",
          ],
          interestsLabel: "INTERESSES",
          interests: [
            "Wandelen",
            "Fietsen",
            "Lezen",
            "Tekenen",
            "Elektrotechniek",
            "Fabricage",
          ],
          softwareLabel: "SOFTWARE",
        },
        philosophy: {
          header: "PERSOONLIJK_PROTOCOL // ONTWERPFILOSOFIE",
          title: "OP DE\nSCHOUDERS\nVAN\nREUZEN",
          text:
            "Design ontstaat nooit in isolatie. Ik geloof in leren van wat al bestaat: referenties bestuderen, het werk van anderen begrijpen en die verzamelde ideeën combineren tot iets nieuws.",
          second:
            "Ik geniet ervan om kennis uit verschillende vakgebieden te verbinden en daar dingen mee te maken die ik vanuit één discipline alleen nooit had kunnen maken.",
          mottoLabel: "PERSOONLIJK_MOTTO",
          motto: "FAKE IT TILL YOU MAKE IT.",
          mottoText:
            "Niet doen alsof ik alles al weet, maar bereid zijn om onbekend terrein te betreden, te leren wat nodig is en door te blijven bouwen tot het idee werkelijkheid wordt.",
        },
        approach: {
          description: "",
          research: {
            title: "ONDERZOEK",
            description:
              "Referenties, materialen, mechanismen en bestaande oplossingen bestuderen, en pas daarna beslissen hoe iets gemaakt moet worden.",
          },
          concept: {
            title: "CONCEPT",
            description:
              "Schetsen, illustratie, visuele referenties en conceptdesign gebruiken om te verkennen wat een object kan worden.",
          },
          build: {
            title: "BOUWEN",
            description:
              "Ideeën zo vroeg mogelijk omzetten in CAD-modellen, elektronica, 3D-geprinte onderdelen en fysieke prototypes.",
          },
          refine: {
            title: "VERFIJNEN",
            description:
              "Testen, aanpassen en itereren totdat esthetiek, functie, bruikbaarheid en maakbaarheid samenkomen.",
          },
        },
        workflow: {
          header: "CREATIEVE_PIJPLIJN // IDEE_NAAR_OBJECT",
          concept: {
            title: "01 // CONCEPT",
            description:
              "Ideegeneratie, schetsen, illustratie en visuele verkenning.",
          },
          design: {
            title: "02 // ONTWERP",
            description:
              "Vormontwikkeling, CAD-modelleren, CMF-beslissingen en technisch onderzoek.",
          },
          prototype: {
            title: "03 // PROTOTYPE",
            description:
              "3D-printen, fabricage, elektronica en fysieke experimenten.",
          },
          system: {
            title: "04 // SYSTEEM",
            description:
              "Hardware, software en mechanische componenten combineren tot iets functioneels.",
          },
          iteration: {
            title: "05 // ITEREREN",
            description:
              "Het resultaat testen, problemen identificeren en het object blijven verbeteren.",
          },
        },
        capabilities: {
          header: "RrSuika_CAPABILITY_MATRIX",
          industrial: {
            title: "Industrieel\nProductontwerp",
            description:
              "Productontwikkeling, vormverkenning, CAD-modelleren, materiaalonderzoek, CMF en fysiek prototypen.",
          },
          mechanical: {
            title: "CMF Design",
            description:
              "Color, Material and Surface Finish: van glanzend en mat tot metallic, plastic, leer, texturen en andere veelvoorkomende oppervlaktebehandelingen.",
          },
          electronics: {
            title: "Elektronica",
            description:
              "Elektrische basisprincipes, elektronica, Arduino, ESP32 en de integratie van elektronische componenten in fysieke producten.",
          },
          embedded: {
            title: "Embedded Systems",
            description:
              "Microcontrollers, sensoren, actuatoren en softwaregestuurde fysieke interactie verkennen, met AI-ondersteunde ontwikkeling als onderdeel van de workflow.",
          },
          fabrication: {
            title: "Fabricage",
            description:
              "FDM 3D-printen, materiaaltesten, lasersnijden, basislassen en hands-on fabricage.",
          },
          visual: {
            title: "Illustratie\nVisueel ontwerp",
            description:
              "Digitale illustratie, conceptart, posterdesign, visuele communicatie en esthetische ontwikkeling.",
          },
          software: {
            title: "Digitale tools",
            description:
              "SolidWorks, KeyShot, Photoshop en Clip Studio Paint, met eerdere ervaring in Blender.",
          },
          teaching: {
            title: "Lesgeven in tekenen",
            description:
              "Soms leer ik beginners tekenen. Lesgeven helpt me om kennis in heldere systemen te ordenen, terwijl ik mijn eigen begrip herzie en versterk.",
          },
        },
        journey: {
          header: "PROCESS_LOG // ONTWIKKELPAD",
          title:
            "TO THE GALAXY AND BEYOND",
          nodes: {
            hardware: "START",
            design: "KRUISPUNT",
            maker: "PRAKTIJK",
            technology: "VOLGENDE FASE",
          },
          text:
            "Mijn pad begon niet met industrieel ontwerp. Ik verdiepte me eerst in hardware-engineering, maar besefte uiteindelijk dat ik een vakgebied wilde waar technisch denken en visuele creativiteit samengaan.",
          second:
            "Industrieel en productontwerp werd een natuurlijk kruispunt: een discipline waarin vorm, functie, materialen, productie en visuele communicatie allemaal samenkomen in hetzelfde proces.",
          third:
            "Inmiddels beweeg ik langzaam weer richting de technische kant. Elektronica, embedded systems, mechanische eigenschappen, materiaaltesten en fabricage worden een steeds belangrijker deel van mijn leerproces en persoonlijke projecten.",
          fourth:
            "Het doel is niet om de specialist te worden die elke componentparameter uit het hoofd kent. Ik ben meer geïnteresseerd in hoe verschillende technologieën samenwerken en hoe ze onderdeel kunnen worden van een compleet, bruikbaar product.",
        },
        current: {
          header: "HUIDIG_ONDERZOEK // 2026",
          modules: {
            design: {
              title: "COMPOSITIE / GRAFISCH ONTWERP / ESTHETIEK",
            },
            technology: {
              title: "ELEKTRONICA / EMBEDDED SYSTEMS / ELEKTRO",
            },
            making: {
              title: "3D-PRINTEN / FABRICAGE",
            },
            visual: {
              title: "ILLUSTRATIE / CONCEPTDESIGN",
            },
            ai: {
              title: "AI-ONDERSTEUNDE WORKFLOW",
            },
          },
          design:
            "Compositie, grafisch ontwerp, esthetiek en visuele systemen.",
          technology:
            "Elektronica, embedded systems, Arduino, ESP32 en elektrische basisprincipes.",
          making:
            "3D-printen, materialen, fabricage en fysiek prototypen.",
          visual:
            "Illustratie, karaktertekenen, conceptdesign en visuele communicatie.",
          ai:
            "AI-ondersteund coderen en technische workflows: AI als implementatietool, terwijl menselijk oordeel, smaak en richting centraal blijven staan.",
        },
        future: {
          header: "VOLGENDE_ITERATIE // TOEKOMSTRICHTING",
          text:
            "Ik wil dat industrieel ontwerp mijn belangrijkste professionele richting blijft, terwijl ik me blijf ontwikkelen als maker en illustrator.",
          second:
            "Op lange termijn steeds beter in staat zijn om een idee helemaal uit te werken: van concept en visuele ontwikkeling tot elektronica, software, mechanische structuur, inkoop en een afgewerkt fysiek prototype.",
          third:
            "Tegelijk tekenen en visueel werk als tweede identiteit behouden, in plaats van het te laten vervangen door technisch werk.",
        },
        closing:
          "Het doel is simpel: ideeën serieus genoeg nemen om ze ook echt te bouwen, en nieuwsgierig genoeg blijven om nieuwe te blijven maken...",
        annex: {
          header: "STYLE_GENEALOGIE // DESIGN_ORIGINS_RECORD",
          status: "RECORD_STATUS: UNCLASSIFIED // GEDEELD UIT NIEUWSGIERIGHEID",
          intro:
            "Ik ben gewoon gek op retro-futurisme!! Wanneer alles om ons heen wordt platgeslagen tot minimalisme en koud, klinisch design, worden mensen gereduceerd tot cijfers en verliezen producten hun emotie en persoonlijkheid. Net als mensen die van Y2K houden of de Backrooms in getrokken worden, ben ik nieuwsgierig naar hoe stijl zich ontwikkelde van de Koude Oorlog tot het einde van de vorige eeuw. Het is een traceerbare, voortdurend veranderende esthetiek die meebeweegt met de maatschappij en cultuur om zich heen. Dat fascineert me.",
          styleIndex: "// STYLE_INDEX // DE BELANGRIJKSTE DIALECTEN DIE DEZE SITE SPREEKT",
          styles: [
            {
              code: "STYLE_01 // BAUHAUS_&_DE_STIJL",
              era: "1919–1933",
              body:
                "De triade van primaire kleuren als ontwerpgrammatica: de overlappende rode/gele/blauwe stippen in de navbar, de driekleurige balken naast de kop. Geometrie als moreel kader.",
              refs: "Bauhaus Dessau · Mondriaan-composities · Moholy-Nagy typografie",
            },
            {
              code: "STYLE_02 // SWISS_INTERNATIONAL",
              era: "Jaren 50–60",
              body:
                "Systematische rasters, genummerde modules, micro-labels in hoofdletters. Tekst geschreven als instrumentmarkeringen: MODULE_01, ENTRY_001, DATA_UPLINK.",
              refs: "Josef Müller-Brockmann, Grid Systems in Graphic Design",
            },
            {
              code: "STYLE_03 // CASSETTE_FUTURISM",
              era: "Jaren 70–80",
              body:
                "Groene fosfor, scanlines, magneetband, streepjescodes, boot-terminals. De CRT is het ware materiaal van de site: elk scherm hier is een opgewarmde monitor.",
              refs: "Alien (1979) · 2001: A Space Odyssey · Sovjet Sojoez-panelen",
            },
            {
              code: "STYLE_04 // NASA_PUNK",
              era: "Jaren 60",
              body:
                "Mission-control telemetrie: breedte-/lengtegraadcoördinaten, LED-segmentmeters, hex-raster, deeltjesnetwerken. De pagina leest als een instrumentenpaneel.",
              refs: "Apollo Mission Control · AGC-uitlezingen · Arknights: Lone Trail UI",
            },
            {
              code: "STYLE_05 // CYBERPUNK_TERMINAL",
              era: "Jaren 80–90",
              body:
                "Donker scherm + groene systeemlogs, de sfeer van een hackerterminal. Het toevallige vijfde dialect: het kwam met het donkere thema en ging nooit meer weg.",
              refs: "Blade Runner · The Matrix",
            },
            {
              code: "STYLE_06 // NEUMORPHIC_GLASS",
              era: "Jaren 20–nu",
              body:
                "Frosted-glass kaarten die over papier zweven, neumorfische knoppen die met zachte dubbele schaduwen en binnenlichten uit de achtergrond omhooggedrukt lijken. De lichtmodus van deze site: projectkaarten vervagen wat erachter ligt, de ACCESS-knop is uit het papier zelf gevormd.",
              refs: "Apple visionOS-glas · Windows Fluent/Acrylic · neumorfisme-golf in de Figma-community",
            },
          ],
          worksIndex: "// WORKS_INDEX // VISUEEL WERK OP DEZELFDE FREQUENTIE",
          works: [
            {
              title: "Arknights: Lone Trail",
              note: "koude onderzoeksstations en lanceerbases, storytelling via instrumentenpanelen",
            },
            {
              title: "Reverse: 1999",
              note: "retro-futurisme verstrengeld met het occulte",
            },
            {
              title: "Atomic Heart",
              note: "Sovjet-futurisme en machine-esthetiek in first person",
            },
            {
              title: "Fallout-serie",
              note: "de atoompunk-benchmark: CRT-terminals en woestenij-optimisme",
            },
            {
              title: "Alien (1979) · 2001: A Space Odyssey",
              note: "de cinematografische broncode van cassette-futurisme",
            },
            {
              title: "Blade Runner · The Matrix",
              note: "waar donkere schermen en groene logs popcultuur werden",
            },
          ],
        },
      },
    },

    system: {
      status: "SYS_STATUS:",
      online: "ONLINE",
    },

    skillMap: {
      hubs: [
        { name: "INDUSTRIEEL ONTWERP", skills: ["ONDERZOEK", "SCHETSEN", "3D-MODELLEREN", "PROTOTYPEN", "INKOOP", "CMF"] },
        { name: "ESTHETIEK", skills: [] },
        { name: "CAD & MODELLEREN", skills: ["SOLIDWORKS", "BLENDER"] },
        { name: "3D-PRINTEN", skills: ["FDM", "SLA", "PLA", "PETG", "ABS", "ASA", "TPU", "RESIN"] },
        { name: "SOLDeren & LASSEN", skills: ["THROUGH-HOLE", "SMD", "MIG"] },
        { name: "RENDERING", skills: ["KEYSHOT"] },
        { name: "DIGITAAL TEKENEN", skills: ["CONCEPT ART", "ILLUSTRATIE", "TEKENLES"] },
        { name: "BEELDBEWERKING", skills: ["PHOTOSHOP", "CLIP STUDIO", "DAVINCI"] },
        { name: "GRAFISCH ONTWERP", skills: ["POSTERS", "VISUELE KUNST", "KUNSTTRENDS"] },
        { name: "EMBEDDED SYSTEMS", skills: ["ESP32", "ARDUINO", "SENSOREN"] },
        { name: "ELEKTRISCHE SYSTEMEN", skills: ["BASISSCHAKELINGEN", "ELEKTROTECHNIEK", "LED-SYSTEMEN"] },
      ],
    },
  },
} satisfies Record<Language, unknown>;

export function getTranslations(language: Language) {
  return translations[language];
}
