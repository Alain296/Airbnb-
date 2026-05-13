import { z } from "zod";

// Use z.enum with literal strings — z.nativeEnum breaks with Prisma enums in Zod v4
const RoleEnum = z.enum(["HOST", "GUEST", "ADMIN"]);

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

export const getUserListingsSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

export const getUserBookingsSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name:     z.string().min(1, "Name is required"),
    email:    z.string().email("Invalid email format"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    phone:    z.string().min(10, "Phone number must be at least 10 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role:     RoleEnum.optional(),
    avatar:   z.string().url("Avatar must be a valid URL").optional(),
    bio:      z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
  body: z.object({
    name:     z.string().min(1).optional(),
    email:    z.string().email().optional(),
    username: z.string().min(3).optional(),
    phone:    z.string().min(10).optional(),
    password: z.string().min(8).optional(),
    role:     RoleEnum.optional(),
    avatar:   z.string().url().optional(),
    bio:      z.string().optional(),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});
