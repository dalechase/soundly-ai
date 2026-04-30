import { affiliateTag, amazonSearchUrl, articles, gearKits, products, trends } from '../data/mockData';

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchTrendingSounds(options = {}) {
  await wait();
  const limit = options.limit ?? trends.length;
  return trends
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit)
    .map((trend) => ({
      ...trend,
      scannedAt: new Date().toISOString(),
      sources: ['short-form audio', 'playlist velocity', 'creator captions'],
    }));
}

export async function matchProductsToTrends(inputTrends = trends) {
  await wait();
  return inputTrends.map((trend) => {
    const kit = gearKits.find((item) => item.id === trend.recommendedKit);
    return {
      trend,
      kit,
      products: kit.products.map((productId) => products.find((product) => product.id === productId)),
      matchScore: Math.min(99, trend.popularityScore + 2),
    };
  });
}

export async function generateSeoArticles(matches = []) {
  await wait();
  return matches.map((match) => ({
    title: `How to Build a ${match.trend.name} Setup`,
    slug: `how-to-build-a-${match.trend.slug}-setup`,
    intent: 'commercial investigation',
    intro: `${match.trend.name} is moving fast. This draft translates the sound into a practical gear path.`,
    recommendedProducts: match.products.map((product) => product.id),
    targetKit: match.kit.id,
    estimatedRevenue: `$${Math.round(match.matchScore * 6.5)}/mo`,
  }));
}

export function insertAffiliateLinks(article, tag = affiliateTag) {
  return {
    ...article,
    affiliateTag: tag,
    recommendedProducts: article.recommendedProducts.map((productId) => ({
      productId,
      href: amazonSearchUrl(products.find((product) => product.id === productId)?.searchQuery || productId),
    })),
    disclosure: 'As an Amazon Associate, Sound.ly may earn from qualifying purchases.',
  };
}

export async function publishArticles(articleQueue = articles) {
  await wait();
  return articleQueue.map((article, index) => ({
    id: article.id ?? article.slug,
    title: article.title,
    status: index === 0 ? 'published' : 'scheduled',
    scheduledFor: index === 0 ? 'Now' : `T+${index * 2}h`,
  }));
}
