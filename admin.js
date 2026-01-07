// Admin Dashboard Functions
let currentTab = 'members';

// Check admin authentication
function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize admin dashboard
function initAdminDashboard() {
    if (!checkAdminAuth()) return;

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('adminName').textContent = `Welcome, ${currentUser.name}`;
    
    logger.log('Admin Dashboard Loaded', { admin: currentUser.email });
    
    loadMembers();
    loadPlans();
    loadTimings();
    loadBills();
    loadNotifications();
    loadStoreProducts();
    loadJoinRequests();
    loadDietPlans();
    
    switchTab('members');
}

// Tab switching
function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event?.target?.classList.add('active');
    document.querySelector(`button[onclick="switchTab('${tabName}')"]`)?.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    logger.log('Admin Tab Switched', { tab: tabName });
}

// Logout function
function logout() {
    logger.log('User Logged Out', { user: JSON.parse(localStorage.getItem('currentUser') || '{}').email });
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// MEMBERS MANAGEMENT
function loadMembers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const members = users.filter(u => u.role === 'member');
    const tbody = document.getElementById('membersTableBody');
    
    tbody.innerHTML = members.length === 0 
        ? '<tr><td colspan="6" style="text-align: center;">No members found</td></tr>'
        : members.map(member => `
            <tr>
                <td>${member.name || 'N/A'}</td>
                <td>${member.email}</td>
                <td>${member.phone || 'N/A'}</td>
                <td>${member.plan || 'Not Assigned'}</td>
                <td>${member.timing || 'Not Assigned'}</td>
                <td>
                    <button onclick="editMember('${member.id}')" class="btn-success">Edit</button>
                    <button onclick="deleteMember('${member.id}')" class="btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Members Loaded', { count: members.length });
}

function openAddMemberModal() {
    const modal = createModal('Add New Member', `
        <form id="addMemberForm">
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="memberName" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="memberEmail" required>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" id="memberPhone" required>
            </div>
            <div class="form-group">
                <label>Plan</label>
                <select id="memberPlanSelect">
                    <option value="">Select Plan</option>
                </select>
            </div>
            <div class="form-group">
                <label>Timing</label>
                <select id="memberTimingSelect">
                    <option value="">Select Timing</option>
                </select>
            </div>
            <button type="submit" class="btn-primary">Add Member</button>
        </form>
    `);
    
    loadPlanOptions('memberPlanSelect');
    loadTimingOptions('memberTimingSelect');
    
    document.getElementById('addMemberForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addMember();
        closeModal();
    });
    
    logger.log('Add Member Modal Opened');
}

function addMember() {
    const name = document.getElementById('memberName').value;
    const email = document.getElementById('memberEmail').value;
    const phone = document.getElementById('memberPhone').value;
    const plan = document.getElementById('memberPlanSelect').value;
    const timing = document.getElementById('memberTimingSelect').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        alert('Email already exists!');
        logger.log('Add Member Failed', { reason: 'Email exists', email });
        return;
    }
    
    const newMember = {
        id: 'member_' + Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: 'temp123',
        role: 'member',
        plan: plan || null,
        timing: timing || null,
        createdAt: new Date().toISOString(),
        bills: [],
        notifications: []
    };
    
    users.push(newMember);
    localStorage.setItem('users', JSON.stringify(users));
    
    logger.log('Member Added', { memberId: newMember.id, email });
    loadMembers();
}

function editMember(memberId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const member = users.find(u => u.id === memberId);
    if (!member) return;
    
    const modal = createModal('Edit Member', `
        <form id="editMemberForm">
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" id="editMemberName" value="${member.name}" required>
            </div>
            <div class="form-group">
                <label>Email *</label>
                <input type="email" id="editMemberEmail" value="${member.email}" required>
            </div>
            <div class="form-group">
                <label>Phone *</label>
                <input type="tel" id="editMemberPhone" value="${member.phone || ''}" required>
            </div>
            <div class="form-group">
                <label>Plan</label>
                <select id="editMemberPlanSelect">
                    <option value="">Select Plan</option>
                </select>
            </div>
            <div class="form-group">
                <label>Timing</label>
                <select id="editMemberTimingSelect">
                    <option value="">Select Timing</option>
                </select>
            </div>
            <button type="submit" class="btn-primary">Update Member</button>
        </form>
    `);
    
    loadPlanOptions('editMemberPlanSelect', member.plan);
    loadTimingOptions('editMemberTimingSelect', member.timing);
    
    document.getElementById('editMemberForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateMember(memberId);
        closeModal();
    });
    
    logger.log('Edit Member Modal Opened', { memberId });
}

function updateMember(memberId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const memberIndex = users.findIndex(u => u.id === memberId);
    if (memberIndex === -1) return;
    
    users[memberIndex].name = document.getElementById('editMemberName').value;
    users[memberIndex].email = document.getElementById('editMemberEmail').value;
    users[memberIndex].phone = document.getElementById('editMemberPhone').value;
    users[memberIndex].plan = document.getElementById('editMemberPlanSelect').value || null;
    users[memberIndex].timing = document.getElementById('editMemberTimingSelect').value || null;
    
    localStorage.setItem('users', JSON.stringify(users));
    
    logger.log('Member Updated', { memberId, email: users[memberIndex].email });
    loadMembers();
}

function deleteMember(memberId) {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(u => u.id !== memberId);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    logger.log('Member Deleted', { memberId });
    loadMembers();
}

function searchMembers() {
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#membersTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    logger.log('Members Searched', { searchTerm });
}

// PLANS MANAGEMENT
function loadPlans() {
    const plans = JSON.parse(localStorage.getItem('gymPlans') || '[]');
    const tbody = document.getElementById('plansTableBody');
    
    tbody.innerHTML = plans.length === 0
        ? '<tr><td colspan="5" style="text-align: center;">No plans found. Create one!</td></tr>'
        : plans.map(plan => `
            <tr>
                <td>${plan.name}</td>
                <td>${plan.duration}</td>
                <td>$${plan.price}</td>
                <td>${plan.features}</td>
                <td>
                    <button onclick="editPlan('${plan.id}')" class="btn-success">Edit</button>
                    <button onclick="deletePlan('${plan.id}')" class="btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Plans Loaded', { count: plans.length });
}

function openAddPlanModal() {
    const modal = createModal('Add New Plan', `
        <form id="addPlanForm">
            <div class="form-group">
                <label>Plan Name *</label>
                <input type="text" id="planName" required>
            </div>
            <div class="form-group">
                <label>Duration *</label>
                <input type="text" id="planDuration" placeholder="e.g., 1 Month, 3 Months" required>
            </div>
            <div class="form-group">
                <label>Price *</label>
                <input type="number" id="planPrice" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Features</label>
                <textarea id="planFeatures" rows="3" placeholder="Enter plan features separated by commas"></textarea>
            </div>
            <button type="submit" class="btn-primary">Add Plan</button>
        </form>
    `);
    
    document.getElementById('addPlanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addPlan();
        closeModal();
    });
    
    logger.log('Add Plan Modal Opened');
}

