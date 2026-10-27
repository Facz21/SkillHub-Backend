import { api, authStorage } from './api.js';

// Application State
const state = {
    workshops: [],
    myEnrollments: [],
    topWorkshops: [],
    currentUser: authStorage.getUser(),
    activeTab: 'workshops', // 'workshops' | 'enrollments' | 'profile' | 'admin'
    searchQuery: '',
    selectedCategory: '',
    selectedExcelFile: null,
    selectedDetailWorkshop: null,
    // Admin & Instructor Suite
    adminSubtab: 'roster', // 'roster' | 'import' | 'demand'
    adminWorkshopSearch: '',
    adminWorkshopScope: 'all', // 'all' | 'mine'
    currentRosterWorkshop: null,
    currentRosterEnrollments: [],
    instructorsList: []
};

// DOM Elements
const elements = {
    // Nav & Auth
    navBrand: document.getElementById('nav-brand'),
    tabWorkshops: document.getElementById('tab-workshops'),
    tabMyEnrollments: document.getElementById('tab-my-enrollments'),
    tabProfile: document.getElementById('tab-profile'),
    btnUserProfile: document.getElementById('btn-user-profile'),
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
    viewProfile: document.getElementById('view-profile'),
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

    // Profile View
    btnProfileToCatalog: document.getElementById('btn-profile-to-catalog'),
    profileEmail: document.getElementById('profile-email'),
    profileFullName: document.getElementById('profile-fullname'),
    profileRole: document.getElementById('profile-role'),
    profileSpecialty: document.getElementById('profile-specialty'),
    formProfileInfo: document.getElementById('form-profile-info'),
    formProfilePassword: document.getElementById('form-profile-password'),
    profileCurrentPassword: document.getElementById('profile-current-password'),
    profileNewPassword: document.getElementById('profile-new-password'),
    profileConfirmPassword: document.getElementById('profile-confirm-password'),
    profileStatActive: document.getElementById('profile-stat-active'),
    profileStatCerts: document.getElementById('profile-stat-certs'),
    profileStatTotal: document.getElementById('profile-stat-total'),

    // Workshop Detail Modal (Platzi Style)
    modalWorkshopDetail: document.getElementById('modal-workshop-detail'),
    btnCloseWorkshopDetail: document.getElementById('btn-close-workshop-detail'),
    detailHero: document.getElementById('detail-hero'),
    detailSchoolBadge: document.getElementById('detail-school-badge'),
    detailCodeBadge: document.getElementById('detail-code-badge'),
    detailTitle: document.getElementById('detail-title'),
    detailDescription: document.getElementById('detail-description'),
    detailInstructorAvatar: document.getElementById('detail-instructor-avatar'),
    detailInstructorName: document.getElementById('detail-instructor-name'),
    detailInstructorSpecialty: document.getElementById('detail-instructor-specialty'),
    detailSchedule: document.getElementById('detail-schedule'),
    detailSyllabusContainer: document.getElementById('detail-syllabus-container'),
    detailSeatsCount: document.getElementById('detail-seats-count'),
    detailSeatsTotal: document.getElementById('detail-seats-total'),
    detailCapacityBar: document.getElementById('detail-capacity-bar'),
    detailActionAuth: document.getElementById('detail-action-auth'),
    detailActionGuest: document.getElementById('detail-action-guest'),
    btnDetailEnroll: document.getElementById('btn-detail-enroll'),
    formQuickEnroll: document.getElementById('form-quick-enroll'),
    quickName: document.getElementById('quick-name'),
    quickEmail: document.getElementById('quick-email'),
    quickPassword: document.getElementById('quick-password'),
    btnDetailSwitchLogin: document.getElementById('btn-detail-switch-login'),

    // Admin & Instructor Suite
    btnOpenCreateWorkshop: document.getElementById('btn-open-create-workshop'),
    btnAdminRefresh: document.getElementById('btn-admin-refresh'),
    statAdminWorkshops: document.getElementById('stat-admin-workshops'),
    statAdminStudents: document.getElementById('stat-admin-students'),
    statAdminSeats: document.getElementById('stat-admin-seats'),
    statAdminOccupancy: document.getElementById('stat-admin-occupancy'),
    subtabAdminRoster: document.getElementById('subtab-admin-roster'),
    subtabAdminImport: document.getElementById('subtab-admin-import'),
    subtabAdminDemand: document.getElementById('subtab-admin-demand'),
    adminSecRoster: document.getElementById('admin-sec-roster'),
    adminSecImport: document.getElementById('admin-sec-import'),
    adminSecDemand: document.getElementById('admin-sec-demand'),
    adminSearchWorkshop: document.getElementById('admin-search-workshop'),
    adminFilterScope: document.getElementById('admin-filter-scope'),
    adminWorkshopsTbody: document.getElementById('admin-workshops-tbody'),
    adminWorkshopsEmpty: document.getElementById('admin-workshops-empty'),
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

    // Create Workshop Modal
    modalCreateWorkshop: document.getElementById('modal-create-workshop'),
    btnCloseCreateWorkshop: document.getElementById('btn-close-create-workshop'),
    formCreateWorkshop: document.getElementById('form-create-workshop'),
    cwCode: document.getElementById('cw-code'),
    cwTitle: document.getElementById('cw-title'),
    cwDescription: document.getElementById('cw-description'),
    cwInstructor: document.getElementById('cw-instructor'),
    cwStart: document.getElementById('cw-start'),
    cwEnd: document.getElementById('cw-end'),
    cwCapacity: document.getElementById('cw-capacity'),

    // Workshop Roster Modal
    modalWorkshopRoster: document.getElementById('modal-workshop-roster'),
    btnCloseRoster: document.getElementById('btn-close-roster'),
    btnPrintRoster: document.getElementById('btn-print-roster'),
    rosterBadgeCode: document.getElementById('roster-badge-code'),
    rosterTitle: document.getElementById('roster-title'),
    rosterMeta: document.getElementById('roster-meta'),
    rosterStatTotal: document.getElementById('roster-stat-total'),
    rosterStatActive: document.getElementById('roster-stat-active'),
    rosterStatCancelled: document.getElementById('roster-stat-cancelled'),
    rosterTableBody: document.getElementById('roster-table-body'),
    rosterEmpty: document.getElementById('roster-empty'),
    printWorkshopInfo: document.getElementById('print-workshop-info'),
    printInstructorInfo: document.getElementById('print-instructor-info'),
    printDate: document.getElementById('print-date'),

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
async function initApp() {
    initTheme();
    setupEventListeners();
    updateAuthUI();
    await loadWorkshops();
    if (authStorage.isAuthenticated()) {
        await loadMyEnrollments();
    }
    refreshLucideIcons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

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
    elements.tabProfile?.addEventListener('click', () => switchTab('profile'));
    elements.btnUserProfile?.addEventListener('click', () => switchTab('profile'));
    elements.tabAdmin?.addEventListener('click', () => switchTab('admin'));
    elements.btnBackToCatalog?.addEventListener('click', () => switchTab('workshops'));
    elements.btnEmptyExplore?.addEventListener('click', () => switchTab('workshops'));
    elements.btnProfileToCatalog?.addEventListener('click', () => switchTab('workshops'));
    elements.btnAdminRefresh?.addEventListener('click', loadAdminData);

    // Admin & Instructor Controls
    elements.btnOpenCreateWorkshop?.addEventListener('click', openCreateWorkshopModal);
    elements.btnCloseCreateWorkshop?.addEventListener('click', closeCreateWorkshopModal);
    elements.modalCreateWorkshop?.addEventListener('click', (e) => {
        if (e.target === elements.modalCreateWorkshop) closeCreateWorkshopModal();
    });
    elements.formCreateWorkshop?.addEventListener('submit', handleCreateWorkshop);

    elements.subtabAdminRoster?.addEventListener('click', () => switchAdminSubtab('roster'));
    elements.subtabAdminImport?.addEventListener('click', () => switchAdminSubtab('import'));
    elements.subtabAdminDemand?.addEventListener('click', () => switchAdminSubtab('demand'));

    elements.adminSearchWorkshop?.addEventListener('input', (e) => {
        state.adminWorkshopSearch = e.target.value.toLowerCase().trim();
        renderAdminWorkshops();
    });
    elements.adminFilterScope?.addEventListener('change', (e) => {
        state.adminWorkshopScope = e.target.value;
        renderAdminWorkshops();
    });

    elements.btnCloseRoster?.addEventListener('click', closeWorkshopRoster);
    elements.modalWorkshopRoster?.addEventListener('click', (e) => {
        if (e.target === elements.modalWorkshopRoster) closeWorkshopRoster();
    });
    elements.btnPrintRoster?.addEventListener('click', handlePrintRoster);

    // Profile & Password Forms
    elements.formProfileInfo?.addEventListener('submit', handleUpdateProfile);
    elements.formProfilePassword?.addEventListener('submit', handleChangePassword);

    // Workshop Detail Modal
    elements.btnCloseWorkshopDetail?.addEventListener('click', closeWorkshopDetail);
    elements.modalWorkshopDetail?.addEventListener('click', (e) => {
        if (e.target === elements.modalWorkshopDetail) closeWorkshopDetail();
    });
    elements.btnDetailEnroll?.addEventListener('click', handleDetailEnroll);
    elements.formQuickEnroll?.addEventListener('submit', handleQuickEnroll);
    elements.btnDetailSwitchLogin?.addEventListener('click', () => {
        closeWorkshopDetail();
        openAuthModal('login');
    });

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
        if (e.key === 'Escape') {
            if (!elements.modalAuth?.classList.contains('hidden')) closeAuthModal();
            if (!elements.modalWorkshopDetail?.classList.contains('hidden')) closeWorkshopDetail();
            if (!elements.modalCreateWorkshop?.classList.contains('hidden')) closeCreateWorkshopModal();
            if (!elements.modalWorkshopRoster?.classList.contains('hidden')) closeWorkshopRoster();
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
    const tabs = [elements.tabWorkshops, elements.tabMyEnrollments, elements.tabProfile, elements.tabAdmin];
    tabs.forEach(t => {
        if (!t) return;
        t.classList.remove('text-brand-600', 'dark:text-brand-400', 'bg-brand-50', 'dark:bg-brand-950/60');
        t.classList.add('text-slate-600', 'dark:text-slate-300');
    });

    // Hide all views
    elements.viewWorkshops?.classList.add('hidden');
    elements.viewEnrollments?.classList.add('hidden');
    elements.viewProfile?.classList.add('hidden');
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
    } else if (tab === 'profile') {
        elements.viewProfile?.classList.remove('hidden');
        elements.tabProfile?.classList.add('text-brand-600', 'dark:text-brand-400', 'bg-brand-50', 'dark:bg-brand-950/60');
        elements.tabProfile?.classList.remove('text-slate-600', 'dark:text-slate-300');
        loadUserProfile();
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
        elements.tabProfile?.classList.remove('hidden');

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
        elements.tabProfile?.classList.add('hidden');
        elements.tabAdmin?.classList.add('hidden');
        if (elements.navEnrollmentsBadge) elements.navEnrollmentsBadge.classList.add('hidden');
        if (state.activeTab === 'profile') switchTab('workshops');
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
            <div class="workshop-card platzi-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between shadow-sm cursor-pointer group" data-card-id="${w.id}">
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
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 group-hover:text-emerald-500 transition-colors">
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
                            <i data-lucide="calendar" class="w-4 h-4 text-emerald-500 flex-shrink-0"></i>
                            <span class="font-medium text-slate-800 dark:text-slate-200 capitalize">${dateFormatted}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="clock" class="w-4 h-4 text-emerald-500 flex-shrink-0"></i>
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
                    <div class="pt-4 flex items-center gap-2">
                        <button data-detail-id="${w.id}" class="btn-card-detail flex-1 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5">
                            <i data-lucide="book-open" class="w-3.5 h-3.5 text-emerald-500"></i>
                            <span>Ver Detalle</span>
                        </button>
                        <div class="flex-[1.3]">
                            ${getActionBtnHtml(w, isEnrolled, hasSeats)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach click events for cards & buttons
    document.querySelectorAll('.workshop-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent triggering if clicked directly on an interactive button
            if (e.target.closest('.btn-enroll-action') || e.target.closest('.btn-card-detail')) return;
            const id = parseInt(card.getAttribute('data-card-id'));
            openWorkshopDetail(id);
        });
    });

    document.querySelectorAll('.btn-card-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-detail-id'));
            openWorkshopDetail(id);
        });
    });

    document.querySelectorAll('.btn-enroll-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleEnrollClick(parseInt(btn.getAttribute('data-id')));
        });
    });

    refreshLucideIcons();
}

