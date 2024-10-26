// Item rarities and their chances (percentages)
const RARITIES = {
    COMMON: { chance: 30, color: '#b0b0b0' },
    UNCOMMON: { chance: 25, color: '#00ff00' },
    RARE: { chance: 15, color: '#0066ff' },
    VERY_RARE: { chance: 10, color: '#9933ff' },
    EPIC: { chance: 8, color: '#ff33cc' },
    LEGENDARY: { chance: 5, color: '#ffaa00' },
    MYTHICAL: { chance: 3, color: '#ff0000' },
    DIVINE: { chance: 2, color: '#ffff00' },
    CELESTIAL: { chance: 1, color: '#00ffff' },
    COSMIC: { chance: 0.5, color: '#ff66ff' },
    TRANSCENDENT: { chance: 0.2, color: '#ff9933' },
    ETHEREAL: { chance: 0.1, color: '#33ffff' },
    ANCIENT: { chance: 0.08, color: '#cc9900' },
    PRIMORDIAL: { chance: 0.05, color: '#00ff99' },
    GODLY: { chance: 0.03, color: '#ff3366' },
    OMNIPOTENT: { chance: 0.02, color: '#ffcc00' },
    INFINITE: { chance: 0.01, color: '#9900ff' },
    ETERNAL: { chance: 0.005, color: '#00ffcc' },
    IMMORTAL: { chance: 0.003, color: '#ff99cc' },
    ABSOLUTE: { chance: 0.002, color: '#ffffff' }
};

