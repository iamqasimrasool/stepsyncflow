import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      orgId: string;
      role: Role;
      departmentIds: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    orgId: string;
    role: Role;
    departmentIds: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    orgId?: string;
    role?: Role;
    departmentIds?: string[];
  }
}
