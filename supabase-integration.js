// Supabase Integration Helper Functions
// This file provides helper functions to sync data with Supabase
// Make sure config.js is properly configured before using these functions

// Sync users with Supabase
async function syncUsersToSupabase() {
    if (!supabase) {
        logger.log('Supabase not configured', { error: 'Supabase client not initialized' });
        return false;
    }
    
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        for (const user of users) {
            const { data, error } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    password: user.password,
                    role: user.role,
                    plan: user.plan,
                    timing: user.timing,
                    created_at: user.createdAt,
                    bills: user.bills || [],
                    notifications: user.notifications || []
                }, { onConflict: 'id' });
            
            if (error) {
                logger.log('Supabase Sync Error - Users', { error: error.message, userId: user.id });
            }
        }
        
        logger.log('Users Synced to Supabase', { count: users.length });
        return true;
    } catch (error) {
        logger.log('Supabase Sync Failed - Users', { error: error.message });
        return false;
    }
}

// Sync gym plans with Supabase
async function syncPlansToSupabase() {
    if (!supabase) {
        logger.log('Supabase not configured', { error: 'Supabase client not initialized' });
        return false;
    }
    
    try {
        const plans = JSON.parse(localStorage.getItem('gymPlans') || '[]');
        
        for (const plan of plans) {
            const { data, error } = await supabase
                .from('gym_plans')
                .upsert({
                    id: plan.id,
                    name: plan.name,
                    duration: plan.duration,
                    price: plan.price,
                    features: plan.features
                }, { onConflict: 'id' });
            
            if (error) {
                logger.log('Supabase Sync Error - Plans', { error: error.message, planId: plan.id });
            }
        }
        
        logger.log('Plans Synced to Supabase', { count: plans.length });
        return true;
    } catch (error) {
        logger.log('Supabase Sync Failed - Plans', { error: error.message });
        return false;
    }
}

// Sync timings with Supabase
async function syncTimingsToSupabase() {
    if (!supabase) {
        logger.log('Supabase not configured', { error: 'Supabase client not initialized' });
        return false;
    }
    
    try {
        const timings = JSON.parse(localStorage.getItem('gymTimings') || '[]');
        
        for (const timing of timings) {
            const { data, error } = await supabase
                .from('gym_timings')
                .upsert({
                    id: timing.id,
                    name: timing.name,
                    start_time: timing.startTime,
                    end_time: timing.endTime,
                    days: timing.days
                }, { onConflict: 'id' });
            
            if (error) {
                logger.log('Supabase Sync Error - Timings', { error: error.message, timingId: timing.id });
            }
        }
        
        logger.log('Timings Synced to Supabase', { count: timings.length });
        return true;
    } catch (error) {
        logger.log('Supabase Sync Failed - Timings', { error: error.message });
        return false;
    }
}

// Sync store products with Supabase
async function syncProductsToSupabase() {
    if (!supabase) {
        logger.log('Supabase not configured', { error: 'Supabase client not initialized' });
        return false;
    }
    
    try {
        const products = JSON.parse(localStorage.getItem('storeProducts') || '[]');
        
        for (const product of products) {
            const { data, error } = await supabase
                .from('store_products')
                .upsert({
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    stock: product.stock,
                    description: product.description
                }, { onConflict: 'id' });
            
            if (error) {
                logger.log('Supabase Sync Error - Products', { error: error.message, productId: product.id });
            }
        }
        
        logger.log('Products Synced to Supabase', { count: products.length });
        return true;
    } catch (error) {
        logger.log('Supabase Sync Failed - Products', { error: error.message });
        return false;
    }
}

// Sync diet plans with Supabase
async function syncDietsToSupabase() {
    if (!supabase) {
        logger.log('Supabase not configured', { error: 'Supabase client not initialized' });
        return false;
    }
    
    try {
        const diets = JSON.parse(localStorage.getItem('dietPlans') || '[]');
        
        for (const diet of diets) {
            const { data, error } = await supabase
                .from('diet_plans')
                .upsert({
                    id: diet.id,
                    name: diet.name,
                    goal: diet.goal,
                    duration: diet.duration,
                    calories: diet.calories,
                    description: diet.description
                }, { onConflict: 'id' });
            
            if (error) {
                logger.log('Supabase Sync Error - Diets', { error: error.message, dietId: diet.id });
            }
        }
        
        logger.log('Diet Plans Synced to Supabase', { count: diets.length });
        return true;
    } catch (error) {
        logger.log('Supabase Sync Failed - Diets', { error: error.message });
        return false;
    }
}

// Sync join requests with Supabase
async function syncJoinRequestsToSupabase() {
    if (!supabase) {
        logger.log('Supabase not configured', { error: 'Supabase client not initialized' });
        return false;
    }
    
    try {
        const requests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
        
        for (const request of requests) {
            const { data, error } = await supabase
                .from('join_requests')
                .insert({
                    full_name: request.fullName,
                    email: request.email,
                    phone: request.phone,
                    age: request.age,
                    interests: request.interests,
                    submitted_at: request.submittedAt
                });
            
            if (error) {
                logger.log('Supabase Sync Error - Join Requests', { error: error.message });
            }
        }
        
        logger.log('Join Requests Synced to Supabase', { count: requests.length });
        return true;
    } catch (error) {
        logger.log('Supabase Sync Failed - Join Requests', { error: error.message });
        return false;
    }
}

// Sync all data to Supabase
async function syncAllToSupabase() {
    logger.log('Starting Full Sync to Supabase');
    
    const results = {
        users: await syncUsersToSupabase(),
        plans: await syncPlansToSupabase(),
        timings: await syncTimingsToSupabase(),
        products: await syncProductsToSupabase(),
        diets: await syncDietsToSupabase(),
        joinRequests: await syncJoinRequestsToSupabase()
    };
    
    logger.log('Full Sync Complete', results);
    return results;
}

// Load users from Supabase
async function loadUsersFromSupabase() {
    if (!supabase) {
        logger.log('Supabase not configured', { error: 'Supabase client not initialized' });
        return [];
    }
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');
        
        if (error) {
            logger.log('Supabase Load Error - Users', { error: error.message });
            return [];
        }
        
        // Convert Supabase format to local storage format
        const users = data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            password: user.password,
            role: user.role,
            plan: user.plan,
            timing: user.timing,
            createdAt: user.created_at,
            bills: user.bills || [],
            notifications: user.notifications || []
        }));
        
        localStorage.setItem('users', JSON.stringify(users));
        logger.log('Users Loaded from Supabase', { count: users.length });
        return users;
    } catch (error) {
        logger.log('Supabase Load Failed - Users', { error: error.message });
        return [];
    }
}

// Auto-sync function (can be called periodically)
function startAutoSync(intervalMinutes = 5) {
    if (!supabase) {
        logger.log('Auto-sync disabled - Supabase not configured');
        return;
    }
    
    setInterval(async () => {
        await syncAllToSupabase();
    }, intervalMinutes * 60 * 1000);
    
    logger.log('Auto-sync started', { intervalMinutes });
}

// Export functions globally
window.syncUsersToSupabase = syncUsersToSupabase;
window.syncPlansToSupabase = syncPlansToSupabase;
window.syncTimingsToSupabase = syncTimingsToSupabase;
window.syncProductsToSupabase = syncProductsToSupabase;
window.syncDietsToSupabase = syncDietsToSupabase;
window.syncJoinRequestsToSupabase = syncJoinRequestsToSupabase;
window.syncAllToSupabase = syncAllToSupabase;
window.loadUsersFromSupabase = loadUsersFromSupabase;
window.startAutoSync = startAutoSync;








