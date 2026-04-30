export const affiliateTag = 'inet9tv-20';

export const amazonLink = (productId) =>
  `https://www.amazon.com/dp/${productId}?tag=${affiliateTag}`;

export const amazonSearchUrl = (query) => {
  const params = new URLSearchParams({
    k: query,
    tag: affiliateTag,
  });
  return `https://www.amazon.com/s?${params.toString()}`;
};

export const products = [
  {
    id: 'mic-orbit-dynamic',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'dynamic broadcast microphone XLR podcast voice',
    slug: 'orbit-dynamic-broadcast-mic',
    name: 'Dynamic Broadcast Microphone',
    typeLabel: 'Dynamic XLR microphone',
    setupRole: 'Captures close podcast, stream, and vocal takes while rejecting more room noise than a sensitive condenser mic.',
    category: 'Microphones',
    price: '$129',
    rating: '4.7',
    bestFor: 'Clean podcast voice, streamers, vocal chains',
    image: '/assets/product-microphone.png',
    pros: ['Rejects room noise well', 'Warm vocal tone', 'Works with budget interfaces'],
    cons: ['Needs a sturdy boom arm', 'Benefits from a gain booster'],
  },
  {
    id: 'mic-aura-usb',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'USB C creator microphone podcast streaming vocals',
    slug: 'aura-usb-creator-mic',
    name: 'USB Creator Microphone',
    typeLabel: 'USB-C condenser microphone',
    setupRole: 'A plug-and-play mic for fast voiceover, short-form vocals, calls, and mobile creator recordings.',
    category: 'Microphones',
    price: '$89',
    rating: '4.5',
    bestFor: 'Mobile creators and fast desk setups',
    image: '/assets/product-usb-mic.png',
    pros: ['Plug-and-play USB-C', 'Compact desk footprint', 'Low-latency monitoring'],
    cons: ['Less upgradeable than XLR', 'Limited onboard EQ'],
  },
  {
    id: 'headphones-nightfield',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'closed back studio headphones recording mixing',
    slug: 'nightfield-closed-back-headphones',
    name: 'Closed-Back Studio Headphones',
    typeLabel: 'Recording and editing headphones',
    setupRole: 'Lets creators monitor vocals, edit speech, and make beats without speaker bleed entering the microphone.',
    category: 'Headphones',
    price: '$99',
    rating: '4.6',
    bestFor: 'Recording vocals, beatmaking, quiet editing',
    image: '/assets/product-headphones.png',
    pros: ['Strong isolation', 'Balanced low end', 'Comfortable for long edits'],
    cons: ['Cable is not wireless', 'Not ideal for mastering'],
  },
  {
    id: 'interface-pulse-2x2',
    affiliateId: 'PRODUCT_ID',
    searchQuery: '2x2 USB audio interface XLR home studio podcast',
    slug: 'pulse-2x2-audio-interface',
    name: '2x2 USB Audio Interface',
    typeLabel: 'XLR/line input recording hub',
    setupRole: 'Connects XLR microphones, instruments, and studio monitors to a computer with cleaner gain and direct monitoring.',
    category: 'Audio Interfaces',
    price: '$149',
    rating: '4.8',
    bestFor: 'Bedroom producers and podcast hosts',
    image: '/assets/product-interface.png',
    pros: ['Clean preamps', 'Two combo inputs', 'Direct monitoring'],
    cons: ['No MIDI DIN ports', 'Requires desktop software for advanced routing'],
  },
  {
    id: 'midi-chroma-keys',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'mini MIDI keyboard controller pads beatmaking',
    slug: 'chroma-keys-mini-midi-controller',
    name: 'Mini MIDI Keyboard Controller',
    typeLabel: 'Keys and pads for beatmaking',
    setupRole: 'Controls software instruments, drum racks, bass lines, and chords without needing a full-size keyboard.',
    category: 'MIDI Controllers',
    price: '$79',
    rating: '4.4',
    bestFor: 'Lo-fi chords, trap melodies, portable beat sketches',
    image: '/assets/product-midi.png',
    pros: ['Velocity-sensitive keys', 'Pads for drums', 'Fits in a backpack'],
    cons: ['Mini keys take adjustment', 'No standalone sounds'],
  },
  {
    id: 'monitors-nearfield-5',
    affiliateId: 'PRODUCT_ID',
    searchQuery: '5 inch powered studio monitor pair home studio',
    slug: 'nearfield-5-studio-monitors',
    name: 'Powered Nearfield Studio Monitors',
    typeLabel: 'Small-room monitor speaker pair',
    setupRole: 'Gives a more honest speaker reference for arranging, mixing, podcast editing, and checking low-mid balance.',
    category: 'Studio Monitors',
    price: '$249',
    rating: '4.6',
    bestFor: 'Home studio mixing and beat arrangement',
    image: '/assets/product-monitors.png',
    pros: ['Honest mids', 'Front-panel volume', 'Compact pair for small rooms'],
    cons: ['Needs isolation pads', 'Sub bass is limited'],
  },
  {
    id: 'treatment-foam-cloud',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'acoustic treatment foam panels home studio podcast',
    slug: 'foam-cloud-acoustic-treatment-kit',
    name: 'Acoustic Treatment Panel Kit',
    typeLabel: 'Foam panels and reflection control',
    setupRole: 'Reduces obvious room reflections so microphones sound drier and monitor decisions feel less smeared.',
    category: 'Acoustic Treatment',
    price: '$69',
    rating: '4.3',
    bestFor: 'Reducing reflections in creator rooms',
    image: '/assets/product-treatment.png',
    pros: ['Tames flutter echo', 'Lightweight panels', 'Easy starter coverage'],
    cons: ['Does not replace bass traps', 'Needs careful placement'],
  },
  {
    id: 'cables-studio-pack',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'XLR TRS studio cable pack audio interface monitors',
    slug: 'studio-cable-pack',
    name: 'Studio Cable Starter Pack',
    typeLabel: 'XLR/TRS connection cables',
    setupRole: 'Connects microphones, interfaces, monitors, and accessories without having to buy cables one by one.',
    category: 'Cables',
    price: '$39',
    rating: '4.5',
    bestFor: 'Connecting mics, interfaces, monitors, and lights',
    image: '/assets/product-cables.png',
    pros: ['Balanced XLR and TRS options', 'Color-coded ends', 'Good starter lengths'],
    cons: ['May need longer runs for large desks', 'No premium braided finish'],
  },
  {
    id: 'stand-zero-boom',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'microphone boom arm desk stand podcast streaming',
    slug: 'zero-noise-boom-stand',
    name: 'Desktop Microphone Boom Arm',
    typeLabel: 'Adjustable desk mic stand',
    setupRole: 'Keeps the microphone close, stable, and off the desk so voice tone stays consistent between takes.',
    category: 'Stands',
    price: '$59',
    rating: '4.4',
    bestFor: 'Podcasts, streams, desk vocal takes',
    image: '/assets/product-stand.png',
    pros: ['Stable arm tension', 'Cable channel', 'Quiet repositioning'],
    cons: ['Desk clamp needs clearance', 'Heavy mics need tightening'],
  },
  {
    id: 'lighting-softgrid',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'creator LED video light desk mount streaming youtube',
    slug: 'softgrid-creator-light',
    name: 'Desk-Mounted LED Key Light',
    typeLabel: 'Soft creator video light',
    setupRole: 'Adds clean face or product lighting for streams, shorts, YouTube reviews, and gear-demo clips.',
    category: 'Lighting',
    price: '$74',
    rating: '4.5',
    bestFor: 'YouTube reviews, Twitch scenes, product shots',
    image: '/assets/product-lighting.png',
    pros: ['Adjustable color temperature', 'Desk-mount friendly', 'Soft face light'],
    cons: ['Not battery powered', 'Requires USB power brick'],
  },
  {
    id: 'accessory-pop-filter',
    affiliateId: 'PRODUCT_ID',
    searchQuery: 'microphone pop filter podcast vocal recording',
    slug: 'studio-pop-filter-kit',
    name: 'Microphone Pop Filter',
    typeLabel: 'Plosive control screen',
    setupRole: 'Softens harsh P and B sounds before they hit the mic capsule, making voice takes easier to edit.',
    category: 'Creator Accessories',
    price: '$24',
    rating: '4.2',
    bestFor: 'Cleaner plosives and more consistent vocal takes',
    image: '/assets/product-pop-filter.png',
    pros: ['Dual-layer screen', 'Flexible gooseneck', 'Cheap vocal upgrade'],
    cons: ['Adds setup clutter', 'Clamp can mark soft surfaces'],
  },
];

