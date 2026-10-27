import { api, authStorage } from './api.js';

// Application State
const state = {
    workshops: [],
    myEnrollments: [],
    topWorkshops: [],
    currentUser: authStorage.getUser(),
    activeTab: 'workshops', // 'workshops' | 'enrollments' | 'admin'
    searchQuery: '',
    selectedCategory: '',
    selectedExcelFile: null
};

// DOM Elements
const elements = {
    // Nav & Auth
    navBrand: document.getElementById('nav-brand'),
    tabWorkshops: document.getElementById('tab-workshops'),
    tabMyEnrollments: document.getElementById('tab-my-enrollments'),
    tabAdmin: document.getElementById('tab-admin'),
    navEnrollmentsBadge: document.getElementById('nav-enrollments-badge'),
    btnToggleTheme: document.getElementById('btn-toggle-theme'),
    iconThemeMoon: document.getElementById('icon-theme-moon'),
    iconThemeSun: document.getElementById('icon-theme-sun'),
    authGuest: document.getElementById('auth-guest'),
    authUser: document.getElementById('auth-user'),
    userAvatar: document.getElementById('user-avatar'),
    userDisplayName: document.getElementById('user-display-name'),
    userRoleBadge: document.getElementById('user-role-badge'),
    btnLogout: document.getElementById('btn-logout'),
    btnOpenLogin: document.getElementById('btn-open-login'),
    btnOpenRegister: document.getElementById('btn-open-register'),

    // Views
    viewWorkshops: document.getElementById('view-workshops'),
    viewEnrollments: document.getElementById('view-enrollments'),
    viewAdmin: document.getElementById('view-admin'),

    // Catalog View
    workshopsGrid: document.getElementById('workshops-grid'),
    workshopsEmpty: document.getElementById('workshops-empty'),
    workshopsCountDisplay: document.getElementById('workshops-count-display'),
    inputSearch: document.getElementById('input-search'),
    selectCategory: document.getElementById('select-category'),
    btnResetFilters: document.getElementById('btn-reset-filters'),

    // Enrollments View
    enrollmentsList: document.getElementById('enrollments-list'),
    enrollmentsEmpty: document.getElementById('enrollments-empty'),
    btnBackToCatalog: document.getElementById('btn-back-to-catalog'),
    btnEmptyExplore: document.getElementById('btn-empty-explore'),

    // Admin View
    btnAdminRefresh: document.getElementById('btn-admin-refresh'),
    excelDropzone: document.getElementById('excel-dropzone'),
    excelFileInput: document.getElementById('excel-file-input'),
    excelFileName: document.getElementById('excel-file-name'),
    btnUploadExcel: document.getElementById('btn-upload-excel'),
    excelResultsContainer: document.getElementById('excel-results-container'),
    statExcelTotal: document.getElementById('stat-excel-total'),
    statExcelSuccess: document.getElementById('stat-excel-success'),
    statExcelRejected: document.getElementById('stat-excel-rejected'),
    excelRejectedWrapper: document.getElementById('excel-rejected-wrapper'),
    excelRejectedTbody: document.getElementById('excel-rejected-tbody'),
    topWorkshopsList: document.getElementById('top-workshops-list'),

    // Modal Auth
    modalAuth: document.getElementById('modal-auth'),
    tabLogin: document.getElementById('tab-login'),
    tabRegister: document.getElementById('tab-register'),
    formLogin: document.getElementById('form-login'),
    formRegister: document.getElementById('form-register'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnDemoParticipant: document.getElementById('btn-demo-participant'),
    btnDemoEmployee: document.getElementById('btn-demo-employee'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    regName: document.getElementById('reg-name'),
    regEmail: document.getElementById('reg-email'),
    regPassword: document.getElementById('reg-password')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    setupEventListeners();
    updateAuthUI();
    await loadWorkshops();
    if (authStorage.isAuthenticated()) {
        await loadMyEnrollments();
    }
    refreshLucideIcons();
});

// Theme Management (Dark Mode)
function initTheme() {
    const savedTheme = localStorage.getItem('skillhub_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcon();
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('skillhub_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    if (elements.iconThemeMoon && elements.iconThemeSun) {
        if (isDark) {
            elements.iconThemeMoon.classList.add('hidden');
            elements.iconThemeSun.classList.remove('hidden');
        } else {
            elements.iconThemeMoon.classList.remove('hidden');
            elements.iconThemeSun.classList.add('hidden');
        }
    }
    refreshLucideIcons();
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme Toggle
    elements.btnToggleTheme?.addEventListener('click', toggleTheme);

    // Navigation Tabs
    elements.navBrand?.addEventListener('click', () => switchTab('workshops'));
    elements.tabWorkshops?.addEventListener('click', () => switchTab('workshops'));
    elements.tabMyEnrollments?.addEventListener('click', () => {
        if (!authStorage.isAuthenticated()) {
            openAuthModal('login');
            showToast('info', 'Inicia sesión para ver tus inscripciones.');
            return;
        }
        switchTab('enrollments');
    });
    elements.tabAdmin?.addEventListener('click', () => switchTab('admin'));
    elements.btnBackToCatalog?.addEventListener('click', () => switchTab('workshops'));
    elements.btnEmptyExplore?.addEventListener('click', () => switchTab('workshops'));
    elements.btnAdminRefresh?.addEventListener('click', loadAdminData);

    // Search & Filter
    elements.inputSearch?.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderWorkshops();
    });
    elements.selectCategory?.addEventListener('change', (e) => {
        state.selectedCategory = e.target.value.trim();
        renderWorkshops();
    });
    elements.btnResetFilters?.addEventListener('click', () => {
        if (elements.inputSearch) elements.inputSearch.value = '';
        if (elements.selectCategory) elements.selectCategory.value = '';
        state.searchQuery = '';
        state.selectedCategory = '';
        renderWorkshops();
    });

    // Auth Modal
    elements.btnOpenLogin?.addEventListener('click', () => openAuthModal('login'));
    elements.btnOpenRegister?.addEventListener('click', () => openAuthModal('register'));
    elements.btnCloseModal?.addEventListener('click', closeAuthModal);
    elements.modalAuth?.addEventListener('click', (e) => {
        if (e.target === elements.modalAuth) closeAuthModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.modalAuth?.classList.contains('hidden')) {
            closeAuthModal();
        }
    });

    elements.tabLogin?.addEventListener('click', () => setAuthTab('login'));
    elements.tabRegister?.addEventListener('click', () => setAuthTab('register'));

    // Forms
    elements.formLogin?.addEventListener('submit', handleLogin);
    elements.formRegister?.addEventListener('submit', handleRegister);
    elements.btnLogout?.addEventListener('click', handleLogout);

    // Demo Fill Shortcuts
    elements.btnDemoParticipant?.addEventListener('click', () => {
        if (elements.loginEmail && elements.loginPassword) {
            elements.loginEmail.value = 'jorge.perez@correo.com';
            elements.loginPassword.value = 'Skillhub2026*';
        }
    });
    elements.btnDemoEmployee?.addEventListener('click', () => {
        if (elements.loginEmail && elements.loginPassword) {
            elements.loginEmail.value = 'andres.mejia@correo.com';
            elements.loginPassword.value = 'Instructor2026*';
        }
    });

    // Admin Excel Drag & Drop
    setupExcelDropzone();

    // Global event when auth changes
    window.addEventListener('auth-changed', async () => {
        state.currentUser = authStorage.getUser();
        updateAuthUI();
        if (authStorage.isAuthenticated()) {
            await loadMyEnrollments();
            if (authStorage.isEmployee() && state.activeTab === 'admin') {
                await loadAdminData();
            }
        } else {
            state.myEnrollments = [];
            switchTab('workshops');
        }
        await loadWorkshops();
    });
}

