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
