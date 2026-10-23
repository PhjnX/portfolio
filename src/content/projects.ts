import type { Localized } from "./site";

export type ProjectLink = { label: Localized; href: string };

export type Project = {
  slug: string;
  title: string;
  kind: "personal" | "client";
  /** Plain text, or per language when it contains words (e.g. "now" / "nay"). */
  period: string | Localized;
  /** Which illustration ProjectVisual draws on the case study page. */
  visual: "vietqr" | "ems" | "woo" | "coffee";
  /** What the 3D scene shows while this project is selected. */
  screen: "dashboard" | "phone" | "shop" | "checkout" | "coffee";
  /** Accent colour used by the case study page and the 3D lights. */
  accent: string;
  summary: Localized;
  role: Localized;
  stack: string[];
  links: ProjectLink[];
  problem: Localized;
  built: Localized[];
  learned: Localized;
};

export const projects: Project[] = [
  {
    slug: "webie-ems-web",
    title: "Webie EMS · Web",
    kind: "client",
    period: "12/2025 – 02/2026",
    visual: "ems",
    screen: "dashboard",
    accent: "#8c7bff",
    summary: {
      en: "Event management web app: a bilingual public site for events, registration and news, plus an admin panel with charts, Excel export, a news editor and maps.",
      vi: "Web app quản lý sự kiện: trang public song ngữ cho sự kiện, đăng ký và tin tức, cùng trang admin có biểu đồ, xuất Excel, soạn tin và bản đồ.",
    },
    role: { en: "Front-end developer", vi: "Front-end developer" },
    stack: ["React 18", "TypeScript", "Vite", "Redux Toolkit", "Tailwind CSS"],
    links: [{ label: { en: "Live site", vi: "Xem trang thật" }, href: "https://ems.webie.com.vn/" }],
    problem: {
      en: "The company needed one place to publish events and take registrations, and a back office for the team to manage events, guests and news, in Vietnamese and English.",
      vi: "Công ty cần một nơi để đăng sự kiện và nhận đăng ký, cùng một trang quản trị để đội vận hành quản lý sự kiện, khách mời và tin tức, bằng cả tiếng Việt và tiếng Anh.",
    },
    built: [
      {
        en: "The public site: event listings, registration forms and news, in VI and EN.",
        vi: "Trang public: danh sách sự kiện, form đăng ký và tin tức, song ngữ Việt – Anh.",
      },
      {
        en: "The admin panel: dashboard charts, Excel export, a news editor and maps.",
        vi: "Trang admin: biểu đồ dashboard, xuất Excel, trình soạn tin và bản đồ.",
      },
      {
        en: "API contracts agreed with the back-end team; REST APIs and WebSocket integrated in Redux Toolkit.",
        vi: "Thống nhất API contract với team back-end; tích hợp REST API và WebSocket qua Redux Toolkit.",
      },
      {
        en: "Route lazy-loading and code splitting in Vite, and Puppeteer prerendering of public pages for SEO and a faster first load.",
        vi: "Lazy-load route và code splitting bằng Vite, prerender trang public bằng Puppeteer để tốt cho SEO và tải đầu nhanh hơn.",
      },
    ],
    learned: {
      en: "Agreeing the API shape with the back end before building screens saved more time than any front-end optimisation.",
      vi: "Thống nhất cấu trúc API với back-end trước khi dựng màn hình tiết kiệm thời gian hơn mọi tối ưu phía front-end.",
    },
  },
  {
    slug: "webie-ems-mobile",
    title: "Webie EMS · Mobile",
    kind: "client",
    period: "03/2026 – 06/2026",
    visual: "ems",
    screen: "phone",
    accent: "#4fd1e8",
    summary: {
      en: "The mobile app for event guests and staff: QR e-tickets, QR scanning at the door, Google sign-in, and photo and news downloads.",
      vi: "App mobile cho khách và nhân sự sự kiện: vé điện tử QR, quét QR tại cổng, đăng nhập Google, tải ảnh và tin tức.",
    },
    role: { en: "Front-end developer", vi: "Front-end developer" },
    stack: ["React Native", "Expo", "TypeScript", "Redux Toolkit", "EAS Build"],
    links: [{ label: { en: "Demo video", vi: "Video demo" }, href: "https://youtu.be/Uz_h0ZTjmBU" }],
    problem: {
      en: "Guests needed their ticket on their phone, and staff needed a fast way to check people in at the venue.",
      vi: "Khách cần có vé ngay trên điện thoại, còn nhân sự cần cách check-in nhanh tại địa điểm tổ chức.",
    },
    built: [
      {
        en: "QR e-tickets for guests and a QR scanner for staff at the door.",
        vi: "Vé điện tử QR cho khách và màn hình quét QR cho nhân sự tại cổng.",
      },
      {
        en: "Google sign-in, plus photo and news downloads after the event.",
        vi: "Đăng nhập bằng Google, tải ảnh và tin tức sau sự kiện.",
      },
      {
        en: "Built in the cloud with EAS Build and released through Google Play closed testing with 20 testers.",
        vi: "Build trên cloud bằng EAS Build và phát hành closed testing trên Google Play với 20 tester.",
      },
    ],
    learned: {
      en: "Building the same product for web and mobile taught me to keep business logic out of components so both apps share it.",
      vi: "Làm cùng một sản phẩm cho web và mobile giúp tôi học cách tách logic nghiệp vụ khỏi component để hai app dùng chung.",
    },
  },
  {
    slug: "german-woocommerce",
    title: "German WooCommerce stores",
    kind: "client",
    period: "2026",
    visual: "woo",
    screen: "shop",
    accent: "#ff9a5c",
    summary: {
      en: "IT42life and Reuschenbach: B2C and B2B shopping flows with business account approval, custom PHP logic and product content structured with custom fields.",
      vi: "IT42life và Reuschenbach: luồng mua hàng B2C và B2B có duyệt tài khoản doanh nghiệp, logic PHP tuỳ biến và nội dung sản phẩm có cấu trúc bằng custom field.",
    },
    role: { en: "WooCommerce developer", vi: "WooCommerce developer" },
    stack: ["WordPress", "WooCommerce", "PHP", "WPCode", "ACF/SCF"],
    links: [],
    problem: {
      en: "Both shops sell in German to consumers and businesses. Business customers need an approved account before they see their prices, and every change has to ship without breaking orders on a live store.",
      vi: "Cả hai shop bán bằng tiếng Đức cho khách lẻ và doanh nghiệp. Khách doanh nghiệp cần được duyệt tài khoản trước khi thấy giá của họ, và mọi thay đổi phải lên production mà không làm hỏng đơn hàng.",
    },
    built: [
      {
        en: "B2C and B2B flows with business account approval.",
        vi: "Luồng B2C và B2B có bước duyệt tài khoản doanh nghiệp.",
      },
      {
        en: "Custom PHP logic through WPCode, kept small and easy to roll back.",
        vi: "Logic PHP tuỳ biến qua WPCode, giữ nhỏ gọn và dễ rollback.",
      },
      {
        en: "Product content structured with ACF/SCF custom fields instead of long free-text descriptions.",
        vi: "Nội dung sản phẩm có cấu trúc bằng custom field ACF/SCF thay vì mô tả dài tự do.",
      },
    ],
    learned: {
      en: "On a live shop the safest change is the smallest one that can be rolled back, so I read the existing code before adding mine.",
      vi: "Với shop đang bán, thay đổi an toàn nhất là thay đổi nhỏ nhất và rollback được, nên tôi luôn đọc kỹ code cũ trước khi thêm code của mình.",
    },
  },
  {
    slug: "phjn-coffee",
    title: "Phjn Coffee",
    kind: "personal",
    period: { en: "10/2026 – now", vi: "10/2026 – nay" },
    visual: "coffee",
    screen: "coffee",
    accent: "#c9a25a",
    summary: {
      en: "Ordering site for a fictional Saigon café: guests scan the QR code on their table to order, and the counter runs orders, menu and tables from an admin dashboard.",
      vi: "Website gọi món cho một quán cà phê (giả lập) ở Sài Gòn: khách quét mã QR trên bàn để gọi món, quầy quản lý đơn, thực đơn và bàn qua trang admin.",
    },
    role: { en: "Side project: design and full-stack build", vi: "Dự án cá nhân: thiết kế và làm full-stack" },
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Zustand", "Vitest"],
    links: [
      { label: { en: "Live site", vi: "Xem trang thật" }, href: "https://phjn-coffee.vercel.app" },
      { label: { en: "Source", vi: "Mã nguồn" }, href: "https://github.com/PhjnX/phjn-coffee" },
    ],
    problem: {
      en: "A café menu where every category needs different choices: coffee has milk and extra shots, milk tea has toppings, juice has sweetness, pastries can be warmed. Orders have to reach the counter fast, and the price must be impossible to change from the browser.",
      vi: "Thực đơn quán cà phê mà mỗi loại món cần lựa chọn khác nhau: cà phê có loại sữa và thêm shot, trà sữa có topping, nước ép chọn độ ngọt, bánh có thể hâm nóng. Đơn phải đến quầy nhanh, và giá không thể bị sửa từ trình duyệt.",
    },
    built: [
      {
        en: "One option system for every kind of item: groups like Size, Sugar or Topping are data (single or multi choice, required or not, with a limit), so a new drink is a data change, not new code.",
        vi: "Một hệ thống tuỳ chọn cho mọi loại món: các nhóm như Size, Mức đường, Topping là dữ liệu (chọn một hoặc nhiều, bắt buộc hay không, có giới hạn), nên thêm món mới chỉ là thêm dữ liệu, không phải viết code.",
      },
      {
        en: "Ordering by table QR code: each code opens the menu for that table; the public site is browse-only. Checkout re-prices every line on the server with the same pricing function, covered by Vitest tests.",
        vi: "Gọi món bằng QR tại bàn: mỗi mã mở thực đơn của đúng bàn đó, còn website công khai chỉ để xem. Lúc thanh toán, server tính lại giá từng món bằng cùng hàm tính giá, có test bằng Vitest.",
      },
      {
        en: "Admin dashboard: today's revenue and best sellers, an order board that shows new orders within 5 seconds, a per-table view to settle bills, a menu editor with photo upload, and printable table QR cards.",
        vi: "Trang admin: doanh thu và món bán chạy trong ngày, bảng đơn hiện đơn mới trong vòng 5 giây, xem theo bàn để tính tiền, sửa thực đơn kèm upload ảnh, và in thẻ QR cho từng bàn.",
      },
      {
        en: "Supabase (Postgres and Storage) in production with a JSON-file fallback for local work, behind one store interface; rate limits, security headers and SEO basics built in.",
        vi: "Supabase (Postgres và Storage) khi chạy thật, file JSON khi chạy trên máy, cùng một lớp lưu trữ chung; có giới hạn request, security header và SEO cơ bản.",
      },
    ],
    learned: {
      en: "Treating product options as data instead of per-category forms kept the UI, the cart and the server price check in agreement, and made the menu easy to grow.",
      vi: "Coi tuỳ chọn món là dữ liệu thay vì làm form riêng cho từng loại giúp giao diện, giỏ hàng và phần kiểm tra giá ở server luôn khớp nhau, và thực đơn dễ mở rộng.",
    },
  },
  {
    slug: "vietqr-checkout",
    title: "VietQR Checkout",
    kind: "personal",
    period: { en: "10/2026 – now", vi: "10/2026 – nay" },
    visual: "vietqr",
    screen: "checkout",
    accent: "#2fd28b",
    summary: {
      en: "A WooCommerce payment gateway: it shows a VietQR code with the amount and order code pre-filled, and marks the order as paid when the SePay webhook reports the transfer.",
      vi: "Cổng thanh toán cho WooCommerce: hiển thị mã VietQR điền sẵn số tiền và mã đơn, tự chuyển đơn sang đã thanh toán khi webhook SePay báo tiền về.",
    },
    role: { en: "Side project", vi: "Dự án cá nhân" },
    stack: ["PHP", "WooCommerce", "SePay webhook", "PHPUnit", "PHPStan"],
    links: [
      {
        label: { en: "Live demo", vi: "Demo trực tiếp" },
        href: "https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/PhjnX/vietqr-checkout/main/blueprint.json",
      },
      { label: { en: "Source", vi: "Mã nguồn" }, href: "https://github.com/PhjnX/vietqr-checkout" },
    ],
    problem: {
      en: "Small shops in Vietnam get paid by bank transfer and match each transfer to an order by hand. Customers mistype the amount or the note, and orders wait.",
      vi: "Shop nhỏ ở Việt Nam nhận tiền qua chuyển khoản và phải dò từng giao dịch với đơn hàng bằng tay. Khách gõ sai số tiền hoặc nội dung, đơn phải chờ.",
    },
    built: [
      {
        en: "A VietQR code with the amount and order code pre-filled, so the transfer matches the order without typing.",
        vi: "Mã VietQR điền sẵn số tiền và mã đơn, khách chuyển khoản là khớp đơn mà không phải gõ tay.",
      },
      {
        en: "A SePay webhook handler that marks the order as paid, ignores duplicate calls and handles partial and overpayments; unpaid orders are cancelled automatically.",
        vi: "Xử lý webhook SePay: chuyển đơn sang đã thanh toán, bỏ qua webhook trùng, xử lý thanh toán thiếu/thừa; đơn chưa thanh toán tự huỷ.",
      },
      {
        en: "Works with the WooCommerce Checkout block and HPOS order storage.",
        vi: "Hỗ trợ Checkout block và HPOS của WooCommerce.",
      },
      {
        en: "Tested with PHPUnit and PHPStan, with a live demo shop running in WordPress Playground.",
        vi: "Kiểm thử bằng PHPUnit và PHPStan; có bản demo chạy trên WordPress Playground.",
      },
    ],
    learned: {
      en: "Anything coming from outside can arrive twice or late, so the webhook handler has to be safe to run again.",
      vi: "Mọi request từ bên ngoài đều có thể đến hai lần hoặc đến trễ, nên phần xử lý webhook phải chạy lại được mà không sai.",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
