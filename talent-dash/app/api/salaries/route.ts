import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { buildSalaryWhere, parseSortDirection, salarySearchParams } from "@/lib/salary";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = parseSortDirection(searchParams.get("sort"));

  const salaries = await prisma.salary.findMany({
    where: buildSalaryWhere(salarySearchParams(searchParams)),
    orderBy: {
      total_compensation: sort,
    },
  });

  return NextResponse.json({ salaries });
}
