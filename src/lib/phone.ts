const LI_PREFIX = "+423";
const CH_PREFIX = "+41";

export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, "");
  const compact = digits.startsWith("00") ? `+${digits.slice(2)}` : digits;

  if (compact.startsWith(LI_PREFIX)) {
    const rest = compact.slice(LI_PREFIX.length).replace(/\D/g, "");
    if (rest.length === 7) return `${LI_PREFIX}${rest}`;
    return null;
  }
  if (compact.startsWith(CH_PREFIX)) {
    const rest = compact.slice(CH_PREFIX.length).replace(/\D/g, "");
    if (rest.length >= 9 && rest.length <= 12) return `${CH_PREFIX}${rest}`;
    return null;
  }

  const only = compact.replace(/\D/g, "");
  if (only.length === 7) return `${LI_PREFIX}${only}`;
  if (only.startsWith("423") && only.length === 10) return `+${only}`;
  return null;
}

export function formatPhoneDisplay(e164: string) {
  if (e164.startsWith("+423") && e164.length === 11) {
    return `+423 ${e164.slice(4, 7)} ${e164.slice(7, 9)} ${e164.slice(9)}`;
  }
  return e164;
}
