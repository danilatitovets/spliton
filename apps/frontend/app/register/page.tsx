import type { Metadata } from "next";

import { RegisterPageShell } from "@/components/auth/register/register-page-shell";

export const metadata: Metadata = {
  title: "Регистрация",
  description:
    "Создайте аккаунт RevShare: доли дохода треков, баланс USDT (TRC20) и выплаты в одном кабинете.",
};

export default function RegisterPage() {
  return <RegisterPageShell />;
}
