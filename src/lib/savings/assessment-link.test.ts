import { describe, expect, it } from "vitest";
import { goalFromAssessment, taxEstimateChanged } from "./assessment-link";
import type { StoredAssessment } from "@/lib/filing/types";
const assessment: StoredAssessment={version:1,category:"salary",createdAt:"2026-01-01",calculationStatus:"estimate-available",grossIncome:1,deductions:0,tax:30000,credits:0,balance:30000,flags:[],language:"en"};
describe("assessment savings link",()=>{it("creates an estimated target only from supported assessment",()=>expect(goalFromAssessment(assessment,"2027-01-01","monthly").target).toBe(30000));it("marks review assessment provisional",()=>expect(goalFromAssessment({...assessment,calculationStatus:"professional-review-required",tax:null},"2027-01-01","weekly").provisional).toBe(true));it("requires explicit update when estimate changes",()=>expect(taxEstimateChanged(goalFromAssessment(assessment,"2027-01-01","monthly"),40000)?.changed).toBe(true))});
