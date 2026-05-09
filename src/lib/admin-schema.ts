/* Schema definition for the admin Site Content / Pages editor */

export type FieldSpec = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "list";
  hint?: string;
  itemFields?: FieldSpec[]; // for list of objects; omit for list of strings
};

export type ContentGroupSpec = {
  group: string;
  key: string;
  label: string;
  hint?: string;
  defaults: Record<string, any>;
  fields: FieldSpec[];
};

const cardItemFields: FieldSpec[] = [
  { key: "icon", label: "Icon (emoji)", type: "text" },
  { key: "module", label: "Module", type: "text" },
  { key: "title", label: "Title", type: "text" },
  { key: "body", label: "Body", type: "textarea" },
];

const articleItemFields: FieldSpec[] = [
  { key: "tag", label: "Tag", type: "text" },
  { key: "title", label: "Title", type: "text" },
  { key: "excerpt", label: "Excerpt", type: "textarea" },
  { key: "image_url", label: "Image", type: "image" },
];

const statItemFields: FieldSpec[] = [
  { key: "num", label: "Number", type: "text" },
  { key: "label", label: "Label", type: "text" },
];

const reviewItemFields: FieldSpec[] = [
  { key: "name", label: "Name", type: "text" },
  { key: "loc", label: "Location", type: "text" },
  { key: "text", label: "Quote", type: "textarea" },
];

const trustItemFields: FieldSpec[] = [
  { key: "value", label: "Headline", type: "text" },
  { key: "label", label: "Subtext", type: "text" },
];

