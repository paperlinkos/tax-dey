import type { Provider, ProviderCapability } from "./types";
const awaiting = Object.fromEntries(["accountLinking", "onboarding", "goalSupport", "balance", "transactions", "scheduledContributions", "withdrawals", "webhooks"].map((key) => [key, "awaiting-verification"])) as Record<ProviderCapability, "awaiting-verification">;
export const providers: Provider[] = ["PiggyVest Business", "Wema Bank / ALAT", "Halo Invest"].map((name) => ({ id: name.toLowerCase().replace(/[^a-z]+/g, "-"), name, capabilities: awaiting }));
