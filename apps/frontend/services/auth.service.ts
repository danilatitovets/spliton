import type { EmailSignInPayload, EmailSignUpPayload } from "@/types/auth";

/**
 * Auth API integration will live here (NestJS).
 * UI-only for now — wire up when backend endpoints exist.
 */
export async function signInWithGoogle(): Promise<void> {
  throw new Error("Google sign-in is not wired yet.");
}

export async function signInWithEmail(payload: EmailSignInPayload): Promise<void> {
  void payload;
  throw new Error("Email sign-in is not wired yet.");
}

/** Replace with POST /auth/register/request-otp when the API exists. */
export async function requestRegistrationOtp(email: string): Promise<void> {
  void email;
  await new Promise((r) => setTimeout(r, 400));
}

/** Replace with POST /auth/register when the API exists. */
export async function signUpWithEmail(payload: EmailSignUpPayload): Promise<void> {
  void payload.email;
  void payload.password;
  void payload.acceptedTerms;
  await new Promise((r) => setTimeout(r, 450));
}
