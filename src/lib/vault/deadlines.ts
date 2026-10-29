import type { Segment } from "@/lib/setaside/types";

export type TaxDeadline = { label: string; date: string; needsReview: boolean };

/**
 * Upcoming deadlines for a tax year. Dates marked `needsReview` are common practice
 * that a tax adviser should confirm for the user's state and year end.
 */
export function deadlinesFor(segment: Segment, taxYear: number, chargesVat: boolean, today: Date): TaxDeadline[] {
  const list: TaxDeadline[] = segment === "company"
    ? [{ label: "Company income tax return (31 Dec year end)", date: `${taxYear + 1}-06-30`, needsReview: true }]
    : [{ label: `Personal income tax return for ${taxYear}`, date: `${taxYear + 1}-03-31`, needsReview: false }];

  if (chargesVat) {
    // VAT for each month is due on the 21st of the next month.
    const monthOffset = today.getUTCDate() <= 21 ? 0 : 1;
    const month = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 21));
    list.unshift({ label: "VAT return for last month", date: month.toISOString().slice(0, 10), needsReview: true });
  }
  return list;
}

export function daysUntil(date: string, today: Date): number {
  return Math.ceil((new Date(`${date}T00:00:00Z`).getTime() - today.getTime()) / 86_400_000);
}
