/**
 * جذر تخطيط مستقل للاستوديو (SPEC §3.2).
 *
 * الاستوديو خارج نظام اللغات وخارج قشرة الموقع بالكامل: لا ترويسة ولا
 * تذييل ولا رموز تصميم، لأنه يأتي بواجهته وأنماطه الخاصة.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
