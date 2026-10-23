/**
 * Everything personal lives here. Edit this file (and projects.ts) to update the site.
 * Every visible string has an English and a Vietnamese version.
 */

export type Lang = "en" | "vi";
export type Localized = { en: string; vi: string };

export const profile = {
  /** Legal name: used where a real name matters (About, CV, metadata description). */
  name: "Bùi Hoàng Phi",
  /** What the site calls me everywhere else. */
  nickname: "Phjn Hoang",
  brand: "Phjn",
  shortName: "Phjn",
  initials: "BHP",
  avatar: "/images/avatar.jpg",
  email: "buihoangphi2003@gmail.com",
  phone: "+84 989 891 465",
  phoneHref: "tel:+84989891465",
  github: "https://github.com/PhjnX",
  githubHandle: "PhjnX",
  linkedin: "https://www.linkedin.com/in/b%C3%B9i-ho%C3%A0ng-phi-91a69b300",
  linkedinLabel: "in/bùi-hoàng-phi",
  /** CV file per site language. */
  cv: { en: "/cv-en.pdf", vi: "/cv-vi.pdf" } as Localized,
  location: { en: "Binh Tan, Ho Chi Minh City", vi: "Bình Tân, TP. Hồ Chí Minh" } as Localized,
  timeZone: "Asia/Ho_Chi_Minh",
  openToWork: true,
  siteUrl: "https://phjn.vercel.app",
};

