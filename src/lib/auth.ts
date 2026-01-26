import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: { departments: true },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
          orgId: user.orgId,
          departmentIds: user.departments.map((dept) => dept.departmentId),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.orgId = (user as { orgId: string }).orgId;
        token.role = (user as { role: Role }).role;
        token.departmentIds = (user as { departmentIds: string[] }).departmentIds;
        token.avatarUrl = (user as { avatarUrl?: string | null }).avatarUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.orgId = token.orgId as string;
        session.user.role = token.role as Role;
        session.user.departmentIds = (token.departmentIds as string[]) ?? [];
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}
