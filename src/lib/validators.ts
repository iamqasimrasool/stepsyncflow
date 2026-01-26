import { z } from "zod";
import { Role, VideoType } from "@prisma/client";

export const signupSchema = z.object({
  orgName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export const sopSchema = z.object({
  title: z.string().min(2),
  summary: z.string().optional().nullable(),
  departmentId: z.string().min(1),
  sectionId: z.string().min(1).optional().nullable(),
  videoType: z.nativeEnum(VideoType).default(VideoType.YOUTUBE),
  videoUrl: z.string().min(3),
  isPublished: z.boolean().optional(),
});

export const sopUpdateSchema = sopSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export const stepSchema = z.object({
  heading: z.string().min(2),
  body: z.string().optional().nullable(),
  timestamp: z.number().int().nonnegative(),
});

export const stepUpdateSchema = stepSchema.partial();

export const reorderStepsSchema = z.object({
  steps: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
    })
  ),
});

export const sopSectionSchema = z.object({
  departmentId: z.string().min(1),
  title: z.string().min(2),
});

export const reorderSectionsSchema = z.object({
  departmentId: z.string().min(1),
  sections: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
    })
  ),
});

export const reorderSopsSchema = z.object({
  departmentId: z.string().min(1),
  sectionId: z.string().min(1).optional().nullable(),
  sops: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().nonnegative(),
    })
  ),
});

export const departmentSchema = z.object({
  name: z.string().min(2),
});

export const userInviteSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  password: z.string().min(8),
  departmentIds: z.array(z.string().min(1)).default([]),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.nativeEnum(Role).optional(),
  departmentIds: z.array(z.string().min(1)).optional(),
});