export const CONTENT_SCHEMA: ContentGroupSpec[] = [
  {
    group: "home",
    key: "hero",
    label: "Hero 横幅",
    defaults: {
      title_line1: "BUILT FOR THE",
      title_line2: "72 HOURS THAT MATTER",
      subtitle: "Professional-grade modular tools. Carry confidence, not clutter.",
      cta: "Shop the Kit",
      cta_to: "/shop-the-kit",
      image_url: "",
    },
    fields: [
      { key: "image_url", label: "背景图（留空=用代码默认图）", type: "image" },
      { key: "title_line1", label: "标题第 1 行", type: "text" },
      { key: "title_line2", label: "标题第 2 行", type: "text" },
      { key: "subtitle", label: "副标题", type: "textarea" },
      { key: "cta", label: "CTA 按钮文字", type: "text" },
      { key: "cta_to", label: "CTA 链接", type: "text" },
    ],
  },
  {
    group: "home",
    key: "marquee",
    label: "滚动横条",
    defaults: { items: ["3 Tools · 1 System", "Ships Within 48h", "2-Year Guarantee", "Gift-Ready Packaging", "Free Shipping Over $100"] },
    fields: [
      { key: "items", label: "条目（每个一行）", type: "list" },
    ],
  },
  {
    group: "home",
    key: "problem",
    label: "Why It Matters（深色区块）",
    defaults: {
      kicker: "Why it matters",
      title: "Why carry three separate tools\nwhen one decision covers everything?",
      body: "Most people have a wrench in the garage,\na knife in a drawer, and *nothing in their bag.*\n\nThat gap between home and wherever you actually are\nis exactly what Survival72 fills.",
    },
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "title", label: "标题", type: "textarea", hint: "用换行控制断行" },
      { key: "body", label: "正文", type: "textarea", hint: "*斜体* 包裹的部分会斜体显示" },
    ],
  },
  {
    group: "home",
    key: "system",
    label: "Modular System 区块",
    defaults: {
      kicker: "The System",
      title: "Three Modules. One System.",
      subtitle: "Buy what you need. Add as you grow. Built to work alone — engineered to work together.",
      cards: [
        { icon: "🔧", module: "Module 01", title: "Precision Pliers", body: "7.2-inch cold-forged steel..." },
        { icon: "🔩", module: "Module 02", title: "Roadside Wrench", body: "Optimized for vehicle..." },
        { icon: "🪓", module: "Module 03", title: "Breacher Axe", body: "Short-handle emergency axe..." },
      ],
      gift_image_url: "",
      gift_tag: "The Ultimate Gift",
      gift_title: "The Unboxing Experience",
      gift_body: "Premium packaging engineered to feel as decisive as the tools inside.",
      gift_bullets: [
        "**Premium Packaging:** 2mm weighted gray-board box.",
        "**Protection:** EVA foam lined with black suede.",
        "**Education:** 24-page Survival72™ Field Guide.",
      ],
    },
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "title", label: "标题", type: "text" },
      { key: "subtitle", label: "副标题", type: "textarea" },
      { key: "cards", label: "三张卡片", type: "list", itemFields: cardItemFields },
      { key: "gift_image_url", label: "礼盒图片", type: "image" },
      { key: "gift_tag", label: "礼盒小标签", type: "text" },
      { key: "gift_title", label: "礼盒标题", type: "text" },
      { key: "gift_body", label: "礼盒正文", type: "textarea" },
      { key: "gift_bullets", label: "礼盒清单（**加粗** 支持）", type: "list" },
    ],
  },
  {
    group: "home",
    key: "edu",
    label: "Field Guide 文章",
    defaults: {
      kicker: "Field Guide",
      title: "Read Before You Carry",
      subtitle: "Short guides. No filler.",
      articles: [],
      cta_text: "Explore all Field Guide articles →",
      cta_href: "/blogs/field-guide",
    },
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "title", label: "标题", type: "text" },
      { key: "subtitle", label: "副标题", type: "textarea" },
      { key: "articles", label: "文章卡片", type: "list", itemFields: articleItemFields },
      { key: "cta_text", label: "CTA 文字", type: "text" },
      { key: "cta_href", label: "CTA 链接", type: "text" },
    ],
  },
  {
    group: "home",
    key: "proof",
    label: "Social Proof（数据 + 评论）",
    defaults: {
      kicker: "Social Proof",
      title: "Used Daily. Recommended Often.",
      stats: [],
      reviews: [],
    },
    fields: [
      { key: "kicker", label: "Kicker", type: "text" },
      { key: "title", label: "标题", type: "text" },
      { key: "stats", label: "统计数据", type: "list", itemFields: statItemFields },
      { key: "reviews", label: "首页评论", type: "list", itemFields: reviewItemFields },
    ],
  },
  {
    group: "home",
    key: "promise",
    label: "Trust Bar",
    defaults: { items: [] },
    fields: [
      { key: "items", label: "信任承诺条目", type: "list", itemFields: trustItemFields },
    ],
  },
  {
    group: "site",
    key: "footer",
    label: "页脚",
    defaults: {
      brand: "SURVIVAL72",
      about: "Built for the 72 hours that matter.",
      copyright: "© 2024 Survival72™. All rights reserved.",
      region: "GCC · COD · AED",
    },
    fields: [
      { key: "brand", label: "品牌名", type: "text" },
      { key: "about", label: "简介", type: "textarea" },
      { key: "copyright", label: "版权", type: "text" },
      { key: "region", label: "右下角文字", type: "text" },
    ],
  },
];

export const PAGE_SLUGS = [
  { slug: "about", label: "About 页面", defaults: { kicker: "Survival72", title: "About Survival72", intro: "", body_md: "" } },
  { slug: "wholesale", label: "Wholesale 页面", defaults: { kicker: "Survival72", title: "Wholesale & Custom", intro: "", body_md: "" } },
  { slug: "contact", label: "Contact 页面", defaults: { kicker: "Survival72", title: "Contact", intro: "", body_md: "" } },
  { slug: "return-policy", label: "Return Policy 页面", defaults: { kicker: "Survival72", title: "Return Policy", intro: "", body_md: "" } },
  { slug: "our-promise", label: "Our Promise 页面", defaults: { kicker: "Survival72", title: "Our Promise", intro: "", body_md: "" } },
  { slug: "corporate-partnerships", label: "Corporate 页面", defaults: { kicker: "Survival72", title: "Corporate & Bespoke", intro: "", body_md: "" } },
];
