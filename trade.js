// Add these variables at the top
let yourInventory = [];
let partnerInventory = [];
let selectedItems = {
    your: new Set(),
    partner: new Set()
};

document.addEventListener('DOMContentLoaded', () => {
    loadPlayerInventory();
    setupTradeControls();
});

// Update the loadPlayerInventory function
async function loadPlayerInventory() {
    const username = localStorage.getItem('playerName');
    try {
        const response = await fetch(`https://universal-backend-7wn9.onrender.com/api/user/${username}`);
        if (!response.ok) {
            throw new Error('Failed to fetch your inventory from server');
        }
        const userData = await response.json();
        yourInventory = userData.inventory || [];
        displayItems('yourItems', yourInventory, 'your');
        loadPendingTrades();
    } catch (error) {
        console.error('Error loading your inventory:', error);
        alert('Failed to load your inventory. Please try again later.');
    }
}

// Add function to load pending trades
async function loadPendingTrades() {
    const username = localStorage.getItem('playerName');
    try {
        const response = await fetch(`https://universal-backend-7wn9.onrender.com/api/trade/pending/${username}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch pending trades');
        }

        const trades = await response.json();
        
        if (trades.length > 0) {
            displayPendingTrades(trades);
        } else {
            console.log('No pending trades found');
            const searchMessage = document.getElementById('searchMessage');
            searchMessage.innerHTML = '<span class="info">You don\'t have any pending trades.</span>';
        }
    } catch (error) {
        console.error('Error loading pending trades:', error);
        const searchMessage = document.getElementById('searchMessage');
        searchMessage.innerHTML = '<span class="info">You don\'t have any pending trades.</span>';
    }
}

// Add function to display pending trades
function displayPendingTrades(trades) {
    const container = document.createElement('div');
    container.className = 'pending-trades';
    
    trades.forEach(trade => {
        const tradeElement = document.createElement('div');
        tradeElement.className = 'pending-trade';
        
        const isReceiver = trade.receiver === localStorage.getItem('playerName');
        
        tradeElement.innerHTML = `
            <h3>${isReceiver ? 'Trade Offer From' : 'Trade Offer To'} ${isReceiver ? trade.sender : trade.receiver}</h3>
            <div class="trade-items">
                <div class="offering">
                    <h4>Offering:</h4>
                    ${displayTradeItems(trade.senderItems)}
                </div>
                <div class="requesting">
                    <h4>Requesting:</h4>
                    ${displayTradeItems(trade.receiverItems)}
                </div>
            </div>
            ${isReceiver ? `
                <div class="trade-actions">
                    <button onclick="respondToTrade('${trade._id}', 'accept')">Accept</button>
                    <button onclick="respondToTrade('${trade._id}', 'reject')">Reject</button>
                </div>
            ` : '<p>Waiting for response...</p>'}
        `;
        
        container.appendChild(tradeElement);
    });
    
    document.querySelector('.trade-container').prepend(container);
}

// Add function to handle trade responses
async function respondToTrade(tradeId, response) {
    try {
        const username = localStorage.getItem('playerName');
        const result = await fetch('https://universal-backend-7wn9.onrender.com/api/trade/respond', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tradeId,
                response,
                username
            })
        });
        
        if (result.ok) {
            const data = await result.json();
            if (response === 'accept') {
                // Fetch updated inventory from the server
                const updatedUser = await fetch(`https://universal-backend-7wn9.onrender.com/api/user/${username}`);
                const userData = await updatedUser.json();

                // Update the inventory display with the fetched data
                yourInventory = userData.inventory;
                displayItems('yourItems', yourInventory, 'your');
            }
            location.reload();
        } else {
            throw new Error('Failed to respond to trade');
        }
    } catch (error) {
        console.error('Error responding to trade:', error);
        alert('Failed to respond to trade');
    }
}

// Update the displayItems function to show items with effects and icons
function displayItems(containerId, items, owner) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'trade-item';
        
        // Add rarity class for styling
        if (item.rarity) {
            itemElement.setAttribute('data-rarity', item.rarity);
        }
        
        // Create item display with icon and effects
        itemElement.innerHTML = `
            <div class="item-icon-container">
                <span class="item-icon" style="color: ${item.color}">${item.icon}</span>
            </div>
            <div class="item-name">${item.name}</div>
            <div class="item-rarity" style="color: ${item.color}">${item.rarity}</div>
        `;
        
        // Add special class if item has one
        if (item.class) {
            const iconContainer = itemElement.querySelector('.item-icon-container');
            iconContainer.classList.add(item.class);
        }
        
        itemElement.addEventListener('click', () => toggleItemSelection(item, owner));
        container.appendChild(itemElement);
    });
}

function toggleItemSelection(item, owner) {
    const itemSet = selectedItems[owner];
    
    if (itemSet.has(item)) {
        itemSet.delete(item);
    } else {
        itemSet.add(item);
    }
    
    updateSelectedItemsDisplay(owner);
    updateTradeButton();
}

