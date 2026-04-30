import { Activity, Bot, CheckCircle2, DollarSign, FilePenLine, Link2, RadioTower, Send, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import AffiliateDisclosure from '../components/AffiliateDisclosure';
import AmazonResolverPanel from '../components/AmazonResolverPanel';
import Container from '../components/Container';
import LiveTrendPanel from '../components/LiveTrendPanel';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import { adminGeneratedArticles } from '../data/mockData';
import { fetchTrendingSounds, generateSeoArticles, insertAffiliateLinks, matchProductsToTrends, publishArticles } from '../lib/automation';

const engineSteps = [
  ['Trending source scanner', 'Tracks social audio captions, playlist movement, creator mentions, and search velocity.', RadioTower],
  ['Product matcher', 'Maps each sound goal to practical gear categories, kits, and affiliate-ready product candidates.', ShoppingBag],
  ['SEO article generator', 'Drafts buying guides from trend intent, kit logic, product pros, and structured FAQ sections.', FilePenLine],
  ['Affiliate link inserter', 'Normalizes Amazon links, applies tags, and adds disclosure blocks to commercial pages.', Link2],
  ['Publishing queue', 'Schedules review-ready posts by revenue score, seasonality, and editorial freshness.', Send],
];

export default function AdminContentEngine() {
  const [run, setRun] = useState(null);

  useEffect(() => {
    let active = true;

    async function runEngine() {
      const scanned = await fetchTrendingSounds({ limit: 4 });
      const matches = await matchProductsToTrends(scanned);
      const drafts = await generateSeoArticles(matches);
      const linked = drafts.map((article) => insertAffiliateLinks(article));
      const published = await publishArticles(linked);

      if (active) {
        setRun({ scanned, matches, drafts: linked, published });
      }
    }

    runEngine();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-mesh-dark">
      <Container className="py-14 sm:py-20">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-neon">Internal System</p>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">AI Content Engine</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/62">
                A dashboard mockup for the autonomous loop that turns emerging sounds into product-matched articles and affiliate-ready buying pages.
              </p>
            </div>
            <div className="rounded-2xl border border-neon/25 bg-neon/10 p-4 text-neon">
              <Bot size={34} />
            </div>
          </div>
        </div>
      </Container>

      <Container className="pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Trend Signals" value={run?.scanned.length ?? '...'} detail="High-intent sounds in the current scan." />
          <StatCard label="Product Matches" value={run?.matches.length ?? '...'} detail="Matched kits with confidence scores." />
          <StatCard label="Drafts Generated" value={run?.drafts.length ?? '...'} detail="SEO briefs with affiliate links inserted." />
          <StatCard label="Revenue Forecast" value="$1.4k" detail="Estimated monthly affiliate opportunity." />
        </div>
      </Container>

      <Container className="pb-16">
        <LiveTrendPanel />
      </Container>

      <Container className="pb-16">
        <AmazonResolverPanel />
      </Container>

      <Container className="pb-16">
        <SectionHeader
          eyebrow="Automation"
          title="From viral audio to publishable commerce"
          description="The engine stages every step separately so editorial review, affiliate compliance, and product data can be connected without changing the frontend."
        />
        <div className="grid gap-4 lg:grid-cols-5">
          {engineSteps.map(([title, body, Icon], index) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-neon/10 text-neon">
                  <Icon size={20} />
                </span>
                <span className="text-xs font-bold text-white/32">0{index + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/58">{body}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="grid gap-8 pb-20 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <SectionHeader eyebrow="Queue" title="Generated articles" description="Revenue-scored drafts waiting for review, link QA, or publish scheduling." />
          <div className="space-y-4">
            {adminGeneratedArticles.map((article) => (
              <div key={article.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-neon">
                      <Activity size={16} />
                      {article.trend}
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-white">{article.title}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/68">
                    {article.status}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-ink/45 p-3">
                    <div className="text-xs text-white/42">Revenue score</div>
                    <div className="mt-1 font-semibold text-amber">{article.revenueScore}</div>
                  </div>
                  <div className="rounded-xl bg-ink/45 p-3">
                    <div className="text-xs text-white/42">Match confidence</div>
                    <div className="mt-1 font-semibold text-neon">{article.confidence}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside>
          <SectionHeader eyebrow="Revenue" title="Dashboard mockup" description="Affiliate analytics snapshot for trend-led buying pages." />
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/52">Projected monthly clicks</div>
                <div className="mt-2 font-display text-4xl font-bold text-white">18.6k</div>
              </div>
              <DollarSign className="text-amber" size={34} />
            </div>
            <div className="mt-6 space-y-4">
              {['Podcast voice pages', 'Mobile creator kits', 'Bedroom producer guides'].map((label, index) => (
                <div key={label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/68">{label}</span>
                    <span className="font-semibold text-neon">{82 - index * 12}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon via-violet to-amber" style={{ width: `${82 - index * 12}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-neon/20 bg-neon/10 p-3 text-sm font-semibold text-neon">
              <CheckCircle2 size={18} />
              Affiliate disclosure checks active
            </div>
            <div className="mt-4">
              <AffiliateDisclosure compact />
            </div>
          </div>
        </aside>
      </Container>
    </div>
  );
}