export const gearKits = [
  {
    id: 'beginner-podcast-kit',
    slug: 'beginner-podcast-kit',
    name: 'Beginner Podcast Kit',
    searchQuery: 'podcast microphone kit XLR audio interface boom arm pop filter',
    estimatedPrice: '$290',
    difficulty: 'Easy',
    image: '/assets/product-microphone.png',
    products: ['mic-orbit-dynamic', 'interface-pulse-2x2', 'stand-zero-boom', 'accessory-pop-filter'],
    whyItWorks:
      'A focused voice chain with room-noise rejection, direct monitoring, and the desk hardware needed for consistent mic placement.',
  },
  {
    id: 'bedroom-producer-kit',
    slug: 'bedroom-producer-kit',
    name: 'Bedroom Producer Kit',
    searchQuery: 'bedroom producer home studio bundle audio interface midi keyboard headphones',
    estimatedPrice: '$615',
    difficulty: 'Intermediate',
    image: '/assets/product-interface.png',
    products: ['interface-pulse-2x2', 'headphones-nightfield', 'midi-chroma-keys', 'monitors-nearfield-5', 'cables-studio-pack'],
    whyItWorks:
      'Balanced monitoring, MIDI input, and clean capture for writing, tracking, and mixing in a small room.',
  },
  {
    id: 'streamer-voice-kit',
    slug: 'streamer-voice-kit',
    name: 'Streamer Voice Kit',
    searchQuery: 'streamer microphone audio interface headphones boom arm lighting kit',
    estimatedPrice: '$405',
    difficulty: 'Easy',
    image: '/assets/product-headphones.png',
    products: ['mic-orbit-dynamic', 'interface-pulse-2x2', 'headphones-nightfield', 'stand-zero-boom', 'lighting-softgrid'],
    whyItWorks:
      'Broadcast-style vocal presence with monitoring and lighting that keeps the camera scene as polished as the sound.',
  },
  {
    id: 'lofi-beatmaker-kit',
    slug: 'lofi-beatmaker-kit',
    name: 'Lo-fi Beatmaker Kit',
    searchQuery: 'lofi beatmaker setup MIDI keyboard studio headphones audio interface',
    estimatedPrice: '$306',
    difficulty: 'Easy',
    image: '/assets/product-midi.png',
    products: ['midi-chroma-keys', 'headphones-nightfield', 'interface-pulse-2x2', 'cables-studio-pack'],
    whyItWorks:
      'A portable writing rig for dusty chords, chopped samples, and late-night arrangements without overbuying.',
  },
  {
    id: 'mobile-creator-kit',
    slug: 'mobile-creator-kit',
    name: 'Mobile Creator Kit',
    searchQuery: 'mobile creator microphone USB headphones lighting kit',
    estimatedPrice: '$226',
    difficulty: 'Easy',
    image: '/assets/product-usb-mic.png',
    products: ['mic-aura-usb', 'headphones-nightfield', 'lighting-softgrid', 'accessory-pop-filter'],
    whyItWorks:
      'Fast USB capture, monitoring, and compact lighting for creators who move between desks, shoots, and travel bags.',
  },
  {
    id: 'pro-home-studio-starter-kit',
    slug: 'pro-home-studio-starter-kit',
    name: 'Pro Home Studio Starter Kit',
    searchQuery: 'home studio starter kit microphone audio interface studio monitors acoustic treatment',
    estimatedPrice: '$792',
    difficulty: 'Advanced',
    image: '/assets/product-monitors.png',
    products: [
      'mic-orbit-dynamic',
      'interface-pulse-2x2',
      'monitors-nearfield-5',
      'treatment-foam-cloud',
      'midi-chroma-keys',
      'cables-studio-pack',
    ],
    whyItWorks:
      'A full signal path that pairs capture, control, monitoring, and first-pass acoustic treatment for serious home releases.',
  },
];

