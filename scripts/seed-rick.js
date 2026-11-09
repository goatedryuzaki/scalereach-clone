const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'storage', 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const rickVideoId = 'lirl3b5hSPN5OINTZJTGd';
const rickClip1 = 'mR_JOA9k7Epv1rqUi_U92';
const rickClip2 = 'clip_rick_never_give_up';
const rickClip3 = 'clip_rick_together_forever';

db.videos[rickVideoId] = {
  id: rickVideoId,
  workspaceId: '0tw4uwrqqbgmw0kuqm9',
  title: 'Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)',
  description: 'The official 4K Remastered music video for Never Gonna Give You Up by Rick Astley.',
  duration: 214,
  status: 'completed',
  sourceType: 'url',
  sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
  progress: 100,
  clipConfig: {
    clipModel: 'ClipPro',
    duration: '0-30s',
    clipTypes: ['viral-clips'],
    captionTemplateId: 'classic',
    aspectRatio: '9:16'
  },
  expiresAt: null,
  createdAt: '2026-11-06T10:00:00.000Z',
  updatedAt: new Date().toISOString()
};

db.clips[rickClip1] = {
  id: rickClip1,
  videoId: rickVideoId,
  title: '#1 The Ultimate Rickroll',
  introTitle: "We're no strangers to love",
  startTime: 12.0,
  endTime: 30.5,
  duration: 18.5,
  transcript: "We're no strangers to love. You know the rules and so do I. A full commitment's what I'm thinking of. You wouldn't get this from any other guy!",
  viralityScore: 88,
  viralityReason: 'Legendary pop intro with unmatched instant recognition across global audiences.',
  improvementSuggestion: 'Already viral perfection. Direct export recommended.',
  hooks: ['Iconic Opening Beat', 'High Energy Dance Hook', 'Nostalgia Factor'],
  emotions: ['Joyful', 'Nostalgic', 'Energetic'],
  recommendedPlatforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
  aspectRatio: '9:16',
  templateId: 'classic',
  thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=60',
  favorited: true,
  createdAt: '2026-11-06T10:01:00.000Z',
  updatedAt: new Date().toISOString()
};

db.clips[rickClip2] = {
  id: rickClip2,
  videoId: rickVideoId,
  title: '#2 Never Gonna Let You Down',
  introTitle: 'Never gonna give you up!',
  startTime: 43.0,
  endTime: 67.2,
  duration: 24.2,
  transcript: 'Never gonna give you up! Never gonna let you down! Never gonna run around and desert you! Never gonna make you cry! Never gonna say goodbye!',
  viralityScore: 92,
  viralityReason: 'World-famous chorus hook with explosive audience participation and karaoke retention.',
  improvementSuggestion: 'Add dynamic zoom on the chorus drop for extra punch.',
  hooks: ['Explosive Chorus Hook', 'Universal Commitment Theme'],
  emotions: ['Euphoric', 'Inspired', 'Happy'],
  recommendedPlatforms: ['TikTok', 'YouTube Shorts', 'Instagram Reels'],
  aspectRatio: '9:16',
  templateId: 'cyan-slide',
  thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=60',
  favorited: false,
  createdAt: '2026-11-06T10:02:00.000Z',
  updatedAt: new Date().toISOString()
};

db.clips[rickClip3] = {
  id: rickClip3,
  videoId: rickVideoId,
  title: '#3 We Know the Game',
  introTitle: "We're gonna play it",
  startTime: 80.0,
  endTime: 100.5,
  duration: 20.5,
  transcript: "We've known each other for so long. Your heart's been aching but you're too shy to say it. Inside we both know what's been going on.",
  viralityScore: 85,
  viralityReason: 'High emotional relatability with deep curiosity gap pacing.',
  improvementSuggestion: 'Cut dead air before the rhythm section comes back in.',
  hooks: ['Direct Eye Contact', 'Relatable Relationship Hook'],
  emotions: ['Curious', 'Empathetic'],
  recommendedPlatforms: ['TikTok', 'YouTube Shorts'],
  aspectRatio: '9:16',
  templateId: 'italic-red',
  thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=60',
  favorited: false,
  createdAt: '2026-11-06T10:03:00.000Z',
  updatedAt: new Date().toISOString()
};

db.captions[rickClip1] = {
  clipId: rickClip1,
  presetId: 'classic',
  words: [
    { id: 'rw-1', word: "We're", start: 0.1, end: 0.4, isHighlighted: false },
    { id: 'rw-2', word: 'no', start: 0.45, end: 0.7, isHighlighted: false },
    { id: 'rw-3', word: 'strangers', start: 0.75, end: 1.3, isHighlighted: true, color: '#38BDF8' },
    { id: 'rw-4', word: 'to', start: 1.35, end: 1.5, isHighlighted: false },
    { id: 'rw-5', word: 'love', start: 1.55, end: 2.1, isHighlighted: true, color: '#F43F5E', emoji: '❤️' },
    { id: 'rw-6', word: 'You', start: 2.3, end: 2.5, isHighlighted: false },
    { id: 'rw-7', word: 'know', start: 2.55, end: 2.8, isHighlighted: false },
    { id: 'rw-8', word: 'the', start: 2.85, end: 3.0, isHighlighted: false },
    { id: 'rw-9', word: 'rules', start: 3.05, end: 3.5, isHighlighted: true, color: '#FACC15', emoji: '📜' },
    { id: 'rw-10', word: 'and', start: 3.55, end: 3.7, isHighlighted: false },
    { id: 'rw-11', word: 'so', start: 3.75, end: 3.9, isHighlighted: false },
    { id: 'rw-12', word: 'do', start: 3.95, end: 4.1, isHighlighted: false },
    { id: 'rw-13', word: 'I!', start: 4.15, end: 4.7, isHighlighted: true, color: '#4ADE80', emoji: '🔥' }
  ],
  style: {
    fontFamily: 'Montserrat',
    fontSize: 44,
    textColor: '#FFFFFF',
    highlightColor: '#38BDF8',
    strokeColor: '#000000',
    strokeWidth: 4,
    animation: 'fade'
  }
};

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Seeded Rick Astley video and clips successfully!');
