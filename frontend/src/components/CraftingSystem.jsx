import React, { useState, useEffect, useMemo, useCallback } from 'react';

// ========================================================================
// AAA QUALITY CRAFTING SYSTEM
// Create lures, baits, and special items from materials
// ========================================================================

// Material types
const MATERIALS = {
  // Common materials
  FISH_SCALE: { id: 'fish_scale', name: 'Fish Scale', icon: '🔷', rarity: 'common', description: 'Shimmering scales from common fish' },
  FISH_BONE: { id: 'fish_bone', name: 'Fish Bone', icon: '🦴', rarity: 'common', description: 'Sturdy bones for crafting' },
  SEAWEED: { id: 'seaweed', name: 'Seaweed', icon: '🌿', rarity: 'common', description: 'Fresh ocean seaweed' },
  SHELL: { id: 'shell', name: 'Shell', icon: '🐚', rarity: 'common', description: 'Beautiful sea shells' },
  CORAL_PIECE: { id: 'coral_piece', name: 'Coral Piece', icon: '🪸', rarity: 'common', description: 'Colorful coral fragment' },
  
  // Uncommon materials
  PEARL: { id: 'pearl', name: 'Pearl', icon: '⚪', rarity: 'uncommon', description: 'Lustrous natural pearl' },
  GOLDEN_SCALE: { id: 'golden_scale', name: 'Golden Scale', icon: '💛', rarity: 'uncommon', description: 'Rare golden fish scale' },
  SHARK_TOOTH: { id: 'shark_tooth', name: 'Shark Tooth', icon: '🦷', rarity: 'uncommon', description: 'Sharp predator tooth' },
  INK_SAC: { id: 'ink_sac', name: 'Ink Sac', icon: '🖤', rarity: 'uncommon', description: 'Squid ink sac' },
  STARFISH: { id: 'starfish', name: 'Starfish', icon: '⭐', rarity: 'uncommon', description: 'Dried starfish' },
  
  // Rare materials
  MERMAID_TEAR: { id: 'mermaid_tear', name: 'Mermaid Tear', icon: '💧', rarity: 'rare', description: 'Magical crystallized tear' },
  DRAGON_SCALE: { id: 'dragon_scale', name: 'Dragon Scale', icon: '🐉', rarity: 'rare', description: 'Scale from legendary fish' },
  ANCIENT_ARTIFACT: { id: 'ancient_artifact', name: 'Ancient Artifact', icon: '🏺', rarity: 'rare', description: 'Relic from the deep' },
  MOONSTONE: { id: 'moonstone', name: 'Moonstone', icon: '🌙', rarity: 'rare', description: 'Stone charged by moonlight' },
  
  // Epic materials
  LEVIATHAN_SCALE: { id: 'leviathan_scale', name: 'Leviathan Scale', icon: '🔮', rarity: 'epic', description: 'Scale from the Leviathan' },
  PHOENIX_FEATHER: { id: 'phoenix_feather', name: 'Phoenix Feather', icon: '🔥', rarity: 'epic', description: 'Feather from Phoenix Koi' },
  KRAKEN_INK: { id: 'kraken_ink', name: 'Kraken Ink', icon: '🌊', rarity: 'epic', description: 'Ink from the Kraken' },
};

