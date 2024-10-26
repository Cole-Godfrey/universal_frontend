class Inventory {
    constructor() {
        this.items = [];
        this.itemsPerPage = 24;
        this.currentPage = 1;
        this.currentFilter = 'ALL';
        this.currentSort = 'VALUE_DESC';
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

        // Add quick sell buttons
        document.getElementById('quickSellButtons').addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-sell-btn')) {
                const rarity = e.target.dataset.rarity;
                this.quickSellByRarity(rarity);
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
                case 'VALUE_DESC':
                    return this.calculateItemValue(b) - this.calculateItemValue(a);
                case 'VALUE_ASC':
                    return this.calculateItemValue(a) - this.calculateItemValue(b);
                case 'NAME_ASC':
                    return a.name.localeCompare(b.name);
                case 'NAME_DESC':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        // Group identical items
        const groupedItems = items.reduce((acc, item) => {
            const key = `${item.name}-${item.rarity}`;
            if (!acc[key]) {
                acc[key] = { ...item, count: 1 };
            } else {
                acc[key].count++;
            }
            return acc;
        }, {});

        return Object.values(groupedItems);
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
            const totalValue = itemValue * (item.count || 1);

            itemElement.innerHTML = `
                <div class="item-content">
                    <div class="item-icon" style="color: ${item.color}">${item.icon}</div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-rarity" style="color: ${item.color}">${item.rarity}</div>
                    <div class="item-worth">Worth: $${itemValue.toLocaleString()}</div>
                    ${item.count > 1 ? `<div class="item-count">x${item.count}</div>` : ''}
                    <button class="sell-item-button">Sell${item.count > 1 ? ' (1)' : ''}</button>
                    ${item.count > 1 ? `<button class="sell-all-button">Sell All</button>` : ''}
                </div>
            `;

            // Add hover effect listeners
            itemElement.addEventListener('mouseenter', () => this.showItemDetails(item, itemElement));
            itemElement.addEventListener('mouseleave', () => this.hideItemDetails(itemElement));

            // Add sell button listeners
            itemElement.querySelector('.sell-item-button').addEventListener('click', () => this.sellItem(item, itemValue));
            if (item.count > 1) {
                itemElement.querySelector('.sell-all-button').addEventListener('click', () => this.sellAllItems(item, totalValue));
            }

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

    async quickSellByRarity(rarity) {
        const itemsToSell = this.items.filter(item => item.rarity === rarity);
        if (itemsToSell.length === 0) {
            alert('No items of this rarity to sell!');
            return;
        }

        const totalValue = itemsToSell.reduce((sum, item) => sum + this.calculateItemValue(item), 0);
        const confirmed = await this.showConfirmDialog(
            `Sell all ${itemsToSell.length} ${rarity} items for $${totalValue.toLocaleString()}?`
        );

        if (confirmed) {
            try {
                // Implement bulk sell API call here
                const username = localStorage.getItem('playerName');
                const response = await fetch('https://universal-backend-7wn9.onrender.com/api/bulk-sell', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        items: itemsToSell.map(item => item.name)
                    })
                });

                if (!response.ok) throw new Error('Failed to sell items');

                this.items = this.items.filter(item => item.rarity !== rarity);
                this.updateBalance(totalValue);
                this.displayInventory();
                this.showToast(`Sold ${itemsToSell.length} items for $${totalValue.toLocaleString()}`);
            } catch (error) {
                console.error('Error bulk selling:', error);
                alert('Failed to sell items. Please try again.');
            }
        }
    }

    showConfirmDialog(message) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog';
            dialog.innerHTML = `
                <div class="confirm-content">
                    <p>${message}</p>
                    <div class="confirm-buttons">
                        <button class="confirm-yes">Yes</button>
                        <button class="confirm-no">No</button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);

            dialog.querySelector('.confirm-yes').onclick = () => {
                dialog.remove();
                resolve(true);
            };
            dialog.querySelector('.confirm-no').onclick = () => {
                dialog.remove();
                resolve(false);
            };
        });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    sellAllItems(item, totalValue) {
        // Implement bulk sell API call here
        const username = localStorage.getItem('playerName');
        const response = fetch('https://universal-backend-7wn9.onrender.com/api/bulk-sell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                items: [item.name]
            })
        });

        if (!response.ok) throw new Error('Failed to sell items');

        this.items = this.items.filter(i => i !== item);
        this.updateBalance(totalValue);
        this.displayInventory();
        this.showToast(`Sold ${item.name} for $${totalValue.toLocaleString()}`);
    }

    showItemDetails(item, itemElement) {
        // Implement item details display here
    }

    hideItemDetails(itemElement) {
        // Implement item details hide here
    }
}

// Initialize inventory when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.inventory = new Inventory();
});