function getActionBtnHtml(w, isEnrolled, hasSeats) {
    if (isEnrolled) {
        return `
            <button disabled class="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-default">
                <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"></i>
                Inscrito
            </button>
        `;
    }

    if (!hasSeats) {
        return `
            <button disabled class="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed">
                <i data-lucide="ban" class="w-3.5 h-3.5"></i>
                Agotado
            </button>
        `;
    }

    return `
        <button data-id="${w.id}" class="btn-enroll-action w-full py-2 px-3 btn-platzi active:scale-[0.98] text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            Inscribirme
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

// Admin & Instructor Suite Navigation
function switchAdminSubtab(subtab) {
    state.adminSubtab = subtab;

    const subtabs = [elements.subtabAdminRoster, elements.subtabAdminImport, elements.subtabAdminDemand];
    subtabs.forEach(st => {
        if (!st) return;
        st.classList.remove('text-amber-600', 'dark:text-amber-400', 'bg-amber-50', 'dark:bg-amber-950/60', 'border-amber-200', 'dark:border-amber-800');
        st.classList.add('text-slate-600', 'dark:text-slate-300');
    });

    elements.adminSecRoster?.classList.add('hidden');
    elements.adminSecImport?.classList.add('hidden');
    elements.adminSecDemand?.classList.add('hidden');

    if (subtab === 'roster') {
        elements.adminSecRoster?.classList.remove('hidden');
        elements.subtabAdminRoster?.classList.add('text-amber-600', 'dark:text-amber-400', 'bg-amber-50', 'dark:bg-amber-950/60', 'border-amber-200', 'dark:border-amber-800');
        elements.subtabAdminRoster?.classList.remove('text-slate-600', 'dark:text-slate-300');
        renderAdminWorkshops();
    } else if (subtab === 'import') {
        elements.adminSecImport?.classList.remove('hidden');
        elements.subtabAdminImport?.classList.add('text-amber-600', 'dark:text-amber-400', 'bg-amber-50', 'dark:bg-amber-950/60', 'border-amber-200', 'dark:border-amber-800');
        elements.subtabAdminImport?.classList.remove('text-slate-600', 'dark:text-slate-300');
    } else if (subtab === 'demand') {
        elements.adminSecDemand?.classList.remove('hidden');
        elements.subtabAdminDemand?.classList.add('text-amber-600', 'dark:text-amber-400', 'bg-amber-50', 'dark:bg-amber-950/60', 'border-amber-200', 'dark:border-amber-800');
        elements.subtabAdminDemand?.classList.remove('text-slate-600', 'dark:text-slate-300');
        renderTopWorkshops();
    }
    refreshLucideIcons();
}

async function loadAdminData() {
    if (!authStorage.isEmployee()) return;

    try {
        const [workshops, topWorkshops] = await Promise.all([
            api.getUpcomingWorkshops(),
            api.getTopWorkshopsReport()
        ]);

        state.workshops = workshops;
        state.topWorkshops = topWorkshops;

        // Calculate and render KPIs
        const totalWorkshops = workshops.length;
        const totalActiveStudents = workshops.reduce((acc, w) => acc + (w.activeEnrollmentsCount || 0), 0);
        const totalSeats = workshops.reduce((acc, w) => acc + (w.capacity || 0), 0);
        const totalFreeSeats = workshops.reduce((acc, w) => acc + (w.availableSeats || 0), 0);
        const occupancyRate = totalSeats > 0 ? Math.round((totalActiveStudents / totalSeats) * 100) : 0;

        if (elements.statAdminWorkshops) elements.statAdminWorkshops.textContent = totalWorkshops;
        if (elements.statAdminStudents) elements.statAdminStudents.textContent = totalActiveStudents;
        if (elements.statAdminSeats) elements.statAdminSeats.textContent = totalFreeSeats;
        if (elements.statAdminOccupancy) elements.statAdminOccupancy.textContent = `${occupancyRate}%`;

        renderAdminWorkshops();
        renderTopWorkshops();
    } catch (err) {
        console.error('Error loading admin data:', err);
    }
}

function renderAdminWorkshops() {
    if (!elements.adminWorkshopsTbody) return;

    let filtered = state.workshops || [];

    // Filter by search query
    if (state.adminWorkshopSearch) {
        const q = state.adminWorkshopSearch;
        filtered = filtered.filter(w =>
            w.code.toLowerCase().includes(q) ||
            w.title.toLowerCase().includes(q) ||
            w.instructorName.toLowerCase().includes(q)
        );
    }

    // Filter by scope (All vs Mine)
    if (state.adminWorkshopScope === 'mine') {
        const myEmail = state.currentUser?.email?.toLowerCase();
        filtered = filtered.filter(w => w.instructorEmail?.toLowerCase() === myEmail);
    }

    if (filtered.length === 0) {
        elements.adminWorkshopsTbody.innerHTML = '';
        elements.adminWorkshopsEmpty?.classList.remove('hidden');
        return;
    }

    elements.adminWorkshopsEmpty?.classList.add('hidden');

    elements.adminWorkshopsTbody.innerHTML = filtered.map(w => {
        const theme = getCategoryTheme(w.instructorSpecialty, w.title);
        const occupied = w.capacity - w.availableSeats;
        const occupancyPct = Math.round((occupied / w.capacity) * 100);

        const startDate = new Date(w.startDateTime);
        const endDate = new Date(w.endDateTime);
        const dateFormatted = startDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
        const timeFormatted = `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td class="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                    <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">${w.code}</span>
                </td>
                <td class="p-3.5">
                    <div class="space-y-0.5">
                        <p class="font-bold text-slate-800 dark:text-slate-100 leading-snug">${escapeHtml(w.title)}</p>
                        <span class="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${theme.bgLight}">
                            <i data-lucide="${theme.icon}" class="w-3 h-3"></i>
                            ${theme.label}
                        </span>
                    </div>
                </td>
                <td class="p-3.5 text-slate-700 dark:text-slate-300">
                    <p class="font-medium leading-none">${escapeHtml(w.instructorName)}</p>
                    <span class="text-[10px] text-slate-400">${escapeHtml(w.instructorEmail)}</span>
                </td>
                <td class="p-3.5 text-slate-600 dark:text-slate-300">
                    <p class="font-medium capitalize leading-none">${dateFormatted}</p>
                    <span class="text-[10px] text-slate-400">${timeFormatted}</span>
                </td>
                <td class="p-3.5">
                    <div class="space-y-1 w-28">
                        <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            <span>${occupied}/${w.capacity}</span>
                            <span>${occupancyPct}%</span>
                        </div>
                        <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div class="${w.availableSeats === 0 ? 'bg-rose-500' : (w.availableSeats <= 3 ? 'bg-amber-500' : 'bg-emerald-500')} h-full rounded-full" style="width: ${occupancyPct}%"></div>
                        </div>
                    </div>
                </td>
                <td class="p-3.5 text-right">
                    <button data-roster-id="${w.id}" class="btn-admin-roster inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800 rounded-xl transition-all shadow-sm">
                        <i data-lucide="users" class="w-3.5 h-3.5 text-emerald-500"></i>
                        <span>Ver Roster</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Attach click events to open roster
    document.querySelectorAll('.btn-admin-roster').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-roster-id'));
            openWorkshopRoster(id);
        });
    });

    refreshLucideIcons();
}

