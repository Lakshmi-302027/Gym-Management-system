# FitZone Gym Management System

A comprehensive Gym Management System built with HTML, CSS, and JavaScript. This system helps gym owners manage members, bills, receipts, notifications, and store products digitally.

## Features

### General Features
- ✅ Fully responsive and scrollable website
- ✅ Homepage with hero image slider
- ✅ Sections: Home, About, Services, Classes, Blogs (Mentors)
- ✅ Join form for new member applications
- ✅ Login/Register system with role-based access

### Admin Dashboard Features
- ✅ Add, Edit, Delete Members
- ✅ Create and Manage Gym Plans
- ✅ Create and Manage Gym Timings
- ✅ Create Bills and Receipts
- ✅ Assign Fee Packages to Members
- ✅ Send Notifications to All Members
- ✅ Manage Supplement Store (Add, Edit, Delete Products)
- ✅ View and Manage Join Requests
- ✅ Diet Plans Management
- ✅ Export Reports and Logs
- ✅ Search and Filter functionality

### Member Dashboard Features
- ✅ View Profile with assigned Plan and Timing
- ✅ View and Download Receipts
- ✅ View Notifications
- ✅ Browse and Purchase from Supplement Store
- ✅ Make Payments (Multiple Payment Methods)
- ✅ Search Receipts and Products

### Technical Features
- ✅ Comprehensive Logging System (All actions are logged)
- ✅ Local Storage for data persistence
- ✅ Supabase Backend Integration Ready
- ✅ Payment Integration
- ✅ Responsive Design (Mobile, Tablet, Desktop)


## File Structure

```
Gym/
├── index.html          # Homepage
├── login.html          # Login/Register page
├── admin.html          # Admin Dashboard
├── member.html         # Member Dashboard
├── styles.css          # All CSS styles
├── script.js           # Main JavaScript (logging, slider, navigation)
├── admin.js            # Admin dashboard functionality
├── member.js           # Member dashboard functionality
├── config.js           # Supabase configuration
├── init.js             # Default data initialization
└── README.md           # This file
```

## Usage Guide

### For Gym Owners (Admin)

1. **Login as Admin**
   - Use default credentials: admin@fitzone.com / admin123
   - Or create a new admin account

2. **Manage Members**
   - Go to "Members" tab
   - Click "Add New Member" to manually add members
   - Edit or delete existing members

3. **Create Gym Plans**
   - Go to "Gym Plans" tab
   - Create different membership plans with pricing

4. **Set Gym Timings**
   - Go to "Timings" tab
   - Create different time slots for members

5. **Generate Bills**
   - Go to "Bills" tab
   - Create bills for members
   - Members will receive notifications automatically

6. **Send Notifications**
   - Go to "Notifications" tab
   - Send messages to all members about gym updates

7. **Manage Store**
   - Go to "Store" tab
   - Add products to the supplement store

8. **Approve Join Requests**
   - Go to "Join Requests" tab
   - Approve or reject applications from the website

### For Members

1. **Register**
   - Click "Login" on homepage
   - Go to "Register" tab
   - Create an account

2. **Join Gym**
   - Fill out the "Join Us" form on homepage
   - Wait for admin approval

3. **Access Dashboard**
   - Login with your credentials
   - View your profile, receipts, and notifications

4. **Make Payments**
   - Go to "Payment" tab
   - Select payment method and pay bills

5. **Shop Store**
   - Browse supplement store
   - Add products to cart

### Live demo
Live at: https://frabjous-kataifi-109108.netlify.app/