export const trends = [
  {
    id: 'lofi-hip-hop',
    name: 'Lo-fi hip hop',
    slug: 'lofi-hip-hop',
    description: 'Dusty drums, warm chords, tape-soft transients, and headphone-first writing energy.',
    popularityScore: 91,
    velocity: '+18%',
    recommendedKit: 'lofi-beatmaker-kit',
    tags: ['beats', 'study', 'warm'],
  },
  {
    id: 'dark-trap',
    name: 'Dark trap',
    slug: 'dark-trap',
    description: '808 pressure, minor-key leads, clipped drums, and close vocal capture with controlled room tone.',
    popularityScore: 88,
    velocity: '+12%',
    recommendedKit: 'bedroom-producer-kit',
    tags: ['808', 'vocal', 'night'],
  },
  {
    id: 'afrobeats-bounce',
    name: 'Afrobeats bounce',
    slug: 'afrobeats-bounce',
    description: 'Bright percussion, syncopated keys, smooth vocal layers, and movement-friendly mixes.',
    popularityScore: 86,
    velocity: '+21%',
    recommendedKit: 'bedroom-producer-kit',
    tags: ['groove', 'keys', 'vocal'],
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    slug: 'synthwave',
    description: 'Wide pads, pulsing arps, gated drums, and neon-toned stereo depth.',
    popularityScore: 82,
    velocity: '+9%',
    recommendedKit: 'pro-home-studio-starter-kit',
    tags: ['retro', 'synth', 'wide'],
  },
  {
    id: 'clean-podcast-voice',
    name: 'Clean podcast voice',
    slug: 'clean-podcast-voice',
    description: 'Tight dynamic mic tone, low room reflection, and speech that cuts without harshness.',
    popularityScore: 94,
    velocity: '+16%',
    recommendedKit: 'beginner-podcast-kit',
    tags: ['voice', 'podcast', 'clarity'],
  },
  {
    id: 'viral-tiktok-vocal-chain',
    name: 'Viral TikTok vocal chain',
    slug: 'viral-tiktok-vocal-chain',
    description: 'Forward vocal, quick compression, bright top end, and a setup that records before the idea cools off.',
    popularityScore: 97,
    velocity: '+28%',
    recommendedKit: 'mobile-creator-kit',
    tags: ['shorts', 'vocal', 'mobile'],
  },
];

