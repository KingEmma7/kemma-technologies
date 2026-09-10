export function PageIntro({
  label,
  title,
  quiet,
  description,
}: {
  label: string;
  title: string;
  quiet: string;
  description: string;
}) {
  return (
    <section className="page-intro wrap">
      <p className="eyebrow section-index">{label}</p>
      <div className="page-intro-grid">
        <h1>
          {title}
          <br />
          <span className="quiet-type">{quiet}</span>
        </h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
