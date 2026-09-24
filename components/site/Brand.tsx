import Image from "next/image";
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Kemma Technologies home">
      <span className="brand-lockup" aria-hidden="true">
        <Image
          className="brand-full-color"
          src="/design/kemma-original.png"
          width={581}
          height={467}
          alt=""
          sizes="108px"
        />
        <Image
          className="brand-light-wordmark"
          src="/design/kemma-graphite.png"
          width={581}
          height={467}
          alt=""
          sizes="108px"
        />
      </span>
    </Link>
  );
}
