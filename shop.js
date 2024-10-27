// At the top of shop.js, add balance management and inventory initialization
let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 10000000;
let balanceDisplay;

// Initialize inventory if it doesn't exist
if (!localStorage.getItem('inventory')) {
    localStorage.setItem('inventory', JSON.stringify([]));
}

// Add orb configurations at the top of shop.js
const ORB_CONFIGS = {
    'basic-orb': {
        cost: 100, // Entry-level orb
        weights: {
            COMMON: 2.0,
            UNCOMMON: 1.5,
            RARE: 0.8,
        }
    },
    'crystal-orb': {
        cost: 500, // Mid-tier orb
        weights: {
            RARE: 3.0,
            VERY_RARE: 2.0,
            EPIC: 1.5,
            COMMON: 0.3,
            UNCOMMON: 0.4,
        }
    },
    'plasma-orb': {
        cost: 2000, // High-tier orb
        weights: {
            EPIC: 4.0,
            LEGENDARY: 3.0,
            MYTHICAL: 2.0,
            COMMON: 0.1,
            UNCOMMON: 0.15,
            RARE: 0.2,
        }
    },
    'nebula-orb': {
        cost: 10000, // Advanced orb
        weights: {
            MYTHICAL: 5.0,
            DIVINE: 4.0,
            CELESTIAL: 3.0,
            LEGENDARY: 1.5,
            EPIC: 0.5,
            COMMON: 0.01,
            UNCOMMON: 0.01,
            RARE: 0.05,
            VERY_RARE: 0.1,
        }
    },
    'void-orb': {
        cost: 50000, // Elite orb
        weights: {
            CELESTIAL: 6.0,
            COSMIC: 5.0,
            TRANSCENDENT: 4.0,
            DIVINE: 2.0,
            MYTHICAL: 0.5,
            COMMON: 0.001,
            UNCOMMON: 0.001,
            RARE: 0.002,
            VERY_RARE: 0.005,
            EPIC: 0.01,
            LEGENDARY: 0.05,
        }
    },
    'phoenix-orb': {
        cost: 250000, // Legendary orb
        weights: {
            TRANSCENDENT: 8.0,
            ETHEREAL: 7.0,
            ANCIENT: 6.0,
            COSMIC: 3.0,
            CELESTIAL: 1.0,
            COMMON: 0.0001,
            UNCOMMON: 0.0001,
            RARE: 0.0005,
            VERY_RARE: 0.001,
            EPIC: 0.002,
            LEGENDARY: 0.005,
            MYTHICAL: 0.01,
            DIVINE: 0.05,
        }
    },
    'quantum-orb': {
        cost: 750000, // Quantum orb
        weights: {
            ANCIENT: 10.0,
            PRIMORDIAL: 8.0,
            GODLY: 6.0,
            ETHEREAL: 4.0,
            TRANSCENDENT: 2.0,
            COMMON: 0.00001,
            UNCOMMON: 0.00001,
            RARE: 0.00005,
            VERY_RARE: 0.0001,
            EPIC: 0.0005,
            LEGENDARY: 0.001,
            MYTHICAL: 0.002,
            DIVINE: 0.005,
            CELESTIAL: 0.01,
        }
    },
    'celestial-orb': {
        cost: 1500000, // Celestial orb
        weights: {
            GODLY: 12.0,
            OMNIPOTENT: 10.0,
            INFINITE: 8.0,
            PRIMORDIAL: 6.0,
            ANCIENT: 4.0,
            COMMON: 0.000001,
            UNCOMMON: 0.000001,
            RARE: 0.000005,
            VERY_RARE: 0.00001,
            EPIC: 0.00005,
            LEGENDARY: 0.0001,
            MYTHICAL: 0.0005,
            DIVINE: 0.001,
            CELESTIAL: 0.002,
            COSMIC: 0.005,
            TRANSCENDENT: 0.01,
            ETHEREAL: 0.05,
        }
    },
    'infinity-orb': {
        cost: 2250000, // Infinity orb
        weights: {
            INFINITE: 15.0,
            ETERNAL: 12.0,
            IMMORTAL: 10.0,
            OMNIPOTENT: 8.0,
            GODLY: 6.0,
            COMMON: 0.0000001,
            UNCOMMON: 0.0000001,
            RARE: 0.0000005,
            VERY_RARE: 0.000001,
            EPIC: 0.000005,
            LEGENDARY: 0.00001,
            MYTHICAL: 0.00005,
            DIVINE: 0.0001,
            CELESTIAL: 0.0005,
            COSMIC: 0.001,
            TRANSCENDENT: 0.002,
            ETHEREAL: 0.005,
            ANCIENT: 0.01,
            PRIMORDIAL: 0.05,
        }
    },
    'cosmic-orb': {
        cost: 3000000, // Cosmic orb
        weights: {
            ETERNAL: 20.0,
            IMMORTAL: 18.0,
            ABSOLUTE: 16.0,
            INFINITE: 14.0,
            COMMON: 0.00000001,
            UNCOMMON: 0.00000001,
            RARE: 0.00000005,
            VERY_RARE: 0.0000001,
            EPIC: 0.0000005,
            LEGENDARY: 0.000001,
            MYTHICAL: 0.000005,
            DIVINE: 0.00001,
            CELESTIAL: 0.00005,
            COSMIC: 0.0001,
            TRANSCENDENT: 0.0005,
            ETHEREAL: 0.001,
            ANCIENT: 0.002,
            PRIMORDIAL: 0.005,
            GODLY: 0.01,
            OMNIPOTENT: 0.05,
        }
    }
    // Additional orb configurations...
};