function addPlan() {
    const plans = JSON.parse(localStorage.getItem('gymPlans') || '[]');
    const newPlan = {
        id: 'plan_' + Date.now(),
        name: document.getElementById('planName').value,
        duration: document.getElementById('planDuration').value,
        price: parseFloat(document.getElementById('planPrice').value),
        features: document.getElementById('planFeatures').value || 'Standard features'
    };
    
    plans.push(newPlan);
    localStorage.setItem('gymPlans', JSON.stringify(plans));
    
    logger.log('Plan Added', { planId: newPlan.id, name: newPlan.name });
    loadPlans();
}

function editPlan(planId) {
    const plans = JSON.parse(localStorage.getItem('gymPlans') || '[]');
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    const modal = createModal('Edit Plan', `
        <form id="editPlanForm">
            <div class="form-group">
                <label>Plan Name *</label>
                <input type="text" id="editPlanName" value="${plan.name}" required>
            </div>
            <div class="form-group">
                <label>Duration *</label>
                <input type="text" id="editPlanDuration" value="${plan.duration}" required>
            </div>
            <div class="form-group">
                <label>Price *</label>
                <input type="number" id="editPlanPrice" value="${plan.price}" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Features</label>
                <textarea id="editPlanFeatures" rows="3">${plan.features}</textarea>
            </div>
            <button type="submit" class="btn-primary">Update Plan</button>
        </form>
    `);
    
    document.getElementById('editPlanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updatePlan(planId);
        closeModal();
    });
    
    logger.log('Edit Plan Modal Opened', { planId });
}