/** The one-page sections, in scroll order. `id` doubles as the URL hash. */
export const sections = [
  { id: "intro", label: { en: "Intro", vi: "Mở đầu" } },
  { id: "about", label: { en: "About", vi: "Giới thiệu" } },
  { id: "whatido", label: { en: "What I do", vi: "Tôi làm gì" } },
  { id: "experience", label: { en: "Experience", vi: "Kinh nghiệm" } },
  { id: "work", label: { en: "Projects", vi: "Dự án" } },
  { id: "skills", label: { en: "Skills", vi: "Kỹ năng" } },
  { id: "contact", label: { en: "Contact", vi: "Liên hệ" } },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const ui = {
  intro: {
    role: { en: "Front-end Developer", vi: "Front-end Developer" },
    status: { en: "Open to work", vi: "Đang tìm việc" },
    hello: { en: "Hello, I'm", vi: "Xin chào, mình là" },
    lead: { en: "Front-end", vi: "Front-end" },
    words: ["DEVELOPER", "ENGINEER"],
    tagline: {
      en: "I build web and mobile interfaces with React, React Native and TypeScript, and customise WordPress and WooCommerce when a project needs it.",
      vi: "Tôi làm giao diện web và mobile với React, React Native và TypeScript, và tuỳ biến WordPress, WooCommerce khi dự án cần.",
    },
    ctaWork: { en: "View projects", vi: "Xem dự án" },
    ctaCv: { en: "Download CV", vi: "Tải CV" },
    scroll: { en: "Scroll", vi: "Cuộn xuống" },
  },
  about: {
    kicker: { en: "About me", vi: "Giới thiệu" },
    title: { en: "Front-end developer, about a year in", vi: "Front-end developer, khoảng một năm kinh nghiệm" },
    realName: { en: "Real name: Bùi Hoàng Phi", vi: "Tên thật: Bùi Hoàng Phi" },
    text: {
      en: "Front-end developer with about a year of experience shipping React/Next.js web apps, a React Native app on Google Play, and WooCommerce stores for German clients. Comfortable with PHP for WordPress/Elementor customisation and REST/WebSocket integration. Looking for a front-end role.",
      vi: "Lập trình viên Front-end với khoảng 1 năm kinh nghiệm phát triển web app React/Next.js, ứng dụng React Native trên Google Play và các shop WooCommerce cho khách hàng Đức. Sử dụng tốt PHP để tuỳ biến WordPress/Elementor và tích hợp REST/WebSocket. Đang tìm kiếm vị trí Front-end.",
    },
    facts: {
      education: { en: "Education", vi: "Học vấn" },
      languages: { en: "Languages", vi: "Ngôn ngữ" },
      course: { en: "Course", vi: "Khoá học" },
    },
  },
  stats: [
    { value: "~1", label: { en: "year building production apps", vi: "năm làm sản phẩm thật" } },
    { value: "2", label: { en: "EMS apps: web and mobile", vi: "app EMS: web và mobile" } },
    { value: "2", label: { en: "German WooCommerce stores", vi: "shop WooCommerce ở Đức" } },
  ],
  whatido: {
    kicker: { en: "What I do", vi: "Tôi làm gì" },
    title: { en: "Three kinds of work", vi: "Ba mảng tôi làm" },
    lead: {
      en: "Web apps, mobile apps and WordPress shops, often in the same week.",
      vi: "Web app, mobile app và shop WordPress, nhiều khi trong cùng một tuần.",
    },
  },
  experience: {
    kicker: { en: "Experience", vi: "Kinh nghiệm" },
    title: { en: "Where I have worked", vi: "Nơi tôi đã làm" },
    lead: {
      en: "About a year at Webie Vietnam: web, mobile and WordPress work.",
      vi: "Khoảng một năm ở Webie Vietnam: làm web, mobile và WordPress.",
    },
  },
  work: {
    kicker: { en: "Projects", vi: "Dự án" },
    title: { en: "Projects I worked on", vi: "Các dự án đã làm" },
    lead: {
      en: "Hover a project to see it on the monitor.",
      vi: "Rê chuột vào từng dự án để xem trên màn hình.",
    },
    personal: { en: "Personal", vi: "Cá nhân" },
    client: { en: "At Webie", vi: "Tại Webie" },
    caseStudy: { en: "Case study", vi: "Xem chi tiết" },
    more: {
      en: "More personal projects are in progress. Follow along on GitHub.",
      vi: "Đang làm thêm vài dự án cá nhân, cập nhật trên GitHub.",
    },
  },
  skills: {
    kicker: { en: "Skills", vi: "Kỹ năng" },
    title: { en: "Tools I work with", vi: "Công cụ tôi dùng" },
    lead: {
      en: "Grouped the same way as on my CV.",
      vi: "Chia nhóm giống như trong CV.",
    },
    soft: { en: "Soft skills", vi: "Kỹ năng mềm" },
  },
  contact: {
    kicker: { en: "Contact", vi: "Liên hệ" },
    title: { en: "Say hello", vi: "Liên hệ với mình" },
    text: {
      en: "Email is the fastest way to reach me. I usually reply within a day.",
      vi: "Email là cách nhanh nhất để liên lạc. Tôi thường trả lời trong vòng một ngày.",
    },
    copy: { en: "Copy", vi: "Copy" },
    copied: { en: "Copied", vi: "Đã copy" },
    phone: { en: "Phone", vi: "Điện thoại" },
    location: { en: "Location", vi: "Địa chỉ" },
  },
  caseStudy: {
    back: { en: "All projects", vi: "Tất cả dự án" },
    role: { en: "Role", vi: "Vai trò" },
    year: { en: "Period", vi: "Thời gian" },
    stack: { en: "Stack", vi: "Công nghệ" },
    problem: { en: "The problem", vi: "Vấn đề" },
    built: { en: "What I built", vi: "Tôi đã làm gì" },
    learned: { en: "What I learned", vi: "Bài học" },
    next: { en: "Next project", vi: "Dự án tiếp theo" },
  },
  footer: {
    built: { en: "Built with Next.js, three.js and Motion.", vi: "Làm bằng Next.js, three.js và Motion." },
    source: { en: "Source code", vi: "Mã nguồn" },
  },
} satisfies Record<string, unknown>;

export const experience = [
  {
    company: "Webie Vietnam",
    role: { en: "Front-end Developer", vi: "Lập trình viên Front-end" },
    period: "12/2025 – 10/2026",
    points: [
      {
        en: "Built the EMS web app and admin panel with React, Vite and Redux Toolkit, with lazy loading, code splitting and Puppeteer prerendering for SEO.",
        vi: "Xây dựng web app EMS và trang quản trị bằng React, Vite, Redux Toolkit; áp dụng lazy loading, code splitting và prerender bằng Puppeteer để tối ưu SEO.",
      },
      {
        en: "EMS Mobile (React Native/Expo, EAS Build): built the whole UI alone — QR e-tickets, QR scanning, Google sign-in — and released it through Google Play closed testing with 20 testers.",
        vi: "Ứng dụng EMS Mobile (React Native/Expo, EAS Build): tự làm toàn bộ UI — vé điện tử QR, quét QR, đăng nhập Google; phát hành closed testing trên Google Play với 20 tester.",
      },
      {
        en: "Built B2C/B2B flows for German WooCommerce stores (IT42life, Reuschenbach) and WordPress/Elementor sites (webieglobal.com), with custom PHP in WPCode and ACF/SCF fields.",
        vi: "Xây dựng luồng B2C/B2B cho các shop WooCommerce Đức (IT42life, Reuschenbach) và website WordPress/Elementor (webieglobal.com), viết PHP tuỳ chỉnh với WPCode và field ACF/SCF.",
      },
      {
        en: "Integrated REST APIs and WebSocket with the back-end team, and ran regular Lighthouse and Core Web Vitals audits on the WordPress sites.",
        vi: "Tích hợp REST API và WebSocket cùng team backend; định kỳ audit Lighthouse và Core Web Vitals cho các website WordPress.",
      },
    ],
  },
];

export const education = {
  school: { en: "Van Lang University", vi: "Đại học Văn Lang" },
  degree: {
    en: "Bachelor of IT, Software Engineering · GPA 3.16/4.0",
    vi: "Cử nhân CNTT, Công nghệ phần mềm · GPA 3.16/4.0",
  },
  period: "2021 – 2025",
};

export const course = {
  school: "Cybersoft Academy",
  name: { en: "Front-end Development", vi: "Khoá học Lập trình Front-end" },
  period: "09/2024 – 05/2025",
};

export const languages: Localized[] = [
  { en: "Vietnamese — native", vi: "Tiếng Việt — bản ngữ" },
  { en: "English — intermediate (TOEIC 615)", vi: "Tiếng Anh — trung cấp (TOEIC 615)" },
];

/** Skill groups, as on the CV. Names must match keys in content/tech.ts to get a logo. */
export const skillGroups: { title: Localized; items: string[] }[] = [
  {
    title: { en: "Front-end", vi: "Front-end" },
    items: ["React", "Next.js", "TypeScript", "JavaScript", "Redux Toolkit", "Zustand", "Tailwind CSS"],
  },
  { title: { en: "Mobile", vi: "Mobile" }, items: ["React Native", "Expo", "EAS Build"] },
  { title: { en: "WordPress", vi: "WordPress" }, items: ["WooCommerce", "Elementor", "PHP", "ACF", "PHPUnit", "PHPStan"] },
  { title: { en: "Tools", vi: "Công cụ" }, items: ["Git", "REST API", "WebSocket", "Puppeteer", "Supabase", "Figma"] },
];

export const softSkills: Localized[] = [
  { en: "Taking part in code review", vi: "Tham gia code review" },
  { en: "Reading English documentation", vi: "Đọc tài liệu tiếng Anh" },
];

/** The "What I do" cards. */
export const services: { title: Localized; text: Localized; stack: string[] }[] = [
  {
    title: { en: "Web apps", vi: "Web app" },
    text: {
      en: "Admin panels and public sites in React and Next.js: dashboards, forms, charts and bilingual content, wired to REST and WebSocket APIs.",
      vi: "Trang admin và trang public bằng React, Next.js: dashboard, form, biểu đồ, nội dung song ngữ, kết nối REST và WebSocket API.",
    },
    stack: ["React", "Next.js", "TypeScript", "Redux Toolkit", "Tailwind CSS"],
  },
  {
    title: { en: "Mobile apps", vi: "Mobile app" },
    text: {
      en: "React Native apps on Expo, from QR tickets and scanning to Google sign-in, built with EAS and shipped to Google Play.",
      vi: "App React Native trên Expo, từ vé QR, quét mã đến đăng nhập Google, build bằng EAS và phát hành lên Google Play.",
    },
    stack: ["React Native", "Expo", "EAS Build"],
  },
  {
    title: { en: "WordPress & WooCommerce", vi: "WordPress & WooCommerce" },
    text: {
      en: "Shops and company sites: B2B/B2C flows, custom fields, custom PHP, and regular Lighthouse and Core Web Vitals checks.",
      vi: "Shop và website doanh nghiệp: luồng B2B/B2C, custom field, PHP tuỳ biến, audit Lighthouse và Core Web Vitals định kỳ.",
    },
    stack: ["WordPress", "WooCommerce", "Elementor", "PHP", "ACF"],
  },
];
