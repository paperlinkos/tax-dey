import type { VaultProductType } from "./compliance";

/**
 * Candidate savings partners. Each one is a licensed institution that would hold the
 * customer's tax vault in the customer's name. Update `status` and `notes` as talks progress.
 */
export type PartnerStatus = "sandbox" | "prospect" | "in-discussion" | "contract-signed" | "live";

export type PartnerProfile = {
  id: string;
  name: string;
  regulator: string;
  licence: string;
  product: VaultProductType;
  status: PartnerStatus;
  apiDocs?: string;
  capabilities: string[];
  notes: string;
};

export const partners: PartnerProfile[] = [
  {
    id: "sandbox",
    name: "Tax Dey Sandbox",
    regulator: "None (simulation)",
    licence: "Not applicable",
    product: "savings-deposit",
    status: "sandbox",
    capabilities: ["open vault", "move money in", "balance", "withdraw"],
    notes: "Simulated partner used for demos and development. No real money.",
  },
  {
    id: "piggyvest-business",
    name: "PiggyVest Business",
    regulator: "Partner bank / CBN (confirm in contract)",
    licence: "To be confirmed with partner",
    product: "savings-deposit",
    status: "prospect",
    apiDocs: "https://www.piggyvest.business/docs",
    capabilities: ["customer wallets", "accrued interest", "reserved account numbers", "scheduled payments", "transfers"],
    notes: "Closest fit to a tax vault: per-customer wallets with funding account numbers and schedules.",
  },
  {
    id: "cowrywise-embed",
    name: "Cowrywise Embed",
    regulator: "SEC Nigeria",
    licence: "Fund/portfolio manager",
    product: "money-market-fund",
    status: "prospect",
    apiDocs: "https://developers.cowrywise.com/",
    capabilities: ["onboarding and KYC", "locked savings", "flexible savings", "naira money market funds"],
    notes: "Investment products engage SEC rules. Use the savings products first; funds only after counsel review. Early access required.",
  },
  {
    id: "anchor",
    name: "Anchor (BaaS)",
    regulator: "CBN, through partner banks",
    licence: "Partner bank licence",
    product: "savings-deposit",
    status: "prospect",
    apiDocs: "https://getanchor.co/developers.html",
    capabilities: ["savings deposit accounts", "sub-accounts", "virtual account numbers", "transfers"],
    notes: "Most control (real account number per user) but more build and compliance work.",
  },
];

export const partnerById = (id: string) => partners.find((partner) => partner.id === id);
