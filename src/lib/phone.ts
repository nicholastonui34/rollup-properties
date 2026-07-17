/**
 * Normalize a Kenyan phone number to E.164 (+254XXXXXXXXX).
 * Accepts: 0712 345 678, 0112345678, 254712345678, +254712345678, 712345678.
 * Returns null if it doesn't look like a valid Kenyan mobile number.
 */
export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  let rest: string;

  if (digits.startsWith("+254")) rest = digits.slice(4);
  else if (digits.startsWith("254")) rest = digits.slice(3);
  else if (digits.startsWith("0")) rest = digits.slice(1);
  else rest = digits;

  // Kenyan mobiles: 7XXXXXXXX (Safaricom/Airtel/Telkom) or 1XXXXXXXX
  if (!/^[71]\d{8}$/.test(rest)) return null;
  return `+254${rest}`;
}

export function displayPhone(e164: string): string {
  // +254712345678 -> 0712 345 678
  if (!e164.startsWith("+254") || e164.length !== 13) return e164;
  const local = `0${e164.slice(4)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}
