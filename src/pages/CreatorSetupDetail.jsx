import { ArrowUpRight, CheckCircle2, Layers3 } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import AffiliateDisclosure from '../components/AffiliateDisclosure';
import Container from '../components/Container';
import ProductCard from '../components/ProductCard';
import { amazonSearchUrl, creatorSetups, getProductById, productSearchQuery } from '../data/mockData';

export default function CreatorSetupDetail() {
  const { slug } = useParams();
  const setup = creatorSetups.find((item) => item.slug === slug);

  if (!setup) {
    return <Navigate to="/creator-setups" replace />;
  }

  const setupProducts = setup.gearList.map(getProductById).filter(Boolean);

  return (
    <div className="bg-mesh-dark">
      <Container className="grid gap-10 py-14 lg:grid-cols-[.9fr_1.1fr] lg:py-20">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-neon">Creator Setup</p>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">{setup.name}</h1>
          <p className="mt-5 text-lg leading-8 text-white/66">{setup.soundGoal}</p>
          <div className="mt-7">
            <AffiliateDisclosure />
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
          <img className="h-full min-h-80 w-full object-cover" src={setup.image} alt="" />
        </div>
      </Container>

      <Container className="grid gap-6 pb-16 md:grid-cols-3">
        {[
          ['Budget version', setup.budgetVersion],
          ['Upgraded version', setup.upgradedVersion],
          ['Buying guide', setup.buyingGuide],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <Layers3 className="text-neon" size={22} />
            <h2 className="mt-4 font-display text-xl font-semibold text-white">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/62">{body}</p>
          </div>
        ))}
      </Container>

      <Container className="pb-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-neon">Gear List</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">Products in this setup</h2>
          </div>
          <a
            href={amazonSearchUrl(setupProducts.map(productSearchQuery).join(' '))}
            target="_blank"
            rel="noreferrer sponsored"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-4 py-3 text-sm font-bold text-ink transition hover:bg-white"
          >
            Search Full Setup
            <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {setupProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-8 flex items-center gap-2 text-sm text-white/54">
          <CheckCircle2 className="text-neon" size={18} />
          Budget and upgraded paths are structured for API-backed pricing later.
        </div>
      </Container>
    </div>
  );
}
