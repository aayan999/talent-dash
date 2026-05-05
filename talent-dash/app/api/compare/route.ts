import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { compareSalaries } from "@/lib/salary";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const salaryId1 = searchParams.get("salaryId1")?.trim();
  const salaryId2 = searchParams.get("salaryId2")?.trim();

  if (!salaryId1 || !salaryId2) {
    return NextResponse.json(
      { error: "salaryId1 and salaryId2 query params are required." },
      { status: 400 },
    );
  }

  if (salaryId1 === salaryId2) {
    return NextResponse.json(
      { error: "salaryId1 and salaryId2 must be different salaries." },
      { status: 400 },
    );
  }

  const [salary1, salary2] = await Promise.all([
    prisma.salary.findUnique({ where: { id: salaryId1 } }),
    prisma.salary.findUnique({ where: { id: salaryId2 } }),
  ]);

  if (!salary1 || !salary2) {
    return NextResponse.json(
      {
        error: "One or both salary records were not found.",
        missing: {
          salaryId1: !salary1,
          salaryId2: !salary2,
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    salaries: {
      salary1,
      salary2,
    },
    comparison: compareSalaries(salary1, salary2),
  });
}
