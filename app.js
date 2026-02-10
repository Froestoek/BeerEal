// ============================================
// BeerEal App - Main Logic
// ============================================

// ============================================
// Configuration
// ============================================
const defaultDrinks = [
    { name: 'Standard Lager', units: 1, emoji: '🍺' },
    { name: 'IPA', units: 1.5, emoji: '🍺' },
    { name: 'Stout', units: 1.5, emoji: '🍺' },
    { name: 'Pilsner', units: 1, emoji: '🍺' }
];

// ============================================
// Local Storage Management
// ============================================
const storage = {
    getDrinks: () => {
        const drinks = localStorage.getItem('drinks');
        return drinks ? JSON.parse(drinks) : defaultDrinks;
    },

    saveDrinks: (drinks) => {
        localStorage.setItem('drinks', JSON.stringify(drinks));
    },

    getCheckIns: () => {
        const checkIns = localStorage.getItem('checkIns');
        return checkIns ? JSON.parse(checkIns) : [];
    },

    saveCheckIns: (checkIns) => {
        localStorage.setItem('checkIns', JSON.stringify(checkIns));
    },

    addCheckIn: (checkIn) => {
        const checkIns = storage.getCheckIns();
        checkIns.unshift(checkIn);
        storage.saveCheckIns(checkIns);
    },

    getDarkMode: () => {
        return localStorage.getItem('darkMode') === 'true';
    },

    setDarkMode: (enabled) => {
        localStorage.setItem('darkMode', enabled);
    },

    getBakdagState: () => {
        const state = localStorage.getItem('bakdag');
        return state ? JSON.parse(state) : { active: false, startTime: null };
    },

    setBakdagState: (state) => {
        localStorage.setItem('bakdag', JSON.stringify(state));
    }
};

// ============================================
// Dark Mode
// ============================================
const darkMode = {
    init: () => {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.checked = storage.getDarkMode();
            darkModeToggle.addEventListener('change', (e) => {
                darkMode.set(e.target.checked);
            });
        }
    },

    set: (enabled) => {
        storage.setDarkMode(enabled);
        if (enabled) {
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.style.colorScheme = 'light';
        }
    }
};

