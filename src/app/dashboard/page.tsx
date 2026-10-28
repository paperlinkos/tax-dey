import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
export default async function Dashboard(){const session=await auth.api.getSession({headers:await headers()});if(!session)redirect("/login");return <main className="mx-auto max-w-4xl px-5 py-14"><div className="flex items-center justify-between gap-4"><h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1><LogoutButton/></div><section className="mt-8 rounded-xl border bg-white p-6"><h2 className="font-bold">Your Tax De workspace</h2><p className="mt-2 text-stone-600">Your account is active. Saved tax assessments and account-synced savings goals are not available yet; your anonymous plans remain only in this browser.</p></section></main>}
