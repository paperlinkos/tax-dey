/**
 * Tax Dey mark, drawn after Nigerian resist-dyed adire cloth: eight dots (your money)
 * with one gold dot lifted out (the tax, set aside).
 *
 * The family, by job:
 * - "rings": the main logo. Detailed rings with centre points at 48px and up; bolder plain rings below that.
 * - "solid": the compact mark for app icons, stickers, receipts and anywhere under ~24px.
 * - the four-dot favicon lives in app/icon.svg.
 */
const DOTS = [[12, 12], [28, 12], [44, 12], [12, 28], [28, 28], [44, 28], [12, 44], [28, 44]];
const CENTRES = [[12, 12], [28, 28], [44, 12], [12, 44]];

type Props = { size?: number; variant?: "rings" | "solid"; main?: string; accent?: string };

export function LogoMark({ size = 32, variant = "rings", main = "var(--color-forest)", accent = "var(--color-gold)" }: Props) {
  const detailed = size >= 48;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {variant === "solid" ? (
        <g fill={main}>{DOTS.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={6.5} />)}</g>
      ) : (
        <>
          <g fill="none" stroke={main} strokeWidth={detailed ? 3.4 : 4.2}>{DOTS.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={detailed ? 5 : 4.6} />)}</g>
          {detailed && <g fill={main}>{CENTRES.map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.6} />)}</g>}
        </>
      )}
      <circle cx={51.5} cy={51.5} r={8.5} fill={accent} />
    </svg>
  );
}
