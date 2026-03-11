export function RouteStub({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{eyebrow}</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
      <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-500">
        Placeholder only for Milestone 1.
      </div>
    </section>
  );
}
