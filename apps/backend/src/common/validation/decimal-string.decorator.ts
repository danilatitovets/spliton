import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/** Positive decimal as string (avoids JSON number float corruption). Max 8 fractional digits. */
export const DECIMAL_STRING_RE = /^\d+(\.\d{1,8})?$/;

function toDecimalString(value: unknown): unknown {
  if (value == null || value === '') return value;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Last-resort coerce for legacy clients — prefer string bodies.
    return String(value);
  }
  return value;
}

export function IsPositiveDecimalString(options?: { optional?: boolean; maxLength?: number }) {
  const maxLength = options?.maxLength ?? 32;
  const decorators = [
    Transform(({ value }) => toDecimalString(value)),
    IsString(),
    MaxLength(maxLength),
    Matches(DECIMAL_STRING_RE, {
      message: 'must be a positive decimal string (max 8 fractional digits)',
    }),
  ];
  if (options?.optional) {
    return applyDecorators(IsOptional(), ...decorators);
  }
  return applyDecorators(IsNotEmpty(), ...decorators);
}