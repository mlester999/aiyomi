import Image from "next/image";
import Link from "next/link";

import aiyomiLogo from "../../web/public/aiyomi-logo-cropped.png";

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <Link aria-label="Aiyomi Admin home" className="brand" href="/">
      <Image
        alt=""
        className="brand-logo"
        height={52}
        priority
        src={aiyomiLogo}
        width={52}
      />
      <span>
        <strong>Aiyomi</strong>
        <small>{compact ? "Admin" : "Admin workspace"}</small>
      </span>
    </Link>
  );
}