export const creatorSetups = [
  {
    id: 'bedroom-producer',
    slug: 'bedroom-producer',
    name: 'Bedroom Producer',
    soundGoal: 'Release-ready demos with clear monitoring, quick MIDI entry, and controlled vocal takes.',
    image: '/assets/product-interface.png',
    gearList: ['interface-pulse-2x2', 'midi-chroma-keys', 'headphones-nightfield', 'monitors-nearfield-5', 'treatment-foam-cloud'],
    budgetVersion:
      'Start with closed-back headphones, the compact MIDI controller, and a 2x2 interface. Add monitors once your desk layout is stable.',
    upgradedVersion:
      'Add nearfield monitors, acoustic treatment at first-reflection points, and a dynamic mic for guide vocals or content.',
    buyingGuide:
      'Prioritize monitoring before flashy instruments. If you cannot hear the low mids clearly, your mixes will keep fighting you.',
  },
  {
    id: 'podcast-host',
    slug: 'podcast-host',
    name: 'Podcast Host',
    soundGoal: 'A close, authoritative spoken-word tone that stays consistent across weekly recording sessions.',
    image: '/assets/product-microphone.png',
    gearList: ['mic-orbit-dynamic', 'interface-pulse-2x2', 'stand-zero-boom', 'accessory-pop-filter', 'treatment-foam-cloud'],
    budgetVersion:
      'Use the dynamic mic on a boom arm with a pop filter, then record close to keep the room out of the take.',
    upgradedVersion:
      'Add wall treatment behind and beside the mic, then keep the interface gain staged conservatively for easier editing.',
    buyingGuide:
      'Voice quality is mostly placement, rejection, and room control. The mic matters, but the room decides how premium it feels.',
  },
  {
    id: 'twitch-streamer',
    slug: 'twitch-streamer',
    name: 'Twitch Streamer',
    soundGoal: 'Broadcast voice, low keyboard bleed, and camera-ready lighting without a complicated desk.',
    image: '/assets/product-headphones.png',
    gearList: ['mic-orbit-dynamic', 'interface-pulse-2x2', 'headphones-nightfield', 'stand-zero-boom', 'lighting-softgrid'],
    budgetVersion:
      'Choose the dynamic mic, boom arm, and headphones first. Use software processing for compression and noise control.',
    upgradedVersion:
      'Add the interface and soft key light to give your voice and camera feed the same finished feel.',
    buyingGuide:
      'Keep the microphone close and off-axis from your keyboard. That one placement decision can beat a lot of expensive cleanup tools.',
  },
  {
    id: 'youtube-reviewer',
    slug: 'youtube-reviewer',
    name: 'YouTube Reviewer',
    soundGoal: 'Clear voiceover, tidy desk shots, and reliable audio when switching between talking head and product B-roll.',
    image: '/assets/product-lighting.png',
    gearList: ['mic-aura-usb', 'headphones-nightfield', 'lighting-softgrid', 'stand-zero-boom', 'cables-studio-pack'],
    budgetVersion:
      'Use a USB mic and soft light for a fast, repeatable talking-head setup that travels between rooms.',
    upgradedVersion:
      'Move to an XLR mic and interface once your channel workflow demands multiple inputs or more routing control.',
    buyingGuide:
      'A repeatable scene beats a complicated one. Buy gear that makes every shoot faster to set up and easier to edit.',
  },
  {
    id: 'mobile-beatmaker',
    slug: 'mobile-beatmaker',
    name: 'Mobile Beatmaker',
    soundGoal: 'Sketch loops, sample ideas, and short-form hooks from a backpack-sized rig.',
    image: '/assets/product-midi.png',
    gearList: ['midi-chroma-keys', 'headphones-nightfield', 'mic-aura-usb', 'cables-studio-pack'],
    budgetVersion:
      'Pair the mini MIDI controller with closed-back headphones and use your laptop or tablet as the production hub.',
    upgradedVersion:
      'Add a compact USB mic for vocal textures, tags, and quick hooks without rebuilding the rig.',
    buyingGuide:
      'Portability only works when you actually carry it. Favor light gear with fewer cables and fast setup rituals.',
  },
];

