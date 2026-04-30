const affiliateTag = 'inet9tv-20';

function valueAfter(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

const query = valueAfter('--query') || process.argv.slice(2).join(' ').trim();

if (!query) {
  console.error('Usage: npm run amazon:search -- --query "podcast microphone kit"');
  process.exit(1);
}

const params = new URLSearchParams({
  k: query,
  tag: affiliateTag,
});

console.log(`https://www.amazon.com/s?${params.toString()}`);
