"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { normalizeKenyanPhone } from "@/lib/phone";
import { Prisma } from "@prisma/client";

export type AuthFormState = { error?: string } | undefined;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().trim().min(9, "Enter your phone number"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SEEKER", "LISTER"]),
});

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const phone = normalizeKenyanPhone(parsed.data.phone);
  if (!phone) {
    return { error: "Enter a valid Kenyan phone number, e.g. 0712 345 678" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        phone,
        email: parsed.data.email || null,
        passwordHash,
        role: parsed.data.role,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "An account with that phone number or email already exists. Try logging in." };
    }
    console.error("signup failed", e);
    return { error: "Something went wrong creating your account. Please try again." };
  }

  await signIn("credentials", {
    identifier: phone,
    password: parsed.data.password,
    redirectTo: "/",
  });
}

const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your phone number or email"),
  password: z.string().min(1, "Enter your password"),
});

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Wrong phone/email or password. Please try again." };
    }
    throw e; // NEXT_REDIRECT on success
  }
}
