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
  nickname: "Phjn Hoàng",
  brand: "Phjn",
  shortName: "Phjn",
  initials: "BHP",
  avatar: "/images/avatar.jpg",
  email: "buihoangphi2003@gmail.com",
  phone: "(+84) 919 497 091",
  phoneHref: "tel:+84919497091",
  github: "https://github.com/PhjnX",
  githubHandle: "PhjnX",
  linkedin: "https://www.linkedin.com/in/b%C3%B9i-ho%C3%A0ng-phi-91a69b300",
  linkedinLabel: "in/bùi-hoàng-phi",
  cvUrl: "/cv.pdf",
  location: { en: "Binh Tan, Ho Chi Minh City", vi: "Bình Tân, TP. Hồ Chí Minh" } as Localized,
  timeZone: "Asia/Ho_Chi_Minh",
  openToWork: true,
  siteUrl: "https://phjnx.vercel.app",
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
    title: { en: "Front-end developer, almost a year in", vi: "Front-end developer, gần một năm kinh nghiệm" },
    realName: { en: "Real name: Bùi Hoàng Phi", vi: "Tên thật: Bùi Hoàng Phi" },
    text: {
      en: "Front-end developer with nearly a year of experience building web and mobile apps with React, React Native and TypeScript. I work closely with back-end teams on REST and WebSocket APIs, and I customise WordPress and WooCommerce with PHP. Next I want to grow into a full-stack role, and I am currently learning .NET and software architecture.",
      vi: "Front-end developer với gần 1 năm kinh nghiệm làm web và mobile app bằng React, React Native và TypeScript. Tôi làm việc sát với team back-end để tích hợp REST và WebSocket API, và tuỳ biến WordPress, WooCommerce bằng PHP. Mục tiêu tiếp theo là trở thành full-stack, hiện tôi đang học .NET và kiến trúc phần mềm.",
    },
    facts: {
      education: { en: "Education", vi: "Học vấn" },
      languages: { en: "Languages", vi: "Ngôn ngữ" },
      certs: { en: "Certifications", vi: "Chứng chỉ" },
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
      en: "Almost a year at Webie Vietnam, after an internship at TechX.",
      vi: "Gần một năm ở Webie Vietnam, trước đó thực tập ở TechX.",
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
      en: "What I use every day, and a few things I am learning.",
      vi: "Những thứ tôi dùng hằng ngày, và vài thứ đang học.",
    },
    learning: { en: "Learning now", vi: "Đang học" },
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
    role: { en: "Front-end Developer", vi: "Front-end Developer" },
    period: "12/2025 – 10/2026",
    points: [
      {
        en: "Built the UI of the EMS web and mobile apps with React, React Native and TypeScript, with state in Redux Toolkit.",
        vi: "Làm UI cho web app và mobile app EMS bằng React, React Native và TypeScript, quản lý state bằng Redux Toolkit.",
      },
      {
        en: "Agreed API contracts with the back-end team and integrated REST APIs and WebSocket.",
        vi: "Thống nhất API contract với team back-end, tích hợp REST API và WebSocket.",
      },
      {
        en: "Responsive layouts in Tailwind CSS; faster Vite builds with route lazy-loading and code splitting.",
        vi: "Dựng layout responsive bằng Tailwind CSS; tối ưu build Vite với lazy-load route và code splitting.",
      },
      {
        en: "Prerendered public pages with Puppeteer for better SEO and first load.",
        vi: "Prerender các trang public bằng Puppeteer để cải thiện SEO và tốc độ tải đầu.",
      },
      {
        en: "Regular audits of company and client sites (performance, 404s, broken links) and coordinated the fixes.",
        vi: "Kiểm tra định kỳ website công ty và khách hàng (hiệu năng, lỗi 404, link hỏng) và điều phối việc sửa.",
      },
      {
        en: "Maintained WooCommerce stores for German clients (IT42life, Reuschenbach) and WordPress/Elementor sites, with custom PHP in WPCode.",
        vi: "Bảo trì shop WooCommerce cho khách hàng Đức (IT42life, Reuschenbach) và các site WordPress/Elementor, viết PHP tuỳ biến bằng WPCode.",
      },
    ],
  },
  {
    company: "TechX Technology",
    role: { en: "Front-end Intern", vi: "Thực tập sinh Front-end" },
    period: "09/2024 – 12/2024",
    points: [
      {
        en: "Built profile pages with HTML and CSS; studied for Japanese IT certifications.",
        vi: "Làm các trang profile bằng HTML và CSS; học các chứng chỉ IT Nhật Bản.",
      },
    ],
  },
];

export const education = {
  school: { en: "Van Lang University", vi: "Đại học Văn Lang" },
  degree: {
    en: "Bachelor of IT, Software Engineering · GPA 3.16/4.0",
    vi: "Cử nhân CNTT, Công nghệ Phần mềm · GPA 3.16/4.0",
  },
  period: "2021 – 2025",
};

export const languages: Localized[] = [
  { en: "Vietnamese (native)", vi: "Tiếng Việt (bản ngữ)" },
  { en: "English (intermediate)", vi: "Tiếng Anh (trung cấp)" },
];

export const certifications = [
  { name: "TOEIC 615 / 990", date: "10/2025" },
  { name: "Front-end Development · Cybersoft", date: "09/2024 – 05/2025" },
];

/** Skill groups, as on the CV. Names must match keys in content/tech.ts to get a logo. */
export const skillGroups: { title: Localized; items: string[] }[] = [
  { title: { en: "Languages", vi: "Ngôn ngữ" }, items: ["JavaScript", "TypeScript", "HTML5", "CSS", "SCSS"] },
  { title: { en: "Front-end", vi: "Front-end" }, items: ["React", "Next.js", "Redux Toolkit", "Tailwind CSS"] },
  { title: { en: "Mobile", vi: "Mobile" }, items: ["React Native", "Expo", "NativeWind", "EAS Build"] },
  { title: { en: "CMS", vi: "CMS" }, items: ["WordPress", "WooCommerce", "Elementor", "ACF/SCF", "WPCode"] },
  {
    title: { en: "Performance & SEO", vi: "Hiệu năng & SEO" },
    items: ["Lighthouse", "PageSpeed", "Puppeteer", "Lazy loading"],
  },
  { title: { en: "Tools", vi: "Công cụ" }, items: ["Git", "GitHub", "GitLab", "Docker", "Vercel", "Postman", "Figma"] },
];

export const learning = ["Angular", "Jest", "React Testing Library", ".NET"];

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
    stack: ["React Native", "Expo", "NativeWind", "EAS Build"],
  },
  {
    title: { en: "WordPress & WooCommerce", vi: "WordPress & WooCommerce" },
    text: {
      en: "Shops and company sites: B2B/B2C flows, custom fields, custom PHP and regular performance and SEO checks.",
      vi: "Shop và website doanh nghiệp: luồng B2B/B2C, custom field, PHP tuỳ biến, kiểm tra hiệu năng và SEO định kỳ.",
    },
    stack: ["WordPress", "WooCommerce", "Elementor", "PHP", "Lighthouse"],
  },
];