// Crafting recipes
const RECIPES = [
  // Basic lures
  {
    id: 'basic_lure',
    name: 'Basic Lure',
    category: 'lure',
    icon: '🎣',
    rarity: 'common',
    description: 'A simple but effective lure',
    materials: [
      { material: 'fish_scale', amount: 3 },
      { material: 'seaweed', amount: 2 },
    ],
    craftTime: 5,
    effect: { biteRate: 1.05 },
  },
  {
    id: 'shiny_lure',
    name: 'Shiny Lure',
    category: 'lure',
    icon: '✨',
    rarity: 'uncommon',
    description: 'Attracts fish with its sparkle',
    materials: [
      { material: 'golden_scale', amount: 2 },
      { material: 'pearl', amount: 1 },
      { material: 'shell', amount: 3 },
    ],
    craftTime: 15,
    effect: { biteRate: 1.15, rareChance: 1.1 },
  },
  {
    id: 'predator_lure',
    name: 'Predator Lure',
    category: 'lure',
    icon: '🦈',
    rarity: 'rare',
    description: 'Mimics wounded prey',
    materials: [
      { material: 'shark_tooth', amount: 3 },
      { material: 'ink_sac', amount: 2 },
      { material: 'fish_bone', amount: 5 },
    ],
    craftTime: 30,
    effect: { biteRate: 1.25, bigFishChance: 1.3 },
  },
  {
    id: 'legendary_lure',
    name: 'Legendary Lure',
    category: 'lure',
    icon: '👑',
    rarity: 'legendary',
    description: 'Attracts legendary fish',
    materials: [
      { material: 'dragon_scale', amount: 2 },
      { material: 'mermaid_tear', amount: 3 },
      { material: 'moonstone', amount: 1 },
    ],
    craftTime: 120,
    effect: { biteRate: 1.5, legendaryChance: 2.0 },
  },
  
  // Baits
  {
    id: 'worm_bait',
    name: 'Premium Worm Bait',
    category: 'bait',
    icon: '🪱',
    rarity: 'common',
    description: 'Irresistible to freshwater fish',
    materials: [
      { material: 'seaweed', amount: 5 },
      { material: 'fish_bone', amount: 2 },
    ],
    craftTime: 3,
    effect: { freshwaterBonus: 1.2 },
    quantity: 10,
  },
  {
    id: 'shrimp_bait',
    name: 'Shrimp Bait',
    category: 'bait',
    icon: '🦐',
    rarity: 'uncommon',
    description: 'Ocean fish favorite',
    materials: [
      { material: 'shell', amount: 4 },
      { material: 'coral_piece', amount: 3 },
    ],
    craftTime: 10,
    effect: { oceanBonus: 1.25 },
    quantity: 10,
  },
  {
    id: 'magic_bait',
    name: 'Magic Bait',
    category: 'bait',
    icon: '🔮',
    rarity: 'rare',
    description: 'Enchanted to attract rare fish',
    materials: [
      { material: 'mermaid_tear', amount: 1 },
      { material: 'starfish', amount: 3 },
      { material: 'pearl', amount: 2 },
    ],
    craftTime: 45,
    effect: { rareChance: 1.5, allBonus: 1.15 },
    quantity: 5,
  },
  
  // Boosters
  {
    id: 'luck_potion',
    name: 'Luck Potion',
    category: 'booster',
    icon: '🍀',
    rarity: 'uncommon',
    description: '30 min luck boost',
    materials: [
      { material: 'starfish', amount: 2 },
      { material: 'pearl', amount: 1 },
      { material: 'seaweed', amount: 3 },
    ],
    craftTime: 20,
    effect: { luck: 1.3 },
    duration: 1800,
  },
  {
    id: 'speed_elixir',
    name: 'Speed Elixir',
    category: 'booster',
    icon: '⚡',
    rarity: 'rare',
    description: '15 min faster reeling',
    materials: [
      { material: 'ink_sac', amount: 3 },
      { material: 'shark_tooth', amount: 2 },
    ],
    craftTime: 30,
    effect: { reelSpeed: 1.5 },
    duration: 900,
  },
  {
    id: 'mega_booster',
    name: 'Mega Booster',
    category: 'booster',
    icon: '💥',
    rarity: 'epic',
    description: '10 min all stats boost',
    materials: [
      { material: 'leviathan_scale', amount: 1 },
      { material: 'phoenix_feather', amount: 1 },
      { material: 'mermaid_tear', amount: 2 },
    ],
    craftTime: 180,
    effect: { allStats: 2.0 },
    duration: 600,
  },
  
  // Special items
  {
    id: 'treasure_map',
    name: 'Treasure Map',
    category: 'special',
    icon: '🗺️',
    rarity: 'rare',
    description: 'Reveals hidden treasure spots',
    materials: [
      { material: 'ancient_artifact', amount: 1 },
      { material: 'ink_sac', amount: 3 },
      { material: 'shell', amount: 5 },
    ],
    craftTime: 60,
    effect: { treasureReveal: true },
  },
  {
    id: 'storm_caller',
    name: 'Storm Caller',
    category: 'special',
    icon: '⛈️',
    rarity: 'epic',
    description: 'Summons a storm for rare fish',
    materials: [
      { material: 'kraken_ink', amount: 1 },
      { material: 'moonstone', amount: 2 },
      { material: 'dragon_scale', amount: 1 },
    ],
    craftTime: 300,
    effect: { summonStorm: true },
  },
];