// Item pool - each rarity has its own items
const ITEMS = {
    COMMON: [
        { name: "Rusty Key", icon: "🔑" },
        { name: "Wooden Token", icon: "🪙" },
        { name: "Glass Marble", icon: "⚪" },
        { name: "Paper Clip", icon: "📎" },
        { name: "String", icon: "🧵" }
    ],
    UNCOMMON: [
        { name: "Lucky Coin", icon: "🍀" },
        { name: "Glowing Crystal", icon: "💎" },
        { name: "Magic Feather", icon: "🪶" },
        { name: "Enchanted Thread", icon: "✨" },
        { name: "Mystic Leaf", icon: "🍃" }
    ],
    RARE: [
        { name: "Dragon Scale", icon: "🐉" },
        { name: "Phoenix Feather", icon: "🔥" },
        { name: "Mermaid's Pearl", icon: "🦪" },
        { name: "Unicorn Hair", icon: "🦄" },
        { name: "Fairy Dust", icon: "⭐" }
    ],
    VERY_RARE: [
        { name: "Time Shard", icon: "⌛" },
        { name: "Soul Gem", icon: "💠" },
        { name: "Void Fragment", icon: "🌌" },
        { name: "Star Essence", icon: "🌟" },
        { name: "Moon Stone", icon: "🌙" }
    ],
    EPIC: [
        { name: "Heart of the Mountain", icon: "⛰️" },
        { name: "Ocean's Breath", icon: "🌊" },
        { name: "Storm Crystal", icon: "⚡" },
        { name: "Sun Fragment", icon: "☀️" },
        { name: "Earth Core", icon: "🌍" }
    ],
    LEGENDARY: [
        { name: "Dragon's Heart", icon: "❤️" },
        { name: "Phoenix Egg", icon: "🥚" },
        { name: "Kraken's Eye", icon: "👁️" },
        { name: "Titan's Strength", icon: "💪" },
        { name: "Giant's Soul", icon: "👻" }
    ],
    MYTHICAL: [
        { name: "World Tree Leaf", icon: "🌳" },
        { name: "Cosmic Shard", icon: "💫" },
        { name: "God's Tear", icon: "💧" },
        { name: "Universe Fragment", icon: "🌌" },
        { name: "Reality Stone", icon: "💎" }
    ],
    DIVINE: [
        { name: "Angel's Blessing", icon: "👼" },
        { name: "Heaven's Light", icon: "🌅" },
        { name: "Divine Grace", icon: "🙏" },
        { name: "Holy Relic", icon: "📿" },
        { name: "Sacred Text", icon: "📜" }
    ],
    CELESTIAL: [
        { name: "Star Core", icon: "✨" },
        { name: "Nebula Fragment", icon: "🌌" },
        { name: "Galaxy Shard", icon: "🌠" },
        { name: "Constellation Map", icon: "🗺️" },
        { name: "Astral Essence", icon: "⭐" }
    ],
    COSMIC: [
        { name: "Black Hole Fragment", icon: "⚫" },
        { name: "Supernova Core", icon: "💥" },
        { name: "Dark Matter", icon: "🌑" },
        { name: "Quantum Crystal", icon: "💠" },
        { name: "Space-Time Shard", icon: "🌀" }
    ],
    TRANSCENDENT: [
        { name: "Reality Warper", icon: "🌈" },
        { name: "Dimension Key", icon: "🗝️" },
        { name: "Multiverse Map", icon: "🗺️" },
        { name: "Infinity Shard", icon: "♾️" },
        { name: "Existence Core", icon: "🔮" }
    ],
    ETHEREAL: [
        { name: "Spirit Essence", icon: "👻" },
        { name: "Ghost Light", icon: "💫" },
        { name: "Soul Fire", icon: "🔥" },
        { name: "Phantom Core", icon: "🌟" },
        { name: "Wraith Fragment", icon: "💨" }
    ],
    ANCIENT: [
        { name: "First Light", icon: "🌅" },
        { name: "Creation Seed", icon: "🌱" },
        { name: "Primordial Essence", icon: "🌋" },
        { name: "Elder Scroll", icon: "📜" },
        { name: "Time's Beginning", icon: "⏳" }
    ],
    PRIMORDIAL: [
        { name: "Chaos Shard", icon: "💥" },
        { name: "Order Crystal", icon: "💠" },
        { name: "Balance Stone", icon: "☯️" },
        { name: "Harmony Core", icon: "🎵" },
        { name: "Unity Fragment", icon: "🤝" }
    ],
    GODLY: [
        { name: "Divine Power", icon: "⚡" },
        { name: "Omniscience Shard", icon: "👁️" },
        { name: "Almighty Fragment", icon: "👑" },
        { name: "Supreme Core", icon: "💫" },
        { name: "Ultimate Essence", icon: "✨" }
    ],
    OMNIPOTENT: [
        { name: "Universal Key", icon: "🗝️" },
        { name: "Reality Bender", icon: "🌀" },
        { name: "Existence Shaper", icon: "🎨" },
        { name: "Creation Core", icon: "🌟" },
        { name: "Power Absolute", icon: "💪" }
    ],
    INFINITE: [
        { name: "Boundless Energy", icon: "♾️", class: "infinite-item-boundless" },
        { name: "Limitless Power", icon: "⚡", class: "infinite-item-power" },
        { name: "Eternal Force", icon: "💫", class: "infinite-item-force" },
        { name: "Infinite Wisdom", icon: "🧠", class: "infinite-item-wisdom" },
        { name: "Boundless Energy", icon: "🌀", class: "infinite-item-energy" }
    ],
    ETERNAL: [
        { name: "Time's End", icon: "⌛", class: "eternal-item-time" },
        { name: "Space's Limit", icon: "🌌", class: "eternal-item-space" },
        { name: "Reality's Edge", icon: "💫", class: "eternal-item-reality" },
        { name: "Existence Boundary", icon: "🔮", class: "eternal-item-existence" },
        { name: "Creation's Peak", icon: "✨", class: "eternal-item-creation" }
    ],
    IMMORTAL: [
        { name: "Life Force", icon: "❤️", class: "immortal-item-force" },
        { name: "Death's Denial", icon: "💀", class: "immortal-item-denial" },
        { name: "Eternal Flame", icon: "🔥", class: "immortal-item-flame" },
        { name: "Undying Light", icon: "🌟", class: "immortal-item-light" },
        { name: "Forever Crystal", icon: "💎", class: "immortal-item-crystal" }
    ],
    ABSOLUTE: [
        { name: "Everything", icon: "🌌", class: "absolute-item-everything" },
        { name: "Nothing", icon: "⚫", class: "absolute-item-nothing" },
        { name: "Alpha", icon: "Α", class: "absolute-item-alpha" },
        { name: "Omega", icon: "Ω", class: "absolute-item-omega" },
        { name: "The One", icon: "☝️", class: "absolute-item-one" }
    ]
};

function rollRarity(weights = {}) {
    const roll = Math.random() * 100;
    let cumulativeChance = 0;
    let totalWeight = 0;
    
    // First, calculate total weighted chances to normalize probabilities
    for (const [rarity, data] of Object.entries(RARITIES)) {
        const weightModifier = weights[rarity] || 1.0;
        if (weightModifier > 0) {  // Only include non-zero weights
            totalWeight += data.chance * weightModifier;
        }
    }
    
    // Now calculate probabilities with normalization
    for (const [rarity, data] of Object.entries(RARITIES)) {
        const weightModifier = weights[rarity] || 1.0;
        if (weightModifier > 0) {  // Skip zero-weight rarities
            // Normalize the chance based on total weight
            const normalizedChance = (data.chance * weightModifier * 100) / totalWeight;
            cumulativeChance += normalizedChance;
            
            if (roll <= cumulativeChance) {
                return rarity;
            }
        }
    }
    
    // Fallback to the highest non-zero weight rarity
    for (const [rarity, data] of Object.entries(RARITIES).reverse()) {
        if (weights[rarity] > 0 || !weights[rarity]) {
            return rarity;
        }
    }
}

function getRandomItem(rarity) {
    const items = ITEMS[rarity];
    const item = items[Math.floor(Math.random() * items.length)];
    return item;
}

