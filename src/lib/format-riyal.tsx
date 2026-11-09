import { Fragment, type ReactNode } from "react";
import SaudiRiyal from "@/components/icons/SaudiRiyal";

/**
 * يستبدل في النص كلمة "ريال" أو "ريال سعودي" أو رمز "﷼"
 * بمكوّن SaudiRiyal لضمان شكل موحّد للرمز عبر التطبيق.
 *
 * أمثلة:
 *   formatRiyal("100,000 ريال")          => "100,000 [⃁]"
 *   formatRiyal("10,000 ريال سعودي")     => "10,000 [⃁]"
 *   formatRiyal("474.82 ﷼ / سنة")       => "474.82 [⃁] / سنة"
 */
export function formatRiyal(text: string): ReactNode {
  if (!text) return text;

  // ترتيب الأنماط مهم: نطابق أولاً "ريال سعودي" ثم "ريال" ثم الرمز.
  const regex = /(ريال\s*سعودي|ريال|﷼|ر\.?س\.?)/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Fragment key={`t-${key++}`}>
          {text.slice(lastIndex, match.index)}
        </Fragment>,
      );
    }
    parts.push(
      <SaudiRiyal
        key={`r-${key++}`}
        className="mx-0.5 inline-block h-[0.95em] w-[0.95em] align-[-0.125em]"
      />,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }
  if (parts.length === 0) return text;
  return <>{parts}</>;
}
