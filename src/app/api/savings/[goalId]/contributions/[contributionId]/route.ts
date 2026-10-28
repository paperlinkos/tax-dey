import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contributionInput } from "@/lib/savings/api";
async function own(g:string,c:string){const s=await auth.api.getSession({headers:await headers()});return s?db.savingsContribution.findFirst({where:{id:c,goalId:g,goal:{ownerId:s.user.id}}}):null}
export async function PATCH(req:Request,{params}:{params:Promise<{goalId:string,contributionId:string}>}){const p=await params;const item=await own(p.goalId,p.contributionId);if(!item)return NextResponse.json({error:"Not found"},{status:404});const value=contributionInput.safeParse(await req.json().catch(()=>null));if(!value.success)return NextResponse.json({error:"Invalid contribution"},{status:400});return NextResponse.json(await db.savingsContribution.update({where:{id:item.id},data:value.data}))}
export async function DELETE(_:Request,{params}:{params:Promise<{goalId:string,contributionId:string}>}){const p=await params;const item=await own(p.goalId,p.contributionId);if(!item)return NextResponse.json({error:"Not found"},{status:404});await db.savingsContribution.delete({where:{id:item.id}});return new NextResponse(null,{status:204})}
