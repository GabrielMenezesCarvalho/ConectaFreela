import Image from "next/image";
import brandMark from "@/assets/landing/cf-letra.png";
import brandWordmark from "@/assets/landing/connectafreela.png";

export function BrandLogo({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  const filter = light ? "brightness(0) invert(1)" : undefined;

  return (
    <span
      className="inline-flex items-center gap-2.5"
      role="img"
      aria-label="ConectaFreela"
    >
      <Image
        src={brandMark}
        alt=""
        className={
          compact
            ? "h-8 w-8 object-contain"
            : "h-9 w-9 object-contain sm:h-11 sm:w-11"
        }
        style={{ filter }}
        priority={!compact}
      />
      <Image
        src={brandWordmark}
        alt=""
        className={
          compact
            ? "hidden h-5 w-auto object-contain min-[400px]:block"
            : "hidden h-5 w-auto object-contain min-[360px]:block sm:h-7"
        }
        style={{ filter }}
        priority={!compact}
      />
    </span>
  );
}
