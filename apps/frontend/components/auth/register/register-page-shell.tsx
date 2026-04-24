"use client";

import * as React from "react";

import { RegisterBrandPanel } from "@/components/auth/register/register-brand-panel";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthSplitLayout } from "@/components/layout/auth-split-layout";

export function RegisterPageShell() {
  const [brandStep, setBrandStep] = React.useState<1 | 2 | 3>(1);

  return (
    <AuthSplitLayout brand={<RegisterBrandPanel step={brandStep} />}>
      <RegisterForm onStepChange={setBrandStep} />
    </AuthSplitLayout>
  );
}
