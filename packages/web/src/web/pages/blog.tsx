import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { POSTS, formatDate } from "../content/blog";
import { useSeo } from "../lib/seo";

export default function Blog() {
  useSeo(
    "Blog o investicionom zlatu — Golden Feather",
    "Tekstovi o formiranju cene zlata, zaključavanju cene, razlici između poluga i dukata i poreskom tretmanu investicionog zlata u Srbiji.",
  );

  return (
    <main className="mx-auto max-w-[1200px] px-6 pt-16 pb-8">
      <p className="num text-[11px] tracking-wider text-muted">BLOG</p>
      <h1 className="display mt-2 max-w-3xl text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-cream">
        Kako zaista funkcioniše kupovina zlata
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        Kratki, tehnički tekstovi bez marketinga. Kako nastaje cena, šta znači finoća, kako se
        oporezuje investiciono zlato i kako radi zaključavanje cene.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {POSTS.map((post, i) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className="rise panel group flex flex-col justify-between rounded-[22px] p-6 transition-colors hover:border-gold/40"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div>
              <div className="num flex items-center gap-2 text-[11px] tracking-wider text-muted">
                <span className="rounded-full border border-line px-2.5 py-1 text-gold">
                  {post.tag.toUpperCase()}
                </span>
                <span>{post.readMinutes} MIN</span>
              </div>
              <h2 className="display mt-4 text-[20px] leading-snug font-bold text-cream">
                {post.title}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">{post.description}</p>
            </div>
            <div className="num mt-6 flex items-center justify-between text-[11px] text-muted">
              <span>{formatDate(post.date)}</span>
              <span className="inline-flex items-center gap-1 text-gold transition-transform group-hover:translate-x-0.5">
                ČITAJ <ArrowUpRight className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