function updatePlan(planId) {
    const plans = JSON.parse(localStorage.getItem('gymPlans') || '[]');
    const planIndex = plans.findIndex(p => p.id === planId);
    if (planIndex === -1) return;
    
    plans[planIndex].name = document.getElementById('editPlanName').value;
    plans[planIndex].duration = document.getElementById('editPlanDuration').value;
    plans[planIndex].price = parseFloat(document.getElementById('editPlanPrice').value);
    plans[planIndex].features = document.getElementById('editPlanFeatures').value;
    
    localStorage.setItem('gymPlans', JSON.stringify(plans));
    
    logger.log('Plan Updated', { planId });
    loadPlans();
}

function deletePlan(planId) {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    const plans = JSON.parse(localStorage.getItem('gymPlans') || '[]');
    const filteredPlans = plans.filter(p => p.id !== planId);
    localStorage.setItem('gymPlans', JSON.stringify(filteredPlans));
    
    logger.log('Plan Deleted', { planId });
    loadPlans();
}

function loadPlanOptions(selectId, selectedValue = '') {
    const plans = JSON.parse(localStorage.getItem('gymPlans') || '[]');
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Plan</option>' + 
        plans.map(plan => 
            `<option value="${plan.name}" ${plan.name === selectedValue ? 'selected' : ''}>${plan.name} - $${plan.price}</option>`
        ).join('');
}

