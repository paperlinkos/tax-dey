# Tax Dey: compliance review guide

For counsel, savings partners and anyone signing off how Tax Dey handles money and tax rules. It lists what to check and where each change goes, so requested changes can ship quickly.

## The operating model in one paragraph

Tax Dey is a technology and tax-estimation service. It calculates the tax inside each payment a user receives and asks the user to move that amount into a savings vault held **in the user's own name** by a licensed partner. Tax Dey never receives, holds or pools customer money, never moves money without the user's in-app confirmation, and does not market returns. The vault currently runs on a simulated "sandbox" partner. No real money moves until a partner adapter is connected.

## Questions for counsel

1. **CBN.** Is sending user-confirmed deposit instructions to a licensed partner, without holding funds, possible without a Tax Dey licence? Does the partner agreement need to name Tax Dey as an agent or technical service provider?
2. **SEC.** If the vault uses a money market fund (e.g. Cowrywise Embed), does Tax Dey's role need SEC registration (sub-broker, robo-adviser, or other), given *SEC v. Chaka Technologies*? Until answered, only savings products are enabled.
3. **Revenue share.** Can Tax Dey take a referral or balance-based fee from the partner, and what disclosure is required?
4. **Tax rules flagged for review** (shown on `/trust`):
   - Small company threshold: the app uses ₦50m turnover (sources conflict with ₦100m), with ≤ ₦250m fixed assets and professional services excluded.
   - Whether CIT has been reduced from 30% to 25% by presidential order.
   - Presumptive tax: 1% of turnover; nano exemption ≤ ₦12m with no fixed premises and no employees. The 2% charge on gross consideration is not modelled.
   - VAT at 7.5%, applied only when the user says they charge VAT.
   - Company return date (30 June for 31 Dec year end) and VAT return date (21st of the following month).
5. **Data protection.** NDPC registration, DPO appointment, privacy notice under the NDPA 2023 and GAID 2025.
6. **Wording.** All user-facing disclosures are in one place (below). Please mark up the exact text.

## Where each change goes

| Change requested | File | What to edit |
|---|---|---|
| Disclosure wording | `src/config/compliance.ts` | `disclosures` |
| Turn a feature on/off (auto-sweep, showing returns, open banking, filing handoff) | `src/config/compliance.ts` | `features` |
| Allow money market funds | `src/config/compliance.ts` | add `"money-market-fund"` to `allowedVaultProducts` |
| Record a sign-off | `src/config/compliance.ts` | add a row to `reviewLog` (shows on `/trust`) |
| Partner status, regulator, notes | `src/config/partners.ts` | the partner's entry |
| Switch the live partner | `src/config/compliance.ts` | `activePartnerId`, after adding an adapter in `src/lib/vault/partner.ts` |
| Tax rates, thresholds, legal sources | `src/lib/tax/rules.ts` | the rule object and its `review` block |
| Deadlines | `src/lib/vault/deadlines.ts` | `deadlinesFor` |

The `/trust` page is generated from these files, so it always shows what is actually configured.

## Payment gateways: fees only, never savings

**Don't use Paystack, Flutterwave or any payment gateway to collect users' tax savings.** Money paid in that way lands in **Tax Dey's** gateway balance, which means Tax Dey would be holding customer funds. That breaks the compliance model and is exactly what needs a CBN licence (MMO, about ₦5bn capital).

- Gateways are fine for **money that's Tax Dey's own**: the "Filing Ready" pack, subscriptions, partner invoices.
- Vault money moves only into an account **in the user's own name** at a licensed partner (PiggyVest Business, Cowrywise Embed, Anchor), from the user's own bank, on the user's confirmation.
- The same applies to a gateway's "dedicated virtual accounts": those accounts settle into the merchant's balance, so they count as Tax Dey holding funds.

## Connecting a real partner

1. Implement `SavingsPartnerAdapter` (`src/lib/vault/partner.ts`): `openVault`, `deposit`, `withdraw`. Every call carries an idempotency key and a record of the customer's confirmation.
2. Register it in `getPartner`, set `activePartnerId`, update the partner's `status`.
3. Partner references are stored in `vault_move`, which the app only ever appends to.

Open technical items before go-live:
- Webhook handling for asynchronous confirmations.
- Moving the partner call outside the database transaction, with an outbox or retry.
- Partner-side KYC hand-off.
