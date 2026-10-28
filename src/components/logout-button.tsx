"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() { const router = useRouter(); const [busy, setBusy] = useState(false); return <button onClick={async () => { setBusy(true); const response = await fetch("/api/auth/sign-out", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }); if (response.ok) router.replace("/login"); else setBusy(false); }} disabled={busy} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold">{busy ? "Signing out…" : "Log out"}</button>; }
