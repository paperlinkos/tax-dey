import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateGoalInput } from "@/lib/savings/api";
async function owned(id:string){const session=await auth.api.getSession({headers:await headers()});if(!session)return null;return db.savingsGoal.findFirst({where:{id,ownerId:session.user.id},include:{contributions:true,revisions:true}})}
export async function GET(_:Request,{params}:{params:Promise<{goalId:string}>}){const goal=await owned((await params).goalId);return goal?NextResponse.json(goal):NextResponse.json({error:"Not found"},{status:404})}
export async function PATCH(request:Request,{params}:{params:Promise<{goalId:string}>}){const goal=await owned((await params).goalId);if(!goal)return NextResponse.json({error:"Not found"},{status:404});const parsed=updateGoalInput.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid goal"},{status:400});const {reason,...data}=parsed.data;const updated=await db.$transaction(async tx=>{const item=await tx.savingsGoal.update({where:{id:goal.id},data});if(data.targetKobo!==undefined&&data.targetKobo!==goal.targetKobo)await tx.savingsRevision.create({data:{goalId:goal.id,previousKobo:goal.targetKobo,nextKobo:data.targetKobo,reason:reason??"Target updated"}});return item});return NextResponse.json(updated)}
export async function DELETE(_:Request,{params}:{params:Promise<{goalId:string}>}){const goal=await owned((await params).goalId);if(!goal)return NextResponse.json({error:"Not found"},{status:404});await db.savingsGoal.delete({where:{id:goal.id}});return new NextResponse(null,{status:204})}
