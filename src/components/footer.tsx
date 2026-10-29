import Link from "next/link";
import { compliance } from "@/config/compliance";
import { LogoMark } from "./logo-mark";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 text-sm text-muted sm:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold text-ink"><LogoMark size={28} />Tax Dey</p>
          <p className="mt-2 max-w-md leading-6">{compliance.disclosures.custody}</p>
          <p className="mt-2 max-w-md leading-6">{compliance.disclosures.estimate}</p>
        </div>
        <nav aria-label="Product" className="grid content-start gap-2">
          <Link href="/vault">Tax vault</Link>
          <Link href="/calculate">Tax calculator</Link>
          <Link href="/filing">Filing checklist</Link>
          <Link href="/learn">Learn</Link>
        </nav>
        <nav aria-label="Company" className="grid content-start gap-2">
          <Link href="/trust">How your money is held</Link>
          <Link href="/partners">For partners</Link>
        </nav>
      </div>
    </footer>
  );
}