// TIMINGS MANAGEMENT
function loadTimings() {
    const timings = JSON.parse(localStorage.getItem('gymTimings') || '[]');
    const tbody = document.getElementById('timingsTableBody');
    
    tbody.innerHTML = timings.length === 0
        ? '<tr><td colspan="5" style="text-align: center;">No timings found. Create one!</td></tr>'
        : timings.map(timing => `
            <tr>
                <td>${timing.name}</td>
                <td>${timing.startTime}</td>
                <td>${timing.endTime}</td>
                <td>${timing.days}</td>
                <td>
                    <button onclick="editTiming('${timing.id}')" class="btn-success">Edit</button>
                    <button onclick="deleteTiming('${timing.id}')" class="btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Timings Loaded', { count: timings.length });
}

function openAddTimingModal() {
    const modal = createModal('Add New Timing', `
        <form id="addTimingForm">
            <div class="form-group">
                <label>Timing Name *</label>
                <input type="text" id="timingName" required>
            </div>
            <div class="form-group">
                <label>Start Time *</label>
                <input type="time" id="timingStart" required>
            </div>
            <div class="form-group">
                <label>End Time *</label>
                <input type="time" id="timingEnd" required>
            </div>
            <div class="form-group">
                <label>Days *</label>
                <input type="text" id="timingDays" placeholder="e.g., Mon-Fri, All Days" required>
            </div>
            <button type="submit" class="btn-primary">Add Timing</button>
        </form>
    `);
    
    document.getElementById('addTimingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addTiming();
        closeModal();
    });
    
    logger.log('Add Timing Modal Opened');
}

function addTiming() {
    const timings = JSON.parse(localStorage.getItem('gymTimings') || '[]');
    const newTiming = {
        id: 'timing_' + Date.now(),
        name: document.getElementById('timingName').value,
        startTime: document.getElementById('timingStart').value,
        endTime: document.getElementById('timingEnd').value,
        days: document.getElementById('timingDays').value
    };
    
    timings.push(newTiming);
    localStorage.setItem('gymTimings', JSON.stringify(timings));
    
    logger.log('Timing Added', { timingId: newTiming.id });
    loadTimings();
}

function editTiming(timingId) {
    const timings = JSON.parse(localStorage.getItem('gymTimings') || '[]');
    const timing = timings.find(t => t.id === timingId);
    if (!timing) return;
    
    const modal = createModal('Edit Timing', `
        <form id="editTimingForm">
            <div class="form-group">
                <label>Timing Name *</label>
                <input type="text" id="editTimingName" value="${timing.name}" required>
            </div>
            <div class="form-group">
                <label>Start Time *</label>
                <input type="time" id="editTimingStart" value="${timing.startTime}" required>
            </div>
            <div class="form-group">
                <label>End Time *</label>
                <input type="time" id="editTimingEnd" value="${timing.endTime}" required>
            </div>
            <div class="form-group">
                <label>Days *</label>
                <input type="text" id="editTimingDays" value="${timing.days}" required>
            </div>
            <button type="submit" class="btn-primary">Update Timing</button>
        </form>
    `);
    
    document.getElementById('editTimingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateTiming(timingId);
        closeModal();
    });
    
    logger.log('Edit Timing Modal Opened', { timingId });
}

function updateTiming(timingId) {
    const timings = JSON.parse(localStorage.getItem('gymTimings') || '[]');
    const timingIndex = timings.findIndex(t => t.id === timingId);
    if (timingIndex === -1) return;
    
    timings[timingIndex].name = document.getElementById('editTimingName').value;
    timings[timingIndex].startTime = document.getElementById('editTimingStart').value;
    timings[timingIndex].endTime = document.getElementById('editTimingEnd').value;
    timings[timingIndex].days = document.getElementById('editTimingDays').value;
    
    localStorage.setItem('gymTimings', JSON.stringify(timings));
    
    logger.log('Timing Updated', { timingId });
    loadTimings();
}

function deleteTiming(timingId) {
    if (!confirm('Are you sure you want to delete this timing?')) return;
    
    const timings = JSON.parse(localStorage.getItem('gymTimings') || '[]');
    const filteredTimings = timings.filter(t => t.id !== timingId);
    localStorage.setItem('gymTimings', JSON.stringify(filteredTimings));
    
    logger.log('Timing Deleted', { timingId });
    loadTimings();
}

function loadTimingOptions(selectId, selectedValue = '') {
    const timings = JSON.parse(localStorage.getItem('gymTimings') || '[]');
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Timing</option>' + 
        timings.map(timing => 
            `<option value="${timing.name}" ${timing.name === selectedValue ? 'selected' : ''}>${timing.name} (${timing.startTime} - ${timing.endTime})</option>`
        ).join('');
}

// BILLS MANAGEMENT
function loadBills() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const allBills = [];
    
    users.forEach(user => {
        if (user.bills && user.bills.length > 0) {
            user.bills.forEach(bill => {
                allBills.push({
                    ...bill,
                    memberName: user.name,
                    memberEmail: user.email
                });
            });
        }
    });
    
    allBills.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = document.getElementById('billsTableBody');
    tbody.innerHTML = allBills.length === 0
        ? '<tr><td colspan="6" style="text-align: center;">No bills found</td></tr>'
        : allBills.map(bill => `
            <tr>
                <td>${bill.memberName} (${bill.memberEmail})</td>
                <td>$${bill.amount}</td>
                <td>${bill.plan || 'N/A'}</td>
                <td>${new Date(bill.date).toLocaleDateString()}</td>
                <td><span class="badge ${bill.status}">${bill.status}</span></td>
                <td>
                    <button onclick="viewBill('${bill.id}')" class="btn-success">View</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Bills Loaded', { count: allBills.length });
}

function openCreateBillModal() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const members = users.filter(u => u.role === 'member');
    
    const modal = createModal('Create Bill', `
        <form id="createBillForm">
            <div class="form-group">
                <label>Member *</label>
                <select id="billMemberSelect" required>
                    <option value="">Select Member</option>
                    ${members.map(m => `<option value="${m.id}">${m.name} (${m.email})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Plan</label>
                <select id="billPlanSelect">
                    <option value="">Select Plan</option>
                </select>
            </div>
            <div class="form-group">
                <label>Amount *</label>
                <input type="number" id="billAmount" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="billDescription" rows="3"></textarea>
            </div>
            <button type="submit" class="btn-primary">Create Bill</button>
        </form>
    `);
    
    loadPlanOptions('billPlanSelect');
    
    document.getElementById('createBillForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createBill();
        closeModal();
    });
    
    logger.log('Create Bill Modal Opened');
}

function createBill() {
    const userId = document.getElementById('billMemberSelect').value;
    const amount = parseFloat(document.getElementById('billAmount').value);
    const plan = document.getElementById('billPlanSelect').value;
    const description = document.getElementById('billDescription').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    
    if (!users[userIndex].bills) {
        users[userIndex].bills = [];
    }
    
    const newBill = {
        id: 'bill_' + Date.now(),
        amount: amount,
        plan: plan || null,
        description: description || 'Gym membership fee',
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    users[userIndex].bills.push(newBill);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Send notification to member
    if (!users[userIndex].notifications) {
        users[userIndex].notifications = [];
    }
    users[userIndex].notifications.push({
        id: 'notif_' + Date.now(),
        title: 'New Bill Generated',
        message: `A bill of $${amount} has been generated for your account.`,
        date: new Date().toISOString(),
        type: 'bill'
    });
    localStorage.setItem('users', JSON.stringify(users));
    
    logger.log('Bill Created', { billId: newBill.id, userId, amount });
    loadBills();
}

function viewBill(billId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let bill = null;
    let member = null;
    
    for (const user of users) {
        if (user.bills) {
            bill = user.bills.find(b => b.id === billId);
            if (bill) {
                member = user;
                break;
            }
        }
    }
    
    if (!bill) return;
    
    const modal = createModal('Bill Receipt', `
        <div class="receipt">
            <h3>Receipt #${bill.id}</h3>
            <p><strong>Member:</strong> ${member.name}</p>
            <p><strong>Email:</strong> ${member.email}</p>
            <p><strong>Amount:</strong> $${bill.amount}</p>
            <p><strong>Plan:</strong> ${bill.plan || 'N/A'}</p>
            <p><strong>Date:</strong> ${new Date(bill.date).toLocaleString()}</p>
            <p><strong>Status:</strong> ${bill.status}</p>
            <p><strong>Description:</strong> ${bill.description}</p>
            <button onclick="printReceipt('${bill.id}')" class="btn-primary">Print Receipt</button>
        </div>
    `);
    
    logger.log('Bill Viewed', { billId });
}

function printReceipt(billId) {
    window.print();
    logger.log('Receipt Printed', { billId });
}

function searchBills() {
    const searchTerm = document.getElementById('billSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#billsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    logger.log('Bills Searched', { searchTerm });
}

// NOTIFICATIONS MANAGEMENT
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const tbody = document.getElementById('notificationsTableBody');
    
    tbody.innerHTML = notifications.length === 0
        ? '<tr><td colspan="5" style="text-align: center;">No notifications found</td></tr>'
        : notifications.map(notif => `
            <tr>
                <td>${notif.title}</td>
                <td>${notif.message}</td>
                <td>${notif.type || 'general'}</td>
                <td>${new Date(notif.date).toLocaleDateString()}</td>
                <td>
                    <button onclick="deleteNotification('${notif.id}')" class="btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Notifications Loaded', { count: notifications.length });
}

function openSendNotificationModal() {
    const modal = createModal('Send Notification', `
        <form id="sendNotificationForm">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" id="notifTitle" required>
            </div>
            <div class="form-group">
                <label>Message *</label>
                <textarea id="notifMessage" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="notifType">
                    <option value="general">General</option>
                    <option value="bill">Bill</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="holiday">Holiday</option>
                </select>
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="notifAllMembers" checked> Send to all members
                </label>
            </div>
            <button type="submit" class="btn-primary">Send Notification</button>
        </form>
    `);
    
    document.getElementById('sendNotificationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        sendNotification();
        closeModal();
    });
    
    logger.log('Send Notification Modal Opened');
}