document.addEventListener('DOMContentLoaded', () => {
    // Add balance display
    const shopContainer = document.querySelector('.shop-container');
    balanceDisplay = document.createElement('div');
    balanceDisplay.className = 'balance-display';
    balanceDisplay.innerHTML = `Balance: $${balance}`;
    shopContainer.insertBefore(balanceDisplay, shopContainer.firstChild);

    const items = document.querySelectorAll('.shop-item');
    const leftNav = document.querySelector('.left-nav');
    const rightNav = document.querySelector('.right-nav');
    let currentIndex = 0;

    function updateNavButtons() {
        leftNav.disabled = currentIndex === 0;
        rightNav.disabled = currentIndex === items.length - 1;
    }

    function showItem(index) {
        items.forEach((item, i) => {
            item.classList.remove('active');
            if (i < index) {
                item.style.transform = 'translateX(-100%)';
            } else if (i > index) {
                item.style.transform = 'translateX(100%)';
            }
        });
        items[index].classList.add('active');
        items[index].style.transform = 'translateX(0)';
        
        const orbType = items[index].querySelector('.item-image').className.split(' ')[1];
        updateDropRates(orbType);
        
        updateNavButtons();
    }

    leftNav.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            showItem(currentIndex);
        }
    });

    rightNav.addEventListener('click', () => {
        if (currentIndex < items.length - 1) {
            currentIndex++;
            showItem(currentIndex);
        }
    });

    // Update buy buttons
    document.querySelectorAll('.buy-button').forEach(button => {
        const orbType = button.closest('.shop-item').querySelector('.item-image').className.split(' ')[1];
        const orbConfig = ORB_CONFIGS[orbType];
        
        // Update button text with cost
        button.textContent = `Buy - $${orbConfig.cost}`;
        
        // Disable button if balance is too low
        if (balance < orbConfig.cost) {
            button.disabled = true;
            button.style.opacity = '0.5';
        }

        button.addEventListener('click', async () => {
            console.log('Buy button clicked'); // Debug log
            console.log('Orb type:', orbType); // Debug log
            console.log('Orb config:', orbConfig); // Debug log
            console.log('Current balance:', balance); // Debug log

            if (!orbConfig) {
                console.error('Invalid orb type:', orbType);
                return;
            }

            const itemCost = orbConfig.cost;
            
            if (balance >= itemCost) {
                // Generate drop with modified weights
                const drop = window.ItemSystem.generateDrop(orbConfig.weights);
                
                // Add item to inventory BEFORE showing the drop animation
                await addItemToInventory(drop);
                
                // Show drop animation
                showDrop(drop);
                
                // Update balance locally and in the database
                balance -= itemCost;
                localStorage.setItem('balance', balance);
                balanceDisplay.innerHTML = `Balance: $${balance}`;

                // Update balance in the database
                try {
                    const username = localStorage.getItem('playerName');
                    const response = await fetch('https://universal-backend-7wn9.onrender.com/api/update-balance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username,
                            balance
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to update balance in database');
                    }

                    console.log('Balance updated in database:', balance);
                } catch (error) {
                    console.error('Error updating balance in database:', error);
                    // Optionally revert the local balance if the database update fails
                    balance += itemCost;
                    localStorage.setItem('balance', balance);
                    balanceDisplay.innerHTML = `Balance: $${balance}`;
                }
                
                // Update button state
                if (balance < itemCost) {
                    button.disabled = true;
                    button.style.opacity = '0.5';
                }
            } else {
                // Show insufficient funds message
                const insufficientFunds = document.createElement('div');
                insufficientFunds.className = 'item-drop';
                insufficientFunds.innerHTML = `<h3 style="color: #ff4444">Insufficient Funds</h3>`;
                shopContainer.appendChild(insufficientFunds);
                
                setTimeout(() => {
                    insufficientFunds.style.opacity = '0';
                    setTimeout(() => insufficientFunds.remove(), 1000);
                }, 2000);
            }
        });
    });

    // Initialize
    updateNavButtons();
    showItem(0);
});

