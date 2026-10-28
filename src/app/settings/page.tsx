import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
export default async function Settings(){const session=await auth.api.getSession({headers:await headers()});if(!session)redirect("/login");return <main className="mx-auto max-w-3xl px-5 py-14"><h1 className="text-3xl font-bold">Account settings</h1><p className="mt-4">Signed in as {session.user.email}</p><p className="mt-4 text-sm text-stone-600">Profile updates and data export are not available yet.</p></main>}
