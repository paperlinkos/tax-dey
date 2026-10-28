import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goalInput } from "@/lib/savings/api";
async function user(){const session=await auth.api.getSession({headers:await headers()});return session?.user}
export async function GET(){const current=await user();if(!current)return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json(await db.savingsGoal.findMany({where:{ownerId:current.id},include:{contributions:true,revisions:true},orderBy:{updatedAt:"desc"}}))}
export async function POST(request:Request){const current=await user();if(!current)return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=goalInput.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid goal"},{status:400});const data=parsed.data;return NextResponse.json(await db.savingsGoal.create({data:{...data,ownerId:current.id,provisional:false}}),{status:201})}
