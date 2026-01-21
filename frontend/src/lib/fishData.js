// ========================================================================
// GO FISH! - COMPREHENSIVE FISH DATABASE (AAA Quality)
// 100+ Fish Species with detailed stats, behaviors, and habitats
// ========================================================================

// ========== FISH RARITY TIERS ==========
export const RARITY_TIERS = {
  COMMON: { tier: 0, name: 'Common', color: '#9CA3AF', chance: 0.50, multiplier: 1.0 },
  UNCOMMON: { tier: 1, name: 'Uncommon', color: '#22C55E', chance: 0.30, multiplier: 1.5 },
  RARE: { tier: 2, name: 'Rare', color: '#3B82F6', chance: 0.15, multiplier: 2.5 },
  EPIC: { tier: 3, name: 'Epic', color: '#A855F7', chance: 0.04, multiplier: 5.0 },
  LEGENDARY: { tier: 4, name: 'Legendary', color: '#F59E0B', chance: 0.009, multiplier: 10.0 },
  MYTHIC: { tier: 5, name: 'Mythic', color: '#EF4444', chance: 0.001, multiplier: 50.0 },
};

// ========== FISH HABITATS ==========
export const HABITATS = {
  FRESHWATER_SURFACE: { name: 'Freshwater Surface', icon: '🌊', stages: [0, 1] },
  FRESHWATER_DEEP: { name: 'Freshwater Deep', icon: '🌀', stages: [0, 1] },
  OCEAN_SHALLOW: { name: 'Ocean Shallow', icon: '🏖️', stages: [2] },
  OCEAN_DEEP: { name: 'Ocean Deep', icon: '🌊', stages: [2, 3] },
  OCEAN_ABYSS: { name: 'Ocean Abyss', icon: '⬛', stages: [3] },
  CORAL_REEF: { name: 'Coral Reef', icon: '🪸', stages: [2] },
  ARCTIC: { name: 'Arctic Waters', icon: '❄️', stages: [3] },
  TROPICAL: { name: 'Tropical Waters', icon: '🌴', stages: [1, 2] },
  CAVE: { name: 'Underground Cave', icon: '🕳️', stages: [3] },
  SWAMP: { name: 'Swamp', icon: '🐊', stages: [0, 1] },
};

