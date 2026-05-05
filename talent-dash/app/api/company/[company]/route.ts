import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  calculateLevelDistribution,
  calculateMedianTotalCompensation,
  normalizeCompany,
} from "@/lib/salary";

type RouteContext = {
  params: Promise<{
    company: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { company: companyParam } = await params;
  const company = normalizeCompany(decodeURIComponent(companyParam));

  if (!company) {
    return NextResponse.json({ error: "company is required." }, { status: 400 });
  }

  const salaries = await prisma.salary.findMany({
    where: {
      company,
    },
    orderBy: {
      total_compensation: "desc",
    },
  });

  return NextResponse.json({
    company,
    salaries,
    medianTotalCompensation: calculateMedianTotalCompensation(salaries),
    levelDistribution: calculateLevelDistribution(salaries),
  });
}