function generateDrop(weights = {}) {
    const rarity = rollRarity(weights);
    const item = getRandomItem(rarity);
    return {
        name: item.name,
        icon: item.icon,
        rarity: rarity,
        color: RARITIES[rarity].color,
        class: item.class || null
    };
}

// Export functions for use in shop.js
window.ItemSystem = {
    generateDrop,
    RARITIES,
    ITEMS
};

// Add this to your ItemSystem section, replacing the previous SETS definition
window.ItemSystem.SETS = {
    // Dragon-themed Set
    "Dragon's Legacy": {
        items: ["Dragon Scale", "Dragon's Heart", "Phoenix Egg"],
        reward: 100000,
        description: "Ancient artifacts of dragon origin"
    },
    // Cosmic-themed Sets
    "Cosmic Explorer": {
        items: ["Black Hole Fragment", "Galaxy Shard", "Space-Time Shard"],
        reward: 250000,
        description: "Remnants of the vast cosmos"
    },
    "Celestial Authority": {
        items: ["Star Core", "Sun Fragment", "Moon Stone", "Constellation Map"],
        reward: 200000,
        description: "Celestial objects of immense power"
    },
    // Divine-themed Sets
    "Divine Authority": {
        items: ["Angel's Blessing", "Divine Grace", "Holy Relic", "Sacred Text"],
        reward: 150000,
        description: "Sacred items of divine power"
    },
    "Divine Omnipotence": {
        items: ["Divine Power", "Omniscience Shard", "Universal Key"],
        reward: 300000,
        description: "Tools of godly might"
    },
    // Nature-themed Sets
    "Nature's Essence": {
        items: ["World Tree Leaf", "Mystic Leaf", "Earth Core", "Creation Seed"],
        reward: 75000,
        description: "Pure manifestations of natural energy"
    },
    // Ocean-themed Set
    "Ocean's Might": {
        items: ["Mermaid's Pearl", "Kraken's Eye", "Ocean's Breath"],
        reward: 120000,
        description: "Treasures from the depths of the sea"
    },
    // Eternal-themed Sets
    "Eternal Power": {
        items: ["Time's End", "Eternal Flame", "Forever Crystal", "Eternal Force"],
        reward: 500000,
        description: "Artifacts of unending power"
    },
    // Reality-themed Sets
    "Reality's Edge": {
        items: ["Reality Stone", "Reality Warper", "Reality's Edge", "Reality Bender"],
        reward: 400000,
        description: "Items that bend the fabric of existence"
    },
    // Time-themed Set
    "Time Master": {
        items: ["Time Shard", "Time's Beginning", "Space-Time Shard"],
        reward: 300000,
        description: "Artifacts that control the flow of time"
    },
    // Ultimate Set
    "Ultimate Creation": {
        items: ["Everything", "The One", "Creation Core", "Power Absolute"],
        reward: 1000000,
        description: "The most powerful combination of items in existence"
    },
    // Spirit-themed Set
    "Spirit Realm": {
        items: ["Spirit Essence", "Ghost Light", "Giant's Soul", "Wraith Fragment"],
        reward: 200000,
        description: "Essences from the spiritual plane"
    },
    // Magical Items Set
    "Mystic Collection": {
        items: ["Magic Feather", "Enchanted Thread", "Fairy Dust", "Lucky Coin"],
        reward: 50000,
        description: "A collection of enchanted items"
    },
    // Common Treasures Set
    "Humble Beginnings": {
        items: ["Rusty Key", "Wooden Token", "Glass Marble", "Paper Clip", "String"],
        reward: 10000,
        description: "Simple items with hidden potential"
    },
    // Crystal Set
    "Crystal Formation": {
        items: ["Glowing Crystal", "Soul Gem", "Storm Crystal", "Quantum Crystal", "Order Crystal"],
        reward: 150000,
        description: "A collection of powerful crystals"
    },
    // Essence Set
    "Pure Essence": {
        items: ["Star Essence", "Astral Essence", "Ultimate Essence", "Primordial Essence"],
        reward: 250000,
        description: "Pure forms of magical energy"
    },
    // Fragment Set
    "Shattered Power": {
        items: ["Void Fragment", "Universe Fragment", "Infinity Shard", "Almighty Fragment", "Unity Fragment"],
        reward: 350000,
        description: "Fragments of immense power"
    },
    // Ancient Knowledge Set
    "Ancient Wisdom": {
        items: ["Elder Scroll", "Infinite Wisdom", "Existence Core", "Phantom Core"],
        reward: 400000,
        description: "Ancient artifacts of knowledge"
    },
    // Life and Death Set
    "Cycle of Existence": {
        items: ["Life Force", "Death's Denial", "Undying Light", "First Light"],
        reward: 450000,
        description: "The balance of life and death"
    },
    // Absolute Power Set
    "Cosmic Supremacy": {
        items: ["Alpha", "Omega", "Nothing", "Existence Boundary", "Creation's Peak"],
        reward: 2000000,
        description: "The ultimate manifestation of power"
    }
};