// ========== COMPREHENSIVE FISH DATABASE ==========
export const FISH_DATABASE = [
  // ==================== COMMON FISH (40) ====================
  { id: 1, name: 'Minnow', size: [5, 12], rarity: 0, points: 10, color: '#8B7355', habitat: 'FRESHWATER_SURFACE', timePreference: 'any', description: 'Tiny but plentiful' },
  { id: 2, name: 'Perch', size: [15, 30], rarity: 0, points: 15, color: '#4CAF50', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Green striped beauty' },
  { id: 3, name: 'Bluegill', size: [10, 25], rarity: 0, points: 12, color: '#2196F3', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Popular panfish' },
  { id: 4, name: 'Crappie', size: [15, 35], rarity: 0, points: 18, color: '#607D8B', habitat: 'FRESHWATER_SURFACE', timePreference: 'any', description: 'Speckled beauty' },
  { id: 5, name: 'Sunfish', size: [8, 20], rarity: 0, points: 8, color: '#FFC107', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Loves the sunshine' },
  { id: 6, name: 'Shad', size: [15, 40], rarity: 0, points: 14, color: '#90A4AE', habitat: 'FRESHWATER_SURFACE', timePreference: 'any', description: 'Swift schooling fish' },
  { id: 7, name: 'Carp', size: [30, 80], rarity: 0, points: 25, color: '#795548', habitat: 'FRESHWATER_DEEP', timePreference: 'any', description: 'Bottom feeder' },
  { id: 8, name: 'Goldfish', size: [5, 15], rarity: 0, points: 20, color: '#FF9800', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Escaped pet' },
  { id: 9, name: 'Chub', size: [15, 35], rarity: 0, points: 16, color: '#8D6E63', habitat: 'FRESHWATER_SURFACE', timePreference: 'any', description: 'Round and plump' },
  { id: 10, name: 'Dace', size: [10, 25], rarity: 0, points: 13, color: '#BDBDBD', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Quick silver fish' },
  { id: 11, name: 'Roach', size: [12, 30], rarity: 0, points: 14, color: '#E57373', habitat: 'FRESHWATER_SURFACE', timePreference: 'any', description: 'Red-finned fish' },
  { id: 12, name: 'Bream', size: [20, 45], rarity: 0, points: 22, color: '#A1887F', habitat: 'FRESHWATER_DEEP', timePreference: 'dusk', description: 'Deep water dweller' },
  { id: 13, name: 'Sardine', size: [8, 18], rarity: 0, points: 8, color: '#78909C', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'In big schools' },
  { id: 14, name: 'Anchovy', size: [5, 15], rarity: 0, points: 6, color: '#90A4AE', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Tiny but tasty' },
  { id: 15, name: 'Herring', size: [15, 35], rarity: 0, points: 18, color: '#607D8B', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Silver swimmer' },
  { id: 16, name: 'Mackerel', size: [20, 50], rarity: 0, points: 28, color: '#26A69A', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Fast predator' },
  { id: 17, name: 'Flounder', size: [25, 60], rarity: 0, points: 35, color: '#8D6E63', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Flat bottom fish' },
  { id: 18, name: 'Sole', size: [20, 45], rarity: 0, points: 30, color: '#BCAAA4', habitat: 'OCEAN_SHALLOW', timePreference: 'night', description: 'Delicious flatfish' },
  { id: 19, name: 'Whiting', size: [25, 55], rarity: 0, points: 32, color: '#CFD8DC', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'White fish' },
  { id: 20, name: 'Pollack', size: [30, 70], rarity: 0, points: 38, color: '#455A64', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Atlantic dweller' },
  { id: 21, name: 'Mullet', size: [20, 50], rarity: 0, points: 25, color: '#78909C', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Coastal swimmer' },
  { id: 22, name: 'Smelt', size: [10, 25], rarity: 0, points: 15, color: '#B0BEC5', habitat: 'FRESHWATER_SURFACE', timePreference: 'night', description: 'Smells like cucumber' },
  { id: 23, name: 'Goby', size: [5, 15], rarity: 0, points: 8, color: '#6D4C41', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Bottom hugger' },
  { id: 24, name: 'Blenny', size: [8, 20], rarity: 0, points: 12, color: '#5D4037', habitat: 'CORAL_REEF', timePreference: 'day', description: 'Rock dweller' },
  { id: 25, name: 'Sculpin', size: [15, 35], rarity: 0, points: 20, color: '#4E342E', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Spiny head' },
  { id: 26, name: 'Tilapia', size: [15, 40], rarity: 0, points: 22, color: '#80CBC4', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Tropical staple' },
  { id: 27, name: 'Mojarra', size: [10, 25], rarity: 0, points: 14, color: '#B2DFDB', habitat: 'TROPICAL', timePreference: 'day', description: 'Silver disc' },
  { id: 28, name: 'Grunt', size: [15, 35], rarity: 0, points: 18, color: '#FFCC80', habitat: 'CORAL_REEF', timePreference: 'night', description: 'Makes grunting sounds' },
  { id: 29, name: 'Pinfish', size: [8, 20], rarity: 0, points: 10, color: '#FFE082', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Spiny little fish' },
  { id: 30, name: 'Sheepshead', size: [25, 55], rarity: 0, points: 35, color: '#263238', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Human-like teeth' },
  { id: 31, name: 'Croaker', size: [20, 45], rarity: 0, points: 28, color: '#A1887F', habitat: 'OCEAN_SHALLOW', timePreference: 'night', description: 'Makes croaking sounds' },
  { id: 32, name: 'Spot', size: [10, 25], rarity: 0, points: 12, color: '#D7CCC8', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Has a spot' },
  { id: 33, name: 'Sea Robin', size: [20, 40], rarity: 0, points: 24, color: '#EF5350', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Wing-like fins' },
  { id: 34, name: 'Butterfish', size: [15, 30], rarity: 0, points: 20, color: '#90CAF9', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Slippery and round' },
  { id: 35, name: 'Scup', size: [20, 40], rarity: 0, points: 26, color: '#CE93D8', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Also called porgy' },
  { id: 36, name: 'Pumpkinseed', size: [10, 20], rarity: 0, points: 15, color: '#FF7043', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Orange and blue' },
  { id: 37, name: 'Rock Bass', size: [15, 30], rarity: 0, points: 20, color: '#6D4C41', habitat: 'FRESHWATER_DEEP', timePreference: 'any', description: 'Red-eyed bass' },
  { id: 38, name: 'White Bass', size: [20, 45], rarity: 0, points: 30, color: '#ECEFF1', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Silver stripes' },
  { id: 39, name: 'Yellow Perch', size: [15, 35], rarity: 0, points: 22, color: '#FFEB3B', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Golden beauty' },
  { id: 40, name: 'Creek Chub', size: [15, 30], rarity: 0, points: 16, color: '#8D6E63', habitat: 'FRESHWATER_SURFACE', timePreference: 'any', description: 'Creek dweller' },
  
  // ==================== UNCOMMON FISH (30) ====================
  { id: 41, name: 'Largemouth Bass', size: [30, 70], rarity: 1, points: 50, color: '#4CAF50', habitat: 'FRESHWATER_DEEP', timePreference: 'any', description: 'Trophy fish' },
  { id: 42, name: 'Smallmouth Bass', size: [25, 55], rarity: 1, points: 45, color: '#689F38', habitat: 'FRESHWATER_DEEP', timePreference: 'day', description: 'Bronze fighter' },
  { id: 43, name: 'Walleye', size: [35, 80], rarity: 1, points: 65, color: '#FFC107', habitat: 'FRESHWATER_DEEP', timePreference: 'night', description: 'Glowing eyes' },
  { id: 44, name: 'Northern Pike', size: [50, 120], rarity: 1, points: 80, color: '#558B2F', habitat: 'FRESHWATER_DEEP', timePreference: 'any', description: 'Water wolf' },
  { id: 45, name: 'Muskie', size: [70, 150], rarity: 1, points: 120, color: '#33691E', habitat: 'FRESHWATER_DEEP', timePreference: 'dusk', description: 'Fish of 10000 casts' },
  { id: 46, name: 'Rainbow Trout', size: [30, 70], rarity: 1, points: 55, color: '#E91E63', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Colorful jumper' },
  { id: 47, name: 'Brown Trout', size: [35, 80], rarity: 1, points: 60, color: '#795548', habitat: 'FRESHWATER_DEEP', timePreference: 'dusk', description: 'Wily and smart' },
  { id: 48, name: 'Brook Trout', size: [20, 50], rarity: 1, points: 48, color: '#00BCD4', habitat: 'FRESHWATER_SURFACE', timePreference: 'day', description: 'Cold water beauty' },
  { id: 49, name: 'Lake Trout', size: [40, 100], rarity: 1, points: 75, color: '#546E7A', habitat: 'FRESHWATER_DEEP', timePreference: 'any', description: 'Deep lake dweller' },
  { id: 50, name: 'Catfish', size: [40, 100], rarity: 1, points: 70, color: '#5D4037', habitat: 'FRESHWATER_DEEP', timePreference: 'night', description: 'Whiskered giant' },
  { id: 51, name: 'Channel Catfish', size: [35, 90], rarity: 1, points: 65, color: '#6D4C41', habitat: 'FRESHWATER_DEEP', timePreference: 'night', description: 'Most popular catfish' },
  { id: 52, name: 'Blue Catfish', size: [50, 130], rarity: 1, points: 90, color: '#455A64', habitat: 'FRESHWATER_DEEP', timePreference: 'night', description: 'River monster' },
  { id: 53, name: 'Striped Bass', size: [40, 100], rarity: 1, points: 85, color: '#78909C', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Striped fighter' },
  { id: 54, name: 'Red Drum', size: [40, 100], rarity: 1, points: 80, color: '#D84315', habitat: 'OCEAN_SHALLOW', timePreference: 'dusk', description: 'Redfish' },
  { id: 55, name: 'Black Drum', size: [50, 120], rarity: 1, points: 95, color: '#37474F', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Big and powerful' },
  { id: 56, name: 'Snook', size: [40, 100], rarity: 1, points: 85, color: '#FDD835', habitat: 'TROPICAL', timePreference: 'night', description: 'Line cutter' },
  { id: 57, name: 'Tarpon', size: [80, 200], rarity: 1, points: 150, color: '#B0BEC5', habitat: 'TROPICAL', timePreference: 'any', description: 'Silver king' },
  { id: 58, name: 'Bonefish', size: [30, 70], rarity: 1, points: 70, color: '#ECEFF1', habitat: 'TROPICAL', timePreference: 'day', description: 'Ghost of the flats' },
  { id: 59, name: 'Permit', size: [40, 90], rarity: 1, points: 100, color: '#90A4AE', habitat: 'TROPICAL', timePreference: 'day', description: 'Ultimate flats fish' },
  { id: 60, name: 'Cobia', size: [50, 130], rarity: 1, points: 110, color: '#4E342E', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Ling' },
  { id: 61, name: 'Mahi-Mahi', size: [40, 120], rarity: 1, points: 100, color: '#00E676', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'Dolphinfish' },
  { id: 62, name: 'Wahoo', size: [50, 150], rarity: 1, points: 130, color: '#1565C0', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'Speed demon' },
  { id: 63, name: 'King Mackerel', size: [40, 120], rarity: 1, points: 90, color: '#455A64', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Kingfish' },
  { id: 64, name: 'Spanish Mackerel', size: [25, 60], rarity: 1, points: 55, color: '#0277BD', habitat: 'OCEAN_SHALLOW', timePreference: 'day', description: 'Spotted speedster' },
  { id: 65, name: 'Bluefish', size: [30, 70], rarity: 1, points: 60, color: '#1976D2', habitat: 'OCEAN_SHALLOW', timePreference: 'any', description: 'Chopper' },
  { id: 66, name: 'Red Snapper', size: [40, 90], rarity: 1, points: 85, color: '#E53935', habitat: 'OCEAN_DEEP', timePreference: 'any', description: 'Reef ruby' },
  { id: 67, name: 'Grouper', size: [50, 150], rarity: 1, points: 120, color: '#6D4C41', habitat: 'OCEAN_DEEP', timePreference: 'any', description: 'Reef tank' },
  { id: 68, name: 'Amberjack', size: [50, 140], rarity: 1, points: 110, color: '#FFA000', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'Reef donkey' },
  { id: 69, name: 'Triggerfish', size: [25, 55], rarity: 1, points: 50, color: '#7986CB', habitat: 'CORAL_REEF', timePreference: 'day', description: 'Tough teeth' },
  { id: 70, name: 'Hogfish', size: [30, 70], rarity: 1, points: 65, color: '#F48FB1', habitat: 'CORAL_REEF', timePreference: 'day', description: 'Pig-faced beauty' },
  
  // ==================== RARE FISH (20) ====================
  { id: 71, name: 'Yellowfin Tuna', size: [80, 200], rarity: 2, points: 200, color: '#FFD54F', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'Ocean racer' },
  { id: 72, name: 'Bluefin Tuna', size: [100, 300], rarity: 2, points: 350, color: '#1565C0', habitat: 'OCEAN_DEEP', timePreference: 'any', description: 'The ultimate tuna' },
  { id: 73, name: 'Swordfish', size: [100, 300], rarity: 2, points: 400, color: '#546E7A', habitat: 'OCEAN_DEEP', timePreference: 'night', description: 'Gladiator of the sea' },
  { id: 74, name: 'Sailfish', size: [80, 250], rarity: 2, points: 350, color: '#7C4DFF', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'Fastest fish alive' },
  { id: 75, name: 'Blue Marlin', size: [150, 400], rarity: 2, points: 500, color: '#2196F3', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'King of billfish' },
  { id: 76, name: 'White Marlin', size: [80, 200], rarity: 2, points: 300, color: '#ECEFF1', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'Atlantic beauty' },
  { id: 77, name: 'Mako Shark', size: [150, 350], rarity: 2, points: 450, color: '#455A64', habitat: 'OCEAN_DEEP', timePreference: 'any', description: 'Blue dynamite' },
  { id: 78, name: 'Hammerhead Shark', size: [200, 400], rarity: 2, points: 500, color: '#607D8B', habitat: 'OCEAN_DEEP', timePreference: 'dusk', description: 'Bizarre hunter' },
  { id: 79, name: 'Tiger Shark', size: [250, 450], rarity: 2, points: 550, color: '#5D4037', habitat: 'OCEAN_DEEP', timePreference: 'night', description: 'Garbage can of the sea' },
  { id: 80, name: 'Giant Trevally', size: [80, 170], rarity: 2, points: 280, color: '#607D8B', habitat: 'TROPICAL', timePreference: 'any', description: 'GT! The bull' },
  { id: 81, name: 'Roosterfish', size: [60, 140], rarity: 2, points: 250, color: '#1976D2', habitat: 'TROPICAL', timePreference: 'day', description: 'Mohawk warrior' },
  { id: 82, name: 'Peacock Bass', size: [40, 90], rarity: 2, points: 180, color: '#00C853', habitat: 'TROPICAL', timePreference: 'day', description: 'Amazon beauty' },
  { id: 83, name: 'Arapaima', size: [150, 300], rarity: 2, points: 400, color: '#4E342E', habitat: 'TROPICAL', timePreference: 'any', description: 'River monster' },
  { id: 84, name: 'Goliath Grouper', size: [200, 400], rarity: 2, points: 450, color: '#6D4C41', habitat: 'OCEAN_DEEP', timePreference: 'any', description: 'Gentle giant' },
  { id: 85, name: 'Barracuda', size: [80, 180], rarity: 2, points: 200, color: '#90A4AE', habitat: 'CORAL_REEF', timePreference: 'day', description: 'Tiger of the reef' },
  { id: 86, name: 'Giant Barramundi', size: [80, 150], rarity: 2, points: 220, color: '#B0BEC5', habitat: 'TROPICAL', timePreference: 'night', description: 'Australian icon' },
  { id: 87, name: 'Sturgeon', size: [150, 350], rarity: 2, points: 380, color: '#455A64', habitat: 'FRESHWATER_DEEP', timePreference: 'any', description: 'Living dinosaur' },
  { id: 88, name: 'Paddlefish', size: [100, 200], rarity: 2, points: 280, color: '#607D8B', habitat: 'FRESHWATER_DEEP', timePreference: 'any', description: 'Spoonbill' },
  { id: 89, name: 'Alligator Gar', size: [150, 300], rarity: 2, points: 350, color: '#33691E', habitat: 'SWAMP', timePreference: 'any', description: 'Prehistoric predator' },
  { id: 90, name: 'Giant Snakehead', size: [80, 150], rarity: 2, points: 240, color: '#263238', habitat: 'SWAMP', timePreference: 'any', description: 'Air breather' },
  
  // ==================== EPIC FISH (10) ====================
  { id: 91, name: 'Golden Koi', size: [50, 100], rarity: 3, points: 800, color: '#FFD700', habitat: 'FRESHWATER_SURFACE', timePreference: 'any', description: 'Symbol of luck', special: true },
  { id: 92, name: 'Albino Catfish', size: [60, 140], rarity: 3, points: 600, color: '#FFFDE7', habitat: 'FRESHWATER_DEEP', timePreference: 'night', description: 'Ghost of the deep', special: true },
  { id: 93, name: 'Electric Eel', size: [100, 250], rarity: 3, points: 700, color: '#FFEB3B', habitat: 'TROPICAL', timePreference: 'night', description: 'Shocking encounter', special: true },
  { id: 94, name: 'Giant Pacific Octopus', size: [200, 500], rarity: 3, points: 900, color: '#E91E63', habitat: 'OCEAN_DEEP', timePreference: 'night', description: 'Eight-armed genius', special: true },
  { id: 95, name: 'Napoleon Wrasse', size: [100, 200], rarity: 3, points: 750, color: '#00BCD4', habitat: 'CORAL_REEF', timePreference: 'day', description: 'Reef emperor', special: true },
  { id: 96, name: 'Oarfish', size: [300, 800], rarity: 3, points: 1000, color: '#B0BEC5', habitat: 'OCEAN_ABYSS', timePreference: 'any', description: 'Sea serpent', special: true },
  { id: 97, name: 'Giant Manta Ray', size: [400, 700], rarity: 3, points: 850, color: '#263238', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'Gentle giant', special: true },
  { id: 98, name: 'Ocean Sunfish', size: [200, 400], rarity: 3, points: 750, color: '#78909C', habitat: 'OCEAN_DEEP', timePreference: 'day', description: 'Mola mola', special: true },
  { id: 99, name: 'Whale Shark', size: [500, 1200], rarity: 3, points: 1200, color: '#455A64', habitat: 'OCEAN_DEEP', timePreference: 'any', description: 'Spotted giant', special: true },
  { id: 100, name: 'Coelacanth', size: [100, 200], rarity: 3, points: 1500, color: '#3F51B5', habitat: 'OCEAN_ABYSS', timePreference: 'night', description: 'Living fossil', special: true },
  
  // ==================== LEGENDARY FISH (8) ====================
  { id: 101, name: 'King Salmon', size: [100, 180], rarity: 4, points: 2000, color: '#E65100', habitat: 'FRESHWATER_DEEP', timePreference: 'any', description: 'Chinook royalty', legendary: true },
  { id: 102, name: 'Monster Bass', size: [80, 150], rarity: 4, points: 2500, color: '#1B5E20', habitat: 'FRESHWATER_DEEP', timePreference: 'dusk', description: 'Legendary lunker', legendary: true },
  { id: 103, name: 'Ghost Koi', size: [60, 120], rarity: 4, points: 3000, color: '#F5F5F5', habitat: 'FRESHWATER_SURFACE', timePreference: 'night', description: 'Phantom of the pond', legendary: true },
  { id: 104, name: 'Great White Shark', size: [400, 700], rarity: 4, points: 4000, color: '#ECEFF1', habitat: 'OCEAN_DEEP', timePreference: 'any', description: 'The apex predator', legendary: true },
  { id: 105, name: 'Giant Squid', size: [500, 1300], rarity: 4, points: 5000, color: '#D32F2F', habitat: 'OCEAN_ABYSS', timePreference: 'night', description: 'Kraken of the deep', legendary: true },
  { id: 106, name: 'Megamouth Shark', size: [400, 600], rarity: 4, points: 4500, color: '#424242', habitat: 'OCEAN_ABYSS', timePreference: 'night', description: 'Deep sea mystery', legendary: true },
  { id: 107, name: 'Greenland Shark', size: [400, 700], rarity: 4, points: 4000, color: '#546E7A', habitat: 'ARCTIC', timePreference: 'any', description: '400 years old', legendary: true },
  { id: 108, name: 'Arapaima Rex', size: [250, 450], rarity: 4, points: 3500, color: '#3E2723', habitat: 'TROPICAL', timePreference: 'any', description: 'Amazon emperor', legendary: true },
  
  // ==================== MYTHIC FISH (2) ====================
  { id: 109, name: 'Leviathan', size: [1000, 2000], rarity: 5, points: 25000, color: '#311B92', habitat: 'OCEAN_ABYSS', timePreference: 'any', description: 'The beast of legend', mythic: true, boss: true },
  { id: 110, name: 'Phoenix Koi', size: [80, 150], rarity: 5, points: 50000, color: '#FF6D00', habitat: 'CAVE', timePreference: 'any', description: 'Reborn from flame', mythic: true, boss: true },
];

// ========== FISH BEHAVIORS ==========
export const FISH_BEHAVIORS = {
  PASSIVE: { name: 'Passive', tensionMod: 0.8, escapeMod: 0.7, description: 'Easy to reel in' },
  NORMAL: { name: 'Normal', tensionMod: 1.0, escapeMod: 1.0, description: 'Standard behavior' },
  AGGRESSIVE: { name: 'Aggressive', tensionMod: 1.3, escapeMod: 1.2, description: 'Fights hard' },
  ERRATIC: { name: 'Erratic', tensionMod: 1.5, escapeMod: 0.9, description: 'Unpredictable' },
  CUNNING: { name: 'Cunning', tensionMod: 1.2, escapeMod: 1.5, description: 'Smart escaper' },
  LEGENDARY: { name: 'Legendary', tensionMod: 2.0, escapeMod: 2.0, description: 'Ultimate challenge' },
};

// ========== SEASONAL FISH AVAILABILITY ==========
export const SEASONAL_FISH = {
  spring: [1, 2, 3, 5, 6, 41, 46, 47, 48],
  summer: [4, 7, 8, 42, 43, 44, 61, 62, 71, 72],
  autumn: [9, 10, 11, 45, 49, 50, 51, 73, 74],
  winter: [12, 13, 14, 52, 53, 54, 87, 107],
};

// ========== BOSS FISH ENCOUNTERS ==========
export const BOSS_FISH = {
  109: { // Leviathan
    health: 1000,
    phases: 3,
    attacks: ['whirlpool', 'tail_slam', 'dive'],
    rewards: { coins: 10000, xp: 5000, items: ['legendary_rod'] },
  },
  110: { // Phoenix Koi
    health: 500,
    phases: 2,
    attacks: ['flame_burst', 'rebirth'],
    rewards: { coins: 25000, xp: 10000, items: ['mythic_lure'] },
  },
};

// ========== HELPER FUNCTIONS ==========
export const getFishById = (id) => FISH_DATABASE.find(f => f.id === id);

export const getFishByRarity = (rarity) => FISH_DATABASE.filter(f => f.rarity === rarity);

export const getFishByHabitat = (habitat) => FISH_DATABASE.filter(f => f.habitat === habitat);

export const getRandomFishByRarity = () => {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [key, tier] of Object.entries(RARITY_TIERS)) {
    cumulative += tier.chance;
    if (rand < cumulative) {
      const fishOfRarity = getFishByRarity(tier.tier);
      return fishOfRarity[Math.floor(Math.random() * fishOfRarity.length)];
    }
  }
  
  return FISH_DATABASE[0]; // Fallback to Minnow
};

export const calculateCatchDifficulty = (fish, rodLevel, lureBonus) => {
  const baseDifficulty = 0.5 + (fish.rarity * 0.15);
  const rodBonus = rodLevel * 0.05;
  const lureMod = lureBonus || 0;
  return Math.max(0.1, Math.min(0.95, baseDifficulty - rodBonus + lureMod));
};

export const getFishValue = (fish, modifiers = {}) => {
  let value = fish.points;
  
  if (modifiers.perfect) value *= 2;
  if (modifiers.combo) value *= (1 + modifiers.combo * 0.1);
  if (modifiers.weather === 'storm') value *= 1.5;
  if (modifiers.event) value *= modifiers.eventMultiplier || 1;
  if (fish.special) value *= 1.5;
  if (fish.legendary) value *= 2;
  if (fish.mythic) value *= 5;
  
  return Math.round(value);
};

export default FISH_DATABASE;
