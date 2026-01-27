import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { rateLimitRequest } from "@/lib/rateLimit";
import { Prisma, Role } from "@prisma/client";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const rateLimitResponse = rateLimitRequest(request, {
    windowMs: 60_000,
    max: 5,
    keyPrefix: "auth:signup",
  });
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid signup payload." },
      { status: 400 }
    );
  }

  const { orgName, name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const slug = slugify(orgName);

  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email already in use." },
      { status: 409 }
    );
  }

  const existingOrg = await db.organization.findFirst({
    where: { OR: [{ name: orgName }, { slug }] },
  });
  if (existingOrg) {
    return NextResponse.json(
      { error: "Organization already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const defaultDepartments = [
    "Operations",
    "Warehouse",
    "Customer Support",
    "Finance",
  ];

  let result: { org: { id: string }; user: { id: string } };
  try {
    result = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug,
        },
      });

      const departments = await Promise.all(
        defaultDepartments.map((dept) =>
          tx.department.create({
            data: { name: dept, orgId: org.id },
          })
        )
      );

      const user = await tx.user.create({
        data: {
          orgId: org.id,
          name,
          email: normalizedEmail,
          passwordHash,
          role: Role.OWNER,
        },
      });

      await Promise.all(
        departments.map((dept) =>
          tx.userDepartment.create({
            data: { userId: user.id, departmentId: dept.id },
          })
        )
      );

      return { org, user };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email or organization already exists." },
        { status: 409 }
      );
    }
    throw error;
  }

  return NextResponse.json({
    orgId: result.org.id,
    userId: result.user.id,
  });
}
