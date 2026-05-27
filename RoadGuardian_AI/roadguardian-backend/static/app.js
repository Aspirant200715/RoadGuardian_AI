/**
 * RoadGuardian AI - Frontend Application
 * @version 3.0.0
 * @description Refactored for the new professional UI.
 */

// --- Type Definitions for JSDoc ---
/** @typedef {{id:number|string,hazard_type:string,latitude:number,longitude:number,location_address?:string,description?:string,status:string,urgency_level:string,severity_score:number,created_at:string,reporter_name?:string,resolved_image_url?:string,resolution_notes?:string,resolved_at?:string,resolved_by_name?:string,assigned_to?:string|null,image_url?:string}} Hazard */
/** @typedef {{id:number|string,email:string,full_name?:string|null,role?:string,points?:number}} User */
/** @typedef {{total_hazards:number,avg_severity:number,resolved_count:number,pending_count:number,high_urgency_count?:number,recent_hazards?:Hazard[]}} DashboardStats */
/** @typedef {{severity_score:number,urgency_level:string,factors?:{explanation?:string}}} SeverityAnalysis */
/** @typedef {{north:number,south:number,east:number,west:number}} Bounds */

// --- Constants ---
const API_BASE = window.location.origin;
const TOKEN_KEY = "roadguardian_token";

// --- Global State Store ---
const store = {
    token: localStorage.getItem(TOKEN_KEY),
    user: null,
    map: null,
    heatmapLayer: null,
    markers: [],
    isLoggedIn() {
        return !!this.token;
    }
};

// --- DOM & UI Utilities ---
const ui = {
    // --- Core Selectors ---
    landingView: document.getElementById("landing-view"),
    dashboardView: document.getElementById("dashboard-view"),
    authModal: document.getElementById("auth-modal"),
    reportModal: document.getElementById("report-hazard-modal"),
    resolveModal: document.getElementById("resolve-hazard-modal"),
    comparisonModal: document.getElementById("comparison-modal"),
    authForm: document.getElementById("auth-form"),
    reportForm: document.getElementById("report-hazard-form"),
    resolveForm: document.getElementById("resolve-hazard-form"),
    
    // --- UI State Management ---
    showView(view) {
        this.landingView.style.display = view === 'landing' ? 'block' : 'none';
        this.dashboardView.style.display = view === 'dashboard' ? 'block' : 'none';
        
        if (view === 'dashboard' && !store.map) {
            mapModule.init();
        }
        if (view === 'dashboard') {
            document.body.classList.add('dashboard-active');
        } else {
            document.body.classList.remove('dashboard-active');
        }
    },

    toggleModal(modal, show) {
        if (!modal) return;
        if (show) {
            modal.style.display = "flex";
            setTimeout(() => modal.classList.add("visible"), 10);
        } else {
            modal.classList.remove("visible");
            modal.addEventListener("transitionend", () => {
                modal.style.display = "none";
            }, { once: true });
        }
    },

    toggleAuthForm(mode) { // 'login' or 'register'
        const isLogin = mode === 'login';
        this.authForm.dataset.mode = mode;
        this.authForm.querySelector('h2').textContent = isLogin ? 'Welcome Back' : 'Create Account';
        this.authForm.querySelector('.form-toggle-text').innerHTML = isLogin 
            ? `Don't have an account? <a href="#" id="show-register">Sign Up</a>`
            : `Already have an account? <a href="#" id="show-login">Log In</a>`;
        this.authForm.querySelector('button[type="submit"]').textContent = isLogin ? 'Log In' : 'Create Account';
        
        const fullNameGroup = this.authForm.querySelector('.form-group:nth-child(3)');
        if (fullNameGroup) fullNameGroup.style.display = isLogin ? 'none' : 'block';
    },

    updateUserUI(user) {
        const userDisplay = document.getElementById("user-display");
        const loginButton = document.getElementById("login-button");
        const reportButton = document.getElementById("report-button-cta");

        if (user) {
            userDisplay.innerHTML = `
                <span class="user-name">${user.full_name || user.email}</span>
                <button id="logout-button" class="button-subtle">Logout</button>
            `;
            userDisplay.style.display = 'flex';
            loginButton.style.display = 'none';
            if (reportButton) reportButton.style.display = 'block';
            document.getElementById("logout-button").addEventListener("click", () => auth.logout());
        } else {
            userDisplay.style.display = 'none';
            loginButton.style.display = 'block';
            if (reportButton) reportButton.style.display = 'none';
        }
    },

    toast(message, type = "info") {
        let container = document.getElementById("toast-container");
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            document.body.appendChild(container);
        }

        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        const node = document.createElement("div");
        node.className = `toast toast-${type}`;
        node.innerHTML = `<span>${icons[type]}</span> ${message}`;
        container.appendChild(node);

        setTimeout(() => {
            node.classList.add("fade-out");
            setTimeout(() => node.remove(), 500);
        }, 4000);
    }
};

