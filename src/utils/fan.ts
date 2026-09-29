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
    /**
     * The replies the nudge button picks from. ⚠️ An ARRAY, not a line: the
     * visitor asked for a pool ("加入多个其他有趣的回复"), so one is drawn at
     * random per press and the joke does not wear out on the second click.
     * ⚠️ en and zh are INDEX-ALIGNED on purpose — entry N says the same thing in
     * both languages. That is the only way 100 jokes stay in sync by eye, and it
     * is why the two arrays must always be edited together.
     */
    nudgeThanks: string[];
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
  docTitle: "Pinky Studio — a personal site",
  metaDescription:
    "A single page for RrSuika Studio: an introduction, the gallery, commission status and how to get in touch.",
  back: "← Work with me",
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
      "Hi there! I’m RrSuika (毛毛). I love drawing, food and sleeping. I enjoy boundless imagination and a youthful mindset.",
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
    nudge: "Update When?",
    nudgeUnit: "nudges logged",
    // ⚠️ NOT a literal rendering of 「大王饶命，小的已经在画了」. The joke is an
    // exaggerated grovel, and English has a native register for it — "have mercy"
    // plus the self-deprecating hurry reads as the same joke rather than as a
    // translation.
    // ── the reply pool. Entry N must say the same thing as the zh entry N. ──
    nudgeThanks: [
      "Easy, easy — I'm drawing as fast as I can!",
      "Gotcha!",
      "I want to sleep zzz",
      "A proper break now is how I get further tomorrow",
      "Not feeling it today",
      "The sun is bouncing off the screen and throwing me off",
      "Not properly awake yet",
      "Slept too long, head's still foggy",
      "Slept badly last night — it's showing in my line quality",
      "My hand just isn't cooperating today",
      "My wrist needs a proper rest",
      "My shoulders are stiff, it would ruin the composition",
      "Sitting all wrong, I can't get into the zone",
      "The desk is too messy, the clutter gets into the drawing",
      "The room is too quiet, I can't concentrate",
      "The room is too loud, I can't draw at all",
      "The AC is set wrong, my hands are stiff",
      "Too hot, the brain isn't turning over",
      "Too cold, the hands won't move",
      "Humidity is too high today, it affects how the paper behaves",
      "The air is too dry, the feel is off",
      "The light isn't stable enough",
      "Today's daylight isn't drawing light",
      "The lamp's colour temperature is off, I'd misjudge every colour",
      "The monitor's colours look strange today",
      "The screen brightness needs recalibrating",
      "The tablet surface is unusually slippery today",
      "The nib's friction feels wrong today",
      "The pressure curve needs redoing",
      "The shortcuts don't sit right under my hand",
      "The software started slowly and killed the mood",
      "The software updated, I need time to adapt",
      "Too many layers. I don't want to touch it",
      "The layers aren't named yet",
      "The file is a mess, I have to tidy it first",
      "I haven't gathered enough reference yet",
      "I gathered too much reference and now I'm overloaded",
      "The references don't match in style, I need to filter them",
      "I haven't found the right composition yet",
      "The composition is almost there — I can't commit yet",
      "I need to think the perspective through again",
      "The dynamics need longer to brew",
      "I haven't worked out the light logic",
      "The colour scheme isn't mature yet",
      "The character design is missing one core idea",
      "The mood isn't there yet",
      "There's no image in my head today",
      "There are too many images in my head today, I can't pick one",
      "I have the idea, I just haven't turned it into visual language",
      "Inspiration is in its accumulation phase",
      "Currently observing other work for direction",
      "Today is not a day for finalising",
      "Today is better for thinking than for linework",
      "Drawing now would teach my eye the wrong thing",
      "I need to settle the big direction first",
      "Details must not run ahead of structure",
      "Detail work now would be premature optimisation",
      "I want to avoid drawing just for the sake of drawing",
      "The piece needs time to grow on its own",
      "Some things can't be rushed",
      "Inspiration needs to settle",
      "The mood needs to brew",
      "The hand needs a warm-up",
      "I meant to warm up first. The warm-up ran long",
      "Today I'll practise lines; the real piece can wait",
      "Today I'll do a few sketches to find the feel",
      "Sketches are done — turns out I need a rest",
      "I've decided to study my own style today",
      "Currently adjusting my style",
      "This is the observation stage of the process",
      "I'm collecting visual reference",
      "My main task right now is building the internal model",
      "My brain is in low-poly mode today",
      "Not enough GPU available today",
      "CPU usage is too high, I can't render yet",
      "The inspiration cache hasn't finished loading",
      "The drawing engine is still compiling in the background",
      "Today booted in power-saving mode",
      "The creative thread is busy with other thoughts",
      "Memory is full of other things, there's no room for pictures",
      "The brain is overheating, it needs to downclock",
      "The neural network is dropping packets today",
      "There's latency in the hand-eye protocol",
      "The pen and the brain aren't communicating reliably",
      "The line-art server is under maintenance today",
      "The colour module is offline",
      "The character modelling service is responding slowly",
      "The lighting system is updating",
      "The perspective module needs a restart",
      "I've used up today's inspiration API calls",
      "I'm afraid whatever I draw today will pollute tomorrow's taste",
      "To avoid making it worse, I've decided not to draw today",
      "Drawing more now could ruin a perfectly good sketch",
      "Let's wait — my head might optimise it on its own",
      "I'm only a tiny bit away from feeling it",
      "Five more minutes of reference and I'll start",
      "After this tutorial I'll start",
      "After I study this artist's brushes I'll start",
      "After I set up the new brushes I'll start",
      "After I tune the tablet settings I'll start",
      "After I find the right music I'll start",
      "After I eat I'll start",
      "I'll save my state today and perform properly tomorrow",
    ],
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
    back: "Work with me",
  },

  lightbox: { close: "Close", prev: "Previous", next: "Next" },
  chips: { works: "works" },
};

