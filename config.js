// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_CONFIG = {
    url: 'https://yqoyegwgighoovmkrdma.supabase.co', // Replace with your Supabase URL
    anonKey: 'sb_publishable_mbkN5fCxs3tza8OI46wYcQ_t6ToLVZx' // Replace with your Supabase anon key
};

// Initialize Supabase client (will fallback to localStorage if not configured)
let supabase = null;

// Try to initialize Supabase if config is provided
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'https://yqoyegwgighoovmkrdma.supabase.co') {
    // Load Supabase client library (you'll need to add this script tag in HTML)
    // <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    try {
        if (typeof supabase !== 'undefined' && window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
            logger.log('Supabase Initialized', { url: SUPABASE_CONFIG.url });
        }
    } catch (e) {
        console.warn('Supabase not available, using localStorage fallback', e);
        logger.log('Supabase Initialization Failed', { error: e.message });
    }
}

// Storage abstraction layer - uses Supabase if available, otherwise localStorage
const Storage = {
    async get(table, filters = {}) {
        if (supabase) {
            try {
                let query = supabase.from(table).select('*');
                
                // Apply filters
                Object.keys(filters).forEach(key => {
                    if (filters[key] !== undefined && filters[key] !== null) {
                        query = query.eq(key, filters[key]);
                    }
                });
                
                const { data, error } = await query;
                if (error) throw error;
                logger.log('Storage Get', { table, filters, count: data?.length || 0 });
                return data || [];
            } catch (e) {
                console.error('Supabase get error:', e);
                logger.log('Storage Get Error', { table, error: e.message });
                return this.getLocalStorage(table, filters);
            }
        }
        return this.getLocalStorage(table, filters);
    },

    async insert(table, data) {
        if (supabase) {
            try {
                const { data: result, error } = await supabase
                    .from(table)
                    .insert([data])
                    .select()
                    .single();
                
                if (error) throw error;
                logger.log('Storage Insert', { table, id: result?.id });
                return result;
            } catch (e) {
                console.error('Supabase insert error:', e);
                logger.log('Storage Insert Error', { table, error: e.message });
                return this.insertLocalStorage(table, data);
            }
        }
        return this.insertLocalStorage(table, data);
    },

    async update(table, id, data) {
        if (supabase) {
            try {
                const { data: result, error } = await supabase
                    .from(table)
                    .eq('id', id)
                    .update(data)
                    .select()
                    .single();
                
                if (error) throw error;
                logger.log('Storage Update', { table, id });
                return result;
            } catch (e) {
                console.error('Supabase update error:', e);
                logger.log('Storage Update Error', { table, id, error: e.message });
                return this.updateLocalStorage(table, id, data);
            }
        }
        return this.updateLocalStorage(table, id, data);
    },

    async delete(table, id) {
        if (supabase) {
            try {
                const { error } = await supabase
                    .from(table)
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                logger.log('Storage Delete', { table, id });
                return true;
            } catch (e) {
                console.error('Supabase delete error:', e);
                logger.log('Storage Delete Error', { table, id, error: e.message });
                return this.deleteLocalStorage(table, id);
            }
        }
        return this.deleteLocalStorage(table, id);
    },

    // LocalStorage fallback methods
    getLocalStorage(table, filters = {}) {
        const items = JSON.parse(localStorage.getItem(table) || '[]');
        if (Object.keys(filters).length === 0) return items;
        
        return items.filter(item => {
            return Object.keys(filters).every(key => {
                return item[key] === filters[key] || 
                       (filters[key] === undefined || filters[key] === null);
            });
        });
    },

    insertLocalStorage(table, data) {
        const items = JSON.parse(localStorage.getItem(table) || '[]');
        const newItem = {
            ...data,
            id: data.id || `${table}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        items.push(newItem);
        localStorage.setItem(table, JSON.stringify(items));
        logger.log('LocalStorage Insert', { table, id: newItem.id });
        return newItem;
    },

    updateLocalStorage(table, id, data) {
        const items = JSON.parse(localStorage.getItem(table) || '[]');
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...data };
            localStorage.setItem(table, JSON.stringify(items));
            logger.log('LocalStorage Update', { table, id });
            return items[index];
        }
        return null;
    },

    deleteLocalStorage(table, id) {
        const items = JSON.parse(localStorage.getItem(table) || '[]');
        const filtered = items.filter(item => item.id !== id);
        localStorage.setItem(table, JSON.stringify(filtered));
        logger.log('LocalStorage Delete', { table, id });
        return true;
    }
};

