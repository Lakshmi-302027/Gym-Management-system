// Member Dashboard Functions
let currentMemberTab = 'profile';

// Check member authentication
function checkMemberAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.role !== 'member') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize member dashboard
function initMemberDashboard() {
    if (!checkMemberAuth()) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const member = users.find(u => u.id === currentUser.id);
    
    if (!member) {
        alert('Member data not found!');
        logout();
        return;
    }
    
    document.getElementById('memberName').textContent = `Welcome, ${member.name}`;
    
    logger.log('Member Dashboard Loaded', { member: member.email });
    
    loadProfile(member);
    loadReceipts(member);
    loadNotifications(member);
    loadStoreProducts();
    
    switchMemberTab('profile');
}

// Tab switching
function switchMemberTab(tabName) {
    currentMemberTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event?.target?.classList.add('active');
    document.querySelector(`button[onclick="switchMemberTab('${tabName}')"]`)?.classList.add('active');
    document.getElementById('member' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    
    logger.log('Member Tab Switched', { tab: tabName });
}

// Load profile
function loadProfile(member) {
    document.getElementById('profileName').textContent = member.name || 'N/A';
    document.getElementById('profileEmail').textContent = member.email;
    document.getElementById('profilePhone').textContent = member.phone || 'N/A';
    document.getElementById('profilePlan').textContent = member.plan || 'Not Assigned';
    document.getElementById('profileTiming').textContent = member.timing || 'Not Assigned';
    document.getElementById('profileSince').textContent = member.createdAt 
        ? new Date(member.createdAt).toLocaleDateString() 
        : 'N/A';
    
    logger.log('Profile Loaded', { memberId: member.id });
}

// Load receipts
function loadReceipts(member) {
    const receipts = member.bills || [];
    const tbody = document.getElementById('receiptsTableBody');
    
    receipts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = receipts.length === 0
        ? '<tr><td colspan="6" style="text-align: center;">No receipts found</td></tr>'
        : receipts.map(bill => `
            <tr>
                <td>${bill.id}</td>
                <td>${new Date(bill.date).toLocaleDateString()}</td>
                <td>$${bill.amount}</td>
                <td>${bill.plan || 'N/A'}</td>
                <td><span class="badge ${bill.status}">${bill.status}</span></td>
                <td>
                    <button onclick="viewReceipt('${bill.id}')" class="btn-success">View</button>
                    <button onclick="downloadReceipt('${bill.id}')" class="btn-secondary">Download</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Receipts Loaded', { count: receipts.length, memberId: member.id });
}

function viewReceipt(billId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const member = users.find(u => u.id === currentUser.id);
    
    if (!member || !member.bills) return;
    
    const bill = member.bills.find(b => b.id === billId);
    if (!bill) return;
    
    const modal = createModal('Receipt Details', `
        <div class="receipt">
            <h3>Receipt #${bill.id}</h3>
            <p><strong>Member:</strong> ${member.name}</p>
            <p><strong>Email:</strong> ${member.email}</p>
            <p><strong>Amount:</strong> $${bill.amount}</p>
            <p><strong>Plan:</strong> ${bill.plan || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(bill.date).toLocaleString()}</p>
            <p><strong>Status:</strong> ${bill.status}</p>
            <p><strong>Description:</strong> ${bill.description || 'N/A'}</p>
            <button onclick="printReceipt('${bill.id}')" class="btn-primary">Print Receipt</button>
        </div>
    `);
    
    logger.log('Receipt Viewed', { billId, memberId: member.id });
}

function downloadReceipt(billId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const member = users.find(u => u.id === currentUser.id);
    
    if (!member || !member.bills) return;
    
    const bill = member.bills.find(b => b.id === billId);
    if (!bill) return;
    
    const receiptContent = `
        FITZONE GYM - RECEIPT
        ======================
        Receipt #: ${bill.id}
        Date: ${new Date(bill.date).toLocaleString()}
        
        Member Details:
        Name: ${member.name}
        Email: ${member.email}
        Phone: ${member.phone || 'N/A'}
        
        Payment Details:
        Amount: $${bill.amount}
        Plan: ${bill.plan || 'N/A'}
        Status: ${bill.status}
        Description: ${bill.description || 'N/A'}
        
        Thank you for your membership!
        ======================
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${bill.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    logger.log('Receipt Downloaded', { billId, memberId: member.id });
}

function printReceipt(billId) {
    window.print();
    logger.log('Receipt Printed', { billId });
}

function searchReceipts() {
    const searchTerm = document.getElementById('receiptSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#receiptsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    logger.log('Receipts Searched', { searchTerm });
}

// Load notifications
function loadNotifications(member) {
    const notifications = member.notifications || [];
    const tbody = document.getElementById('notificationsTableBody');
    
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = notifications.length === 0
        ? '<tr><td colspan="3" style="text-align: center;">No notifications</td></tr>'
        : notifications.map(notif => `
            <tr>
                <td>${notif.title}</td>
                <td>${notif.message}</td>
                <td>${new Date(notif.date).toLocaleDateString()}</td>
            </tr>
        `).join('');
    
    logger.log('Notifications Loaded', { count: notifications.length, memberId: member.id });
}

// Load store products for members
function loadStoreProducts() {
    const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    const grid = document.getElementById('storeProductsGrid');
    
    if (grid) {
        grid.innerHTML = products.length === 0
            ? '<div style="text-align: center; width: 100%; padding: 2rem;"><p>No products available</p></div>'
            : products.map(product => `
                <div class="service-card">
                    <div class="service-icon">💊</div>
                    <h3>${product.name}</h3>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>Price:</strong> $${product.price}</p>
                    <p><strong>Stock:</strong> ${product.stock}</p>
                    <p>${product.description}</p>
                    <button onclick="addToCart('${product.id}')" class="btn-primary" style="margin-top: 1rem;">Add to Cart</button>
                </div>
            `).join('');
    }
    
    logger.log('Store Products Loaded for Member', { count: products.length });
}

function addToCart(productId) {
    const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Product not found!');
        return;
    }
    
    if (product.stock <= 0) {
        alert('Product out of stock!');
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('memberCart') || '[]');
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    localStorage.setItem('memberCart', JSON.stringify(cart));
    
    alert('Product added to cart!');
    logger.log('Product Added to Cart', { productId, productName: product.name });
}

function searchMemberProducts() {
    const searchTerm = document.getElementById('memberProductSearch').value.toLowerCase();
    const cards = document.querySelectorAll('#storeProductsGrid .service-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    logger.log('Store Products Searched', { searchTerm });
}

// Payment handling
function initPaymentForm() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment();
        });
    }
}

