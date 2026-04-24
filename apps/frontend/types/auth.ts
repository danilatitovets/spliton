export type AuthProvider = "google" | "email";

export type EmailSignInPayload = {
  email: string;
  password: string;
  remember: boolean;
};

export type EmailSignUpPayload = {
  email: string;
  password: string;
  acceptedTerms: boolean;
};
