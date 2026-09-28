import type { Language } from "./i18n";

/**
 * Copy for the standalone FAN page (`/fan/`, `/zh/fan/`, `/nl/fan/`).
 *
 * ⚠️ This is deliberately NOT in `translations.ts`. That file is the single
 * source for the SITE's copy — nav, cards, sections, footer — and it is already
 * 1700 lines. The fan page is a self-contained visual artefact with its own
 * voice, and folding three more languages of prose into the shared table would
 * make the shared table harder to read without making the fan page any more
 * consistent. Same rules still apply: no inline dictionary inside the component,
 * every language written natively (see `docs/writing-style.md` rules 15/16/20),
 * and no invented facts.
 *
 * ⚠️ Every fact in here is already published on the About page or in the footer:
 * Rotterdam, industrial designer + maker, the interests list, and the three
 * contact handles. Nothing is embellished.
 */

export interface FanCopy {
  /** `<html lang>` already comes from the layout; this is the tab title. */
  docTitle: string;
  metaDescription: string;
  back: string;
  hero: {
    title: string;
    cn: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stamp: string;
    scroll: string;
  };
  intro: {
    tag: string;
    title: string;
    /** The self-introduction paragraphs. */
    paras: string[];
    facts: { label: string; value: string }[];
  };
  gallery: {
    tag: string;
    title: string;
    sub: string;
  };
  /** Per-folder row labels; only the folders that have artwork are rendered. */
  categories: Record<string, string>;
  commissions: {
    tag: string;
    title: string;
    /** The closed badge, drawn as a pill. */
    status: string;
    body: string[];
    note: string;
    /** The 催更 button: the label, what it is counting, and the thanks. */
    nudge: string;
    nudgeUnit: string;
    nudgeThanks: string;
  };
  contact: {
    tag: string;
    title: string;
    sub: string;
    /** `href` is omitted for the handles that have no public URL (see en copy). */
    links: { label: string; handle: string; href?: string }[];
  };
  footer: { note: string; back: string };
  lightbox: { close: string; prev: string; next: string };
  chips: { works: string };
}

const en: FanCopy = {
  docTitle: "Pinky Studio — a fan letter in pink",
  metaDescription:
    "A single page for RrSuika Studio: an introduction, the gallery, commission status and how to get in touch.",
  back: "← Work with the studio",
  hero: {
    title: "RRSUIKA STUDIO",
    cn: "Fluffy World",
    sub: "EAT, SLEEP, DRAW, REPEAT.",
    ctaPrimary: "SEE THE DRAWINGS",
    ctaSecondary: "FIND ME",
    // ⚠️ The stamp names the DESIGN REFERENCE, not the page's own origin.
    // "FAN MADE · 非官方" read as a disclaimer and undercut the whole page.
    stamp: "STYLE REF · ARKNIGHTS 逐影集趣",
  },

  intro: {
    tag: "MODULE_01 · INTRODUCTION",
    title: "Who am I?",
    // ⚠️ This is a FAN page, and the voice has to match. The first draft read like
    // a job application ("industrial designer and maker … bridging technical
    // thinking") and the visitor asked for it to be rewritten as something a fan
    // would actually enjoy reading. Same published facts, warmer voice.
    paras: [
      "Hello! I am RrSuika (毛毛), and I draw: girls, food that looks almost edible, and whatever else wanders into my head at 2am.",
      "By day I am an industrial designer; by night I am someone who draws. One desk, drawings on the left and half-taken-apart electronics on the right — and I am the bit in between.",
      "What I want to dig into is drawing and aesthetics as a discipline, and I like teaching beginners. There is a particular satisfaction in finding that something abstract can be pinned down by a concrete rule.",
    ],
    facts: [
      { label: "Location", value: "Rotterdam // NL" },
      { label: "Field", value: "Aesthetics + Design + Technology" },
      { label: "Interests", value: "Hiking · Cycling · Reading · Drawing · Electronics" },
      { label: "Focus", value: "Illustration · Industrial design · Embedded systems" },
    ],
  },

  gallery: {
    tag: "MODULE_02 · GALLERY",
    title: "Gallery",
    sub: "",
  },

  categories: {
    illustrations: "Illustrations",
    "fashion-design": "Fashion Design",
    "food-art": "Food Art",
  },

  commissions: {
    tag: "MODULE_03 · COMMISSIONS",
    title: "Commissions",
    status: "TEMPORARILY CLOSED",
    body: [
      "I am not taking new commission work at the moment. Current projects and personal pieces have the drawing time.",
    ],
    note: "Feel free to chat — questions about drawing are welcome too.",
    nudge: "NUDGE ME",
    nudgeUnit: "nudges logged",
    // ⚠️ NOT a literal rendering of 「大王饶命，小的已经在画了」. The joke is an
    // exaggerated grovel, and English has a native register for it — "have mercy"
    // plus the self-deprecating hurry reads as the same joke rather than as a
    // translation.
    nudgeThanks: "Easy, easy — I'm drawing as fast as I can!",
  },

  contact: {
    tag: "MODULE_04 · CONTACT",
    title: "Get in touch",
    sub: "You can find me below.",
    /**
     * ⚠️ `href` is OPTIONAL and stays undefined where no public URL exists. Discord
     * and QQ are published in the site footer as plain text, so those two rows
     * render as text rather than as links — a link that 404s is worse than no link
     * (rule 19: no invented facts, and a guessed profile URL is an invented fact).
     */
    links: [
      {
        label: "Pixiv",
        handle: "pixiv.net/users/71884225",
        href: "https://www.pixiv.net/users/71884225",
      },
      { label: "Bilibili", handle: "space.bilibili.com/353118047", href: "https://space.bilibili.com/353118047" },
      { label: "Discord", handle: "rrsuika" },
      { label: "QQ", handle: "2385568240" },
    ],
  },

  footer: {
    // NOTE: `note` is EMPTY ON PURPOSE. The visitor asked for the
    // fan-tribute sentence to come out, so the footer keeps the way back and nothing
    // else. The markup guards the paragraph with a truthiness check, so an empty
    // string removes the line instead of leaving a gap in the layout.
    note: "",
    back: "Work with the studio",
  },

  lightbox: { close: "Close", prev: "Previous", next: "Next" },
  chips: { works: "works" },
};

