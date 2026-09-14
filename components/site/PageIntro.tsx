export function PageIntro({
  label,
  title,
  description,
}: {
  label?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro wrap">
      {label && <p className="context-label section-label">{label}</p>}
      <div className="page-intro-grid">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
