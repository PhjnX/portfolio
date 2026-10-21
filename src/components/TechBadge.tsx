import { getTech, isDarkBrand } from "@/content/tech";

type Props = { name: string; size?: "sm" | "md" };

/** A technology label with its brand logo. */
export function TechBadge({ name, size = "md" }: Props) {
  const t = getTech(name);
  const icon = size === "sm" ? 13 : 15;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-fg/[0.04] font-semibold text-fg backdrop-blur-sm ${
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      }`}
    >
      {t.path && t.hex && (
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          aria-hidden
          className={`shrink-0 ${isDarkBrand(t.hex) ? "dark:!fill-fg" : ""}`}
          style={{ fill: t.hex }}
        >
          <path d={t.path} />
        </svg>
      )}
      {t.name}
    </span>
  );
}