function updateDropRates(orbType) {
    const orbConfig = ORB_CONFIGS[orbType];
    const dropRatesPanel = document.querySelector('.drop-rates');
    
    if (!dropRatesPanel) {
        const panel = document.createElement('div');
        panel.className = 'drop-rates';
        document.querySelector('.shop-display').appendChild(panel);
    }
    
    // Clear existing rates
    const panel = document.querySelector('.drop-rates');
    panel.innerHTML = '<h3 style="color: #fff; margin-bottom: 10px;">Drop Rates</h3>';
    
    // Calculate total weighted chances for normalization
    let totalWeight = 0;
    Object.entries(window.ItemSystem.RARITIES).forEach(([rarity, data]) => {
        const weightModifier = orbConfig?.weights[rarity] || 1.0;
        if (weightModifier > 0) {  // Only include non-zero weights
            totalWeight += data.chance * weightModifier;
        }
    });
    
    // Calculate and display normalized rates for each rarity
    Object.entries(window.ItemSystem.RARITIES).forEach(([rarity, data]) => {
        const weightModifier = orbConfig?.weights[rarity] || 1.0;
        
        // Only show rarities with non-zero weights
        if (weightModifier > 0) {
            // Calculate normalized probability
            const normalizedChance = ((data.chance * weightModifier * 100) / totalWeight).toFixed(3);
            
            const rateItem = document.createElement('div');
            rateItem.className = 'rate-item';
            rateItem.innerHTML = `
                <span class="rate-rarity" style="color: ${data.color}">${rarity}</span>
                <span class="rate-chance">${normalizedChance}%</span>
            `;
            panel.appendChild(rateItem);
        }
    });
}

