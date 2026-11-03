/**
 * ScaleReach 29 Split-Screen B-Roll Video Asset Catalog
 * Across GTA 5 (13), Minecraft (8), Subway Surfers (3), ASMR (5)
 */

export interface BRollItem {
  id: string;
  name: string;
  duration: number;
  preview: string;
  category: string;
  sourceUrl?: string;
}

export type BrollAsset = BRollItem;

export interface BRollCategory {
  category: string;
  count: number;
  items: BRollItem[];
}

export const BROLL_CATEGORIES: BRollCategory[] = [
  {
    category: 'GTA 5',
    count: 13,
    items: [
      { id: 'gta-1', name: 'GTA 5 - 1', duration: 90, preview: '/backgrounds/thumbnails/gta_1.gif', category: 'GTA 5' },
      { id: 'gta-2', name: 'GTA 5 - 2', duration: 90, preview: '/backgrounds/thumbnails/gta_2.gif', category: 'GTA 5' },
      { id: 'gta-3', name: 'GTA 5 - 3', duration: 90, preview: '/backgrounds/thumbnails/gta_3.gif', category: 'GTA 5' },
      { id: 'gta-4', name: 'GTA 5 - 4', duration: 90, preview: '/backgrounds/thumbnails/gta_4.gif', category: 'GTA 5' },
      { id: 'gta-5', name: 'GTA 5 - 5', duration: 90, preview: '/backgrounds/thumbnails/gta_5.gif', category: 'GTA 5' },
      { id: 'gta-6', name: 'GTA 5 - 6', duration: 90, preview: '/backgrounds/thumbnails/gta_6.gif', category: 'GTA 5' },
      { id: 'gta-7', name: 'GTA 5 - 7', duration: 90, preview: '/backgrounds/thumbnails/gta_7.gif', category: 'GTA 5' },
      { id: 'gta-8', name: 'GTA 5 - 8', duration: 90, preview: '/backgrounds/thumbnails/gta_8.gif', category: 'GTA 5' },
      { id: 'gta-9', name: 'GTA 5 - 9', duration: 90, preview: '/backgrounds/thumbnails/gta_9.gif', category: 'GTA 5' },
      { id: 'gta-10', name: 'GTA 5 - 10', duration: 90, preview: '/backgrounds/thumbnails/gta_10.gif', category: 'GTA 5' },
      { id: 'gta-11', name: 'GTA 5 - 11', duration: 90, preview: '/backgrounds/thumbnails/gta_11.gif', category: 'GTA 5' },
      { id: 'gta-12', name: 'GTA 5 - 12', duration: 90, preview: '/backgrounds/thumbnails/gta_12.gif', category: 'GTA 5' },
      { id: 'gta-13', name: 'GTA 5 - 13', duration: 90, preview: '/backgrounds/thumbnails/gta_13.gif', category: 'GTA 5' },
    ],
  },
  {
    category: 'Minecraft',
    count: 8,
    items: [
      { id: 'mc-1', name: 'Minecraft 1 (Parkour Spiral)', duration: 90, preview: '/backgrounds/thumbnails/mc_1.gif', category: 'Minecraft' },
      { id: 'mc-2', name: 'Minecraft 2 (Dropper)', duration: 90, preview: '/backgrounds/thumbnails/mc_2.gif', category: 'Minecraft' },
      { id: 'mc-3', name: 'Minecraft 3 (Speedrun Nether)', duration: 90, preview: '/backgrounds/thumbnails/mc_3.gif', category: 'Minecraft' },
      { id: 'mc-4', name: 'Minecraft 4 (Rainbow Parkour)', duration: 90, preview: '/backgrounds/thumbnails/mc_4.gif', category: 'Minecraft' },
      { id: 'mc-5', name: 'Minecraft 5 (Lava Jump)', duration: 90, preview: '/backgrounds/thumbnails/mc_5.gif', category: 'Minecraft' },
      { id: 'mc-6', name: 'Minecraft 6 (Ice Boat Racing)', duration: 90, preview: '/backgrounds/thumbnails/mc_6.gif', category: 'Minecraft' },
      { id: 'mc-7', name: 'Minecraft 7 (Survival Build)', duration: 90, preview: '/backgrounds/thumbnails/mc_7.gif', category: 'Minecraft' },
      { id: 'mc-8', name: 'Minecraft 8 (TNT Trap Run)', duration: 90, preview: '/backgrounds/thumbnails/mc_8.gif', category: 'Minecraft' },
    ],
  },
  {
    category: 'Subway Surfers',
    count: 3,
    items: [
      { id: 'subway-1', name: 'Subway Surfer 1', duration: 80, preview: '/backgrounds/thumbnails/subway_1.gif', category: 'Subway Surfers' },
      { id: 'subway-2', name: 'Subway Surfer 2', duration: 90, preview: '/backgrounds/thumbnails/subway_2.gif', category: 'Subway Surfers' },
      { id: 'subway-3', name: 'Subway Surfer 3', duration: 90, preview: '/backgrounds/thumbnails/subway_3.gif', category: 'Subway Surfers' },
    ],
  },
  {
    category: 'ASMR',
    count: 5,
    items: [
      { id: 'asmr-1', name: 'ASMR Soothing (Kinetic Sand)', duration: 90, preview: '/backgrounds/thumbnails/asmr_1.gif', category: 'ASMR' },
      { id: 'asmr-2', name: 'ASMR Satisfying (Soap Cutting)', duration: 90, preview: '/backgrounds/thumbnails/asmr_2.gif', category: 'ASMR' },
      { id: 'asmr-3', name: 'ASMR Relaxing (Slime Mix)', duration: 90, preview: '/backgrounds/thumbnails/asmr_3.gif', category: 'ASMR' },
      { id: 'asmr-4', name: 'ASMR Slice (Hydraulic Press)', duration: 90, preview: '/backgrounds/thumbnails/asmr_4.gif', category: 'ASMR' },
      { id: 'asmr-5', name: 'ASMR Cutting (Laser Engrave)', duration: 90, preview: '/backgrounds/thumbnails/asmr_5.gif', category: 'ASMR' },
    ],
  },
];

export const ALL_BROLL_ITEMS: BRollItem[] = BROLL_CATEGORIES.flatMap(c => c.items);
export const ALL_BROLL_ASSETS: BrollAsset[] = ALL_BROLL_ITEMS;

export function getBRollById(id: string): BRollItem | undefined {
  return ALL_BROLL_ITEMS.find(item => item.id === id);
}

export function getBrollsByCategory(category: string): BrollAsset[] {
  if (!category || category === 'All') {
    return ALL_BROLL_ASSETS;
  }
  return ALL_BROLL_ASSETS.filter(a => a.category.toLowerCase() === category.toLowerCase());
}
