/**
 * Validate a Saudi national ID / Iqama number using the official
 * checksum algorithm (modified Luhn) used by Absher / Yakeen.
 *
 * Rules:
 * - Must be exactly 10 digits.
 * - Must start with 1 (Saudi citizen) or 2 (resident / Iqama).
 * - Must pass the checksum:
 *   For each digit (left → right):
 *     - Even position (1st, 3rd, ...): double the digit; if > 9, sum its digits.
 *     - Odd position: take as-is.
 *   Sum all values; total must be divisible by 10.
 */
export const isValidSaudiId = (raw: string): boolean => {
  const id = (raw || "").trim();
  if (!/^\d{10}$/.test(id)) return false;

  const first = id[0];
  if (first !== "1" && first !== "2") return false;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const digit = Number(id[i]);
    if (i % 2 === 0) {
      const doubled = digit * 2;
      sum += doubled > 9 ? Math.floor(doubled / 10) + (doubled % 10) : doubled;
    } else {
      sum += digit;
    }
  }
  return sum % 10 === 0;
};

export const saudiIdErrorMessage = (raw: string): string | null => {
  const id = (raw || "").trim();
  if (!id) return "الرجاء إدخال رقم الهوية / الإقامة";
  if (!/^\d+$/.test(id)) return "رقم الهوية يجب أن يحتوي على أرقام فقط";
  if (id.length !== 10) return "رقم الهوية يجب أن يكون 10 أرقام";
  if (id[0] !== "1" && id[0] !== "2")
    return "رقم الهوية يجب أن يبدأ بـ 1 (مواطن) أو 2 (مقيم)";
  if (!isValidSaudiId(id)) return "رقم الهوية / الإقامة غير صحيح";
  return null;
};