function sendNotification() {
    const title = document.getElementById('notifTitle').value;
    const message = document.getElementById('notifMessage').value;
    const type = document.getElementById('notifType').value;
    const sendToAll = document.getElementById('notifAllMembers').checked;
    
    const notification = {
        id: 'notif_' + Date.now(),
        title: title,
        message: message,
        type: type,
        date: new Date().toISOString()
    };
    
    // Save admin notification
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push(notification);
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    
    // Send to members
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.forEach(user => {
        if (user.role === 'member' && (sendToAll || true)) {
            if (!user.notifications) {
                user.notifications = [];
            }
            user.notifications.push(notification);
        }
    });
    localStorage.setItem('users', JSON.stringify(users));
    
    logger.log('Notification Sent', { notificationId: notification.id, sentToAll: sendToAll });
    loadNotifications();
}

function deleteNotification(notifId) {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const filtered = notifications.filter(n => n.id !== notifId);
    localStorage.setItem('adminNotifications', JSON.stringify(filtered));
    
    logger.log('Notification Deleted', { notifId });
    loadNotifications();
}

// STORE MANAGEMENT
function loadStoreProducts() {
    const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    const tbody = document.getElementById('storeTableBody');
    
    tbody.innerHTML = products.length === 0
        ? '<tr><td colspan="6" style="text-align: center;">No products found. Add one!</td></tr>'
        : products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price}</td>
                <td>${product.stock}</td>
                <td>${product.description.substring(0, 50)}...</td>
                <td>
                    <button onclick="editProduct('${product.id}')" class="btn-success">Edit</button>
                    <button onclick="deleteProduct('${product.id}')" class="btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Store Products Loaded', { count: products.length });
}