// Create / Publish Workshop Modal Handlers
async function openCreateWorkshopModal() {
    if (!elements.modalCreateWorkshop) return;

    try {
        if (elements.cwInstructor) {
            elements.cwInstructor.innerHTML = '<option value="">Cargando instructores...</option>';
            const instructors = await api.getInstructors();
            state.instructorsList = instructors;

            elements.cwInstructor.innerHTML = '<option value="">Selecciona el instructor...</option>' +
                instructors.map(i => `
                    <option value="${escapeHtml(i.email)}" ${i.email === state.currentUser?.email ? 'selected' : ''}>
                        ${escapeHtml(i.fullName)} (${escapeHtml(i.specialty || 'Instructor')}) — ${escapeHtml(i.email)}
                    </option>
                `).join('');
        }

        // Set default dates (tomorrow 09:00 to 12:00)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(12, 0, 0, 0);

        const formatForInput = (d) => {
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        if (elements.cwStart) elements.cwStart.value = formatForInput(tomorrow);
        if (elements.cwEnd) elements.cwEnd.value = formatForInput(tomorrowEnd);

        elements.modalCreateWorkshop.classList.remove('hidden');
        refreshLucideIcons();
    } catch (err) {
        console.error('Error opening create workshop modal:', err);
        showToast('error', 'Error al preparar el formulario de publicación.');
    }
}

function closeCreateWorkshopModal() {
    elements.modalCreateWorkshop?.classList.add('hidden');
    elements.formCreateWorkshop?.reset();
}

async function handleCreateWorkshop(e) {
    e.preventDefault();

    const code = elements.cwCode?.value.trim().toUpperCase();
    const title = elements.cwTitle?.value.trim();
    const description = elements.cwDescription?.value.trim();
    const instructorEmail = elements.cwInstructor?.value.trim();
    const startVal = elements.cwStart?.value;
    const endVal = elements.cwEnd?.value;
    const capacity = parseInt(elements.cwCapacity?.value || '15');

    if (!code || !title || !description || !instructorEmail || !startVal || !endVal) {
        showToast('error', 'Por favor completa todos los campos del taller.');
        return;
    }

    const startDateTime = new Date(startVal).toISOString();
    const endDateTime = new Date(endVal).toISOString();

    const submitBtn = elements.formCreateWorkshop?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        await api.createWorkshop({
            code,
            title,
            description,
            instructorEmail,
            startDateTime,
            endDateTime,
            capacity
        });

        closeCreateWorkshopModal();

        Swal.fire({
            title: '¡Taller Publicado con Éxito!',
            html: `El taller <strong>${escapeHtml(title)}</strong> (<code>${code}</code>) ya se encuentra activo en el catálogo público y disponible para inscripciones.`,
            icon: 'success',
            confirmButtonColor: '#00d074'
        });

        await loadWorkshops();
        await loadAdminData();
    } catch (err) {
        Swal.fire({
            title: 'No se pudo publicar el taller',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// Workshop Attendance Roster Modal Handlers
async function openWorkshopRoster(workshopId) {
    const workshop = state.workshops.find(w => w.id === workshopId);
    if (!workshop) return;

    state.currentRosterWorkshop = workshop;

    const startDate = new Date(workshop.startDateTime);
    const endDate = new Date(workshop.endDateTime);
    const dateFormatted = startDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeFormatted = `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

    if (elements.rosterBadgeCode) elements.rosterBadgeCode.textContent = workshop.code;
    if (elements.rosterTitle) elements.rosterTitle.textContent = workshop.title;
    if (elements.rosterMeta) elements.rosterMeta.textContent = `Profesor: ${workshop.instructorName} · ${dateFormatted} (${timeFormatted})`;

    // Printable elements
    if (elements.printWorkshopInfo) elements.printWorkshopInfo.textContent = `Taller: ${workshop.code} - ${workshop.title} (${dateFormatted}, ${timeFormatted})`;
    if (elements.printInstructorInfo) elements.printInstructorInfo.textContent = `Instructor: ${workshop.instructorName} (${workshop.instructorEmail})`;
    if (elements.printDate) elements.printDate.textContent = `Generado el: ${new Date().toLocaleString('es-ES')}`;

    try {
        const enrollments = await api.getWorkshopEnrollments(workshopId);
        state.currentRosterEnrollments = enrollments;

        const total = enrollments.length;
        const active = enrollments.filter(e => e.status === 1).length;
        const cancelled = enrollments.filter(e => e.status === 2).length;

        if (elements.rosterStatTotal) elements.rosterStatTotal.textContent = total;
        if (elements.rosterStatActive) elements.rosterStatActive.textContent = active;
        if (elements.rosterStatCancelled) elements.rosterStatCancelled.textContent = cancelled;

        renderRosterTable(enrollments);

        elements.modalWorkshopRoster?.classList.remove('hidden');
        refreshLucideIcons();
    } catch (err) {
        console.error('Error fetching workshop roster:', err);
        showToast('error', 'Error al cargar los inscritos del taller.');
    }
}

function renderRosterTable(enrollments) {
    if (!elements.rosterTableBody) return;

    if (enrollments.length === 0) {
        elements.rosterTableBody.innerHTML = '';
        elements.rosterEmpty?.classList.remove('hidden');
        return;
    }

    elements.rosterEmpty?.classList.add('hidden');

    elements.rosterTableBody.innerHTML = enrollments.map((e, index) => {
        const isActive = e.status === 1;
        const enrolledDate = new Date(e.enrolledAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        return `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <td class="p-3 text-slate-400 font-mono font-medium">${index + 1}</td>
                <td class="p-3">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold no-print">
                            ${escapeHtml(e.participantName.charAt(0))}
                        </div>
                        <span class="font-semibold text-slate-800 dark:text-slate-200">${escapeHtml(e.participantName)}</span>
                    </div>
                </td>
                <td class="p-3 font-mono text-slate-600 dark:text-slate-300">${escapeHtml(e.participantEmail)}</td>
                <td class="p-3 text-slate-500 dark:text-slate-400">${enrolledDate}</td>
                <td class="p-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}">
                        ${isActive ? 'Activo' : 'Cancelado'}
                    </span>
                </td>
                <td class="p-3 hidden print:table-cell border-b border-gray-300">
                    <div class="w-28 h-6 border-b border-dashed border-gray-400"></div>
                </td>
                <td class="p-3 text-right no-print">
                    <div class="inline-flex items-center gap-1.5">
                        ${isActive ? `
                            <button data-cert-id="${e.enrollmentId}" data-name="${escapeHtml(e.participantName)}" title="Descargar constancia oficial en PDF" class="btn-roster-cert p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors">
                                <i data-lucide="award" class="w-4 h-4"></i>
                            </button>
                            <button data-cancel-id="${e.enrollmentId}" data-name="${escapeHtml(e.participantName)}" title="Cancelar inscripción administrativa (sin restricción de 24h)" class="btn-roster-cancel p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors">
                                <i data-lucide="user-x" class="w-4 h-4"></i>
                            </button>
                        ` : `
                            <span class="text-[10px] text-slate-400 italic">Cancelado por ${escapeHtml(e.cancelledBy || 'usuario')}</span>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Attach actions inside roster
    document.querySelectorAll('.btn-roster-cert').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-cert-id'));
            const name = btn.getAttribute('data-name');
            handleAdminDownloadCertificate(id, name);
        });
    });

    document.querySelectorAll('.btn-roster-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-cancel-id'));
            const name = btn.getAttribute('data-name');
            handleAdminCancelEnrollment(id, name);
        });
    });

    refreshLucideIcons();
}

function closeWorkshopRoster() {
    elements.modalWorkshopRoster?.classList.add('hidden');
    state.currentRosterWorkshop = null;
    state.currentRosterEnrollments = [];
}

async function handleAdminCancelEnrollment(enrollmentId, participantName) {
    const result = await Swal.fire({
        title: '¿Cancelar inscripción de alumno?',
        text: `Como instructor/empleado, cancelarás la inscripción de "${participantName}". Esta acción liberará el cupo de inmediato.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, cancelar inscripción',
        cancelButtonText: 'No'
    });

    if (!result.isConfirmed) return;

    try {
        await api.cancelEnrollment(enrollmentId);

        showToast('success', `Inscripción de ${participantName} cancelada.`);

        // Refresh both roster and background admin data
        if (state.currentRosterWorkshop) {
            await openWorkshopRoster(state.currentRosterWorkshop.id);
        }
        await loadWorkshops();
        await loadAdminData();
    } catch (err) {
        Swal.fire({
            title: 'Error al cancelar',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    }
}

async function handleAdminDownloadCertificate(enrollmentId, participantName) {
    if (!state.currentRosterWorkshop) return;

    try {
        showToast('info', `Generando constancia PDF para ${participantName}...`);
        await api.downloadCertificate(enrollmentId, state.currentRosterWorkshop.code, participantName);
        showToast('success', 'Constancia PDF descargada.');
    } catch (err) {
        Swal.fire({
            title: 'Error al generar constancia',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    }
}

function handlePrintRoster() {
    window.print();
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

// ==========================================
// WORKSHOP DETAIL (Platzi Course Experience)
// ==========================================

function generateSyllabus(workshop) {
    const text = `${workshop.instructorSpecialty || ''} ${workshop.title || ''}`.toLowerCase();
    if (text.includes('foto')) {
        return [
            { num: '01', title: 'Fundamentos de la Cámara y Exposición Manual', desc: 'Triángulo de exposición (ISO, diafragma, velocidad), lentes y calibración de balance de blancos.', duration: '1.5 horas' },
            { num: '02', title: 'Composición, Iluminación y Ley de Tercios', desc: 'Manejo de luz natural, reflectores y dirección de modelos en locación presencial.', duration: '2 horas' },
            { num: '03', title: 'Sesión Práctica de Disparo Guiado', desc: 'Taller práctico con retroalimentación en tiempo real del instructor en el aula.', duration: '2 horas' },
            { num: '04', title: 'Revelado Digital y Entrega de Portafolio', desc: 'Edición básica en Adobe Lightroom y exportación para certificación oficial.', duration: '1.5 horas' }
        ];
    }
    if (text.includes('coci') || text.includes('repos')) {
        return [
            { num: '01', title: 'Mise en Place, Técnicas de Corte y Seguridad', desc: 'Dominio del cuchillo, manipulación higiénica de alimentos y preparación de estaciones.', duration: '1.5 horas' },
            { num: '02', title: 'Cocciones, Fondos y Salsas Madre', desc: 'Elaboración de reducciones, emulsiones y bases aromáticas clásicas.', duration: '2 horas' },
            { num: '03', title: 'Elaboración del Menú Principal en Cocina', desc: 'Práctica presencial individual con ingredientes provistos por el centro de formación.', duration: '2.5 horas' },
            { num: '04', title: 'Emplatado Profesional y Degustación Crítica', desc: 'Técnicas de presentación gastronómica de vanguardia y análisis sensorial.', duration: '1 hora' }
        ];
    }
    if (text.includes('ora') || text.includes('prese')) {
        return [
            { num: '01', title: 'Dominio del Miedo Escénico y Lenguaje Corporal', desc: 'Respiración diafragmática, postura abierta y eliminación de muletillas.', duration: '1.5 horas' },
            { num: '02', title: 'Estructura del Discurso y Storytelling Persuasivo', desc: 'Cómo abrir una charla memorable, generar empatía y conectar con la audiencia.', duration: '2 horas' },
            { num: '03', title: 'Modulación de la Voz, Pausas y Proyección', desc: 'Ejercicios presenciales de entonación, volumen y ritmo para retener la atención.', duration: '1.5 horas' },
            { num: '04', title: 'Presentación de Pitch y Evaluación 360°', desc: 'Discurso en vivo frente al grupo con retroalimentación directa y video análisis.', duration: '2 horas' }
        ];
    }
    if (text.includes('mús') || text.includes('guit')) {
        return [
            { num: '01', title: 'Afinación, Postura y Calentamiento Instrumental', desc: 'Técnicas de prevención de lesiones y ergonomía con el instrumento.', duration: '1 hora' },
            { num: '02', title: 'Armonía Aplicada y Progresiones de Acordes', desc: 'Escalas mayores, menores y digitación rítmica en compases estándar.', duration: '2 horas' },
            { num: '03', title: 'Ensamble y Coordinación Rítmica en Vivo', desc: 'Dinámicas grupales de tempo, dinámicas de volumen y escucha activa.', duration: '2 horas' },
            { num: '04', title: 'Interpretación de Obra y Cierre Formativo', desc: 'Ejecución de pieza musical evaluada por el instructor.', duration: '1.5 horas' }
        ];
    }
    return [
        { num: '01', title: 'Fundamentos y Análisis de Requerimientos', desc: 'Bases conceptuales, arquitectura de la solución y preparación del entorno de trabajo.', duration: '1.5 horas' },
        { num: '02', title: 'Metodología Práctica y Buenas Prácticas de la Industria', desc: 'Patrones probados, diseño modular y optimización del flujo creativo/técnico.', duration: '2 horas' },
        { num: '03', title: 'Proyecto Aplicado Presencial (Hands-on)', desc: 'Construcción en tiempo real con acompañamiento personalizado del docente.', duration: '2.5 horas' },
        { num: '04', title: 'Validación, Despliegue y Emisión de Certificado', desc: 'Revisión final de entregables y rúbrica para constancia de acreditación.', duration: '1 hora' }
    ];
}

function openWorkshopDetail(workshopId) {
    const workshop = state.workshops.find(w => w.id === workshopId);
    if (!workshop) return;

    state.selectedDetailWorkshop = workshop;
    const theme = getCategoryTheme(workshop.instructorSpecialty, workshop.title);

    // Header info
    if (elements.detailSchoolBadge) elements.detailSchoolBadge.textContent = `Escuela de ${theme.label}`;
    if (elements.detailCodeBadge) elements.detailCodeBadge.textContent = workshop.code;
    if (elements.detailTitle) elements.detailTitle.textContent = workshop.title;
    if (elements.detailDescription) elements.detailDescription.textContent = workshop.description;

    // Instructor info
    if (elements.detailInstructorName) elements.detailInstructorName.textContent = workshop.instructorName;
    if (elements.detailInstructorSpecialty) elements.detailInstructorSpecialty.textContent = workshop.instructorSpecialty || 'Instructor Especialista SkillHub';
    if (elements.detailInstructorAvatar) elements.detailInstructorAvatar.textContent = workshop.instructorName.charAt(0).toUpperCase();

    // Schedule info
    const startDate = new Date(workshop.startDateTime);
    const endDate = new Date(workshop.endDateTime);
    const dateFormatted = startDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeFormatted = `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} — ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    if (elements.detailSchedule) elements.detailSchedule.textContent = `${dateFormatted} (${timeFormatted})`;

    // Seats & capacity
    const occupied = workshop.capacity - workshop.availableSeats;
    const occupancyPct = Math.round((occupied / workshop.capacity) * 100);
    if (elements.detailSeatsCount) elements.detailSeatsCount.textContent = workshop.availableSeats;
    if (elements.detailSeatsTotal) elements.detailSeatsTotal.textContent = `de ${workshop.capacity} cupos totales`;
    if (elements.detailCapacityBar) {
        elements.detailCapacityBar.style.width = `${occupancyPct}%`;
        elements.detailCapacityBar.className = `h-full progress-bar-fill ${workshop.availableSeats === 0 ? 'bg-rose-500' : (workshop.availableSeats <= 3 ? 'bg-amber-500' : 'bg-emerald-500')}`;
    }

    // Modular Syllabus
    const syllabus = generateSyllabus(workshop);
    if (elements.detailSyllabusContainer) {
        elements.detailSyllabusContainer.innerHTML = syllabus.map(item => `
            <div class="syllabus-item pb-4">
                <span class="syllabus-dot"></span>
                <div class="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span class="text-[10px] text-emerald-500 font-mono font-bold">${item.num}</span>
                            ${escapeHtml(item.title)}
                        </span>
                        <span class="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            ${item.duration}
                        </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${escapeHtml(item.desc)}</p>
                </div>
            </div>
        `).join('');
    }

    // Action Area (Auth vs Guest)
    const isAuth = authStorage.isAuthenticated();
    const isEnrolled = state.myEnrollments.some(e => e.workshopId === workshop.id && e.status === 1);
    const hasSeats = workshop.availableSeats > 0;

    if (isAuth) {
        elements.detailActionAuth?.classList.remove('hidden');
        elements.detailActionGuest?.classList.add('hidden');

        if (elements.btnDetailEnroll) {
            if (isEnrolled) {
                elements.btnDetailEnroll.disabled = true;
                elements.btnDetailEnroll.className = 'w-full py-3 px-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-default';
                elements.btnDetailEnroll.innerHTML = '<i data-lucide="check-circle" class="w-4 h-4"></i><span>Ya estás inscrito</span>';
            } else if (!hasSeats) {
                elements.btnDetailEnroll.disabled = true;
                elements.btnDetailEnroll.className = 'w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed';
                elements.btnDetailEnroll.innerHTML = '<i data-lucide="ban" class="w-4 h-4"></i><span>Cupos Agotados</span>';
            } else {
                elements.btnDetailEnroll.disabled = false;
                elements.btnDetailEnroll.className = 'w-full py-3 px-4 btn-platzi rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2';
                elements.btnDetailEnroll.innerHTML = '<i data-lucide="sparkles" class="w-4 h-4"></i><span>Inscribirme Ahora</span>';
            }
        }
    } else {
        elements.detailActionAuth?.classList.add('hidden');
        elements.detailActionGuest?.classList.remove('hidden');
        if (elements.formQuickEnroll) elements.formQuickEnroll.reset();
    }

    elements.modalWorkshopDetail?.classList.remove('hidden');
    refreshLucideIcons();
}

function closeWorkshopDetail() {
    elements.modalWorkshopDetail?.classList.add('hidden');
    state.selectedDetailWorkshop = null;
}

async function handleDetailEnroll() {
    if (!state.selectedDetailWorkshop) return;
    const workshop = state.selectedDetailWorkshop;
    closeWorkshopDetail();
    await handleEnrollClick(workshop.id);
}

async function handleQuickEnroll(e) {
    e.preventDefault();
    if (!state.selectedDetailWorkshop) return;

    const workshop = state.selectedDetailWorkshop;
    const fullName = elements.quickName?.value.trim();
    const email = elements.quickEmail?.value.trim();
    const password = elements.quickPassword?.value;

    const submitBtn = elements.formQuickEnroll?.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
        // 1. Register participant
        await api.register(fullName, email, password);

        // 2. Direct enrollment into selected workshop
        await api.enroll(workshop.id);

        closeWorkshopDetail();

        // Trigger celebratory confetti
        if (window.confetti) {
            window.confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        }

        Swal.fire({
            title: '¡Bienvenido e Inscrito!',
            html: `Tu cuenta ha sido creada y quedaste registrado exitosamente en el taller <strong>${escapeHtml(workshop.title)}</strong>.<br><br>Fecha: <strong>${new Date(workshop.startDateTime).toLocaleDateString('es-ES')}</strong>.`,
            icon: 'success',
            confirmButtonColor: '#00d074'
        });

        await loadMyEnrollments();
        await loadWorkshops();
    } catch (err) {
        Swal.fire({
            title: 'No se pudo completar el registro',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

// ==========================================
// USER PROFILE & LEARNING DASHBOARD
// ==========================================

async function loadUserProfile() {
    if (!authStorage.isAuthenticated()) {
        openAuthModal('login');
        return;
    }

    try {
        const profile = await api.getProfile();

        if (elements.profileEmail) elements.profileEmail.value = profile.email;
        if (elements.profileFullName) elements.profileFullName.value = profile.fullName;
        if (elements.profileRole) elements.profileRole.value = profile.role === 'Employee' ? 'Instructor / Administrador' : 'Participante Estudiante';
        if (elements.profileSpecialty) elements.profileSpecialty.value = profile.specialty || '';

        // Calculate and display metrics
        const total = state.myEnrollments.length;
        const active = state.myEnrollments.filter(e => e.status === 1).length;
        const certs = active; // PDF certificates are available for active enrollments

        if (elements.profileStatTotal) elements.profileStatTotal.textContent = total;
        if (elements.profileStatActive) elements.profileStatActive.textContent = active;
        if (elements.profileStatCerts) elements.profileStatCerts.textContent = certs;

    } catch (err) {
        console.error('Error fetching profile:', err);
        showToast('error', 'Error al cargar los datos del perfil.');
    }
}

async function handleUpdateProfile(e) {
    e.preventDefault();
    const fullName = elements.profileFullName?.value.trim();
    const specialty = elements.profileSpecialty?.value.trim();

    if (!fullName) {
        showToast('error', 'El nombre completo no puede estar vacío.');
        return;
    }

    const submitBtn = document.getElementById('btn-save-profile');
    if (submitBtn) submitBtn.disabled = true;

    try {
        const updated = await api.updateProfile(fullName, specialty);

        // Update local state and storage
        const current = authStorage.getUser() || {};
        current.fullName = updated.fullName;
        authStorage.setSession(authStorage.getToken(), current);
        state.currentUser = current;
        updateAuthUI();

        Swal.fire({
            title: 'Perfil Actualizado',
            text: 'Tus datos personales se han guardado correctamente.',
            icon: 'success',
            confirmButtonColor: '#00d074'
        });
    } catch (err) {
        Swal.fire({
            title: 'Error al actualizar',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function handleChangePassword(e) {
    e.preventDefault();
    const currentPassword = elements.profileCurrentPassword?.value;
    const newPassword = elements.profileNewPassword?.value;
    const confirmPassword = elements.profileConfirmPassword?.value;

    if (!currentPassword || !newPassword) {
        showToast('error', 'Completa los campos de contraseña.');
        return;
    }

    if (newPassword !== confirmPassword) {
        Swal.fire({
            title: 'Contraseñas no coinciden',
            text: 'La nueva contraseña y la confirmación no son iguales.',
            icon: 'warning',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }

    if (newPassword.length < 6) {
        showToast('error', 'La nueva contraseña debe tener al menos 6 caracteres.');
        return;
    }

    const submitBtn = document.getElementById('btn-save-password');
    if (submitBtn) submitBtn.disabled = true;

    try {
        await api.changePassword(currentPassword, newPassword);

        if (elements.formProfilePassword) elements.formProfilePassword.reset();

        Swal.fire({
            title: 'Contraseña Modificada',
            text: 'Tu contraseña de acceso ha sido actualizada con éxito.',
            icon: 'success',
            confirmButtonColor: '#00d074'
        });
    } catch (err) {
        Swal.fire({
            title: 'Error al cambiar contraseña',
            text: err.message,
            icon: 'error',
            confirmButtonColor: '#4f46e5'
        });
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
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
