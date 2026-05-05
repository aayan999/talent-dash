import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { duplicateSalaryWhere, parseSalaryPayload } from "@/lib/salary";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseSalaryPayload(payload);

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const existingDuplicate = await prisma.salary.findFirst({
    where: duplicateSalaryWhere(parsed.data),
    select: {
      id: true,
    },
  });

  const salary = await prisma.salary.create({
    data: parsed.data,
  });

  return NextResponse.json(
    {
      salary,
      duplicate: Boolean(existingDuplicate),
      duplicateOf: existingDuplicate?.id ?? null,
    },
    { status: 201 },
  );
}