function showDrop(drop) {
    const dropDisplay = document.createElement('div');
    dropDisplay.className = 'item-drop';
    dropDisplay.setAttribute('data-rarity', drop.rarity);
    
    // First show the opening animation
    const openingAnimation = document.createElement('div');
    openingAnimation.className = 'orb-opening-animation';
    openingAnimation.setAttribute('data-rarity', drop.rarity);
    
    // Get the currently selected orb type
    const currentOrbType = document.querySelector('.shop-item.active .item-image').className.split(' ')[1];
    
    // Special animation for cosmic orb
    if (currentOrbType === 'cosmic-orb') {
        // Create and inject enhanced styles
        const style = document.createElement('style');
        style.textContent = `
            .cosmic-orb-fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1000;
                background: black;
                opacity: 0;
                animation: cosmicFade 1s ease-out forwards;
            }

            .cosmic-universe {
                position: absolute;
                width: 100%;
                height: 100%;
                overflow: hidden;
                perspective: 1000px;
            }

            .cosmic-galaxy {
                position: absolute;
                width: 300%;
                height: 300%;
                top: -100%;
                left: -100%;
                background: 
                    radial-gradient(ellipse at center, 
                        rgba(255,255,255,0.3) 0%,
                        rgba(138,43,226,0.4) 20%,
                        rgba(0,0,0,0.6) 60%,
                        transparent 100%),
                    radial-gradient(circle at 30% 40%, rgba(255,100,255,0.2) 0%, transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(100,100,255,0.2) 0%, transparent 50%);
                animation: galaxyRotate 15s linear infinite;
                transform-origin: center;
                filter: blur(3px);
            }

            .cosmic-stars {
                position: absolute;
                width: 200%;
                height: 200%;
                top: -50%;
                left: -50%;
                animation: starField 20s linear infinite;
            }

            .cosmic-star {
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 8px white;
                animation: starTwinkle var(--twinkle-duration) ease-in-out infinite;
            }

            .cosmic-nebula {
                position: absolute;
                width: 200%;
                height: 200%;
                top: -50%;
                left: -50%;
                filter: blur(30px);
                opacity: 0.5;
                background: 
                    radial-gradient(circle at 30% 40%, rgba(255,100,255,0.4) 0%, transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(100,100,255,0.4) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(255,255,100,0.2) 0%, transparent 60%);
                animation: nebulaFlow 15s ease-in-out infinite;
            }

            .cosmic-vortex {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 0;
                height: 0;
                background: radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 70%);
                animation: vortexGrow 3s ease-out forwards;
            }

            .cosmic-energy-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                animation: energyRingExpand 2s ease-out infinite;
            }

            .cosmic-shooting-star {
                position: absolute;
                width: 100px;
                height: 2px;
                background: linear-gradient(90deg, white, transparent);
                opacity: 0;
                animation: cosmicShootingStar 2s linear infinite;
                box-shadow: 0 0 20px white;
            }

            .cosmic-item-reveal {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                z-index: 1001;
                text-align: center;
                animation: revealFade 1s ease-out forwards;
                animation-delay: 3s;
                background: rgba(0, 0, 0, 0.7);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }

            @keyframes cosmicFade {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }

            @keyframes galaxyRotate {
                0% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.2); }
                100% { transform: rotate(360deg) scale(1); }
            }

            @keyframes starField {
                0% { transform: rotate(0deg) translateZ(-100px); }
                100% { transform: rotate(360deg) translateZ(100px); }
            }

            @keyframes starTwinkle {
                0%, 100% { opacity: 0.2; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
            }

            @keyframes nebulaFlow {
                0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.3; }
                50% { transform: rotate(180deg) scale(1.2); opacity: 0.6; }
            }

            @keyframes vortexGrow {
                0% { width: 0; height: 0; opacity: 0; }
                50% { width: 300px; height: 300px; opacity: 0.8; }
                100% { width: 200px; height: 200px; opacity: 0.5; }
            }

            @keyframes energyRingExpand {
                0% { width: 0; height: 0; opacity: 1; }
                100% { width: 400px; height: 400px; opacity: 0; }
            }

            @keyframes cosmicShootingStar {
                0% { 
                    transform: translate(0, 0) rotate(-45deg); 
                    opacity: 0; 
                }
                20% { opacity: 1; }
                100% { 
                    transform: translate(-500px, 500px) rotate(-45deg);
                    opacity: 0;
                }
            }

            @keyframes revealFade {
                0% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0);
                    filter: blur(10px);
                }
                100% { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1);
                    filter: blur(0);
                }
            }
        `;
        document.head.appendChild(style);

        const cosmicAnimation = document.createElement('div');
        cosmicAnimation.className = 'cosmic-orb-fullscreen';
        cosmicAnimation.innerHTML = `
            <div class="cosmic-universe">
                <div class="cosmic-galaxy"></div>
                <div class="cosmic-nebula"></div>
                <div class="cosmic-stars"></div>
                <div class="cosmic-vortex"></div>
                <div class="cosmic-energy-ring"></div>
                <div class="cosmic-shooting-stars">
                    <div class="cosmic-shooting-star"></div>
                    <div class="cosmic-shooting-star"></div>
                    <div class="cosmic-shooting-star"></div>
                    <div class="cosmic-shooting-star"></div>
                </div>
            </div>
            <div class="cosmic-item-reveal">
                <div class="${drop.rarity.toLowerCase()}-animation">
                    <div class="${drop.rarity.toLowerCase()}-glow"></div>
                    ${drop.class ? `
                        <div class="${drop.class}">
                            <span class="item-icon cosmic-icon">${drop.icon}</span>
                        </div>
                    ` : `
                        <div class="item-icon-container">
                            <span class="item-icon cosmic-icon" style="color: ${drop.color}">${drop.icon}</span>
                        </div>
                    `}
                    <h3 style="color: ${drop.color}">✧ ${drop.rarity} ✧</h3>
                    <h2 style="color: ${drop.color}">${drop.name}</h2>
                </div>
            </div>
        `;

        // Add dynamic stars
        const starsContainer = cosmicAnimation.querySelector('.cosmic-stars');
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'cosmic-star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.setProperty('--twinkle-duration', `${1 + Math.random() * 3}s`);
            starsContainer.appendChild(star);
        }

        document.body.appendChild(cosmicAnimation);

        // Remove the cosmic animation after a longer duration
        const duration = getRarityDuration(drop.rarity) + 3000;
        setTimeout(() => {
            cosmicAnimation.style.opacity = '0';
            setTimeout(() => {
                cosmicAnimation.remove();
                style.remove();
            }, 1000);
        }, duration);

        return;
    } else if (currentOrbType === 'infinity-orb') {
        // Create and inject styles for infinity orb animation
        const style = document.createElement('style');
        style.textContent = `
            .infinity-orb-fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1000;
                background: linear-gradient(45deg, #1a0033, #4a0099);
                opacity: 0;
                animation: infinityFade 1s ease-out forwards;
            }

            .infinity-core {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: radial-gradient(circle, #9900ff 0%, transparent 70%);
                animation: infinityPulse 3s infinite;
            }

            .infinity-symbol {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 100px;
                color: white;
                text-shadow: 0 0 20px #9900ff;
                animation: infinityRotate 4s infinite;
            }

            .infinity-rings {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .infinity-ring {
                position: absolute;
                border: 2px solid rgba(153, 0, 255, 0.5);
                border-radius: 50%;
                animation: infinityRingExpand 3s infinite;
            }

            .infinity-particles {
                position: absolute;
                width: 100%;
                height: 100%;
                perspective: 1000px;
            }

            .infinity-particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 10px #9900ff;
                animation: infinityParticleFloat var(--duration) infinite;
            }

            .infinity-runes {
                position: absolute;
                width: 100%;
                height: 100%;
            }

            .infinity-rune {
                position: absolute;
                color: rgba(255, 255, 255, 0.7);
                font-size: 24px;
                animation: runeFloat var(--duration) infinite;
            }

            .infinity-portal {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(0deg);
                width: 300px;
                height: 300px;
                border-radius: 50%;
                background: conic-gradient(
                    from 0deg,
                    transparent 0deg,
                    rgba(153, 0, 255, 0.2) 90deg,
                    transparent 180deg,
                    rgba(153, 0, 255, 0.2) 270deg,
                    transparent 360deg
                );
                animation: portalSpin 4s linear infinite;
            }

            .infinity-item-reveal {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1001;
                text-align: center;
                opacity: 0;
                animation: revealFade 1s ease-out forwards;
                animation-delay: 3s;
            }

            @keyframes infinityFade {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }

            @keyframes infinityPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
            }

            @keyframes infinityRotate {
                0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
                50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.2); }
                100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
            }

            @keyframes infinityRingExpand {
                0% { width: 0; height: 0; opacity: 1; }
                100% { width: 500px; height: 500px; opacity: 0; }
            }

            @keyframes infinityParticleFloat {
                0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
                50% { transform: translate3d(var(--x), var(--y), var(--z)) scale(1.5); opacity: 1; }
                100% { transform: translate3d(calc(var(--x) * 2), calc(var(--y) * 2), calc(var(--z) * 2)) scale(1); opacity: 0; }
            }

            @keyframes runeFloat {
                0% { transform: translate(var(--startX), var(--startY)) rotate(0deg); opacity: 0; }
                25% { opacity: 1; }
                100% { transform: translate(var(--endX), var(--endY)) rotate(360deg); opacity: 0; }
            }

            @keyframes portalSpin {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }

            @keyframes revealFade {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);

        const infinityAnimation = document.createElement('div');
        infinityAnimation.className = 'infinity-orb-fullscreen';
        infinityAnimation.innerHTML = `
            <div class="infinity-portal"></div>
            <div class="infinity-core"></div>
            <div class="infinity-symbol">∞</div>
            <div class="infinity-rings">
                ${Array.from({length: 5}, () => '<div class="infinity-ring"></div>').join('')}
            </div>
            <div class="infinity-particles"></div>
            <div class="infinity-runes"></div>
            <div class="infinity-item-reveal">
                <div class="${drop.rarity.toLowerCase()}-animation">
                    <div class="${drop.rarity.toLowerCase()}-glow"></div>
                    ${drop.class ? `
                        <div class="${drop.class}">
                            <span class="item-icon cosmic-icon">${drop.icon}</span>
                        </div>
                    ` : `
                        <div class="item-icon-container">
                            <span class="item-icon cosmic-icon" style="color: ${drop.color}">${drop.icon}</span>
                        </div>
                    `}
                    <h3 style="color: ${drop.color}">✧ ${drop.rarity} ✧</h3>
                    <h2 style="color: ${drop.color}">${drop.name}</h2>
                </div>
            </div>
        `;

        // Add particles
        const particlesContainer = infinityAnimation.querySelector('.infinity-particles');
        for (let i = 0; i < 100; i++) {
            const particle = document.createElement('div');
            particle.className = 'infinity-particle';
            particle.style.setProperty('--x', `${(Math.random() - 0.5) * 400}px`);
            particle.style.setProperty('--y', `${(Math.random() - 0.5) * 400}px`);
            particle.style.setProperty('--z', `${(Math.random() - 0.5) * 400}px`);
            particle.style.setProperty('--duration', `${2 + Math.random() * 3}s`);
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particlesContainer.appendChild(particle);
        }

        // Add floating runes
        const runesContainer = infinityAnimation.querySelector('.infinity-runes');
        const runeSymbols = ['∞', '☯', '✧', '⚡', '✵', '❂', '☄', '✺'];
        for (let i = 0; i < 20; i++) {
            const rune = document.createElement('div');
            rune.className = 'infinity-rune';
            rune.textContent = runeSymbols[Math.floor(Math.random() * runeSymbols.length)];
            rune.style.setProperty('--startX', `${Math.random() * 100}%`);
            rune.style.setProperty('--startY', `${Math.random() * 100}%`);
            rune.style.setProperty('--endX', `${Math.random() * 100}%`);
            rune.style.setProperty('--endY', `${Math.random() * 100}%`);
            rune.style.setProperty('--duration', `${3 + Math.random() * 4}s`);
            rune.style.left = rune.style.getPropertyValue('--startX');
            rune.style.top = rune.style.getPropertyValue('--startY');
            runesContainer.appendChild(rune);
        }

        document.body.appendChild(infinityAnimation);

        // Remove the animation after duration
        const duration = getRarityDuration(drop.rarity) + 3000;
        setTimeout(() => {
            infinityAnimation.style.opacity = '0';
            setTimeout(() => {
                infinityAnimation.remove();
                style.remove();
            }, 1000);
        }, duration);

        return;
    } else if (currentOrbType === 'celestial-orb') {
        // Create and inject styles for celestial orb animation
        const style = document.createElement('style');
        style.textContent = `
            .celestial-orb-fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1000;
                background: linear-gradient(45deg, #000033, #000066);
                opacity: 0;
                animation: celestialFade 1s ease-out forwards;
                overflow: hidden;
            }

            .celestial-core {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: radial-gradient(circle, #ffffff 0%, #00ffff 30%, transparent 70%);
                animation: celestialPulse 3s infinite;
                filter: blur(5px);
            }

            .celestial-aura {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                height: 300px;
                background: conic-gradient(
                    from 0deg,
                    transparent 0deg,
                    rgba(0, 255, 255, 0.2) 90deg,
                    transparent 180deg,
                    rgba(0, 255, 255, 0.2) 270deg,
                    transparent 360deg
                );
                border-radius: 50%;
                animation: celestialRotate 10s linear infinite;
            }

            .zodiac-ring {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 400px;
                height: 400px;
                border: 2px solid rgba(0, 255, 255, 0.3);
                border-radius: 50%;
                animation: zodiacRotate 20s linear infinite;
            }

            .constellation {
                position: absolute;
                width: 4px;
                height: 4px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 10px #00ffff;
                animation: starTwinkle var(--twinkle-duration) infinite;
            }

            .constellation-line {
                position: absolute;
                background: rgba(0, 255, 255, 0.3);
                height: 2px;
                transform-origin: left center;
                animation: constellationFade 3s infinite;
            }

            .divine-light {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: divineLight 5s infinite;
            }

            .celestial-stars {
                position: absolute;
                width: 100%;
                height: 100%;
                perspective: 1000px;
            }

            .celestial-star {
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                animation: starFloat var(--float-duration) infinite;
            }

            .celestial-beam {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 4px;
                height: 0;
                background: rgba(255, 255, 255, 0.8);
                animation: beamGrow 3s forwards;
                filter: blur(2px);
            }

            .celestial-item-reveal {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1001;
                text-align: center;
                opacity: 0;
                animation: revealFade 1s ease-out forwards;
                animation-delay: 3s;
            }

            @keyframes celestialFade {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }

            @keyframes celestialPulse {
                0%, 100% { 
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.5;
                    filter: blur(5px);
                }
                50% { 
                    transform: translate(-50%, -50%) scale(1.5);
                    opacity: 0.8;
                    filter: blur(3px);
                }
            }

            @keyframes celestialRotate {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(360deg); }
            }

            @keyframes zodiacRotate {
                0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
                50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.2); }
                100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
            }

            @keyframes starTwinkle {
                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.2); }
            }

            @keyframes constellationFade {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.8; }
            }

            @keyframes divineLight {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.2); }
            }

            @keyframes starFloat {
                0% { transform: translateZ(0) scale(1); }
                50% { transform: translateZ(100px) scale(1.5); }
                100% { transform: translateZ(0) scale(1); }
            }

            @keyframes beamGrow {
                0% { height: 0; opacity: 0; }
                50% { height: 1000px; opacity: 0.8; }
                100% { height: 0; opacity: 0; }
            }

            @keyframes revealFade {
                0% { 
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0);
                    filter: blur(10px);
                }
                100% { 
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    filter: blur(0);
                }
            }
        `;
        document.head.appendChild(style);

        const celestialAnimation = document.createElement('div');
        celestialAnimation.className = 'celestial-orb-fullscreen';
        celestialAnimation.innerHTML = `
            <div class="divine-light"></div>
            <div class="celestial-stars"></div>
            <div class="zodiac-ring"></div>
            <div class="celestial-aura"></div>
            <div class="celestial-core"></div>
            <div class="celestial-beams">
                ${Array.from({length: 8}, () => '<div class="celestial-beam"></div>').join('')}
            </div>
            <div class="celestial-item-reveal">
                <div class="${drop.rarity.toLowerCase()}-animation">
                    <div class="${drop.rarity.toLowerCase()}-glow"></div>
                    ${drop.class ? `
                        <div class="${drop.class}">
                            <span class="item-icon cosmic-icon">${drop.icon}</span>
                        </div>
                    ` : `
                        <div class="item-icon-container">
                            <span class="item-icon cosmic-icon" style="color: ${drop.color}">${drop.icon}</span>
                        </div>
                    `}
                    <h3 style="color: ${drop.color}">✧ ${drop.rarity} ✧</h3>
                    <h2 style="color: ${drop.color}">${drop.name}</h2>
                </div>
            </div>
        `;

        // Add dynamic stars
        const starsContainer = celestialAnimation.querySelector('.celestial-stars');
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'celestial-star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.setProperty('--float-duration', `${2 + Math.random() * 4}s`);
            starsContainer.appendChild(star);
        }

        // Add constellation points and lines
        const zodiacRing = celestialAnimation.querySelector('.zodiac-ring');
        const constellationPoints = 12;
        const center = { x: 200, y: 200 }; // Center of the zodiac ring
        const radius = 180; // Radius for constellation points
        const points = [];

        for (let i = 0; i < constellationPoints; i++) {
            const angle = (i / constellationPoints) * Math.PI * 2;
            const x = center.x + Math.cos(angle) * radius;
            const y = center.y + Math.sin(angle) * radius;
            
            const point = document.createElement('div');
            point.className = 'constellation';
            point.style.left = `${x}px`;
            point.style.top = `${y}px`;
            point.style.setProperty('--twinkle-duration', `${1 + Math.random() * 2}s`);
            zodiacRing.appendChild(point);
            points.push({ x, y });

            // Create constellation lines
            if (i > 0) {
                const line = document.createElement('div');
                line.className = 'constellation-line';
                const prevPoint = points[i - 1];
                const dx = x - prevPoint.x;
                const dy = y - prevPoint.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);
                
                line.style.width = `${length}px`;
                line.style.left = `${prevPoint.x}px`;
                line.style.top = `${prevPoint.y}px`;
                line.style.transform = `rotate(${angle}rad)`;
                zodiacRing.appendChild(line);
            }
        }

        document.body.appendChild(celestialAnimation);

        // Remove the animation after duration
        const duration = getRarityDuration(drop.rarity) + 3000;
        setTimeout(() => {
            celestialAnimation.style.opacity = '0';
            setTimeout(() => {
                celestialAnimation.remove();
                style.remove();
            }, 1000);
        }, duration);

        return;
    } else {
        // Default orb animation for other orbs
        openingAnimation.innerHTML = `
            <div class="orb-beams"></div>
            <div class="orb-glow"></div>
            <div class="orb-particles"></div>
            <div class="orb-rings"></div>
            <div class="orb-core"></div>
        `;
    }
    
    dropDisplay.appendChild(openingAnimation);
    document.querySelector('.shop-container').appendChild(dropDisplay);

    // Create explosion effect at the end of the orb animation
    setTimeout(() => {
        createExplosionParticles(openingAnimation);
        openingAnimation.style.opacity = '0';
        setTimeout(() => openingAnimation.remove(), 100);
    }, 2800);

    // Show the item slightly after the explosion starts
    setTimeout(() => {
        // Get the item's CSS class if it exists for high-tier items
        const items = window.ItemSystem.ITEMS[drop.rarity];
        const item = Array.isArray(items) ? 
            items.find(i => typeof i === 'object' && i.name === drop.name) : null;
        
        let content = '';
        
        if (item && item.class) {
            // High-tier item with custom image
            content = `
                <div class="${drop.rarity.toLowerCase()}-animation">
                    <div class="${item.class}">
                        <span class="item-icon">${drop.icon}</span>
                    </div>
                    <h3 style="color: ${drop.color}">✧ ${drop.rarity} ✧</h3>
                    <h2 style="color: ${drop.color}">${drop.name}</h2>
                </div>
            `;
        } else {
            // Default display for other items
            content = `
                <div class="standard-item-animation">
                    <div class="item-icon-container">
                        <span class="item-icon" style="color: ${drop.color}">${drop.icon}</span>
                    </div>
                    <h3 style="color: ${drop.color}">${drop.rarity}</h3>
                    <h2 style="color: ${drop.color}">${drop.name}</h2>
                </div>
            `;
        }
        
        dropDisplay.innerHTML = content;

        // Add scale animation for the content
        const contentElement = dropDisplay.children[0];
        contentElement.animate([
            { transform: 'scale(0)', offset: 0 },
            { transform: 'scale(1.2)', offset: 0.6 },
            { transform: 'scale(0.9)', offset: 0.8 },
            { transform: 'scale(1)', offset: 1 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            fill: 'forwards'
        });

        // Add time particles for ETERNAL items
        if (drop.rarity === "ETERNAL") {
            addTimeParticles(dropDisplay);
        }
    }, 3000);

    // Update the final removal timing
    const duration = getRarityDuration(drop.rarity);
    setTimeout(() => {
        dropDisplay.style.opacity = '0';
        setTimeout(() => dropDisplay.remove(), 1000);
    }, duration + 3000);
}

function getRarityDuration(rarity) {
    switch(rarity) {
        case 'ABSOLUTE': return 6000;
        case 'IMMORTAL': return 5500;
        case 'ETERNAL': return 5000;
        case 'INFINITE': return 4500;
        case 'OMNIPOTENT': return 4000;
        case 'GODLY': return 3500;
        default: return 3000;
    }
}

function createExplosionParticles(container) {
    // Create shockwave
    const shockwave = document.createElement('div');
    shockwave.className = 'shockwave';
    container.appendChild(shockwave);

    // Create more particles
    const particleCount = 80; // Increased from 50
    const centerX = container.offsetWidth / 2;
    const centerY = container.offsetHeight / 2;

    // Create main explosion particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'explosion-particle';
        
        // Random angle and distance
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = 400 + Math.random() * 300; // Increased distance
        
        // Calculate end position
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        // Set initial position
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        
        // Add particle to container
        container.appendChild(particle);
        
        // More violent particle animation
        particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${endX * 0.2}px, ${endY * 0.2}px) scale(2.5)`,
                opacity: 0.9,
                offset: 0.1
            },
            {
                transform: `translate(${endX * 0.4}px, ${endY * 0.4}px) scale(1.5)`,
                opacity: 0.7,
                offset: 0.2
            },
            { 
                transform: `translate(${endX}px, ${endY}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 600, // Faster animation
            easing: 'cubic-bezier(0.1, 0, 0.2, 1)',
            fill: 'forwards'
        });
    }

    // Add more debris particles
    for (let i = 0; i < 40; i++) { // Increased from 20
        const debris = document.createElement('div');
        debris.className = 'debris';
        
        // Random size and shape
        const size = 4 + Math.random() * 12; // Bigger debris
        debris.style.width = `${size}px`;
        debris.style.height = `${size}px`;
        
        // Random initial position near center
        const startX = centerX + (Math.random() - 0.5) * 10;
        const startY = centerY + (Math.random() - 0.5) * 10;
        debris.style.left = `${startX}px`;
        debris.style.top = `${startY}px`;
        
        container.appendChild(debris);
        
        // Random trajectory
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 400; // Increased distance
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        // More violent spinning animation
        debris.animate([
            {
                transform: 'rotate(0deg) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${endX * 0.5}px, ${endY * 0.5}px) rotate(${360 + Math.random() * 720}deg) scale(1.5)`,
                opacity: 0.8,
                offset: 0.3
            },
            {
                transform: `translate(${endX}px, ${endY}px) rotate(${1080 + Math.random() * 720}deg) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.05, 0.7, 0.3, 1)',
            fill: 'forwards'
        });
    }

    // Enhanced screen shake effect
    const shopContainer = document.querySelector('.shop-container');
    shopContainer.animate([
        { transform: 'translate(0, 0)' },
        { transform: 'translate(-15px, 10px)' },
        { transform: 'translate(12px, -12px)' },
        { transform: 'translate(-10px, 8px)' },
        { transform: 'translate(8px, -6px)' },
        { transform: 'translate(-6px, 4px)' },
        { transform: 'translate(4px, -2px)' },
        { transform: 'translate(0, 0)' }
    ], {
        duration: 500,
        easing: 'ease-out'
    });
}

// Add this function after the showDrop function
function addTimeParticles(dropDisplay) {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'time-particles';
    
    // Add 10 particles
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.className = 'time-particle';
        
        // Random starting position
        const x = Math.random() * 100 - 50; // -50 to 50
        const y = Math.random() * 100 - 50; // -50 to 50
        
        particle.style.setProperty('--x', `${x}px`);
        particle.style.setProperty('--y', `${y}px`);
        
        // Random starting position within the container
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 2}s`;
        
        particlesContainer.appendChild(particle);
    }
    
    dropDisplay.querySelector('.item-image').appendChild(particlesContainer);
}

