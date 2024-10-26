class Inventory {
    constructor() {
        this.items = [];
        this.itemsPerPage = 24;
        this.currentPage = 1;
        this.currentFilter = 'ALL';
        this.currentSort = 'RARITY_DESC';
        this.searchQuery = '';
        this.activeSets = new Set();
        this.currentTab = 'items'; // Add this line to track current tab
        this.initializeTabs(); // Add this line
        
        this.loadInventory();
        this.initializeFilters();
        this.initializeEventListeners();
        this.initializeSets();
    }

    async loadInventory() {
        const username = localStorage.getItem('playerName');
        try {
            const response = await fetch(`https://universal-backend-7wn9.onrender.com/api/user/${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch inventory from server');
            }
            const userData = await response.json();
            this.items = userData.inventory || [];
            this.updateBalance(userData.balance);
            this.displayInventory();
        } catch (error) {
            console.error('Error loading inventory:', error);
            alert('Failed to load inventory. Please try again later.');
        }
    }

    initializeFilters() {
        const rarityFilter = document.getElementById('rarityFilter');
        Object.keys(window.ItemSystem.RARITIES).forEach(rarity => {
            const option = document.createElement('option');
            option.value = rarity;
            option.textContent = rarity;
            option.style.color = window.ItemSystem.RARITIES[rarity].color;
            rarityFilter.appendChild(option);
        });
    }

    initializeEventListeners() {
        document.getElementById('rarityFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.currentPage = 1;
            this.displayInventory();
        });

        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.displayInventory();
        });

        document.getElementById('searchBar').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.displayInventory();
        });

        document.querySelector('.prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayInventory();
            }
        });

        document.querySelector('.next-page').addEventListener('click', () => {
            const filteredItems = this.getFilteredItems();
            const maxPages = Math.ceil(filteredItems.length / this.itemsPerPage);
            if (this.currentPage < maxPages) {
                this.currentPage++;
                this.displayInventory();
            }
        });
    }

    getFilteredItems() {
        let items = [...this.items];

        if (this.searchQuery) {
            items = items.filter(item => item.name.toLowerCase().includes(this.searchQuery));
        }

        if (this.currentFilter !== 'ALL') {
            items = items.filter(item => item.rarity === this.currentFilter);
        }

        items.sort((a, b) => {
            switch (this.currentSort) {
                case 'RARITY_DESC':
                    return this.getRarityWeight(b.rarity) - this.getRarityWeight(a.rarity);
                case 'RARITY_ASC':
                    return this.getRarityWeight(a.rarity) - this.getRarityWeight(b.rarity);
                case 'NAME_ASC':
                    return a.name.localeCompare(b.name);
                case 'NAME_DESC':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        return items;
    }

    getRarityWeight(rarity) {
        const rarities = Object.keys(window.ItemSystem.RARITIES);
        return rarities.indexOf(rarity);
    }

    displayInventory() {
        const grid = document.querySelector('.inventory-grid');
        grid.innerHTML = '';

        const filteredItems = this.getFilteredItems();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageItems = filteredItems.slice(startIndex, endIndex);

        pageItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.setAttribute('data-rarity', item.rarity);
            
            const itemValue = this.calculateItemValue(item);
            const itemWorth = this.calculateItemWorth(item);

            itemElement.innerHTML = `
                <div class="item-icon" style="color: ${item.color}">${item.icon}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-rarity" style="color: ${item.color}">${item.rarity}</div>
                <div class="item-worth" style="color: #00d4ff;">Worth: $${itemWorth.toLocaleString()}</div>
                <button class="sell-item-button">Sell</button>
            `;

            itemElement.querySelector('.sell-item-button').addEventListener('click', () => this.sellItem(item, itemValue));
            grid.appendChild(itemElement);
        });

        const maxPages = Math.ceil(filteredItems.length / this.itemsPerPage);
        document.querySelector('.page-info').textContent = `Page ${this.currentPage} of ${maxPages}`;
        document.querySelector('.prev-page').disabled = this.currentPage === 1;
        document.querySelector('.next-page').disabled = this.currentPage === maxPages;
    }

    async sellItem(item, itemValue) {
        const username = localStorage.getItem('playerName');
        console.log('Attempting to sell item:', { item, username });
        
        try {
            // Call the server to update the inventory
            console.log('Sending sell request to server...');
            const response = await fetch('https://universal-backend-7wn9.onrender.com/api/sell-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    itemName: item.name
                })
            });

            console.log('Server response status:', response.status);
            const result = await response.json();
            console.log('Server response:', result);

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update inventory on server');
            }

            if (!result.success) {
                throw new Error(result.error || 'Failed to sell item');
            }

            // Update local inventory with the server's version
            console.log('Updating local inventory with server response');
            this.items = result.inventory;
            console.log('New local inventory:', this.items);

            // Update balance
            console.log('Fetching updated user data...');
            const userResponse = await fetch(`https://universal-backend-7wn9.onrender.com/api/user/${username}`);
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user data from server');
            }
            const userData = await userResponse.json();
            const newBalance = userData.balance + itemValue;
            console.log('Updating balance to:', newBalance);

            // Update balance on the server
            console.log('Sending balance update to server...');
            const balanceResponse = await fetch('https://universal-backend-7wn9.onrender.com/api/update-balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    balance: newBalance
                })
            });

            if (!balanceResponse.ok) {
                throw new Error('Failed to update balance on server');
            }

            // Update local display
            console.log('Updating local display...');
            this.displayInventory();
            this.updateBalance(itemValue);
            alert(`Sold ${item.name} for $${itemValue.toLocaleString()}`);
            
            // Verify the item was removed
            console.log('Final inventory check:', this.items);
            
        } catch (error) {
            console.error('Error selling item:', error);
            alert('Failed to sell item. Please try again later.');
        }
    }

    calculateItemValue(item) {
        // Adjusted sell value calculation based on rarity
        const rarityValues = {
            COMMON: 5,
            UNCOMMON: 15,
            RARE: 40,
            VERY_RARE: 80,
            EPIC: 150,
            LEGENDARY: 300,
            MYTHICAL: 600,
            DIVINE: 1200,
            CELESTIAL: 2500,
            COSMIC: 5000,
            TRANSCENDENT: 10000,
            ETHEREAL: 20000,
            ANCIENT: 40000,
            PRIMORDIAL: 80000,
            GODLY: 160000,
            OMNIPOTENT: 320000,
            INFINITE: 640000,
            ETERNAL: 1280000,
            IMMORTAL: 2560000,
            ABSOLUTE: 5120000
        };
        return rarityValues[item.rarity] || 0;
    }

    calculateItemWorth(item) {
        // Make the worth value the same as the sell value
        return this.calculateItemValue(item);
    }

    updateBalance(amount) {
        const balanceDisplay = document.getElementById('balanceDisplay');
        const currentBalance = parseInt(balanceDisplay.textContent.replace(/[^0-9]/g, ''));
        const newBalance = currentBalance + amount;
        balanceDisplay.textContent = `Balance: $${newBalance.toLocaleString()}`;
        localStorage.setItem('balance', newBalance); // Update local storage
    }

    initializeSets() {
        this.updateActiveSets();
    }

    updateActiveSets() {
        this.activeSets.clear();
        
        Object.entries(window.ItemSystem.ITEM_SETS).forEach(([setId, setInfo]) => {
            const ownedSetItems = this.items.filter(item => 
                setInfo.items.includes(item.name)
            );
            
            if (ownedSetItems.length >= setInfo.requiredCount) {
                this.activeSets.add(setId);
            }
        });
    }

    initializeTabs() {
        const tabsHtml = `
            <div class="inventory-tabs">
                <button class="tab-button active" data-tab="items">Items</button>
                <button class="tab-button" data-tab="sets">Sets</button>
            </div>
        `;
        
        const inventoryDisplay = document.querySelector('.inventory-display');
        inventoryDisplay.insertAdjacentHTML('beforebegin', tabsHtml);

        // Add tab click listeners
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        
        // Update visibility of content
        const inventoryDisplay = document.querySelector('.inventory-display');
        if (!inventoryDisplay) {
            console.error('Could not find inventory display!');
            return;
        }
        
        if (tabName === 'items') {
            console.log('Showing items tab');
            inventoryDisplay.style.display = 'block';
            const setsContainer = document.querySelector('.sets-container');
            if (setsContainer) {
                setsContainer.style.display = 'none';
            }
        } else {
            console.log('Showing sets tab');
            inventoryDisplay.style.display = 'none';
            this.displaySets();
        }
    }

    displaySets() {
        console.log('displaySets called');
        if (!window.ItemSystem || !window.ItemSystem.ITEM_SETS) {
            console.error('ItemSystem or ITEM_SETS not found!');
            return;
        }

        let setsContainer = document.querySelector('.sets-container');
        if (!setsContainer) {
            console.log('Creating new sets container');
            setsContainer = document.createElement('div');
            setsContainer.className = 'sets-container';
            setsContainer.style.display = 'block'; // Force display block
            
            // Insert after the inventory display
            const inventoryContainer = document.querySelector('.inventory-container');
            if (!inventoryContainer) {
                console.error('Could not find inventory container!');
                return;
            }
            inventoryContainer.appendChild(setsContainer);
        } else {
            console.log('Found existing sets container');
            setsContainer.style.display = 'block'; // Force display block
        }

        // Clear existing content
        setsContainer.innerHTML = '';

        // Add a title to the sets container
        const setsTitle = document.createElement('h2');
        setsTitle.textContent = 'Item Sets';
        setsTitle.style.color = '#00d4ff';
        setsTitle.style.marginBottom = '20px';
        setsContainer.appendChild(setsTitle);

        let setCount = 0;
        Object.entries(window.ItemSystem.ITEM_SETS).forEach(([setId, setInfo]) => {
            console.log('Creating set element for:', setId);
            setCount++;
            
            const setElement = document.createElement('div');
            setElement.className = 'set-info';
            
            const ownedItems = this.items.filter(item => 
                setInfo.items.includes(item.name)
            );
            
            console.log('Owned items for', setId, ':', ownedItems);
            
            const isComplete = ownedItems.length >= setInfo.requiredCount;
            
            setElement.innerHTML = `
                <h3 style="color: ${setInfo.color}">${setInfo.name}</h3>
                <p class="set-description">${setInfo.description}</p>
                <div class="set-progress">
                    <div class="progress-bar" style="width: ${(ownedItems.length / setInfo.requiredCount) * 100}%"></div>
                    <span>${ownedItems.length}/${setInfo.requiredCount}</span>
                </div>
                <p class="set-bonus ${isComplete ? 'active' : ''}">${setInfo.bonus}</p>
                <div class="set-items">
                    ${setInfo.items.map(itemName => {
                        const owned = ownedItems.some(item => item.name === itemName);
                        return `<div class="set-item ${owned ? 'owned' : ''}">${itemName}</div>`;
                    }).join('')}
                </div>
            `;
            
            setsContainer.appendChild(setElement);
        });

        console.log(`Created ${setCount} set elements`);

        // If no sets were created, show a message
        if (setCount === 0) {
            setsContainer.innerHTML = '<p style="color: #999; text-align: center;">No item sets available</p>';
        }
    }
}

// Initialize inventory when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('ItemSystem:', window.ItemSystem); // Add this line
    console.log('ITEM_SETS:', window.ItemSystem.ITEM_SETS); // Add this line
    window.inventory = new Inventory();
});