// ============================================
// Drinks Management
// ============================================
const drinks = {
    renderGrid: () => {
        const drinksGrid = document.getElementById('drinks-grid');
        const allDrinks = storage.getDrinks();
        drinksGrid.innerHTML = '';
        
        allDrinks.forEach((drink, index) => {
            const card = document.createElement('div');
            card.className = 'drink-card';
            card.innerHTML = `
                <div class="drink-image">${drink.emoji}</div>
                <p class="drink-name">${drink.name}</p>
                <p class="drink-units">${drink.units} unit${drink.units !== 1 ? 's' : ''}</p>
            `;
            drinksGrid.appendChild(card);
        });
    },

    populateSelect: () => {
        const drinkSelect = document.getElementById('drink-select');
        const allDrinks = storage.getDrinks();
        drinkSelect.innerHTML = '<option value="">Select a drink...</option>';
        allDrinks.forEach((drink, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${drink.name} (${drink.units} units)`;
            drinkSelect.appendChild(option);
        });
    },

    add: (newDrink) => {
        const allDrinks = storage.getDrinks();
        allDrinks.push(newDrink);
        storage.saveDrinks(allDrinks);
        drinks.populateSelect();
        drinks.renderGrid();
    },

    init: () => {
        const addDrinkBtn = document.getElementById('add-drink-btn');
        const addDrinkForm = document.getElementById('add-drink-form');
        const drinkForm = document.getElementById('drink-form');
        const cancelDrinkBtn = document.getElementById('cancel-drink-btn');

        if (addDrinkBtn) {
            addDrinkBtn.addEventListener('click', () => {
                addDrinkForm.style.display = 'block';
            });
        }

        if (cancelDrinkBtn) {
            cancelDrinkBtn.addEventListener('click', () => {
                addDrinkForm.style.display = 'none';
                drinkForm.reset();
            });
        }

        if (drinkForm) {
            drinkForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newDrink = {
                    name: document.getElementById('drink-name').value,
                    units: parseFloat(document.getElementById('drink-units-input').value),
                    emoji: document.getElementById('drink-image-input').value || '🍺'
                };
                
                drinks.add(newDrink);
                
                addDrinkForm.style.display = 'none';
                drinkForm.reset();
            });
        }
    }
};

// ============================================
// Feed Management
// ============================================
const feed = {
    createCard: (checkIn) => {
        const article = document.createElement('article');
        article.className = 'feed-card';
        
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const timestamp = new Date(checkIn.timestamp);
        const timeAgo = feed.getTimeAgo(timestamp);
        
        article.innerHTML = `
            <div class="card-header">
                <div class="user-info">
                    <div class="user-avatar">👤</div>
                    <div class="user-details">
                        <h3 class="user-name">You</h3>
                        <time class="card-time">${timeAgo}</time>
                    </div>
                </div>
            </div>
            <div class="card-photo" style="background: ${randomColor};">
                ${checkIn.photoData ? `<img src="${checkIn.photoData}" alt="Check-in photo">` : ''}
            </div>
            <div class="card-content">
                <p class="card-beer-type">${checkIn.drinkName}</p>
                ${checkIn.notes ? `<p class="card-notes">${checkIn.notes}</p>` : ''}
                <div class="card-stats">
                    <span class="card-units">${checkIn.units} unit${checkIn.units !== 1 ? 's' : ''}</span>
                    <span class="card-location">📍 Just now</span>
                </div>
            </div>
        `;
        
        return article;
    },

    getTimeAgo: (date) => {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    },

    render: () => {
        const feedContainer = document.getElementById('feed-container');
        const checkIns = storage.getCheckIns();
        
        feedContainer.innerHTML = '';
        
        if (checkIns.length === 0) {
            feedContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">No check-ins yet. Start your bakdag to begin!</p>';
            return;
        }
        
        checkIns.forEach(checkIn => {
            feedContainer.appendChild(feed.createCard(checkIn));
        });
    }
};

// ============================================
// Check-in Management
// ============================================
const checkin = {
    submit: async (e) => {
        e.preventDefault();
        
        const drinkSelectIndex = document.getElementById('drink-select').value;
        if (drinkSelectIndex === '') return;
        
        const allDrinks = storage.getDrinks();
        const selectedDrink = allDrinks[drinkSelectIndex];
        const notes = document.getElementById('checkin-notes').value;
        const photoInput = document.getElementById('photo-upload');
        
        let photoData = null;
        if (photoInput.files.length > 0) {
            photoData = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(photoInput.files[0]);
            });
        }
        
        const checkInData = {
            drinkName: selectedDrink.name,
            units: selectedDrink.units,
            notes: notes,
            photoData: photoData,
            timestamp: new Date().toISOString()
        };
        
        storage.addCheckIn(checkInData);
        feed.render();
        bakdag.updateProgress();
        
        // Reset form
        document.getElementById('checkin-form').reset();
        document.getElementById('photo-preview').innerHTML = '';
    },

    init: () => {
        const checkinForm = document.getElementById('checkin-form');
        if (checkinForm) {
            checkinForm.addEventListener('submit', checkin.submit);
        }
    }
};

// ============================================
// Bakdag Management
// ============================================
const bakdag = {
    updateCheckinFormVisibility: () => {
        const bakdagState = storage.getBakdagState();
        const checkinSection = document.getElementById('checkin-section');
        if (bakdagState.active) {
            checkinSection.style.display = 'block';
        } else {
            checkinSection.style.display = 'none';
        }
    },

    updateBakdagButtons: () => {
        const bakdagState = storage.getBakdagState();
        const startBtn = document.getElementById('start-bakdag-btn');
        const statsBtn = document.getElementById('bakdag-stats-btn');
        
        if (bakdagState.active) {
            if (startBtn) startBtn.style.display = 'none';
            if (statsBtn) statsBtn.style.display = 'block';
        } else {
            if (startBtn) startBtn.style.display = 'block';
            if (statsBtn) statsBtn.style.display = 'none';
        }
    },

    updateProgress: () => {
        const checkIns = storage.getCheckIns();
        const bakdagState = storage.getBakdagState();
        
        if (!bakdagState.active) {
            document.getElementById('units-count').textContent = '0';
            document.getElementById('progress-fill').style.width = '0%';
            document.getElementById('pace-indicator').textContent = '0';
            return;
        }
        
        // Calculate total units
        let totalUnits = 0;
        checkIns.forEach(checkIn => {
            totalUnits += checkIn.units;
        });
        
        // Calculate progress percentage (max 100%)
        const percentage = Math.min((totalUnits / 24) * 100, 100);
        
        // Calculate pace (units per hour)
        let pace = 0;
        if (checkIns.length > 0 && bakdagState.startTime) {
            const startTime = new Date(bakdagState.startTime);
            const now = new Date();
            const hours = (now - startTime) / (1000 * 60 * 60);
            if (hours > 0) {
                pace = (totalUnits / hours).toFixed(2);
            }
        }
        
        // Update DOM
        document.getElementById('units-count').textContent = totalUnits;
        document.getElementById('progress-fill').style.width = percentage + '%';
        document.getElementById('pace-indicator').textContent = pace;
    },

    updateStats: () => {
        const bakdagState = storage.getBakdagState();
        const checkIns = storage.getCheckIns();
        
        if (!bakdagState.active) return;
        
        // Calculate total units
        let totalUnits = 0;
        checkIns.forEach(checkIn => {
            totalUnits += checkIn.units;
        });
        
        // Calculate pace
        let pace = 0;
        let timeElapsed = { hours: 0, minutes: 0 };
        let projectedFinishTime = '--:--';
        
        if (bakdagState.startTime) {
            const startTime = new Date(bakdagState.startTime);
            const now = new Date();
            const ms = now - startTime;
            const hours = Math.floor(ms / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            timeElapsed = { hours, minutes };
            
            if (hours > 0 || minutes > 0) {
                const totalMinutes = hours * 60 + minutes;
                pace = (totalUnits / (totalMinutes / 60)).toFixed(2);
                
                // Calculate projected finish time
                if (pace > 0) {
                    const remainingUnits = 24 - totalUnits;
                    const minutesToFinish = (remainingUnits / pace) * 60;
                    const finishMs = now.getTime() + (minutesToFinish * 60 * 1000);
                    const finishTime = new Date(finishMs);
                    const finishHours = String(finishTime.getHours()).padStart(2, '0');
                    const finishMinutes = String(finishTime.getMinutes()).padStart(2, '0');
                    projectedFinishTime = `${finishHours}:${finishMinutes}`;
                }
            }
        }
        
        // Generate fun message
        let funMessage = '';
        const percentage = (totalUnits / 24) * 100;
        if (percentage === 0) {
            funMessage = 'Get started! 🚀';
        } else if (percentage < 25) {
            funMessage = 'Just getting warmed up! 🌡️';
        } else if (percentage < 50) {
            funMessage = 'Halfway there! You\'re crushing it! 💪';
        } else if (percentage < 75) {
            funMessage = 'More than 3/4 of the way! Almost there! 🏁';
        } else if (percentage < 100) {
            funMessage = 'Final stretch! You\'ve got this! 🎯';
        } else {
            funMessage = 'BAKDAG CHAMPION! 👑';
        }
        
        // Update DOM
        document.getElementById('stats-total-units').textContent = totalUnits;
        document.getElementById('stats-pace').textContent = pace;
        document.getElementById('stats-time-elapsed').textContent = `${timeElapsed.hours}h ${timeElapsed.minutes}m`;
        document.getElementById('stats-checkins').textContent = checkIns.length;
        document.getElementById('stats-projected-time').textContent = projectedFinishTime;
        document.getElementById('stats-fun-message').textContent = funMessage;
    },

    start: () => {
        const bakdagState = {
            active: true,
            startTime: new Date().toISOString()
        };
        storage.setBakdagState(bakdagState);
        bakdag.updateCheckinFormVisibility();
        bakdag.updateBakdagButtons();
        bakdag.updateProgress();
        
        pageNav.switchTo('home');
    },

    end: () => {
        const bakdagState = {
            active: false,
            startTime: null
        };
        storage.setBakdagState(bakdagState);
        bakdag.updateCheckinFormVisibility();
        bakdag.updateBakdagButtons();
        bakdag.updateProgress();
        
        pageNav.switchTo('home');
    },

    init: () => {
        const startBakdagBtn = document.getElementById('start-bakdag-btn');
        const statsBtn = document.getElementById('bakdag-stats-btn');
        const endBakdagBtn = document.getElementById('end-bakdag-btn');
        const backToHomeBtn = document.getElementById('back-to-home-btn');
        
        if (startBakdagBtn) {
            startBakdagBtn.addEventListener('click', () => {
                bakdag.start();
            });
        }
        
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                bakdag.updateStats();
                pageNav.switchTo('stats');
            });
        }
        
        if (endBakdagBtn) {
            endBakdagBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to end this Bakdag?')) {
                    bakdag.end();
                }
            });
        }
        
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                pageNav.switchTo('home');
            });
        }
    }
};

// ============================================
// Page Navigation
// ============================================
const pageNav = {
    switchTo: (pageName) => {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('page-active');
        });
        document.getElementById(pageName + '-page').classList.add('page-active');

        document.querySelectorAll('.nav-item[data-page]').forEach(navItem => {
            navItem.classList.remove('nav-active');
        });
        const navItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
        if (navItem) {
            navItem.classList.add('nav-active');
        }
    },

    init: () => {
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                pageNav.switchTo(page);
            });
        });
    }
};

// ============================================
// Settings
// ============================================
const settings = {
    init: () => {
        const settingsBtn = document.getElementById('settings-btn');
        const closeSettingsBtn = document.getElementById('close-settings-btn');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                pageNav.switchTo('settings');
            });
        }

        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                pageNav.switchTo('home');
            });
        }
    }
};

// ============================================
// Service Worker
// ============================================
const serviceWorkerInit = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }
};

// ============================================
// App Initialization
// ============================================
const app = {
    init: () => {
        serviceWorkerInit();
        
        darkMode.init();
        bakdag.updateCheckinFormVisibility();
        bakdag.updateBakdagButtons();
        bakdag.updateProgress();
        drinks.populateSelect();
        drinks.renderGrid();
        feed.render();
        
        pageNav.init();
        settings.init();
        bakdag.init();
        drinks.init();
        checkin.init();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', app.init);