// UI Switcher between Tabs
function switchTab(tab) {
    state.activeTab = tab;

    // Reset tab active styles
    const tabs = [elements.tabWorkshops, elements.tabMyEnrollments, elements.tabAdmin];
    tabs.forEach(t => {
        if (!t) return;
        t.classList.remove('text-brand-600', 'dark:text-brand-400', 'bg-brand-50', 'dark:bg-brand-950/60');
        t.classList.add('text-slate-600', 'dark:text-slate-300');
    });

    // Hide all views
    elements.viewWorkshops?.classList.add('hidden');
    elements.viewEnrollments?.classList.add('hidden');
    elements.viewAdmin?.classList.add('hidden');

    if (tab === 'workshops') {
        elements.viewWorkshops?.classList.remove('hidden');
        elements.tabWorkshops?.classList.add('text-brand-600', 'dark:text-brand-400', 'bg-brand-50', 'dark:bg-brand-950/60');
        elements.tabWorkshops?.classList.remove('text-slate-600', 'dark:text-slate-300');
    } else if (tab === 'enrollments') {
        elements.viewEnrollments?.classList.remove('hidden');
        elements.tabMyEnrollments?.classList.add('text-brand-600', 'dark:text-brand-400', 'bg-brand-50', 'dark:bg-brand-950/60');
        elements.tabMyEnrollments?.classList.remove('text-slate-600', 'dark:text-slate-300');
        renderEnrollments();
    } else if (tab === 'admin') {
        elements.viewAdmin?.classList.remove('hidden');
        elements.tabAdmin?.classList.add('text-amber-600', 'dark:text-amber-400', 'bg-amber-50', 'dark:bg-amber-950/40');
        elements.tabAdmin?.classList.remove('text-slate-600', 'dark:text-slate-300');
        loadAdminData();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshLucideIcons();
}

// Update Auth UI Elements
function updateAuthUI() {
    const isAuth = authStorage.isAuthenticated();
    const user = state.currentUser;
    const isEmp = authStorage.isEmployee();

    if (isAuth && user) {
        elements.authGuest?.classList.add('hidden');
        elements.authUser?.classList.remove('hidden');

        if (elements.userDisplayName) elements.userDisplayName.textContent = user.fullName || user.email;
        if (elements.userRoleBadge) {
            elements.userRoleBadge.textContent = isEmp ? 'Instructor / Admin' : 'Participante';
            elements.userRoleBadge.className = isEmp
                ? 'text-[10px] text-amber-600 dark:text-amber-400 font-bold leading-none'
                : 'text-[10px] text-brand-600 dark:text-brand-400 font-medium leading-none';
        }
        if (elements.userAvatar) {
            elements.userAvatar.textContent = (user.fullName || user.email).charAt(0).toUpperCase();
            elements.userAvatar.className = isEmp
                ? 'w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold'
                : 'w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold';
        }

        // Show/hide Admin tab
        if (isEmp) {
            elements.tabAdmin?.classList.remove('hidden');
        } else {
            elements.tabAdmin?.classList.add('hidden');
            if (state.activeTab === 'admin') switchTab('workshops');
        }
    } else {
        elements.authGuest?.classList.remove('hidden');
        elements.authUser?.classList.add('hidden');
        elements.tabAdmin?.classList.add('hidden');
        if (elements.navEnrollmentsBadge) elements.navEnrollmentsBadge.classList.add('hidden');
    }
}

// Load Workshops from API
async function loadWorkshops() {
    try {
        state.workshops = await api.getUpcomingWorkshops();
        renderWorkshops();
    } catch (err) {
        console.error('Error loading workshops:', err);
        showToast('error', 'No se pudieron cargar los talleres. Revisa que el backend esté ejecutándose.');
    }
}

// Load User Enrollments from API
async function loadMyEnrollments() {
    try {
        state.myEnrollments = await api.getMyEnrollments();
        const activeCount = state.myEnrollments.filter(e => e.status === 1).length;
        if (elements.navEnrollmentsBadge) {
            if (activeCount > 0) {
                elements.navEnrollmentsBadge.textContent = activeCount;
                elements.navEnrollmentsBadge.classList.remove('hidden');
            } else {
                elements.navEnrollmentsBadge.classList.add('hidden');
            }
        }
        renderEnrollments();
    } catch (err) {
        console.error('Error loading enrollments:', err);
    }
}

// Category Theme Mapping (Visual Polish)
function getCategoryTheme(specialty, title) {
    const text = `${specialty || ''} ${title || ''}`.toLowerCase();

    if (text.includes('foto')) {
        return {
            gradient: 'from-blue-600 to-indigo-600',
            bgLight: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            icon: 'camera',
            label: 'Fotografía'
        };
    }
    if (text.includes('coci') || text.includes('repos')) {
        return {
            gradient: 'from-amber-600 to-orange-600',
            bgLight: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
            icon: 'utensils',
            label: 'Cocina'
        };
    }
    if (text.includes('ora') || text.includes('prese')) {
        return {
            gradient: 'from-purple-600 to-violet-600',
            bgLight: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
            icon: 'mic',
            label: 'Oratoria'
        };
    }
    if (text.includes('mús') || text.includes('guit') || text.includes('prod')) {
        return {
            gradient: 'from-rose-600 to-pink-600',
            bgLight: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            icon: 'music',
            label: 'Música'
        };
    }
    if (text.includes('dise') || text.includes('canva') || text.includes('color')) {
        return {
            gradient: 'from-teal-600 to-cyan-600',
            bgLight: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
            icon: 'palette',
            label: 'Diseño Gráfico'
        };
    }
    return {
        gradient: 'from-emerald-600 to-teal-600',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: 'trending-up',
        label: 'Marketing Digital'
    };
}

// Render Workshop Cards with Themed Headers and Capacity Progress Bars
function renderWorkshops() {
    if (!elements.workshopsGrid) return;

    let filtered = state.workshops;

    if (state.searchQuery) {
        filtered = filtered.filter(w =>
            w.title.toLowerCase().includes(state.searchQuery) ||
            w.description.toLowerCase().includes(state.searchQuery) ||
            w.instructorName.toLowerCase().includes(state.searchQuery) ||
            w.code.toLowerCase().includes(state.searchQuery)
        );
    }

    if (state.selectedCategory) {
        filtered = filtered.filter(w =>
            (w.instructorSpecialty && w.instructorSpecialty.toLowerCase().includes(state.selectedCategory.toLowerCase())) ||
            w.title.toLowerCase().includes(state.selectedCategory.toLowerCase())
        );
    }

    if (elements.workshopsCountDisplay) {
        elements.workshopsCountDisplay.textContent = `${filtered.length} taller${filtered.length === 1 ? '' : 'es'} disponible${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
        elements.workshopsGrid.innerHTML = '';
        elements.workshopsEmpty?.classList.remove('hidden');
        return;
    }

    elements.workshopsEmpty?.classList.add('hidden');

    elements.workshopsGrid.innerHTML = filtered.map(w => {
        const isEnrolled = state.myEnrollments.some(e => e.workshopId === w.id && e.status === 1);
        const hasSeats = w.availableSeats > 0;
        const theme = getCategoryTheme(w.instructorSpecialty, w.title);

        const occupied = w.capacity - w.availableSeats;
        const occupancyPct = Math.round((occupied / w.capacity) * 100);

        let badgeClass = 'badge-available';
        let badgeText = `${w.availableSeats} cupos libres`;
        let pulseClass = '';
        let barColor = 'bg-emerald-500';

        if (w.availableSeats === 0) {
            badgeClass = 'badge-full';
            badgeText = 'Agotado';
            barColor = 'bg-rose-500';
        } else if (w.availableSeats <= 3) {
            badgeClass = 'badge-low';
            badgeText = `¡Últimos ${w.availableSeats} cupos!`;
            pulseClass = 'badge-pulse';
            barColor = 'bg-amber-500';
        }

        const startDate = new Date(w.startDateTime);
        const endDate = new Date(w.endDateTime);
        const dateFormatted = startDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const timeFormatted = `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} — ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

        return `
            <div class="workshop-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-sm">
                <!-- Themed Top Banner -->
                <div class="h-2.5 bg-gradient-to-r ${theme.gradient}"></div>

                <div class="p-6 space-y-4">
                    <!-- Header with Code & Availability Pill -->
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5">
                            <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded tracking-wider">
                                ${w.code}
                            </span>
                            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full border ${theme.bgLight} flex items-center gap-1">
                                <i data-lucide="${theme.icon}" class="w-3 h-3"></i>
                                ${theme.label}
                            </span>
                        </div>
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass} ${pulseClass} flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full ${w.availableSeats === 0 ? 'bg-rose-500' : (w.availableSeats <= 3 ? 'bg-amber-500' : 'bg-emerald-500')}"></span>
                            ${badgeText}
                        </span>
                    </div>

                    <!-- Workshop Title & Description -->
                    <div class="space-y-1.5">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                            ${escapeHtml(w.title)}
                        </h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            ${escapeHtml(w.description)}
                        </p>
                    </div>

                    <!-- Occupancy Progress Bar -->
                    <div class="space-y-1 pt-1">
                        <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>Ocupación de cupos:</span>
                            <span class="font-semibold text-slate-700 dark:text-slate-300">${occupied}/${w.capacity} (${occupancyPct}%)</span>
                        </div>
                        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div class="${barColor} h-full rounded-full progress-bar-fill" style="width: ${occupancyPct}%"></div>
                        </div>
                    </div>

                    <!-- Workshop Schedule Details -->
                    <div class="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <div class="flex items-center gap-2">
                            <i data-lucide="calendar" class="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0"></i>
                            <span class="font-medium text-slate-800 dark:text-slate-200 capitalize">${dateFormatted}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="clock" class="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0"></i>
                            <span>${timeFormatted}</span>
                        </div>
                    </div>

                    <!-- Instructor Attribution -->
                    <div class="flex items-center gap-2.5 pt-1">
                        <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                            ${escapeHtml(w.instructorName.charAt(0))}
                        </div>
                        <div class="text-left">
                            <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">${escapeHtml(w.instructorName)}</p>
                            <p class="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">${escapeHtml(w.instructorSpecialty || 'Instructor')}</p>
                        </div>
                    </div>
                </div>

                <!-- Card Action Footer -->
                <div class="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 mt-2">
                    <div class="pt-4">
                        ${getActionBtnHtml(w, isEnrolled, hasSeats)}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach click events for enroll buttons
    document.querySelectorAll('.btn-enroll-action').forEach(btn => {
        btn.addEventListener('click', () => handleEnrollClick(parseInt(btn.getAttribute('data-id'))));
    });

    refreshLucideIcons();
}

function getActionBtnHtml(w, isEnrolled, hasSeats) {
    if (isEnrolled) {
        return `
            <button disabled class="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-default">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600 dark:text-emerald-400"></i>
                Ya estás inscrito
            </button>
        `;
    }

    if (!hasSeats) {
        return `
            <button disabled class="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                <i data-lucide="ban" class="w-4 h-4"></i>
                Cupos Agotados
            </button>
        `;
    }

    return `
        <button data-id="${w.id}" class="btn-enroll-action w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:shadow shadow-brand-600/30 flex items-center justify-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            Inscribirme al Taller
        </button>
    `;
}

// Render Enrollments View with Live Countdown and Calendar Integration
function renderEnrollments() {
    if (!elements.enrollmentsList) return;

    if (state.myEnrollments.length === 0) {
        elements.enrollmentsList.innerHTML = '';
        elements.enrollmentsEmpty?.classList.remove('hidden');
        return;
    }

    elements.enrollmentsEmpty?.classList.add('hidden');

    elements.enrollmentsList.innerHTML = state.myEnrollments.map(e => {
        const isActive = e.status === 1;
        const startDate = new Date(e.startDateTime);
        const endDate = new Date(e.endDateTime);
        const enrolledDate = new Date(e.enrolledAt);

        const dateFormatted = startDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const timeFormatted = `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} — ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

        // Countdown logic for the 24h cancellation rule
        const { countdownHtml, canCancelNow } = getCancellationCountdown(startDate, isActive);

        // Google Calendar URL
        const gcalUrl = buildGoogleCalendarUrl(e.workshopTitle, e.workshopCode, startDate, endDate);

        return `
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <!-- Info Left -->
                <div class="space-y-2.5">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            ${escapeHtml(e.workshopCode)}
                        </span>
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}">
                            ${isActive ? '● Inscripción Activa' : '✕ Inscripción Cancelada'}
                        </span>
                        ${countdownHtml}
                    </div>

                    <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        ${escapeHtml(e.workshopTitle)}
                    </h3>

                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400"></i>
                            Instructor: <strong class="text-slate-700 dark:text-slate-200">${escapeHtml(e.instructorName)}</strong>
                        </span>
                        <span>•</span>
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i>
                            <span class="capitalize">${dateFormatted} (${timeFormatted})</span>
                        </span>
                        <span>•</span>
                        <span class="text-slate-400">Inscrito el ${enrolledDate.toLocaleDateString('es-ES')}</span>
                    </div>
                </div>

                <!-- Actions Right -->
                <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start md:self-auto">
                    ${isActive ? `
                        <a href="${gcalUrl}" target="_blank" title="Agregar a Google Calendar" class="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors">
                            <i data-lucide="calendar-plus" class="w-4 h-4 text-brand-600 dark:text-brand-400"></i>
                            <span class="hidden sm:inline">Calendario</span>
                        </a>

                        <button data-id="${e.id}" data-code="${e.workshopCode}" class="btn-download-pdf px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors">
                            <i data-lucide="file-down" class="w-4 h-4"></i>
                            Descargar PDF
                        </button>

                        <button data-id="${e.id}" data-title="${escapeHtml(e.workshopTitle)}" data-cancelable="${canCancelNow}" class="btn-cancel-enrollment px-3.5 py-2 ${canCancelNow ? 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'} rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors" ${!canCancelNow ? 'disabled' : ''}>
                            <i data-lucide="x-circle" class="w-4 h-4"></i>
                            ${canCancelNow ? 'Cancelar' : 'No cancelable (< 24h)'}
                        </button>
                    ` : `
                        <span class="text-xs text-slate-400 dark:text-slate-500 italic">
                            Cancelado el ${e.cancelledAt ? new Date(e.cancelledAt).toLocaleDateString('es-ES') : ''}
                        </span>
                    `}
                </div>
            </div>
        `;
    }).join('');

    // Attach PDF download handlers
    document.querySelectorAll('.btn-download-pdf').forEach(btn => {
        btn.addEventListener('click', () => handleDownloadPdf(btn.getAttribute('data-id'), btn.getAttribute('data-code')));
    });

    // Attach cancellation handlers
    document.querySelectorAll('.btn-cancel-enrollment').forEach(btn => {
        btn.addEventListener('click', () => handleCancelEnrollment(btn.getAttribute('data-id'), btn.getAttribute('data-title'), btn.getAttribute('data-cancelable') === 'true'));
    });

    refreshLucideIcons();
}