function processPayment() {
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;
    const cardNumber = document.getElementById('cardNumber').value;
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }
    
    if (!method) {
        alert('Please select a payment method!');
        return;
    }
    
    // Simulate payment processing
    const paymentData = {
        amount: amount,
        method: method,
        cardNumber: cardNumber ? cardNumber.replace(/\d(?=\d{4})/g, '*') : 'N/A',
        date: new Date().toISOString(),
        status: 'success',
        transactionId: 'TXN_' + Date.now()
    };
    
    // Create bill for this payment
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const memberIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (memberIndex !== -1) {
        if (!users[memberIndex].bills) {
            users[memberIndex].bills = [];
        }
        
        const newBill = {
            id: 'bill_' + Date.now(),
            amount: amount,
            plan: users[memberIndex].plan || null,
            description: `Payment via ${method}`,
            date: new Date().toISOString(),
            status: 'paid',
            paymentMethod: method,
            transactionId: paymentData.transactionId
        };
        
        users[memberIndex].bills.push(newBill);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update UI
        loadReceipts(users[memberIndex]);
    }
    
    logger.log('Payment Processed', { amount, method, transactionId: paymentData.transactionId });
    
    alert(`Payment of $${amount} processed successfully!\nTransaction ID: ${paymentData.transactionId}`);
    
    // Reset form
    document.getElementById('paymentForm').reset();
}

// Logout function
function logout() {
    logger.log('Member Logged Out', { user: JSON.parse(localStorage.getItem('currentUser') || '{}').email });
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Modal helper
function createModal(title, content) {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = `
        <div class="modal active" id="dynamicModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal" onclick="closeModal()">&times;</button>
                </div>
                ${content}
            </div>
        </div>
    `;
    
    // Close on outside click
    document.getElementById('dynamicModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    return modalContainer;
}

function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initMemberDashboard();
    initPaymentForm();
});

// Export functions globally
window.switchMemberTab = switchMemberTab;
window.viewReceipt = viewReceipt;
window.downloadReceipt = downloadReceipt;
window.printReceipt = printReceipt;
window.searchReceipts = searchReceipts;
window.addToCart = addToCart;
window.searchMemberProducts = searchMemberProducts;
window.logout = logout;
window.closeModal = closeModal;