// Replace the existing addItemToInventory function with this updated version
async function addItemToInventory(item) {
    try {
        const username = localStorage.getItem('playerName');
        
        // Fetch the current inventory directly from the database
        const getCurrentInventory = await fetch(`https://universal-backend-7wn9.onrender.com/api/user/${username}`);
        if (!getCurrentInventory.ok) {
            throw new Error('Failed to fetch current inventory');
        }
        const userData = await getCurrentInventory.json();
        const currentInventory = userData.inventory || [];

        // Add new item to the current inventory
        currentInventory.push(item);

        // Update both local storage and database with the new inventory
        localStorage.setItem('inventory', JSON.stringify(currentInventory));

        const response = await fetch('https://universal-backend-7wn9.onrender.com/api/update-inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                inventory: currentInventory
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update inventory in database');
        }

        console.log('Item added to inventory:', item);
    } catch (error) {
        console.error('Error updating inventory:', error);
        // On error, sync local storage with database
        const username = localStorage.getItem('playerName');
        try {
            const getCurrentInventory = await fetch(`https://universal-backend-7wn9.onrender.com/api/user/${username}`);
            if (getCurrentInventory.ok) {
                const userData = await getCurrentInventory.json();
                localStorage.setItem('inventory', JSON.stringify(userData.inventory || []));
            }
        } catch (revertError) {
            console.error('Error reverting inventory:', revertError);
        }
    }
}

