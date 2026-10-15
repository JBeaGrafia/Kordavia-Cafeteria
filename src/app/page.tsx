import ContactForm from "@/components/ContactForm";
import { siteConfig } from "@/config/site";

type HomeProps = {
  searchParams: Promise<{ to?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const toEmail = params.to?.trim() || undefined;

  return (
    <main className="page">
      <div className="bg" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="bg-image"
          src="/images/cafe-bar-bg.jpg"
          alt=""
        />
        <div className="bg-veil" />
      </div>

      <div className="content">
        <header className="brand-block">
          <h1 className="brand">{siteConfig.name}</h1>
          <p className="tagline">{siteConfig.tagline}</p>
        </header>

        <section className="contact-panel" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="contact-title">
            Escríbenos
          </h2>
          <p className="contact-lead">
            Déjanos tu mensaje y te respondemos enseguida.
          </p>
          <ContactForm toEmail={toEmail} />
        </section>
      </div>
    </main>
  );
}