const zh: FanCopy = {
  docTitle: "毛绒绒世界 - 一封粉色的应援信",
  metaDescription:
    "为 RrSuika（毛毛）做的粉丝向单页：自我介绍、画廊、约稿状态，以及怎么联系。",
  back: "← 与工作室合作",
  hero: {
    title: "RRSUIKA STUDIO",
    cn: "毛绒绒世界",
    sub: "吃饭，睡觉，画画，重复。",
    ctaPrimary: "看画",
    ctaSecondary: "找到我",
    // ⚠️ 印章写的是**风格参考来源**,不是「这是粉丝做的」。原来那句读起来像免责声明。
    stamp: "风格参考 · 明日方舟 逐影集趣",
  },

  intro: {
    tag: "模块_01 · 自我介绍",
    title: "我是谁？",
    // ⚠️ 粉丝向的口气,不是求职简历。事实不变(鹿特丹、工业设计兼 maker、那张摆满
    // 画稿和电子零件的桌子),换掉的是说话的方式。破折号按写作规范不用于正文。
    paras: [
      "你好呀，我是 RrSuika（毛毛），喜欢画画，美食和睡觉。我喜欢天马行空的想象和年轻的心态。",
      "白天我是工业设计师，晚上我是画画爱好者。一张桌子上左边摊着画稿，右边摊着拆了一半的电子零件，而我在两者之间。",
      "我希望钻研绘画和美学理论，同时喜欢教新手画画。当发现抽象逻辑能被具象规则所定义时，那种成就感是无与伦比的。",
    ],
    facts: [
      { label: "坐标", value: "鹿特丹 // 荷兰" },
      { label: "方向", value: "美学 + 设计 + 技术" },
      { label: "兴趣", value: "徒步 · 骑行 · 阅读 · 画画 · 电子" },
      { label: "在做", value: "插画 · 工业设计 · 嵌入式" },
    ],
  },

  gallery: {
    tag: "模块_02 · 画廊",
    title: "画廊",
    sub: "",
  },

  categories: {
    illustrations: "插画",
    "fashion-design": "服装设计",
    "food-art": "美食艺术",
  },

  commissions: {
    tag: "模块_03 · 约稿",
    title: "约稿",
    status: "暂时关闭",
    body: [
      "现在暂时不接新的约稿。手上的项目和个人创作已经占掉了画画的时间。",
    ],
    note: "欢迎沟通，绘画上有问题也可以问~",
    nudge: "催更",
    nudgeUnit: "次催更已记录",
    nudgeThanks: "大王饶命，小的已经在画了。",
  },

  contact: {
    tag: "模块_04 · 联系方式",
    title: "你可以在下面找到我",
    sub: "你可以在下面找到我。",
    links: [
      {
        label: "Pixiv",
        handle: "pixiv.net/users/71884225",
        href: "https://www.pixiv.net/users/71884225",
      },
      { label: "Bilibili", handle: "space.bilibili.com/353118047", href: "https://space.bilibili.com/353118047" },
      { label: "Discord", handle: "rrsuika" },
      { label: "QQ", handle: "2385568240" },
    ],
  },

  footer: {
    // 粉丝致敬那句是访客要求删掉的,这里留空。标记里用真值判断守着,
    // 空字符串就是「不渲染这一行」,不会在版面上留一段空行。
    note: "",
    back: "与工作室合作",
  },

  lightbox: { close: "关闭", prev: "上一张", next: "下一张" },
  chips: { works: "件作品" },
};

export const fanCopy: Record<"en" | "zh", FanCopy> = { en, zh };

/** The fan page only ships in English and Chinese — NL readers get English. */
export function getFanLanguage(language: Language): "en" | "zh" {
  return language === "zh" ? "zh" : "en";
}
