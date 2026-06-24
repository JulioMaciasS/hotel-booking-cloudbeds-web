type Variant = "hill" | "valley" | "wave";

/** Three distinct soft curves so adjacent dividers don't all look identical. */
const PATHS: Record<Variant, string> = {
  hill: "M0,38 C402,4 1038,4 1440,38 L1440,56 L0,56 Z",
  valley: "M0,16 C402,52 1038,52 1440,16 L1440,56 L0,56 Z",
  wave: "M0,22 C480,54 960,2 1440,30 L1440,56 L0,56 Z",
};

type SectionDividerProps = {
  /** Background of the section ABOVE the divider (fills the area over the curve). */
  topColor: string;
  /** Background of the section BELOW the divider (the curve's fill). */
  bottomColor: string;
  /** Which curve shape to draw — alternate these between adjacent dividers. */
  variant?: Variant;
  className?: string;
};

/**
 * Static-SVG soft curve that softens the seam between two sections — a calm,
 * organic shape that suits the Patagonian aesthetic. It carries BOTH adjacent
 * colors (wrapper background = the section above, path fill = the section
 * below), so it can sit between two sections regardless of their padding and
 * always blends. No animation and no blur → zero runtime / Core-Web-Vitals cost.
 *
 * Place it between two solid-colored sections, varying `variant` so the page
 * doesn't repeat one shape:
 *   </section>
 *   <SectionDivider topColor="#ffffff" bottomColor="#1f2b27" variant="wave" />
 *   <section className="bg-[#1f2b27]">
 */
export function SectionDivider({
  topColor,
  bottomColor,
  variant = "hill",
  className = "",
}: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={`-mt-px ${className}`}
      style={{ backgroundColor: topColor }}
    >
      <svg
        className="block h-[34px] w-full sm:h-[56px]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 56"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={PATHS[variant]} fill={bottomColor} />
      </svg>
    </div>
  );
}
