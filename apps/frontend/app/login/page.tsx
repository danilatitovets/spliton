import type { Metadata } from "next";

import { BrandPanel } from "@/components/auth/brand-panel";
import { LoginForm } from "@/components/auth/login-form";
import { AuthSplitLayout } from "@/components/layout/auth-split-layout";

export const metadata: Metadata = {
  title: "Вход",
  description:
    "Вход в RevShare: управление балансом USDT (TRC20), долями дохода треков и выплатами.",
};

export default function LoginPage() {
  return (
    <AuthSplitLayout brand={<BrandPanel />}>
      <LoginForm />
    </AuthSplitLayout>
  );
}
