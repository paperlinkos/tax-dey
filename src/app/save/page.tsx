import { redirect } from "next/navigation";

// The old manual savings tracker is replaced by the tax vault.
export default function SavePage() {
  redirect("/vault");
}
