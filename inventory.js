class Inventory {
    constructor() {
        this.items = [];
        this.itemsPerPage = 24;
        this.currentPage = 1;
        this.currentFilter = 'ALL';
        this.currentSort = 'RARITY_DESC';
        this.searchQuery = '';
        this.currentView = 'items'; // Add this line to track current view
        this.initializeFilters();
        this.initializeEventListeners();
        this.initializeSetSystem();
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

        // Add these new listeners
        document.getElementById('viewItems').addEventListener('click', () => {
            this.currentView = 'items';
            this.toggleView();
        });

        document.getElementById('viewSets').addEventListener('click', () => {
            this.currentView = 'sets';
            this.toggleView();
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
        try {
            // Call the server to update the inventory
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

            if (!response.ok) {
                throw new Error('Failed to update inventory on server');
            }

            // Fetch the current balance from the server
            const userResponse = await fetch(`https://universal-backend-7wn9.onrender.com/api/user/${username}`);
            if (!userResponse.ok) {
                throw new Error('Failed to fetch user data from server');
            }
            const userData = await userResponse.json();
            const newBalance = userData.balance + itemValue;

            // Update balance on the server
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

            // Remove sold item from local inventory
            this.items = this.items.filter(i => i !== item);
            this.displayInventory();
            this.updateBalance(itemValue);
            alert(`Sold ${item.name} for $${itemValue.toLocaleString()}`);
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

    initializeSetSystem() {
        const setsContainer = document.querySelector('.sets-container');
        Object.entries(window.ItemSystem.SETS).forEach(([setName, setData]) => {
            const setElement = document.createElement('div');
            setElement.className = 'set-box';
            
            const itemsHtml = setData.items.map(itemName => {
                const hasItem = this.items.some(item => item.name === itemName);
                return `
                    <div class="set-item ${hasItem ? 'owned' : 'missing'}">
                        <div class="set-item-icon">${this.getItemIcon(itemName)}</div>
                        <div class="set-item-name">${itemName}</div>
                    </div>
                `;
            }).join('');

            setElement.innerHTML = `
                <div class="set-header">
                    <h3>${setName}</h3>
                    <p>${setData.description}</p>
                </div>
                <div class="set-items">
                    ${itemsHtml}
                </div>
                <div class="set-reward">
                    <p>Set Reward: $${setData.reward.toLocaleString()}</p>
                    ${this.hasCompleteSet(setData.items) ? 
                        '<button class="claim-set-button">Claim Reward</button>' : 
                        '<span class="incomplete-set">Set Incomplete</span>'}
                </div>
            `;

            if (this.hasCompleteSet(setData.items)) {
                setElement.querySelector('.claim-set-button').addEventListener('click', () => {
                    this.claimSetReward(setName, setData);
                });
            }

            setsContainer.appendChild(setElement);
        });
    }

    hasCompleteSet(setItems) {
        return setItems.every(itemName => 
            this.items.some(item => item.name === itemName)
        );
    }

    getItemIcon(itemName) {
        // Search through all rarities and their items to find the matching item
        for (const [rarity, items] of Object.entries(window.ItemSystem.ITEMS)) {
            const item = items.find(item => item.name === itemName);
            if (item) {
                return item.icon;
            }
        }
        return '🎁'; // Default icon if item not found
    }

    async claimSetReward(setName, setData) {
        const username = localStorage.getItem('playerName');
        try {
            // Call server to claim reward and update balance
            const response = await fetch('https://universal-backend-7wn9.onrender.com/api/claim-set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    setName,
                    reward: setData.reward
                })
            });

            if (!response.ok) throw new Error('Failed to claim set reward');

            this.updateBalance(setData.reward);
            alert(`Claimed ${setName} set reward: $${setData.reward.toLocaleString()}`);
            
            // Refresh the sets view
            this.initializeSetSystem();
        } catch (error) {
            console.error('Error claiming set reward:', error);
            alert('Failed to claim set reward. Please try again later.');
        }
    }

    toggleView() {
        const inventoryGrid = document.querySelector('.inventory-display');
        const setsContainer = document.querySelector('.sets-display');
        
        if (this.currentView === 'items') {
            inventoryGrid.style.display = 'block';
            setsContainer.style.display = 'none';
            document.getElementById('viewItems').classList.add('active');
            document.getElementById('viewSets').classList.remove('active');
        } else {
            inventoryGrid.style.display = 'none';
            setsContainer.style.display = 'block';
            document.getElementById('viewItems').classList.remove('active');
            document.getElementById('viewSets').classList.add('active');
        }
    }
}

// Initialize inventory when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.inventory = new Inventory();
});
