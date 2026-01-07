// Initialize default data for the application
function initializeDefaultData() {
    logger.log('Initializing Default Data');
    
    // Initialize default gym plans if none exist
    if (!localStorage.getItem('gymPlans')) {
        const defaultPlans = [
            {
                id: 'plan_1',
                name: 'Basic Plan',
                duration: '1 Month',
                price: 50,
                features: 'Gym Access, Basic Equipment, Locker Access'
            },
            {
                id: 'plan_2',
                name: 'Standard Plan',
                duration: '3 Months',
                price: 130,
                features: 'Gym Access, All Equipment, Locker Access, Group Classes'
            },
            {
                id: 'plan_3',
                name: 'Premium Plan',
                duration: '6 Months',
                price: 240,
                features: 'Gym Access, All Equipment, Locker Access, Group Classes, Personal Training Sessions'
            },
            {
                id: 'plan_4',
                name: 'Elite Plan',
                duration: '12 Months',
                price: 450,
                features: 'Gym Access, All Equipment, Locker Access, Group Classes, Personal Training Sessions, Nutrition Counseling'
            }
        ];
        localStorage.setItem('gymPlans', JSON.stringify(defaultPlans));
        logger.log('Default Plans Initialized', { count: defaultPlans.length });
    }
    
    // Initialize default gym timings if none exist
    if (!localStorage.getItem('gymTimings')) {
        const defaultTimings = [
            {
                id: 'timing_1',
                name: 'Early Morning',
                startTime: '05:00',
                endTime: '09:00',
                days: 'Mon-Fri'
            },
            {
                id: 'timing_2',
                name: 'Morning',
                startTime: '09:00',
                endTime: '12:00',
                days: 'Mon-Sun'
            },
            {
                id: 'timing_3',
                name: 'Afternoon',
                startTime: '12:00',
                endTime: '17:00',
                days: 'Mon-Sun'
            },
            {
                id: 'timing_4',
                name: 'Evening',
                startTime: '17:00',
                endTime: '21:00',
                days: 'Mon-Sun'
            },
            {
                id: 'timing_5',
                name: 'Night',
                startTime: '21:00',
                endTime: '23:00',
                days: 'Mon-Fri'
            }
        ];
        localStorage.setItem('gymTimings', JSON.stringify(defaultTimings));
        logger.log('Default Timings Initialized', { count: defaultTimings.length });
    }
    
    // Initialize default store products if none exist
    if (!localStorage.getItem('storeProducts')) {
        const defaultProducts = [
            {
                id: 'product_1',
                name: 'Whey Protein Powder',
                category: 'protein',
                price: 45.99,
                stock: 50,
                description: 'High-quality whey protein powder for muscle recovery and growth. 2lbs container.'
            },
            {
                id: 'product_2',
                name: 'Multivitamin Supplements',
                category: 'vitamins',
                price: 25.99,
                stock: 100,
                description: 'Complete multivitamin supplement to support overall health and wellness.'
            },
            {
                id: 'product_3',
                name: 'Creatine Monohydrate',
                category: 'supplements',
                price: 19.99,
                stock: 75,
                description: 'Pure creatine monohydrate powder for enhanced strength and performance.'
            },
            {
                id: 'product_4',
                name: 'Pre-Workout Energizer',
                category: 'supplements',
                price: 29.99,
                stock: 60,
                description: 'Energy-boosting pre-workout supplement to maximize your training sessions.'
            },
            {
                id: 'product_5',
                name: 'Gym Gloves',
                category: 'accessories',
                price: 15.99,
                stock: 80,
                description: 'Comfortable and durable gym gloves for better grip and hand protection.'
            },
            {
                id: 'product_6',
                name: 'Protein Shaker Bottle',
                category: 'accessories',
                price: 12.99,
                stock: 120,
                description: 'Premium protein shaker bottle with mixing ball for smooth protein shakes.'
            }
        ];
        localStorage.setItem('storeProducts', JSON.stringify(defaultProducts));
        logger.log('Default Products Initialized', { count: defaultProducts.length });
    }
    
    // Initialize default diet plans if none exist
    if (!localStorage.getItem('dietPlans')) {
        const defaultDiets = [
            {
                id: 'diet_1',
                name: 'Weight Loss Diet',
                goal: 'weight_loss',
                duration: '4 weeks',
                calories: '1500-1800',
                description: 'A balanced diet plan focused on calorie deficit while maintaining essential nutrients. Includes meal plans, recipes, and portion guidelines.'
            },
            {
                id: 'diet_2',
                name: 'Muscle Gain Diet',
                goal: 'muscle_gain',
                duration: '8 weeks',
                calories: '2500-3000',
                description: 'High-protein diet plan designed to support muscle growth and recovery. Includes meal timing and protein distribution strategies.'
            },
            {
                id: 'diet_3',
                name: 'Maintenance Diet',
                goal: 'maintenance',
                duration: 'Ongoing',
                calories: '2000-2200',
                description: 'Balanced diet plan to maintain current weight and overall health. Flexible meal options with nutritional guidelines.'
            }
        ];
        localStorage.setItem('dietPlans', JSON.stringify(defaultDiets));
        logger.log('Default Diet Plans Initialized', { count: defaultDiets.length });
    }
    
    // Initialize admin notifications if none exist
    if (!localStorage.getItem('adminNotifications')) {
        localStorage.setItem('adminNotifications', JSON.stringify([]));
    }
    
    // Initialize join requests if none exist
    if (!localStorage.getItem('joinRequests')) {
        localStorage.setItem('joinRequests', JSON.stringify([]));
    }
    
    logger.log('Default Data Initialization Complete');
}

// Initialize on page load
if (typeof logger !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeDefaultData);
} else {
    // Wait for logger to be available
    window.addEventListener('load', function() {
        setTimeout(initializeDefaultData, 100);
    });
}