const zh: FanCopy = {
  docTitle: "毛绒绒的个人网站",
  metaDescription:
    "为 RrSuika（毛毛）做的粉丝向单页：自我介绍、画廊、约稿状态，以及怎么联系。",
  back: "← 与我合作",
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
    // ⚠️ **必须和 en 的 `nudgeThanks` 逐条对应**,第 N 条说的是同一件事。改一边就改另一边。
    // 前三条是原有的那句 + 访客点名要的两句,后面 100 条是访客给的清单,顺序照抄。
    nudgeThanks: [
      "大王饶命，小的已经在画了",
      "Gotcha！",
      "我想睡觉 zzz",
      "暂时的休息是为了更好的前行",
      "今天状态不好",
      "阳光反射在屏幕上影响发挥",
      "没睡醒",
      "睡太久头有点晕",
      "昨晚睡得不太安稳，影响线条稳定性",
      "今天手感不太对",
      "手腕需要适当休息",
      "肩膀有点僵，怕影响构图",
      "坐姿不对，没办法进入创作状态",
      "桌面太乱，视觉会干扰构思",
      "房间太安静了，反而集中不了注意力",
      "房间太吵了，完全没法画",
      "空调温度不合适，手有点僵",
      "天气太热，脑子转不动",
      "天气太冷，手转不动",
      "今天空气湿度太高，影响纸张表现",
      "空气太干，手感不好",
      "光线不够稳定",
      "今天的自然光不适合画画",
      "灯光色温不对，颜色判断容易出问题",
      "显示器今天的颜色看起来有点怪",
      "屏幕亮度需要重新校准",
      "数位板表面今天特别滑",
      "数位笔笔尖今天摩擦感不对",
      "笔压曲线需要重新调一下",
      "快捷键手感不太顺",
      "软件启动得有点慢，影响心情",
      "软件今天更新了，我需要适应一下",
      "图层太多了，看着就不想动",
      "图层命名还没整理好",
      "文件结构比较混乱，得先整理",
      "参考图还没找够",
      "参考图找太多了，现在信息超载",
      "参考图风格不统一，需要重新筛选",
      "目前还没找到最合适的构图",
      "构图感觉还差一点，不能贸然下笔",
      "透视关系需要再想一下",
      "动态需要进一步酝酿",
      "光影逻辑还没想明白",
      "色彩方案还没有成熟",
      "角色设计还缺一个核心点",
      "氛围还没到位",
      "今天脑子里没有画面",
      "今天脑子里的画面太多了，不知道先画哪个",
      "想法有了，但还没整理成视觉语言",
      "灵感现在处于积累阶段",
      "正在观察其他作品寻找方向",
      "今天不适合定稿",
      "今天更适合思考，不适合落笔",
      "现在画容易形成错误审美记忆",
      "我需要先把大方向确定下来",
      "细节不能比结构先跑",
      "现在画细节属于过早优化",
      "我要避免为了画而画",
      "需要给作品一点自然生长的时间",
      "有些东西急不出来",
      "灵感需要沉淀",
      "状态需要酝酿",
      "手感需要预热",
      "我准备先热身一下，结果热身时间有点长",
      "今天先练线条，正稿改天再说",
      "今天先画几个草稿找找感觉",
      "草稿画完发现还是得休息一下",
      "今天决定研究一下自己的画风",
      "正在进行风格调整",
      "现在属于创作流程中的观察阶段",
      "我正在进行视觉资料采集",
      "我现在主要任务是构建脑内模型",
      "今天大脑处于低多边形状态",
      "今天的 GPU 不太够用",
      "CPU 占用率过高，暂时无法渲染",
      "灵感缓存还没加载完成",
      "绘画引擎正在后台编译",
      "今天启动的是省电模式",
      "创作线程被其他思绪占用了",
      "内存里塞满了其他事情，暂时没空间放画面",
      "大脑温度过高，需要降频",
      "神经网络今天有点丢包",
      "手眼同步协议出现延迟",
      "笔和脑子的通信不太稳定",
      "今天的线稿服务器维护中",
      "色彩模块暂时离线",
      "人物建模服务响应过慢",
      "光影系统正在更新",
      "透视模块需要重启",
      "今天的灵感 API 调用次数用完了",
      "我怕今天画出来的东西会污染明天的审美",
      "为了避免越画越丑，我决定今天先不画",
      "现在画下去可能会破坏本来不错的草稿",
      "再等等，说不定脑子里会自动优化",
      "我现在距离「有感觉」只差一点点",
      "再刷五分钟参考图就开始",
      "看完这个教程我就开始",
      "研究完这个画师的笔刷我就开始",
      "配完新的笔刷我就开始",
      "调完数位板参数我就开始",
      "找到合适的音乐我就开始",
      "吃完东西我就开始",
      "今天先保存一下状态，明天正式发挥",
    ],
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
    back: "与我合作",
  },

  lightbox: { close: "关闭", prev: "上一张", next: "下一张" },
  chips: { works: "件作品" },
};

export const fanCopy: Record<"en" | "zh", FanCopy> = { en, zh };

/** The fan page only ships in English and Chinese — NL readers get English. */
export function getFanLanguage(language: Language): "en" | "zh" {
  return language === "zh" ? "zh" : "en";
}
