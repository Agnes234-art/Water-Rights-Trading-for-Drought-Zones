let currentUser = null;
let platformStats = {
    totalAllocations: 0,
    totalTrades: 0,
    totalVolume: 0,
    platformFeeRate: 25
};

const mockListings = [
    {
        id: 1,
        seller: "SP1ABCDEF123456789",
        amount: 1000,
        pricePerUnit: 50,
        region: "California Central Valley",
        expiryBlock: 1000000,
        active: true
    },
    {
        id: 2,
        seller: "SP2GHIJKL987654321",
        amount: 500,
        pricePerUnit: 75,
        region: "Arizona Desert",
        expiryBlock: 1000100,
        active: true
    },
    {
        id: 3,
        seller: "SP3MNOPQR456789123",
        amount: 2000,
        pricePerUnit: 40,
        region: "Texas Panhandle",
        expiryBlock: 1000200,
        active: true
    }
];

const mockUserData = {
    totalAllocation: 5000,
    availableBalance: 3500,
    tradesCount: 12,
    totalEarned: 2500,
    region: "California Central Valley"
};

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'marketplace') {
        updateMarketplace();
    } else if (sectionId === 'statistics') {
        updateStatistics();
    }
}

function updateDashboard() {
    document.getElementById('user-total-allocation').textContent = formatNumber(mockUserData.totalAllocation);
    document.getElementById('user-available-balance').textContent = formatNumber(mockUserData.availableBalance);
    document.getElementById('user-trades-count').textContent = mockUserData.tradesCount;
    document.getElementById('user-total-earned').textContent = formatNumber(mockUserData.totalEarned);
}

function updateMarketplace() {
    const listingsContainer = document.getElementById('listings-container');
    listingsContainer.innerHTML = '';
    
    if (mockListings.length === 0) {
        listingsContainer.innerHTML = '<div class="loading">No active listings found</div>';
        return;
    }
    
    mockListings.forEach(listing => {
        if (listing.active) {
            const listingCard = createListingCard(listing);
            listingsContainer.appendChild(listingCard);
        }
    });
}

function createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    
    const totalCost = listing.amount * listing.pricePerUnit;
    const isOwnListing = listing.seller === currentUser;
    
    card.innerHTML = `
        <div class="listing-header">
            <div class="listing-amount">${formatNumber(listing.amount)} units</div>
            <div class="listing-price">${formatNumber(listing.pricePerUnit)} STX/unit</div>
        </div>
        <div class="listing-info">
            <p><strong>Region:</strong> ${listing.region}</p>
            <p><strong>Total Cost:</strong> ${formatNumber(totalCost)} STX</p>
            <p><strong>Seller:</strong> ${truncateAddress(listing.seller)}</p>
            <p><strong>Expires:</strong> Block ${listing.expiryBlock}</p>
        </div>
        <div class="listing-actions">
            ${isOwnListing 
                ? `<button class="btn-small btn-cancel" onclick="cancelListing(${listing.id})">Cancel</button>`
                : `<button class="btn-small btn-buy" onclick="buyListing(${listing.id})">Buy Rights</button>`
            }
        </div>
    `;
    
    return card;
}

function updateStatistics() {
    document.getElementById('total-allocations').textContent = formatNumber(platformStats.totalAllocations);
    document.getElementById('total-trades').textContent = formatNumber(platformStats.totalTrades);
    document.getElementById('total-volume').textContent = formatNumber(platformStats.totalVolume);
    document.getElementById('platform-fee').textContent = (platformStats.platformFeeRate / 100).toFixed(2) + '%';
}

function registerAllocation() {
    const amount = parseInt(document.getElementById('allocation-amount').value);
    const region = document.getElementById('allocation-region').value;
    const expiry = parseInt(document.getElementById('allocation-expiry').value);
    
    if (!amount || !region || !expiry) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (amount <= 0 || expiry <= 0) {
        showNotification('Amount and expiry must be positive numbers', 'error');
        return;
    }
    
    mockUserData.totalAllocation += amount;
    mockUserData.availableBalance += amount;
    mockUserData.region = region;
    platformStats.totalAllocations++;
    
    clearForm(['allocation-amount', 'allocation-region', 'allocation-expiry']);
    showNotification(`Successfully registered ${formatNumber(amount)} water units in ${region}`, 'success');
    
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateDashboard();
    }
}