function openAddProductModal() {
    const modal = createModal('Add Product', `
        <form id="addProductForm">
            <div class="form-group">
                <label>Product Name *</label>
                <input type="text" id="productName" required>
            </div>
            <div class="form-group">
                <label>Category *</label>
                <select id="productCategory" required>
                    <option value="">Select Category</option>
                    <option value="protein">Protein</option>
                    <option value="vitamins">Vitamins</option>
                    <option value="supplements">Supplements</option>
                    <option value="accessories">Accessories</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Price *</label>
                <input type="number" id="productPrice" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Stock *</label>
                <input type="number" id="productStock" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="productDescription" rows="3"></textarea>
            </div>
            <button type="submit" class="btn-primary">Add Product</button>
        </form>
    `);
    
    document.getElementById('addProductForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addProduct();
        closeModal();
    });
    
    logger.log('Add Product Modal Opened');
}

function addProduct() {
    const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    const newProduct = {
        id: 'product_' + Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        description: document.getElementById('productDescription').value || 'No description'
    };
    
    products.push(newProduct);
    localStorage.setItem('storeProducts', JSON.stringify(products));
    
    logger.log('Product Added', { productId: newProduct.id });
    loadStoreProducts();
}

function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = createModal('Edit Product', `
        <form id="editProductForm">
            <div class="form-group">
                <label>Product Name *</label>
                <input type="text" id="editProductName" value="${product.name}" required>
            </div>
            <div class="form-group">
                <label>Category *</label>
                <select id="editProductCategory" required>
                    <option value="protein" ${product.category === 'protein' ? 'selected' : ''}>Protein</option>
                    <option value="vitamins" ${product.category === 'vitamins' ? 'selected' : ''}>Vitamins</option>
                    <option value="supplements" ${product.category === 'supplements' ? 'selected' : ''}>Supplements</option>
                    <option value="accessories" ${product.category === 'accessories' ? 'selected' : ''}>Accessories</option>
                    <option value="other" ${product.category === 'other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Price *</label>
                <input type="number" id="editProductPrice" value="${product.price}" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Stock *</label>
                <input type="number" id="editProductStock" value="${product.stock}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="editProductDescription" rows="3">${product.description}</textarea>
            </div>
            <button type="submit" class="btn-primary">Update Product</button>
        </form>
    `);
    
    document.getElementById('editProductForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateProduct(productId);
        closeModal();
    });
    
    logger.log('Edit Product Modal Opened', { productId });
}

function updateProduct(productId) {
    const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) return;
    
    products[productIndex].name = document.getElementById('editProductName').value;
    products[productIndex].category = document.getElementById('editProductCategory').value;
    products[productIndex].price = parseFloat(document.getElementById('editProductPrice').value);
    products[productIndex].stock = parseInt(document.getElementById('editProductStock').value);
    products[productIndex].description = document.getElementById('editProductDescription').value;
    
    localStorage.setItem('storeProducts', JSON.stringify(products));
    
    logger.log('Product Updated', { productId });
    loadStoreProducts();
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
    const filtered = products.filter(p => p.id !== productId);
    localStorage.setItem('storeProducts', JSON.stringify(filtered));
    
    logger.log('Product Deleted', { productId });
    loadStoreProducts();
}

function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#storeTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    logger.log('Products Searched', { searchTerm });
}