// Rarity colors
const RARITY_COLORS = {
  common: { bg: 'from-gray-500 to-gray-600', text: 'text-gray-300', border: 'border-gray-400' },
  uncommon: { bg: 'from-green-500 to-emerald-600', text: 'text-green-300', border: 'border-green-400' },
  rare: { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-300', border: 'border-blue-400' },
  epic: { bg: 'from-purple-500 to-pink-600', text: 'text-purple-300', border: 'border-purple-400' },
  legendary: { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-300', border: 'border-yellow-400' },
};

// Material card component
const MaterialCard = ({ material, count, needed }) => {
  const mat = MATERIALS[material.toUpperCase()] || MATERIALS[material];
  const hasEnough = count >= needed;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasEnough ? 'bg-green-900/30' : 'bg-red-900/30'} border ${hasEnough ? 'border-green-500/30' : 'border-red-500/30'}`}>
      <span className="text-xl">{mat?.icon || '❓'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{mat?.name || material}</p>
        <p className={`text-[10px] ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
          {count}/{needed}
        </p>
      </div>
    </div>
  );
};

// Recipe card component
const RecipeCard = ({ recipe, inventory, onCraft, craftingItem }) => {
  const rarity = RARITY_COLORS[recipe.rarity];
  const isCrafting = craftingItem === recipe.id;
  
  // Check if we have all materials
  const canCraft = recipe.materials.every(
    mat => (inventory[mat.material] || 0) >= mat.amount
  );
  
  return (
    <div className={`rounded-2xl border-2 ${rarity.border} bg-gradient-to-br ${rarity.bg}/20 p-4 transition-all ${canCraft && !isCrafting ? 'hover:scale-[1.02]' : 'opacity-70'}`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${rarity.bg} flex items-center justify-center text-3xl`}>
          {recipe.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold ${rarity.text}`}>{recipe.name}</h3>
          <p className="text-xs text-white/50 line-clamp-2">{recipe.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${rarity.bg} text-white uppercase`}>
              {recipe.rarity}
            </span>
            <span className="text-[10px] text-white/40">{recipe.category}</span>
          </div>
        </div>
      </div>
      
      {/* Materials */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {recipe.materials.map((mat, i) => (
          <MaterialCard
            key={i}
            material={mat.material}
            count={inventory[mat.material] || 0}
            needed={mat.amount}
          />
        ))}
      </div>
      
      {/* Craft time & button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-white/50">
          ⏱️ {recipe.craftTime}s
          {recipe.quantity && <span className="ml-2">x{recipe.quantity}</span>}
        </div>
        <button
          onClick={() => onCraft(recipe)}
          disabled={!canCraft || isCrafting}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            canCraft && !isCrafting
              ? `bg-gradient-to-r ${rarity.bg} text-white hover:opacity-90`
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isCrafting ? '⏳ Crafting...' : 'Craft'}
        </button>
      </div>
    </div>
  );
};

// Crafting progress bar
const CraftingProgress = ({ recipe, progress, onCancel }) => {
  const rarity = RARITY_COLORS[recipe.rarity];
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-80 bg-slate-800 rounded-2xl p-4 border-2 border-white/20 shadow-2xl z-50">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{recipe.icon}</span>
        <div className="flex-1">
          <p className={`font-bold ${rarity.text}`}>{recipe.name}</p>
          <p className="text-xs text-white/50">Crafting...</p>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-red-500/50 hover:bg-red-500 text-white text-sm font-bold"
        >
          ×
        </button>
      </div>
      <div className="h-3 bg-black/40 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${rarity.bg} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-xs text-white/50 mt-2">{Math.round(progress)}%</p>
    </div>
  );
};

// Main Crafting System Component
const CraftingSystem = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inventory, setInventory] = useState({
    fish_scale: 50,
    fish_bone: 30,
    seaweed: 40,
    shell: 25,
    coral_piece: 20,
    pearl: 8,
    golden_scale: 5,
    shark_tooth: 6,
    ink_sac: 4,
    starfish: 7,
    mermaid_tear: 2,
    dragon_scale: 1,
    ancient_artifact: 1,
    moonstone: 1,
    leviathan_scale: 0,
    phoenix_feather: 0,
    kraken_ink: 0,
  });
  const [craftingItem, setCraftingItem] = useState(null);
  const [craftingProgress, setCraftingProgress] = useState(0);
  const [craftedItems, setCraftedItems] = useState([]);
  
  // Filter recipes by category
  const filteredRecipes = useMemo(() => {
    if (selectedCategory === 'all') return RECIPES;
    return RECIPES.filter(r => r.category === selectedCategory);
  }, [selectedCategory]);
  
  // Handle crafting
  const handleCraft = useCallback((recipe) => {
    // Deduct materials
    const newInventory = { ...inventory };
    recipe.materials.forEach(mat => {
      newInventory[mat.material] -= mat.amount;
    });
    setInventory(newInventory);
    
    // Start crafting
    setCraftingItem(recipe.id);
    setCraftingProgress(0);
    
    // Simulate crafting progress
    const interval = setInterval(() => {
      setCraftingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCraftingItem(null);
          setCraftedItems(items => [...items, recipe]);
          return 0;
        }
        return prev + (100 / recipe.craftTime);
      });
    }, 1000);
  }, [inventory]);
  
  // Cancel crafting
  const handleCancelCraft = useCallback(() => {
    // TODO: Refund materials
    setCraftingItem(null);
    setCraftingProgress(0);
  }, []);
  
  const categories = ['all', 'lure', 'bait', 'booster', 'special'];
  const currentCraftingRecipe = RECIPES.find(r => r.id === craftingItem);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90" data-testid="crafting-system">
      <div className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚒️</span>
            <div>
              <h2 className="text-xl font-bold text-white font-pixel">CRAFTING</h2>
              <p className="text-xs text-amber-200">Create powerful fishing gear</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/30 text-white font-bold">×</button>
        </div>
        
        {/* Materials overview */}
        <div className="p-4 bg-black/30 border-b border-white/10">
          <p className="text-xs text-white/50 mb-2 uppercase tracking-wider">Your Materials</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(inventory).slice(0, 10).map(([key, value]) => {
              const mat = MATERIALS[key.toUpperCase()];
              if (!mat) return null;
              return (
                <div key={key} className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-xs">
                  <span>{mat.icon}</span>
                  <span className="text-white/70">{value}</span>
                </div>
              );
            })}
            <button className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/50 hover:bg-white/20">
              +{Object.keys(inventory).length - 10} more
            </button>
          </div>
        </div>
        
        {/* Category tabs */}
        <div className="p-4 border-b border-white/10">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {cat === 'all' ? '📦 All' : cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Recipe grid */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-2 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                inventory={inventory}
                onCraft={handleCraft}
                craftingItem={craftingItem}
              />
            ))}
          </div>
        </div>
        
        {/* Crafted items section */}
        {craftedItems.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-green-900/20">
            <p className="text-xs text-green-400 mb-2 uppercase tracking-wider">Recently Crafted</p>
            <div className="flex gap-2">
              {craftedItems.slice(-5).map((item, i) => (
                <div key={i} className="w-10 h-10 rounded-lg bg-green-900/50 flex items-center justify-center text-xl" title={item.name}>
                  {item.icon}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Crafting progress overlay */}
        {craftingItem && currentCraftingRecipe && (
          <CraftingProgress
            recipe={currentCraftingRecipe}
            progress={craftingProgress}
            onCancel={handleCancelCraft}
          />
        )}
      </div>
    </div>
  );
};

export { CraftingSystem, MATERIALS, RECIPES };
export default CraftingSystem;