function getCancellationCountdown(startDate, isActive) {
    if (!isActive) return { countdownHtml: '', canCancelNow: false };

    const now = new Date();
    const deadline = new Date(startDate.getTime() - (24 * 60 * 60 * 1000));
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        const remHours = hours % 24;

        let timeStr = days > 0 ? `${days}d ${remHours}h` : `${hours} horas`;
        return {
            countdownHtml: `
                <span class="text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <i data-lucide="timer" class="w-3 h-3 text-amber-600 dark:text-amber-400"></i>
                    Plazo para cancelar: ${timeStr} restantes
                </span>
            `,
            canCancelNow: true
        };
    } else {
        return {
            countdownHtml: `
                <span class="text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                    <i data-lucide="alert-triangle" class="w-3 h-3 text-rose-600 dark:text-rose-400"></i>
                    Cancelación bloqueada (&lt; 24h restantes)
                </span>
            `,
            canCancelNow: false
        };
    }
}

function buildGoogleCalendarUrl(title, code, start, end) {
    const toIso = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const dates = `${toIso(start)}/${toIso(end)}`;
    const details = encodeURIComponent(`Taller presencial en SkillHub: ${title} (Código: ${code})`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${details}&location=SkillHub`;
}

// Handle Workshop Enrollment Action
async function handleEnrollClick(workshopId) {
    if (!authStorage.isAuthenticated()) {
        openAuthModal('login');
        showToast('info', 'Por favor inicia sesión o regístrate para inscribirte.');
        return;
    }

    const workshop = state.workshops.find(w => w.id === workshopId);
    if (!workshop) return;

    // SweetAlert Confirmation
    const result = await Swal.fire({
        title: 'Confirmar Inscripción',
        html: `¿Deseas asegurar tu cupo en el taller <strong>"${escapeHtml(workshop.title)}"</strong> dictado por <em>${escapeHtml(workshop.instructorName)}</em>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Sí, Inscribirme',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
        Swal.showLoading();
        await api.enroll(workshopId);

        // Confetti effect on success
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }

        await Swal.fire({
            title: '¡Inscripción Exitosa!',
            text: `Quedaste formalmente inscrito(a) en "${workshop.title}". Ya puedes descargar tu constancia en PDF.`,
            icon: 'success',
            confirmButtonColor: '#4f46e5'
        });

        await loadMyEnrollments();
        await loadWorkshops();
    } catch (err) {
        Swal.fire({
            title: 'No se pudo realizar la inscripción',
            text: err.message,
            icon: 'warning',
            confirmButtonColor: '#4f46e5'
        });
    }
}

