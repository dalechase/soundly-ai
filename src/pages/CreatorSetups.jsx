import Container from '../components/Container';
import CreatorSetupCard from '../components/CreatorSetupCard';
import SectionHeader from '../components/SectionHeader';
import { creatorSetups } from '../data/mockData';

export default function CreatorSetups() {
  return (
    <div className="bg-mesh-dark">
      <Container className="py-14 sm:py-20">
        <SectionHeader
          eyebrow="Creator Setups"
          title="Recreate the room behind the sound"
          description="Fictional but realistic creator rigs for producers, hosts, streamers, reviewers, and mobile beatmakers."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {creatorSetups.map((setup) => (
            <CreatorSetupCard key={setup.id} setup={setup} />
          ))}
        </div>
      </Container>
    </div>
  );
}