// Update the updateSelectedItemsDisplay function
function updateSelectedItemsDisplay(owner) {
    const container = document.getElementById(`${owner}SelectedItems`);
    container.innerHTML = '';
    
    selectedItems[owner].forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'trade-item selected';
        
        // Add rarity class for styling
        if (item.rarity) {
            itemElement.setAttribute('data-rarity', item.rarity);
        }
        
        // Create item display with icon and effects
        itemElement.innerHTML = `
            <div class="item-icon-container">
                <span class="item-icon" style="color: ${item.color}">${item.icon}</span>
            </div>
            <div class="item-name">${item.name}</div>
            <div class="item-rarity" style="color: ${item.color}">${item.rarity}</div>
        `;
        
        // Add special class if item has one
        if (item.class) {
            const iconContainer = itemElement.querySelector('.item-icon-container');
            iconContainer.classList.add(item.class);
        }
        
        container.appendChild(itemElement);
    });
}

function setupTradeControls() {
    document.getElementById('proposeTrade').addEventListener('click', proposeTrade);
    document.getElementById('cancelTrade').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Replace the change event with click event for find button
    document.getElementById('findPlayer').addEventListener('click', findPlayer);
    
    // Also allow Enter key to trigger search
    document.getElementById('tradePartner').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findPlayer();
        }
    });
}

// Add the findPlayer function
async function findPlayer() {
    const partnerName = document.getElementById('tradePartner').value.trim();
    const searchMessage = document.getElementById('searchMessage');
    const partnerItems = document.getElementById('partnerItems');
    
    if (!partnerName) {
        searchMessage.innerHTML = '<span class="error">Please enter a player name</span>';
        return;
    }

    if (partnerName === localStorage.getItem('playerName')) {
        searchMessage.innerHTML = '<span class="error">You cannot trade with yourself</span>';
        return;
    }

    searchMessage.innerHTML = '<span class="searching">Searching for player...</span>';
    partnerItems.innerHTML = ''; // Clear previous items

    try {
        const response = await fetch(`https://universal-backend-7wn9.onrender.com/api/user/${partnerName}`);
        if (!response.ok) {
            throw new Error('Player not found');
        }

        const user = await response.json();
        searchMessage.innerHTML = '<span class="success">Player found!</span>';
        
        // Load the player's inventory
        partnerInventory = user.inventory || [];
        displayItems('partnerItems', partnerInventory, 'partner');
        
        // Enable propose trade button if items are selected
        updateTradeButton();

    } catch (error) {
        searchMessage.innerHTML = '<span class="error">Player not found</span>';
        partnerItems.innerHTML = '<div class="no-items">No items to display</div>';
        document.getElementById('proposeTrade').disabled = true;
    }
}

function loadPartnerInventory() {
    const partnerName = document.getElementById('tradePartner').value;
    if (!partnerName) return;
    
    fetch(`/api/inventory/${partnerName}`)
        .then(response => response.json())
        .then(inventory => {
            displayItems('partnerItems', inventory, 'partner');
        })
        .catch(error => console.error('Error loading partner inventory:', error));
}

function proposeTrade() {
    const partnerName = document.getElementById('tradePartner').value;
    if (!partnerName) {
        alert('Please enter a trade partner name');
        return;
    }
    
    const tradeData = {
        sender: localStorage.getItem('playerName'),
        receiver: partnerName,
        senderItems: Array.from(selectedItems.your),
        receiverItems: Array.from(selectedItems.partner)
    };
    
    fetch('https://universal-backend-7wn9.onrender.com/api/trade/propose', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tradeData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Failed to propose trade'); });
        }
        return response.json();
    })
    .then(result => {
        if (result.success) {
            alert('Trade proposal sent!');
            window.location.href = 'index.html';
        } else {
            throw new Error(result.error || 'Failed to propose trade');
        }
    })
    .catch(error => {
        console.error('Error proposing trade:', error);
        alert('Failed to propose trade');
    });
}

// Add function to update trade button state
function updateTradeButton() {
    const proposeButton = document.getElementById('proposeTrade');
    const partnerName = document.getElementById('tradePartner').value;
    
    proposeButton.disabled = !partnerName || 
        (selectedItems.your.size === 0 && selectedItems.partner.size === 0);
}

// Update the displayTradeItems function
function displayTradeItems(items) {
    return items.map(item => `
        <div class="trade-item" data-rarity="${item.rarity}">
            <div class="item-icon-container ${item.class || ''}">
                <span class="item-icon" style="color: ${item.color}">${item.icon}</span>
            </div>
            <div class="item-name">${item.name}</div>
            <div class="item-rarity" style="color: ${item.color}">${item.rarity}</div>
        </div>
    `).join('');
}
