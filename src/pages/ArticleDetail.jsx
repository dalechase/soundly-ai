import { ArrowUpRight, HelpCircle } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import AffiliateDisclosure from '../components/AffiliateDisclosure';
import Container from '../components/Container';
import ProductCard from '../components/ProductCard';
import { amazonSearchUrl, articles, getProductById, productSearchQuery } from '../data/mockData';

export default function ArticleDetail() {
  const { slug } = useParams();
  const article = articles.find((item) => item.slug === slug);

  if (!article) {
    return <Navigate to="/articles" replace />;
  }

  const recommendedProducts = article.recommendedProducts.map(getProductById).filter(Boolean);

  return (
    <div className="bg-mesh-dark">
      <Container className="py-14 sm:py-20">
        <article className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-neon">Sound.ly Buying Guide</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">{article.title}</h1>
            <p className="mt-5 text-lg leading-8 text-white/66">{article.intro}</p>
            <div className="mt-6">
              <AffiliateDisclosure />
            </div>
          </div>

          <section className="py-12">
            <h2 className="font-display text-3xl font-bold">Recommended products</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {recommendedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          <section className="py-6">
            <h2 className="font-display text-3xl font-bold">Comparison table</h2>
            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
              <div className="grid grid-cols-[1.2fr_1fr_.5fr] border-b border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/48">
                <div>Product</div>
                <div>Best for</div>
                <div>Score</div>
              </div>
              {article.comparison.map((row) => {
                const product = getProductById(row.product);
                return (
                  <a
                    key={row.product}
                    href={amazonSearchUrl(productSearchQuery(product))}
                    target="_blank"
                    rel="noreferrer sponsored"
                    className="grid grid-cols-[1.2fr_1fr_.5fr] items-center gap-3 border-b border-white/10 px-4 py-4 text-sm transition last:border-0 hover:bg-white/[0.045]"
                  >
                    <span className="font-semibold text-white">{product.name}</span>
                    <span className="text-white/62">{row.bestFor}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-neon">
                      {row.score}
                      <ArrowUpRight size={14} />
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          <section className="py-12">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
              <h2 className="font-display text-3xl font-bold">Buying guide</h2>
              <p className="mt-4 text-base leading-7 text-white/66">{article.buyingGuide}</p>
            </div>
          </section>

          <section className="pb-20">
            <h2 className="font-display text-3xl font-bold">FAQ</h2>
            <div className="mt-7 grid gap-4">
              {article.faq.map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                  <div className="flex items-center gap-3 font-display text-lg font-semibold text-white">
                    <HelpCircle className="text-neon" size={20} />
                    {question}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/62">{answer}</p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </Container>
    </div>
  );
}