// Handle PDF Download
async function handleDownloadPdf(enrollmentId, code) {
    try {
        showToast('info', 'Generando constancia oficial en PDF...');
        await api.downloadCertificate(enrollmentId, code);
        showToast('success', 'Descarga completada con éxito.');
    } catch (err) {
        Swal.fire({
            title: 'Error de descarga',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    }
}

// Handle Cancel Enrollment
async function handleCancelEnrollment(enrollmentId, title, canCancel) {
    if (!canCancel && !authStorage.isEmployee()) {
        Swal.fire({
            title: 'Cancelación fuera de plazo',
            text: 'Como participante, solo puedes cancelar hasta 24 horas antes del inicio del taller.',
            icon: 'warning',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }

    const confirm = await Swal.fire({
        title: '¿Deseas cancelar tu inscripción?',
        html: `Estás a punto de cancelar tu inscripción en <strong>"${escapeHtml(title)}"</strong>.<br><br><span class="text-xs text-rose-600 dark:text-rose-400 font-semibold">Tu cupo será liberado inmediatamente para otro participante.</span>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Sí, liberar mi cupo',
        cancelButtonText: 'Mantener inscripción'
    });

    if (!confirm.isConfirmed) return;

    try {
        Swal.showLoading();
        await api.cancelEnrollment(enrollmentId);

        await Swal.fire({
            title: 'Inscripción Cancelada',
            text: 'Tu inscripción ha sido cancelada y el cupo quedó liberado.',
            icon: 'success',
            confirmButtonColor: '#4f46e5'
        });

        await loadMyEnrollments();
        await loadWorkshops();
    } catch (err) {
        Swal.fire({
            title: 'Error al cancelar',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    }
}

// Admin / Employee Features
function setupExcelDropzone() {
    const dropzone = elements.excelDropzone;
    const fileInput = elements.excelFileInput;
    const fileNameDisplay = elements.excelFileName;
    const uploadBtn = elements.btnUploadExcel;

    dropzone?.addEventListener('click', () => fileInput?.click());

    dropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dropzone-active');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropzone?.addEventListener(type, () => dropzone.classList.remove('dropzone-active'));
    });

    dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dropzone-active');
        if (e.dataTransfer.files?.length > 0) {
            handleSelectedExcelFile(e.dataTransfer.files[0]);
        }
    });

    fileInput?.addEventListener('change', (e) => {
        if (e.target.files?.length > 0) {
            handleSelectedExcelFile(e.target.files[0]);
        }
    });

    uploadBtn?.addEventListener('click', handleUploadExcel);
}

function handleSelectedExcelFile(file) {
    if (!file.name.endsWith('.xlsx')) {
        showToast('error', 'Por favor selecciona un archivo con extensión .xlsx');
        return;
    }
    state.selectedExcelFile = file;
    if (elements.excelFileName) {
        elements.excelFileName.innerHTML = `<strong>Archivo seleccionado:</strong> ${escapeHtml(file.name)} (${(file.size / 1024).toFixed(1)} KB)`;
    }
    if (elements.btnUploadExcel) elements.btnUploadExcel.disabled = false;
}

async function handleUploadExcel() {
    if (!state.selectedExcelFile) return;

    try {
        if (elements.btnUploadExcel) elements.btnUploadExcel.disabled = true;
        showToast('info', 'Procesando archivo Excel...');

        const result = await api.importEnrollmentsExcel(state.selectedExcelFile);

        // Render Results
        if (elements.excelResultsContainer) elements.excelResultsContainer.classList.remove('hidden');
        if (elements.statExcelTotal) elements.statExcelTotal.textContent = result.totalRows;
        if (elements.statExcelSuccess) elements.statExcelSuccess.textContent = result.successfulCount;
        if (elements.statExcelRejected) elements.statExcelRejected.textContent = result.rejectedCount;

        if (elements.excelRejectedWrapper && elements.excelRejectedTbody) {
            if (result.rejectedCount > 0) {
                elements.excelRejectedWrapper.classList.remove('hidden');
                elements.excelRejectedTbody.innerHTML = result.rejectedDetails.map(d => `
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td class="p-2 font-mono font-bold text-slate-700 dark:text-slate-300">#${d.rowNumber}</td>
                        <td class="p-2 text-slate-600 dark:text-slate-300">${escapeHtml(d.participantEmail)}</td>
                        <td class="p-2 font-mono text-slate-700 dark:text-slate-300">${escapeHtml(d.workshopCode)}</td>
                        <td class="p-2 text-rose-600 dark:text-rose-400 font-medium">${escapeHtml(d.reason)}</td>
                    </tr>
                `).join('');
            } else {
                elements.excelRejectedWrapper.classList.add('hidden');
                elements.excelRejectedTbody.innerHTML = '';
            }
        }

        Swal.fire({
            title: 'Procesamiento Finalizado',
            text: `Se registraron ${result.successfulCount} inscripciones exitosamente y ${result.rejectedCount} filas fueron rechazadas.`,
            icon: result.successfulCount > 0 ? 'success' : 'info',
            confirmButtonColor: '#4f46e5'
        });

        await loadWorkshops();
        await loadAdminData();
    } catch (err) {
        Swal.fire({
            title: 'Error de importación',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    } finally {
        if (elements.btnUploadExcel) elements.btnUploadExcel.disabled = false;
    }
}

async function loadAdminData() {
    if (!authStorage.isEmployee()) return;

    try {
        state.topWorkshops = await api.getTopWorkshopsReport();
        renderTopWorkshops();
    } catch (err) {
        console.error('Error loading top workshops report:', err);
    }
}

function renderTopWorkshops() {
    if (!elements.topWorkshopsList) return;

    if (state.topWorkshops.length === 0) {
        elements.topWorkshopsList.innerHTML = '<p class="text-xs text-slate-400 p-4 text-center">No hay datos de demanda disponibles aún.</p>';
        return;
    }

    elements.topWorkshopsList.innerHTML = state.topWorkshops.map((w, index) => {
        const isTop3 = index < 3;
        const medalColors = ['text-amber-500', 'text-slate-400', 'text-amber-700'];

        return `
            <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-2 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center ${isTop3 ? medalColors[index] : 'text-slate-500'}">
                            ${index + 1}
                        </span>
                        <h4 class="text-xs font-bold text-slate-900 dark:text-white">${escapeHtml(w.title)}</h4>
                        <span class="text-[10px] font-mono text-slate-400">(${w.code})</span>
                    </div>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        ${w.activeEnrollmentsCount} activos
                    </span>
                </div>

                <div class="space-y-1">
                    <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Instructor: ${escapeHtml(w.instructorName)}</span>
                        <span>Ocupación: <strong>${w.occupancyRate}%</strong> (${w.activeEnrollmentsCount}/${w.capacity})</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full" style="width: ${Math.min(100, w.occupancyRate)}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    refreshLucideIcons();
}

// Auth Handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = elements.loginEmail?.value.trim();
    const password = elements.loginPassword?.value;

    try {
        const submitBtn = elements.formLogin?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        await api.login(email, password);
        closeAuthModal();
        showToast('success', `¡Bienvenido de nuevo, ${state.currentUser?.fullName || email}!`);
    } catch (err) {
        Swal.fire({
            title: 'Error de Acceso',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    } finally {
        const submitBtn = elements.formLogin?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const fullName = elements.regName?.value.trim();
    const email = elements.regEmail?.value.trim();
    const password = elements.regPassword?.value;

    try {
        const submitBtn = elements.formRegister?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        await api.register(fullName, email, password);
        closeAuthModal();
        showToast('success', `¡Cuenta creada exitosamente! Bienvenido a SkillHub, ${fullName}.`);
    } catch (err) {
        Swal.fire({
            title: 'Error de Registro',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    } finally {
        const submitBtn = elements.formRegister?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
    }
}

function handleLogout() {
    api.logout();
    showToast('info', 'Has cerrado sesión.');
}

// Auth Modal Helpers
function openAuthModal(tab = 'login') {
    setAuthTab(tab);
    elements.modalAuth?.classList.remove('hidden');
    refreshLucideIcons();
}

function closeAuthModal() {
    elements.modalAuth?.classList.add('hidden');
}

function setAuthTab(tab) {
    if (tab === 'login') {
        elements.tabLogin?.classList.add('text-brand-600', 'dark:text-brand-400', 'border-brand-600', 'dark:border-brand-400', 'bg-white', 'dark:bg-slate-900');
        elements.tabLogin?.classList.remove('text-slate-500', 'dark:text-slate-400');
        elements.tabRegister?.classList.remove('text-brand-600', 'dark:text-brand-400', 'border-brand-600', 'dark:border-brand-400', 'bg-white', 'dark:bg-slate-900');
        elements.tabRegister?.classList.add('text-slate-500', 'dark:text-slate-400');

        elements.formLogin?.classList.remove('hidden');
        elements.formRegister?.classList.add('hidden');
    } else {
        elements.tabRegister?.classList.add('text-brand-600', 'dark:text-brand-400', 'border-brand-600', 'dark:border-brand-400', 'bg-white', 'dark:bg-slate-900');
        elements.tabRegister?.classList.remove('text-slate-500', 'dark:text-slate-400');
        elements.tabLogin?.classList.remove('text-brand-600', 'dark:text-brand-400', 'border-brand-600', 'dark:border-brand-400', 'bg-white', 'dark:bg-slate-900');
        elements.tabLogin?.classList.add('text-slate-500', 'dark:text-slate-400');

        elements.formRegister?.classList.remove('hidden');
        elements.formLogin?.classList.add('hidden');
    }
    refreshLucideIcons();
}

// Helpers
function showToast(icon, title) {
    const isDark = document.documentElement.classList.contains('dark');
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a'
    });
    Toast.fire({ icon, title });
}

function refreshLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