export const articles = [
  {
    id: 'best-microphones-clean-podcast-voice',
    slug: 'best-microphones-for-clean-podcast-voice',
    title: 'Best Microphones for Clean Podcast Voice',
    intro:
      'A clean podcast voice starts with a mic that rejects the room, a stable position, and enough gain to stay full without clipping.',
    recommendedProducts: ['mic-orbit-dynamic', 'interface-pulse-2x2', 'stand-zero-boom', 'accessory-pop-filter'],
    comparison: [
      { product: 'mic-orbit-dynamic', bestFor: 'Primary voice capture', score: '9.2' },
      { product: 'interface-pulse-2x2', bestFor: 'Clean gain and monitoring', score: '8.9' },
      { product: 'stand-zero-boom', bestFor: 'Consistent placement', score: '8.5' },
    ],
    buyingGuide:
      'Choose a dynamic mic if your room is untreated, keep it close, and spend a little budget on placement accessories before chasing more expensive processing.',
    faq: [
      ['Do I need XLR for a podcast?', 'Not always, but XLR gives more upgrade room if you plan to grow the setup.'],
      ['What matters most for voice clarity?', 'Mic distance, room reflections, and consistent gain staging.'],
    ],
  },
  {
    id: 'lofi-setup-under-300',
    slug: 'how-to-build-a-lo-fi-beat-setup-under-300',
    title: 'How to Build a Lo-fi Beat Setup Under $300',
    intro:
      'Lo-fi production rewards quick ideas, cozy monitoring, and a controller that keeps chords and drums close at hand.',
    recommendedProducts: ['midi-chroma-keys', 'headphones-nightfield', 'cables-studio-pack'],
    comparison: [
      { product: 'midi-chroma-keys', bestFor: 'Chords and drums', score: '8.8' },
      { product: 'headphones-nightfield', bestFor: 'Late-night monitoring', score: '8.6' },
      { product: 'cables-studio-pack', bestFor: 'Reliable routing', score: '8.0' },
    ],
    buyingGuide:
      'Put your first dollars into a MIDI controller and headphones. Add an interface when you start recording external audio or vocals.',
    faq: [
      ['Can I make beats without monitors?', 'Yes. Closed-back headphones are enough to write and arrange, especially at a starter budget.'],
      ['What makes a setup sound lo-fi?', 'The sound is mostly production choices: samples, saturation, swing, filtering, and soft transients.'],
    ],
  },
  {
    id: 'viral-tiktok-vocal-chain',
    slug: 'what-gear-do-you-need-for-a-viral-tiktok-vocal-chain',
    title: 'What Gear Do You Need for a Viral TikTok Vocal Chain?',
    intro:
      'Short-form vocal chains need speed first: a mic that is always ready, monitoring that prevents bad takes, and lighting that keeps the clip usable.',
    recommendedProducts: ['mic-aura-usb', 'headphones-nightfield', 'lighting-softgrid', 'accessory-pop-filter'],
    comparison: [
      { product: 'mic-aura-usb', bestFor: 'Fast USB vocal capture', score: '8.7' },
      { product: 'headphones-nightfield', bestFor: 'Avoiding bleed', score: '8.4' },
      { product: 'lighting-softgrid', bestFor: 'Camera-ready takes', score: '8.2' },
    ],
    buyingGuide:
      'For viral workflows, reduce friction. The best gear is the gear that lets you record the idea in under a minute.',
    faq: [
      ['Is USB good enough for TikTok vocals?', 'Yes, especially when the performance and processing are strong.'],
      ['Should I buy lights for an audio setup?', 'If video is part of the post, lighting often matters as much as the vocal chain.'],
    ],
  },
  {
    id: 'audio-interfaces-bedroom-producers',
    slug: 'best-audio-interfaces-for-bedroom-producers',
    title: 'Best Audio Interfaces for Bedroom Producers',
    intro:
      'A bedroom producer interface should provide clean input gain, direct monitoring, stable drivers, and enough outputs to grow into monitors.',
    recommendedProducts: ['interface-pulse-2x2', 'monitors-nearfield-5', 'cables-studio-pack', 'mic-orbit-dynamic'],
    comparison: [
      { product: 'interface-pulse-2x2', bestFor: 'Two-input production hub', score: '9.0' },
      { product: 'monitors-nearfield-5', bestFor: 'Mix translation', score: '8.7' },
      { product: 'cables-studio-pack', bestFor: 'Balanced connections', score: '8.1' },
    ],
    buyingGuide:
      'Buy an interface around your input needs for the next year, not the next decade. Two clean inputs are enough for most creators starting out.',
    faq: [
      ['How many inputs do I need?', 'Most solo producers are fine with two combo inputs.'],
      ['Do interfaces improve sound quality?', 'They improve recording quality, monitoring control, and connection reliability.'],
    ],
  },
];

export const adminGeneratedArticles = [
  {
    title: 'Clean Podcast Voice: Dynamic Mic Chains Ranked',
    trend: 'Clean podcast voice',
    status: 'Ready for review',
    revenueScore: '$420/mo',
    confidence: '92%',
  },
  {
    title: 'Afrobeats Bounce Starter Gear for Home Producers',
    trend: 'Afrobeats bounce',
    status: 'Drafting',
    revenueScore: '$310/mo',
    confidence: '86%',
  },
  {
    title: 'Viral TikTok Vocal Chain Under $250',
    trend: 'Viral TikTok vocal chain',
    status: 'Queued',
    revenueScore: '$680/mo',
    confidence: '95%',
  },
];

export const getProductById = (id) => products.find((product) => product.id === id);

export const getKitById = (id) => gearKits.find((kit) => kit.id === id);

export const productSearchQuery = (product) =>
  product.searchQuery || [product.name, product.category, product.bestFor].filter(Boolean).join(' ');

export const kitSearchQuery = (kit) =>
  kit.searchQuery ||
  [
    kit.name,
    ...kit.products.map(getProductById).filter(Boolean).map((product) => product.searchQuery || product.name),
  ]
    .filter(Boolean)
    .join(' ');
