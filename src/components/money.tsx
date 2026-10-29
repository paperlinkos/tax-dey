const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export const formatNaira = (value: number) => naira.format(Math.round(value));

export function Naira({ value }: { value: number }) { return <>{formatNaira(value)}</>; }
