import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contributionInput } from "@/lib/savings/api";
async function own(id:string){const s=await auth.api.getSession({headers:await headers()});return s?db.savingsGoal.findFirst({where:{id,ownerId:s.user.id}}):null}
export async function GET(_:Request,{params}:{params:Promise<{goalId:string}>}){const goal=await own((await params).goalId);return goal?NextResponse.json(await db.savingsContribution.findMany({where:{goalId:goal.id},orderBy:{occurredAt:"desc"}})):NextResponse.json({error:"Not found"},{status:404})}
export async function POST(request:Request,{params}:{params:Promise<{goalId:string}>}){const goal=await own((await params).goalId);if(!goal)return NextResponse.json({error:"Not found"},{status:404});const parsed=contributionInput.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid contribution"},{status:400});return NextResponse.json(await db.savingsContribution.create({data:{...parsed.data,goalId:goal.id,source:"manual"}}),{status:201})}
