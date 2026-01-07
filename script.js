// Logging System
class Logger {
    constructor() {
        this.logs = this.loadLogs();
    }

    log(action, details = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            details: details,
            user: this.getCurrentUser() || 'Guest'
        };

        this.logs.push(logEntry);
        this.saveLogs();
        console.log(`[LOG] ${logEntry.timestamp} - ${action}`, details);
    }

    saveLogs() {
        try {
            const logsJson = JSON.stringify(this.logs);
            localStorage.setItem('app_logs', logsJson);
            
            // Keep only last 1000 logs to prevent storage overflow
            if (this.logs.length > 1000) {
                this.logs = this.logs.slice(-1000);
                localStorage.setItem('app_logs', JSON.stringify(this.logs));
            }
        } catch (e) {
            console.error('Failed to save logs:', e);
        }
    }

    loadLogs() {
        try {
            const logsJson = localStorage.getItem('app_logs');
            return logsJson ? JSON.parse(logsJson) : [];
        } catch (e) {
            console.error('Failed to load logs:', e);
            return [];
        }
    }

    getCurrentUser() {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser).email : null;
    }

    getLogs() {
        return this.logs;
    }

    exportLogs() {
        const logsJson = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([logsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize logger
const logger = new Logger();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    logger.log('Page Loaded', { page: window.location.pathname });

    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function setActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', setActiveNav);

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            logger.log('Mobile Menu Toggled', { state: navMenu.classList.contains('active') });
        });
    }

    // Smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    logger.log('Navigation Click', { target: targetId });
                }
            }
        });
    });

    // Join form submission
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                age: document.getElementById('age').value,
                interests: document.getElementById('interests').value,
                submittedAt: new Date().toISOString()
            };

            // Save join request
            let joinRequests = JSON.parse(localStorage.getItem('joinRequests') || '[]');
            joinRequests.push(formData);
            localStorage.setItem('joinRequests', JSON.stringify(joinRequests));

            logger.log('Join Form Submitted', formData);

            // Show success message
            const successMsg = document.getElementById('joinSuccess');
            if (successMsg) {
                successMsg.style.display = 'block';
                joinForm.reset();
                setTimeout(() => {
                    successMsg.style.display = 'none';
                }, 5000);
            }

            alert('Thank you! Your application has been submitted. We will contact you soon.');
        });
    }

    // Initialize slider
    initSlider();
});

// Hero Slider Functions
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function initSlider() {
    logger.log('Slider Initialized');
    if (slides.length > 0) {
        showSlide(0);
        // Auto-play slider
        setInterval(() => {
            changeSlide(1);
        }, 5000);
    }
}

function showSlide(index) {
    if (index >= slides.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = index;
    }

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    if (slides[currentSlideIndex]) {
        slides[currentSlideIndex].classList.add('active');
    }
    if (dots[currentSlideIndex]) {
        dots[currentSlideIndex].classList.add('active');
    }

    logger.log('Slide Changed', { slideIndex: currentSlideIndex });
}

function changeSlide(direction) {
    showSlide(currentSlideIndex + direction);
}

function currentSlide(index) {
    showSlide(index - 1);
}

// Export functions globally
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;

// Authentication Functions
function initializeAuth() {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const user = JSON.parse(currentUser);
        logger.log('User Session Check', { email: user.email, role: user.role });
        
        // Redirect based on role
        if (window.location.pathname.includes('login.html')) {
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'member.html';
            }
        }
    }
}

// Initialize auth check
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

