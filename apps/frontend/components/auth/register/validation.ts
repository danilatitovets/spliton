export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const minPasswordLength = 8;

export type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

export type FormErrorState = FieldErrors & { submit?: string };

export function validatePasswordStep(values: {
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}): Pick<FieldErrors, "password" | "confirmPassword" | "terms"> {
  const next: Pick<FieldErrors, "password" | "confirmPassword" | "terms"> = {};

  if (!values.password) {
    next.password = "Придумайте пароль";
  } else if (values.password.length < minPasswordLength) {
    next.password = `Минимум ${minPasswordLength} символов`;
  }

  if (!values.confirmPassword) {
    next.confirmPassword = "Подтвердите пароль";
  } else if (values.password !== values.confirmPassword) {
    next.confirmPassword = "Пароли не совпадают";
  }

  if (!values.termsAccepted) {
    next.terms = "Нужно принять условия и конфиденциальность";
  }

  return next;
}

export function emailErrorMessage(trimmed: string): string | undefined {
  if (!trimmed) return "Укажите электронную почту";
  if (!emailPattern.test(trimmed)) return "Введите действительный email";
  return undefined;
}