function transferWaterRights() {
    const recipient = document.getElementById('transfer-recipient').value;
    const amount = parseInt(document.getElementById('transfer-amount').value);
    
    if (!recipient || !amount) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (amount <= 0) {
        showNotification('Amount must be a positive number', 'error');
        return;
    }
    
    if (amount > mockUserData.availableBalance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    mockUserData.availableBalance -= amount;
    mockUserData.totalAllocation -= amount;
    
    clearForm(['transfer-recipient', 'transfer-amount']);
    showNotification(`Successfully transferred ${formatNumber(amount)} water units to ${truncateAddress(recipient)}`, 'success');
    
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateDashboard();
    }
}

function createListing() {
    const amount = parseInt(document.getElementById('listing-amount').value);
    const price = parseInt(document.getElementById('listing-price').value);
    const expiry = parseInt(document.getElementById('listing-expiry').value);
    
    if (!amount || !price || !expiry) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (amount <= 0 || price <= 0 || expiry <= 0) {
        showNotification('All values must be positive numbers', 'error');
        return;
    }
    
    if (amount > mockUserData.availableBalance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    const newListing = {
        id: mockListings.length + 1,
        seller: currentUser || "SP1CURRENT123456789",
        amount: amount,
        pricePerUnit: price,
        region: mockUserData.region,
        expiryBlock: 1000000 + expiry,
        active: true
    };
    
    mockListings.push(newListing);
    mockUserData.availableBalance -= amount;
    
    clearForm(['listing-amount', 'listing-price', 'listing-expiry']);
    showNotification(`Successfully created listing for ${formatNumber(amount)} water units at ${formatNumber(price)} STX/unit`, 'success');
    
    if (document.getElementById('marketplace').classList.contains('active')) {
        updateMarketplace();
    }
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateDashboard();
    }
}

function buyListing(listingId) {
    const listing = mockListings.find(l => l.id === listingId);
    if (!listing || !listing.active) {
        showNotification('Listing not found or inactive', 'error');
        return;
    }
    
    const totalCost = listing.amount * listing.pricePerUnit;
    const platformFee = Math.floor(totalCost * platformStats.platformFeeRate / 10000);
    
    listing.active = false;
    mockUserData.availableBalance += listing.amount;
    mockUserData.totalAllocation += listing.amount;
    mockUserData.tradesCount++;
    platformStats.totalTrades++;
    platformStats.totalVolume += listing.amount;
    
    showNotification(`Successfully purchased ${formatNumber(listing.amount)} water units for ${formatNumber(totalCost)} STX`, 'success');
    
    if (document.getElementById('marketplace').classList.contains('active')) {
        updateMarketplace();
    }
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateDashboard();
    }
}

function cancelListing(listingId) {
    const listing = mockListings.find(l => l.id === listingId);
    if (!listing || !listing.active) {
        showNotification('Listing not found or inactive', 'error');
        return;
    }
    
    listing.active = false;
    mockUserData.availableBalance += listing.amount;
    
    showNotification(`Successfully cancelled listing for ${formatNumber(listing.amount)} water units`, 'success');
    
    if (document.getElementById('marketplace').classList.contains('active')) {
        updateMarketplace();
    }
    if (document.getElementById('dashboard').classList.contains('active')) {
        updateDashboard();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    messageElement.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    document.getElementById('notification').classList.add('hidden');
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function truncateAddress(address) {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

function clearForm(fieldIds) {
    fieldIds.forEach(id => {
        document.getElementById(id).value = '';
    });
}

function initializeApp() {
    currentUser = "SP1CURRENT123456789";
    
    platformStats.totalAllocations = 156;
    platformStats.totalTrades = 89;
    platformStats.totalVolume = 125000;
    
    showSection('dashboard');
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideNotification();
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
