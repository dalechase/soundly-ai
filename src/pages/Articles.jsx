import ArticleCard from '../components/ArticleCard';
import Container from '../components/Container';
import SectionHeader from '../components/SectionHeader';
import { articles } from '../data/mockData';

export default function Articles() {
  return (
    <div className="bg-mesh-dark">
      <Container className="py-14 sm:py-20">
        <SectionHeader
          eyebrow="Article Templates"
          title="Buying guides built from trend intent"
          description="Reusable article layouts for comparison tables, recommended products, buying guidance, FAQ, and affiliate disclosure."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Container>
    </div>
  );
}
