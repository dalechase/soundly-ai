import AudioGenerator from '../components/AudioGenerator';
import Container from '../components/Container';

export default function Generate() {
  return (
    <div className="bg-mesh-dark">
      <Container className="min-h-[calc(100svh-72px)] py-8 sm:py-12">
        <AudioGenerator />
      </Container>
    </div>
  );
}
