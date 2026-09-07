import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { POSTS, findPost, formatDate } from "../content/blog";
import { useSeo } from "../lib/seo";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = findPost(params.slug ?? "");

  useSeo(
    post ? `${post.title} — Golden Feather` : "Tekst nije pronađen — Golden Feather",
    post?.description ?? "Blog o investicionom zlatu.",
  );

  if (!post) {
    return (
      <main className="mx-auto max-w-[1200px] px-6 py-32">
        <h1 className="display text-5xl font-extrabold text-cream">404</h1>
        <p className="mt-3 text-muted">Ovaj tekst ne postoji.</p>
        <Link to="/blog" className="num mt-6 inline-block text-[13px] text-gold">
          ← Nazad na blog
        </Link>
      </main>
    );
  }

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="mx-auto max-w-[1200px] px-6 pt-12 pb-8">
      <Link
        to="/blog"
        className="num inline-flex items-center gap-2 text-[12px] tracking-wider text-muted transition-colors hover:text-cream"
      >
        <ArrowLeft className="size-3.5" /> BLOG
      </Link>

      <article className="mt-8 max-w-[720px]">
        <div className="num flex items-center gap-3 text-[11px] tracking-wider text-muted">
          <span className="rounded-full border border-line px-2.5 py-1 text-gold">
            {post.tag.toUpperCase()}
          </span>
          <span>{formatDate(post.date)}</span>
          <span>· {post.readMinutes} min čitanja</span>
        </div>

        <h1 className="display mt-5 text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.05] font-extrabold text-cream">
          {post.title}
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-muted">{post.description}</p>

        <div className="mt-10 space-y-6">
          {post.blocks.map((b, i) => {
            if (b.type === "h")
              return (
                <h2
                  key={i}
                  className="display pt-4 text-[20px] font-bold text-cream"
                >
                  {b.text}
                </h2>
              );
            if (b.type === "list")
              return (
                <ul key={i} className="space-y-3">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-cream/85">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              );
            if (b.type === "note")
              return (
                <p
                  key={i}
                  className="panel rounded-[18px] p-5 text-[13px] leading-relaxed text-muted"
                >
                  {b.text}
                </p>
              );
            return (
              <p key={i} className="text-[15px] leading-relaxed text-cream/85">
                {b.text}
              </p>
            );
          })}
        </div>

        <div className="panel mt-14 flex flex-wrap items-center justify-between gap-4 rounded-[22px] p-6">
          <div>
            <p className="display text-[17px] font-bold text-cream">
              Cena se menja svakih 30 sekundi
            </p>
            <p className="mt-1.5 text-[13px] text-muted">
              Pogledajte aktuelni cenovnik ili zaključajte cenu do dolaska.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/zakljucaj"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-[13px] font-semibold text-ink"
            >
              Zaključaj cenu <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/kontakt"
              className="inline-flex items-center rounded-full border border-line px-5 py-2.5 text-[13px] font-semibold text-cream hover:bg-panel2"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="mt-16 border-t border-line pt-10">
          <p className="num text-[11px] tracking-wider text-muted">JOŠ TEKSTOVA</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {others.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="panel rounded-[22px] p-5 transition-colors hover:border-gold/40"
              >
                <h3 className="display text-[16px] font-bold text-cream">{p.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
