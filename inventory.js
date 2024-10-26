class Inventory {
    constructor() {
        this.items = [];
        this.itemsPerPage = 24;
        this.currentPage = 1;
        this.currentFilter = 'ALL';
        this.currentSort = 'RARITY_DESC';
        this.searchQuery = '';
        
        this.loadInventory();
        this.initializeFilters();
        this.initializeEventListeners();
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

        document.getElementById('viewMode').addEventListener('change', (e) => {
            const mode = e.target.value;
            if (mode === 'SETS') {
                this.displaySets();
            } else {
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

    displaySets() {
        const grid = document.querySelector('.inventory-grid');
        grid.innerHTML = '';
        
        Object.entries(window.ItemSystem.SETS).forEach(([setId, setData]) => {
            const setElement = document.createElement('div');
            setElement.className = 'set-container';
            
            const setHeader = document.createElement('div');
            setHeader.className = 'set-header';
            setHeader.innerHTML = `
                <h3>${setData.name}</h3>
                <span class="set-reward">Complete Reward: $${setData.reward.toLocaleString()}</span>
            `;
            
            const setItems = document.createElement('div');
            setItems.className = 'set-items';
            
            const ownedItems = new Set(this.items.map(item => item.name));
            const allItemsOwned = setData.items.every(itemName => ownedItems.has(itemName));
            
            setData.items.forEach(itemName => {
                const itemOwned = ownedItems.has(itemName);
                const itemElement = document.createElement('div');
                itemElement.className = `set-item ${itemOwned ? 'owned' : 'missing'}`;
                
                const item = window.ItemSystem.ITEMS.find(i => i.name === itemName);
                itemElement.innerHTML = `
                    <div class="item-icon" style="color: ${itemOwned ? item.color : '#666'}">${item.icon}</div>
                    <div class="item-name">${itemName}</div>
                    <div class="item-status">${itemOwned ? 'Owned' : 'Missing'}</div>
                `;
                
                setItems.appendChild(itemElement);
            });
            
            const completeButton = document.createElement('button');
            completeButton.className = 'complete-set-button';
            completeButton.textContent = 'Complete Set';
            completeButton.disabled = !allItemsOwned;
            completeButton.addEventListener('click', () => this.completeSet(setId, setData));
            
            setElement.appendChild(setHeader);
            setElement.appendChild(setItems);
            setElement.appendChild(completeButton);
            grid.appendChild(setElement);
        });
    }

    async completeSet(setId, setData) {
        const username = localStorage.getItem('playerName');
        try {
            const response = await fetch('https://universal-backend-7wn9.onrender.com/api/complete-set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    setId,
                    items: setData.items
                })
            });

            if (!response.ok) {
                throw new Error('Failed to complete set');
            }

            // Remove items from inventory
            this.items = this.items.filter(item => !setData.items.includes(item.name));
            
            // Update balance
            this.updateBalance(setData.reward);
            
            alert(`Completed ${setData.name} set! Received $${setData.reward.toLocaleString()}`);
            this.displaySets();
        } catch (error) {
            console.error('Error completing set:', error);
            alert('Failed to complete set. Please try again later.');
        }
    }
}

// Initialize inventory when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.inventory = new Inventory();
});