// --- API Service ---
const api = {
    async request(endpoint, options = {}) {
        const headers = { ...(options.headers || {}) };
        if (!(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }
        if (store.token) {
            headers.Authorization = `Bearer ${store.token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

        if (response.status === 401) {
            auth.logout(true); // Silent logout
            throw new Error("Session expired. Please log in again.");
        }
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred' }));
            throw new Error(errorData.detail || 'Request failed');
        }
        return response;
    },

    async get(endpoint) {
        const res = await this.request(endpoint);
        return res.json();
    },

    async post(endpoint, data) {
        const res = await this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async postForm(endpoint, formData) {
        const res = await this.request(endpoint, {
            method: "POST",
            body: formData
        });
        return res.json();
    },
};

// --- Authentication Module ---
const auth = {
    async login(email, password) {
        try {
            const data = await api.post("/auth/login", { email, password });
            store.token = data.access_token;
            localStorage.setItem(TOKEN_KEY, data.access_token);
            await this.getProfile();
            ui.toggleModal(ui.authModal, false);
            ui.showView('dashboard');
            dashboard.load();
            ui.toast("Login successful!", "success");
        } catch (error) {
            ui.toast(`Login failed: ${error.message}`, "error");
        }
    },

    async register(email, password, fullName) {
        try {
            await api.post("/auth/register", { email, password, full_name: fullName });
            ui.toast("Registration successful! Logging you in...", "success");
            await this.login(email, password);
        } catch (error) {
            ui.toast(`Registration failed: ${error.message}`, "error");
        }
    },

    async getProfile() {
        try {
            store.user = await api.get("/auth/me");
            ui.updateUserUI(store.user);
        } catch (error) {
            console.error("Failed to get profile:", error);
            this.logout(true);
        }
    },

    logout(silent = false) {
        store.token = null;
        store.user = null;
        localStorage.removeItem(TOKEN_KEY);
        ui.updateUserUI(null);
        ui.showView('landing');
        if (!silent) {
            ui.toast("You have been logged out.", "info");
        }
    },

    async init() {
        if (store.isLoggedIn()) {
            await this.getProfile();
            ui.showView('dashboard');
            dashboard.load();
        } else {
            ui.showView('landing');
            ui.updateUserUI(null);
        }
    }
};

// --- Map Module ---
const mapModule = {
    init() {
        if (store.map || !document.getElementById("map-container")) return;

        store.map = L.map("map-container").setView([13.0827, 80.2707], 12); // Default to Chennai
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(store.map);

        this.loadHeatmap();
        store.map.on("moveend", () => this.loadHeatmap());
        this.locateUser();
    },

    async loadHeatmap() {
        if (!store.map) return;
        const bounds = store.map.getBounds();
        const query = `?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}`;
        
        try {
            const heatmapData = await api.get(`/hazards/heatmap${query}`);
            if (store.heatmapLayer) {
                store.map.removeLayer(store.heatmapLayer);
            }
            if(heatmapData && heatmapData.length > 0) {
                const intensityData = heatmapData.map(p => [p.center_lat, p.center_lng, p.severity_avg / 10]);
                store.heatmapLayer = L.heatLayer(intensityData, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 18,
                    gradient: {0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red'}
                }).addTo(store.map);
            }
        } catch (error) {
            console.error("Failed to load heatmap data:", error);
        }
    },
    
    locateUser() {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                store.map.setView([latitude, longitude], 14);
                L.marker([latitude, longitude], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '📍',
                        iconSize: [24, 24]
                    })
                }).addTo(store.map).bindPopup("Your Location").openPopup();
                
                // Pre-fill report form
                document.getElementById("latitude").value = latitude.toFixed(6);
                document.getElementById("longitude").value = longitude.toFixed(6);
            },
            () => {
                ui.toast("Could not access your location.", "warning");
            }
        );
    }
};

// --- Dashboard Module ---
const dashboard = {
    async load() {
        if (!store.isLoggedIn()) return;
        try {
            const data = await api.get("/hazards/dashboard");
            this.updateStats(data);
            this.renderRecentHazards(data.recent_hazards);
            // Add other dashboard loading functions here (e.g., badges)
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            ui.toast("Could not refresh dashboard.", "error");
        }
    },

    updateStats(data) {
        document.getElementById("stat-total-hazards").textContent = data.total_hazards || 0;
        document.getElementById("stat-avg-severity").textContent = (data.avg_severity || 0).toFixed(1);
        document.getElementById("stat-resolved-count").textContent = data.resolved_count || 0;
        document.getElementById("stat-user-points").textContent = store.user?.points || 0;
    },

    renderRecentHazards(hazards = []) {
        const listEl = document.getElementById("recent-hazards-list");
        if (!listEl) return;
        if (!hazards || !hazards.length) {
            listEl.innerHTML = `<li class="empty-state">No recent hazards reported.</li>`;
            return;
        }
        listEl.innerHTML = hazards.map(h => `
            <li class="hazard-item" data-lat="${h.latitude}" data-lng="${h.longitude}">
                <span class="hazard-type">${h.hazard_type.replace(/_/g, ' ')}</span>
                <span class="hazard-severity" data-level="${h.urgency_level.toLowerCase()}">${h.severity_score.toFixed(1)}</span>
                <span class="hazard-status">${h.status}</span>
                <span class="hazard-time">${this.timeAgo(h.created_at)}</span>
            </li>
        `).join('');
        
        // Add event listeners to new items
        listEl.querySelectorAll('.hazard-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = item.dataset.lat;
                const lng = item.dataset.lng;
                store.map.setView([lat, lng], 16);
            });
        });
    },
    
    timeAgo(dateString) {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    }
};

// --- Hazard Reporting Module ---
const hazardReporter = {
    async submit(event) {
        event.preventDefault();
        if (!store.isLoggedIn()) {
            ui.toast("Please log in to report a hazard.", "warning");
            return;
        }
        
        const formData = new FormData(ui.reportForm);
        const submitButton = ui.reportForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            // The 'upload' endpoint expects form data
            await api.postForm("/hazards/upload", formData);
            ui.toast("Hazard reported successfully! Thank you.", "success");
            ui.toggleModal(ui.reportModal, false);
            ui.reportForm.reset();
            document.getElementById('image-preview-container').style.display = 'none';
            dashboard.load(); // Refresh dashboard data
            mapModule.loadHeatmap(); // Refresh map
        } catch (error) {
            ui.toast(`Failed to submit report: ${error.message}`, "error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Report';
        }
    }
};

// --- Event Listeners ---
function bindEventListeners() {
    // --- Auth Modal ---
    document.getElementById("signInBtn")?.addEventListener("click", () => {
        ui.toggleAuthForm('login');
        ui.toggleModal(ui.authModal, true);
    });

    document.getElementById("signUpBtn")?.addEventListener("click", () => {
        ui.toggleAuthForm('register');
        ui.toggleModal(ui.authModal, true);
    });

    ui.authModal.addEventListener("click", (e) => {
        if (e.target.id === 'auth-modal' || e.target.classList.contains('close-modal')) {
            ui.toggleModal(ui.authModal, false);
        }
        if (e.target.id === 'show-register') {
            e.preventDefault();
            ui.toggleAuthForm('register');
        }
        if (e.target.id === 'show-login') {
            e.preventDefault();
            ui.toggleAuthForm('login');
        }
    });

    ui.authForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const mode = e.target.dataset.mode;
        const email = e.target.email.value;
        const password = e.target.password.value;
        if (mode === 'login') {
            auth.login(email, password);
        } else {
            const fullName = e.target.fullName.value;
            auth.register(email, password, fullName);
        }
    });

    // --- Report Hazard Modal ---
    const reportButton = document.getElementById("report-button-cta");
    if (reportButton) {
        reportButton.addEventListener("click", () => {
            ui.toggleModal(ui.reportModal, true);
        });
    }
    
    ui.reportModal.addEventListener("click", (e) => {
        if (e.target.id === 'report-hazard-modal' || e.target.classList.contains('close-modal')) {
            ui.toggleModal(ui.reportModal, false);
        }
    });

    ui.reportForm.addEventListener("submit", hazardReporter.submit);
    
    // --- Image Preview for Report ---
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewContainer = document.getElementById('image-preview-container');

    if (imageInput) {
        imageInput.addEventListener('change', () => {
            const file = imageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.src = '#';
                imagePreviewContainer.style.display = 'none';
            }
        });
    }
}

// --- App Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    bindEventListeners();
    auth.init();
});