// Add after your existing code

// Initialize Stripe
const stripe = Stripe('your_publishable_key'); // Replace with your actual Stripe publishable key

// Modal functionality
const modal = document.getElementById('currencyModal');
const buyButton = document.querySelector('.buy-currency-button');
const closeButton = document.querySelector('.close-modal');

buyButton.onclick = () => {
    modal.style.display = 'block';
}

closeButton.onclick = () => {
    modal.style.display = 'none';
}

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Handle currency purchases
document.querySelectorAll('.purchase-button').forEach(button => {
    button.addEventListener('click', async (e) => {
        const amount = e.target.dataset.amount;
        const price = e.target.dataset.price;
        
        // Disable button and show loading state
        button.disabled = true;
        button.classList.add('loading');
        button.textContent = 'Processing...';

        try {
            // Create payment intent on your server
            const response = await fetch('https://universal-backend-7wn9.onrender.com/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseFloat(price) * 100, // Convert to cents
                    currency: 'usd',
                    metadata: {
                        coins: amount,
                        username: localStorage.getItem('playerName')
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const { clientSecret } = await response.json();

            // Confirm the payment with Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: await stripe.elements().create('card'),
                    billing_details: {
                        name: localStorage.getItem('playerName')
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            // Payment successful, update user's balance
            const updateResponse = await fetch('https://universal-backend-7wn9.onrender.com/api/update-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: localStorage.getItem('playerName'),
                    balance: balance + parseInt(amount)
                })
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update balance');
            }

            // Update local balance
            balance += parseInt(amount);
            localStorage.setItem('balance', balance);
            balanceDisplay.innerHTML = `Balance: $${balance}`;

            // Show success message
            alert('Purchase successful! Your balance has been updated.');
            modal.style.display = 'none';

        } catch (error) {
            alert(`Payment failed: ${error.message}`);
        } finally {
            // Reset button state
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = 'Purchase';
        }
    });
});

