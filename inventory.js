class Inventory {
    constructor() {
        this.items = [];
        this.itemsPerPage = 24;
        this.currentPage = 1;
        this.currentFilter = 'ALL';
        this.currentSort = 'RARITY_DESC';
        this.searchQuery = '';
        this.currentView = 'items'; // 'items' or 'sets'
        
        // Wait for DOM to be fully loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        this.loadInventory();
        this.initializeFilters();
        this.initializeEventListeners();
        this.updateViewVisibility();
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
        // Get button elements
        const inventoryButton = document.getElementById('inventoryButton');
        const setsButton = document.getElementById('setsButton');

        if (!inventoryButton || !setsButton) {
            console.error('View toggle buttons not found');
            return;
        }

        // Add button event listeners
        inventoryButton.addEventListener('click', (e) => {
            this.setActiveView('items', e.target);
        });
        
        setsButton.addEventListener('click', (e) => {
            this.setActiveView('sets', e.target);
        });

        // Store references to filter elements
        this.filterElements = {
            rarityFilter: document.getElementById('rarityFilter'),
            sortBy: document.getElementById('sortBy'),
            searchBar: document.getElementById('searchBar'),
            prevPage: document.querySelector('.prev-page'),
            nextPage: document.querySelector('.next-page')
        };

        // Add event listeners only if elements exist
        if (this.filterElements.rarityFilter) {
            this.filterElements.rarityFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.currentPage = 1;
                this.displayInventory();
            });
        }

        if (this.filterElements.sortBy) {
            this.filterElements.sortBy.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.displayInventory();
            });
        }

        if (this.filterElements.searchBar) {
            this.filterElements.searchBar.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.displayInventory();
            });
        }

        if (this.filterElements.prevPage) {
            this.filterElements.prevPage.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.displayInventory();
                }
            });
        }

        if (this.filterElements.nextPage) {
            this.filterElements.nextPage.addEventListener('click', () => {
                const filteredItems = this.getFilteredItems();
                const maxPages = Math.ceil(filteredItems.length / this.itemsPerPage);
                if (this.currentPage < maxPages) {
                    this.currentPage++;
                    this.displayInventory();
                }
            });
        }
    }

    // Add this new method
    updateViewVisibility() {
        const filtersContainer = document.querySelector('.inventory-filters');
        const paginationContainer = document.querySelector('.inventory-pagination');
        
        if (this.currentView === 'sets') {
            filtersContainer.style.display = 'none';
            paginationContainer.style.display = 'none';
        } else {
            filtersContainer.style.display = 'flex';
            paginationContainer.style.display = 'flex';
        }
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
        
        Object.entries(window.ItemSystem.SETS).forEach(([setName, setData]) => {
            const setElement = document.createElement('div');
            setElement.className = 'set-container';
            
            const setHeader = document.createElement('div');
            setHeader.className = 'set-header';
            setHeader.innerHTML = `
                <h3>${setName}</h3>
                <p>${setData.description}</p>
                <p class="set-reward">Reward: $${setData.reward.toLocaleString()}</p>
            `;
            
            const setItems = document.createElement('div');
            setItems.className = 'set-items';
            
            const ownedItems = new Set(this.items.map(item => item.name));
            
            setData.items.forEach(itemName => {
                const itemElement = document.createElement('div');
                const isOwned = ownedItems.has(itemName);
                itemElement.className = `set-item ${isOwned ? 'owned' : 'missing'}`;
                
                const item = window.ItemSystem.getItemByName(itemName);
                itemElement.innerHTML = `
                    <div class="item-icon" style="color: ${isOwned ? item.color : '#666'}">${item.icon}</div>
                    <div class="item-name">${itemName}</div>
                    <div class="item-status">${isOwned ? '✓' : '×'}</div>
                `;
                
                setItems.appendChild(itemElement);
            });
            
            setElement.appendChild(setHeader);
            setElement.appendChild(setItems);
            grid.appendChild(setElement);
        });
    }

    // Add this new method
    setActiveView(view, buttonElement) {
        // Update active button styling
        document.querySelectorAll('.view-button').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');

        // Update view
        this.currentView = view;
        this.updateViewVisibility();
        
        if (view === 'sets') {
            this.displaySets();
        } else {
            this.displayInventory();
        }
    }
}

// Initialize inventory when page loads
window.inventory = new Inventory();