// JOIN REQUESTS
function loadJoinRequests() {
    const requests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
    const tbody = document.getElementById('joinRequestsTableBody');
    
    tbody.innerHTML = requests.length === 0
        ? '<tr><td colspan="7" style="text-align: center;">No join requests found</td></tr>'
        : requests.map((req, index) => `
            <tr>
                <td>${req.fullName}</td>
                <td>${req.email}</td>
                <td>${req.phone}</td>
                <td>${req.age || 'N/A'}</td>
                <td>${req.interests || 'N/A'}</td>
                <td>${new Date(req.submittedAt).toLocaleDateString()}</td>
                <td>
                    <button onclick="approveJoinRequest(${index})" class="btn-success">Approve</button>
                    <button onclick="rejectJoinRequest(${index})" class="btn-danger">Reject</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Join Requests Loaded', { count: requests.length });
}

function approveJoinRequest(index) {
    const requests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
    const request = requests[index];
    
    // Create member from request
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const newMember = {
        id: 'member_' + Date.now(),
        name: request.fullName,
        email: request.email,
        phone: request.phone,
        password: 'temp123',
        role: 'member',
        plan: null,
        timing: null,
        createdAt: new Date().toISOString(),
        bills: [],
        notifications: []
    };
    
    users.push(newMember);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Remove from requests
    requests.splice(index, 1);
    localStorage.setItem('joinRequests', JSON.stringify(requests));
    
    logger.log('Join Request Approved', { email: request.email });
    loadJoinRequests();
    loadMembers();
}

function rejectJoinRequest(index) {
    if (!confirm('Are you sure you want to reject this request?')) return;
    
    const requests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
    requests.splice(index, 1);
    localStorage.setItem('joinRequests', JSON.stringify(requests));
    
    logger.log('Join Request Rejected', { index });
    loadJoinRequests();
}

// DIET PLANS
function loadDietPlans() {
    const diets = JSON.parse(localStorage.getItem('dietPlans') || '[]');
    const tbody = document.getElementById('dietTableBody');
    
    tbody.innerHTML = diets.length === 0
        ? '<tr><td colspan="6" style="text-align: center;">No diet plans found. Add one!</td></tr>'
        : diets.map(diet => `
            <tr>
                <td>${diet.name}</td>
                <td>${diet.goal}</td>
                <td>${diet.duration}</td>
                <td>${diet.calories}</td>
                <td>${diet.description.substring(0, 50)}...</td>
                <td>
                    <button onclick="editDiet('${diet.id}')" class="btn-success">Edit</button>
                    <button onclick="deleteDiet('${diet.id}')" class="btn-danger">Delete</button>
                </td>
            </tr>
        `).join('');
    
    logger.log('Diet Plans Loaded', { count: diets.length });
}

function openAddDietModal() {
    const modal = createModal('Add Diet Plan', `
        <form id="addDietForm">
            <div class="form-group">
                <label>Diet Name *</label>
                <input type="text" id="dietName" required>
            </div>
            <div class="form-group">
                <label>Goal *</label>
                <select id="dietGoal" required>
                    <option value="">Select Goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="general_health">General Health</option>
                </select>
            </div>
            <div class="form-group">
                <label>Duration *</label>
                <input type="text" id="dietDuration" placeholder="e.g., 4 weeks, 2 months" required>
            </div>
            <div class="form-group">
                <label>Daily Calories</label>
                <input type="number" id="dietCalories" placeholder="e.g., 2000">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="dietDescription" rows="4"></textarea>
            </div>
            <button type="submit" class="btn-primary">Add Diet Plan</button>
        </form>
    `);
    
    document.getElementById('addDietForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addDiet();
        closeModal();
    });
    
    logger.log('Add Diet Modal Opened');
}

function addDiet() {
    const diets = JSON.parse(localStorage.getItem('dietPlans') || '[]');
    const newDiet = {
        id: 'diet_' + Date.now(),
        name: document.getElementById('dietName').value,
        goal: document.getElementById('dietGoal').value,
        duration: document.getElementById('dietDuration').value,
        calories: document.getElementById('dietCalories').value || 'N/A',
        description: document.getElementById('dietDescription').value || 'No description'
    };
    
    diets.push(newDiet);
    localStorage.setItem('dietPlans', JSON.stringify(diets));
    
    logger.log('Diet Plan Added', { dietId: newDiet.id });
    loadDietPlans();
}

function editDiet(dietId) {
    const diets = JSON.parse(localStorage.getItem('dietPlans') || '[]');
    const diet = diets.find(d => d.id === dietId);
    if (!diet) return;
    
    const modal = createModal('Edit Diet Plan', `
        <form id="editDietForm">
            <div class="form-group">
                <label>Diet Name *</label>
                <input type="text" id="editDietName" value="${diet.name}" required>
            </div>
            <div class="form-group">
                <label>Goal *</label>
                <select id="editDietGoal" required>
                    <option value="weight_loss" ${diet.goal === 'weight_loss' ? 'selected' : ''}>Weight Loss</option>
                    <option value="muscle_gain" ${diet.goal === 'muscle_gain' ? 'selected' : ''}>Muscle Gain</option>
                    <option value="maintenance" ${diet.goal === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                    <option value="general_health" ${diet.goal === 'general_health' ? 'selected' : ''}>General Health</option>
                </select>
            </div>
            <div class="form-group">
                <label>Duration *</label>
                <input type="text" id="editDietDuration" value="${diet.duration}" required>
            </div>
            <div class="form-group">
                <label>Daily Calories</label>
                <input type="number" id="editDietCalories" value="${diet.calories === 'N/A' ? '' : diet.calories}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="editDietDescription" rows="4">${diet.description}</textarea>
            </div>
            <button type="submit" class="btn-primary">Update Diet Plan</button>
        </form>
    `);
    
    document.getElementById('editDietForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateDiet(dietId);
        closeModal();
    });
    
    logger.log('Edit Diet Modal Opened', { dietId });
}

function updateDiet(dietId) {
    const diets = JSON.parse(localStorage.getItem('dietPlans') || '[]');
    const dietIndex = diets.findIndex(d => d.id === dietId);
    if (dietIndex === -1) return;
    
    diets[dietIndex].name = document.getElementById('editDietName').value;
    diets[dietIndex].goal = document.getElementById('editDietGoal').value;
    diets[dietIndex].duration = document.getElementById('editDietDuration').value;
    diets[dietIndex].calories = document.getElementById('editDietCalories').value || 'N/A';
    diets[dietIndex].description = document.getElementById('editDietDescription').value;
    
    localStorage.setItem('dietPlans', JSON.stringify(diets));
    
    logger.log('Diet Plan Updated', { dietId });
    loadDietPlans();
}

function deleteDiet(dietId) {
    if (!confirm('Are you sure you want to delete this diet plan?')) return;
    
    const diets = JSON.parse(localStorage.getItem('dietPlans') || '[]');
    const filtered = diets.filter(d => d.id !== dietId);
    localStorage.setItem('dietPlans', JSON.stringify(filtered));
    
    logger.log('Diet Plan Deleted', { dietId });
    loadDietPlans();
}

// REPORTS EXPORT
function exportReports() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const members = users.filter(u => u.role === 'member');
    const allBills = [];
    
    members.forEach(member => {
        if (member.bills && member.bills.length > 0) {
            member.bills.forEach(bill => {
                allBills.push({
                    member: member.name,
                    email: member.email,
                    amount: bill.amount,
                    plan: bill.plan,
                    date: bill.date,
                    status: bill.status
                });
            });
        }
    });
    
    const report = {
        generatedAt: new Date().toISOString(),
        totalMembers: members.length,
        totalBills: allBills.length,
        totalRevenue: allBills.reduce((sum, b) => sum + (b.status === 'paid' ? b.amount : 0), 0),
        members: members.map(m => ({
            name: m.name,
            email: m.email,
            plan: m.plan,
            timing: m.timing,
            memberSince: m.createdAt
        })),
        bills: allBills
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    logger.log('Report Exported', { members: members.length, bills: allBills.length });
}

function exportLogs() {
    logger.exportLogs();
}

// MODAL HELPERS
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
document.addEventListener('DOMContentLoaded', initAdminDashboard);

// Export functions globally
window.switchTab = switchTab;
window.logout = logout;
window.openAddMemberModal = openAddMemberModal;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.searchMembers = searchMembers;
window.openAddPlanModal = openAddPlanModal;
window.editPlan = editPlan;
window.deletePlan = deletePlan;
window.openAddTimingModal = openAddTimingModal;
window.editTiming = editTiming;
window.deleteTiming = deleteTiming;
window.openCreateBillModal = openCreateBillModal;
window.viewBill = viewBill;
window.printReceipt = printReceipt;
window.searchBills = searchBills;
window.openSendNotificationModal = openSendNotificationModal;
window.deleteNotification = deleteNotification;
window.openAddProductModal = openAddProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.searchProducts = searchProducts;
window.approveJoinRequest = approveJoinRequest;
window.rejectJoinRequest = rejectJoinRequest;
window.openAddDietModal = openAddDietModal;
window.editDiet = editDiet;
window.deleteDiet = deleteDiet;
window.exportReports = exportReports;
window.exportLogs = exportLogs;
window.closeModal = closeModal;

