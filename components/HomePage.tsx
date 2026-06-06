import type { SiteContent } from "@/lib/content-types";

type Props = {
  content: SiteContent;
};

function formatMultiline(text: string) {
  return text.split("\n").map((line, index, lines) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

function sectionDomId(section: { id: string; anchor?: string }) {
  const raw = section.anchor?.trim() || section.id;
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

export function HomePage({ content }: Props) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${content.visit.mapsQuery}`;

  return (
    <div className="page">
      <header className="site-header">
        <div className="header-inner">
          <a href="/" className="brand-link">
            <img src="/logo.png" alt="F.A.N Coffee Shop logo" width={52} height={52} />
            <div className="brand-text">
              <strong>{content.brand.nameStrong}</strong>
              <span>{content.brand.nameSub}</span>
            </div>
          </a>
          <nav className="nav" aria-label="Main">
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#catering">Catering</a>
            <a href="#visit">Visit</a>
          </nav>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <span className="hero-tag">{content.hero.tag}</span>
          <h1 id="hero-heading">
            {content.hero.titleBefore}{" "}
            <em>{content.hero.titleEmphasis}</em>
          </h1>
          <p>{content.hero.description}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#menu">
              {content.hero.primaryCta}
            </a>
            <a className="btn btn-secondary" href="#visit">
              {content.hero.secondaryCta}
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-wrap">
            <img
              src="/logo.png"
              alt=""
              width={280}
              height={280}
              className="logo-large"
            />
          </div>
        </div>
      </section>

      <section id="menu" className="section" aria-labelledby="menu-heading">
        <div className="section-header">
          <h2 id="menu-heading">{content.menuSection.heading}</h2>
          <p>{content.menuSection.subtitle}</p>
        </div>
        <div className="menu-grid">
          {content.menuCategories.map((category) => (
            <article key={category.id} className="menu-card">
              <h3>
                {category.title}
                {category.featured ? (
                  <span className="badge">Signature</span>
                ) : null}
              </h3>
              <p>{category.subtitle}</p>
              <ul className="menu-list">
                {category.items.map((item) => (
                  <li key={item.id}>
                    <span>
                      {item.name}
                      {item.description ? (
                        <span className="desc">{item.description}</span>
                      ) : null}
                    </span>
                    <span className="price">{item.price}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="about-strip" aria-labelledby="about-heading">
        <div className="about-inner">
          <h2 id="about-heading">{content.about.heading}</h2>
          <p>{content.about.body}</p>
        </div>
      </section>

      <section id="catering" className="catering" aria-labelledby="catering-heading">
        <div className="catering-inner">
          <div className="catering-copy">
            <p className="catering-eyebrow">{content.catering.eyebrow}</p>
            <h2 id="catering-heading">{content.catering.heading}</h2>
            <p>{content.catering.body}</p>
            <p className="catering-note">{content.catering.note}</p>
            <a className="btn btn-primary" href={`tel:${content.visit.phoneTel}`}>
              {content.catering.ctaLabel}
            </a>
          </div>
          <ul className="catering-list">
            {content.catering.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </section>

      {(content.customSections ?? []).map((section) => {
        const domId = sectionDomId(section);
        return (
        <section
          key={section.id}
          id={domId}
          className="custom-section"
          aria-labelledby={`${domId}-heading`}
        >
          <div className="custom-section-inner">
            {section.eyebrow ? (
              <p className="custom-section-eyebrow">{section.eyebrow}</p>
            ) : null}
            <h2 id={`${domId}-heading`}>{section.heading}</h2>
            <p>{section.body}</p>
            {section.linkLabel && section.linkHref ? (
              <a className="btn btn-secondary" href={section.linkHref}>
                {section.linkLabel}
              </a>
            ) : null}
          </div>
        </section>
        );
      })}

      <section id="visit" className="section" aria-labelledby="visit-heading">
        <div className="section-header">
          <h2 id="visit-heading">{content.visit.heading}</h2>
          <p>{content.visit.subtitle}</p>
        </div>
        <div className="visit">
          <div className="visit-card">
            <h3>Hours</h3>
            <p>{formatMultiline(content.visit.hours)}</p>
          </div>
          <div className="visit-card">
            <h3>Location</h3>
            <p>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                {content.visit.addressLine1}
                <br />
                {content.visit.addressLine2}
              </a>
            </p>
          </div>
          <div className="visit-card">
            <h3>Contact</h3>
            <p>
              <a href={`tel:${content.visit.phoneTel}`}>{content.visit.phone}</a>
            </p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>{content.footer.text}</p>
        <p className="footer-admin">
          <a href="/admin/login">Admin login</a>
        </p>
      </footer>
    </div>
  );
}
