import { api, authStorage } from './api.js';

// Application State
const state = {
    workshops: [],
    myEnrollments: [],
    currentUser: authStorage.getUser(),
    activeTab: 'workshops', // 'workshops' | 'enrollments'
    searchQuery: '',
    selectedCategory: ''
};

// DOM Elements
const elements = {
    // Nav & Auth
    navBrand: document.getElementById('nav-brand'),
    tabWorkshops: document.getElementById('tab-workshops'),
    tabMyEnrollments: document.getElementById('tab-my-enrollments'),
    navEnrollmentsBadge: document.getElementById('nav-enrollments-badge'),
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

    // Modal Auth
    modalAuth: document.getElementById('modal-auth'),
    tabLogin: document.getElementById('tab-login'),
    tabRegister: document.getElementById('tab-register'),
    formLogin: document.getElementById('form-login'),
    formRegister: document.getElementById('form-register'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnDemoParticipant: document.getElementById('btn-demo-participant'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    regName: document.getElementById('reg-name'),
    regEmail: document.getElementById('reg-email'),
    regPassword: document.getElementById('reg-password')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    updateAuthUI();
    await loadWorkshops();
    if (authStorage.isAuthenticated()) {
        await loadMyEnrollments();
    }
    refreshLucideIcons();
});

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
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
    elements.btnBackToCatalog?.addEventListener('click', () => switchTab('workshops'));
    elements.btnEmptyExplore?.addEventListener('click', () => switchTab('workshops'));

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

    elements.tabLogin?.addEventListener('click', () => setAuthTab('login'));
    elements.tabRegister?.addEventListener('click', () => setAuthTab('register'));

    // Forms
    elements.formLogin?.addEventListener('submit', handleLogin);
    elements.formRegister?.addEventListener('submit', handleRegister);
    elements.btnLogout?.addEventListener('click', handleLogout);

    // Demo Fill
    elements.btnDemoParticipant?.addEventListener('click', () => {
        if (elements.loginEmail && elements.loginPassword) {
            elements.loginEmail.value = 'jorge.perez@correo.com';
            elements.loginPassword.value = 'Skillhub2026*';
        }
    });

    // Global event when auth changes
    window.addEventListener('auth-changed', async () => {
        state.currentUser = authStorage.getUser();
        updateAuthUI();
        if (authStorage.isAuthenticated()) {
            await loadMyEnrollments();
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

    if (tab === 'workshops') {
        elements.viewWorkshops?.classList.remove('hidden');
        elements.viewEnrollments?.classList.add('hidden');

        elements.tabWorkshops?.classList.add('text-brand-600', 'bg-brand-50');
        elements.tabWorkshops?.classList.remove('text-slate-600', 'hover:bg-slate-100');

        elements.tabMyEnrollments?.classList.remove('text-brand-600', 'bg-brand-50');
        elements.tabMyEnrollments?.classList.add('text-slate-600', 'hover:bg-slate-100');
    } else {
        elements.viewWorkshops?.classList.add('hidden');
        elements.viewEnrollments?.classList.remove('hidden');

        elements.tabMyEnrollments?.classList.add('text-brand-600', 'bg-brand-50');
        elements.tabMyEnrollments?.classList.remove('text-slate-600', 'hover:bg-slate-100');

        elements.tabWorkshops?.classList.remove('text-brand-600', 'bg-brand-50');
        elements.tabWorkshops?.classList.add('text-slate-600', 'hover:bg-slate-100');

        renderEnrollments();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    refreshLucideIcons();
}

// Update Auth UI Elements
function updateAuthUI() {
    const isAuth = authStorage.isAuthenticated();
    const user = state.currentUser;

    if (isAuth && user) {
        elements.authGuest?.classList.add('hidden');
        elements.authUser?.classList.remove('hidden');

        if (elements.userDisplayName) elements.userDisplayName.textContent = user.fullName || user.email;
        if (elements.userRoleBadge) elements.userRoleBadge.textContent = user.role === 'Employee' ? 'Instructor' : 'Participante';
        if (elements.userAvatar) {
            elements.userAvatar.textContent = (user.fullName || user.email).charAt(0).toUpperCase();
        }
    } else {
        elements.authGuest?.classList.remove('hidden');
        elements.authUser?.classList.add('hidden');
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

// Render Workshop Cards
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

        let badgeClass = 'badge-available';
        let badgeText = `${w.availableSeats} cupos libres`;
        let pulseClass = '';

        if (w.availableSeats === 0) {
            badgeClass = 'badge-full';
            badgeText = 'Agotado';
        } else if (w.availableSeats <= 3) {
            badgeClass = 'badge-low';
            badgeText = `¡Últimos ${w.availableSeats} cupos!`;
            pulseClass = 'badge-pulse';
        }

        const startDate = new Date(w.startDateTime);
        const endDate = new Date(w.endDateTime);
        const dateFormatted = startDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const timeFormatted = `${startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} — ${endDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;

        return `
            <div class="workshop-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:border-brand-300">
                <div class="p-6 space-y-4">
                    <!-- Card Top Header -->
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md tracking-wider">
                            ${w.code}
                        </span>
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass} ${pulseClass} flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full ${w.availableSeats === 0 ? 'bg-rose-500' : (w.availableSeats <= 3 ? 'bg-amber-500' : 'bg-emerald-500')}"></span>
                            ${badgeText}
                        </span>
                    </div>

                    <!-- Workshop Title & Description -->
                    <div class="space-y-1.5">
                        <h3 class="text-lg font-bold text-slate-900 leading-snug line-clamp-1 hover:text-brand-600 transition-colors">
                            ${escapeHtml(w.title)}
                        </h3>
                        <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
                            ${escapeHtml(w.description)}
                        </p>
                    </div>

                    <!-- Workshop Schedule Details -->
                    <div class="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 text-xs text-slate-600">
                        <div class="flex items-center gap-2">
                            <i data-lucide="calendar" class="w-4 h-4 text-brand-600 flex-shrink-0"></i>
                            <span class="font-medium text-slate-800 capitalize">${dateFormatted}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i data-lucide="clock" class="w-4 h-4 text-brand-600 flex-shrink-0"></i>
                            <span>${timeFormatted}</span>
                        </div>
                    </div>

                    <!-- Instructor Attribution -->
                    <div class="flex items-center gap-2.5 pt-1">
                        <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                            ${escapeHtml(w.instructorName.charAt(0))}
                        </div>
                        <div class="text-left">
                            <p class="text-xs font-semibold text-slate-800 leading-tight">${escapeHtml(w.instructorName)}</p>
                            <p class="text-[11px] text-slate-400 leading-tight">${escapeHtml(w.instructorSpecialty || 'Instructor')}</p>
                        </div>
                    </div>
                </div>

                <!-- Card Action Footer -->
                <div class="p-6 pt-0 border-t border-slate-100 bg-slate-50/50 mt-2">
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
            <button disabled class="w-full py-2.5 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-default">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
                Ya estás inscrito
            </button>
        `;
    }

    if (!hasSeats) {
        return `
            <button disabled class="w-full py-2.5 px-4 bg-slate-100 text-slate-400 font-medium text-xs rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                <i data-lucide="ban" class="w-4 h-4"></i>
                Cupos Agotados
            </button>
        `;
    }

    return `
        <button data-id="${w.id}" class="btn-enroll-action w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm transition-all hover:shadow shadow-brand-600/30 flex items-center justify-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4"></i>
            Inscribirme al Taller
        </button>
    `;
}

// Render Enrollments View
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

        return `
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <!-- Info Left -->
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            ${escapeHtml(e.workshopCode)}
                        </span>
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}">
                            ${isActive ? '● Inscripción Activa' : '✕ Inscripción Cancelada'}
                        </span>
                    </div>

                    <h3 class="text-lg font-bold text-slate-900 leading-snug">
                        ${escapeHtml(e.workshopTitle)}
                    </h3>

                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span class="flex items-center gap-1.5">
                            <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400"></i>
                            Instructor: <strong class="text-slate-700">${escapeHtml(e.instructorName)}</strong>
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
                        <button data-id="${e.id}" data-code="${e.workshopCode}" class="btn-download-pdf px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors">
                            <i data-lucide="file-down" class="w-4 h-4"></i>
                            Descargar Constancia PDF
                        </button>

                        <button data-id="${e.id}" data-title="${escapeHtml(e.workshopTitle)}" data-cancelable="${e.canParticipantCancel}" class="btn-cancel-enrollment px-3.5 py-2 ${e.canParticipantCancel ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'} rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors" ${!e.canParticipantCancel ? 'disabled' : ''}>
                            <i data-lucide="x-circle" class="w-4 h-4"></i>
                            ${e.canParticipantCancel ? 'Cancelar Inscripción' : 'No cancelable (< 24h)'}
                        </button>
                    ` : `
                        <span class="text-xs text-slate-400 italic">
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
                particleCount: 80,
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
    if (!canCancel) {
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
        html: `Estás a punto de cancelar tu inscripción en <strong>"${escapeHtml(title)}"</strong>.<br><br><span class="text-xs text-rose-600 font-semibold">Tu cupo será liberado inmediatamente para otro participante.</span>`,
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
        elements.tabLogin?.classList.add('text-brand-600', 'border-brand-600', 'bg-white');
        elements.tabLogin?.classList.remove('text-slate-500');
        elements.tabRegister?.classList.remove('text-brand-600', 'border-brand-600', 'bg-white');
        elements.tabRegister?.classList.add('text-slate-500');

        elements.formLogin?.classList.remove('hidden');
        elements.formRegister?.classList.add('hidden');
    } else {
        elements.tabRegister?.classList.add('text-brand-600', 'border-brand-600', 'bg-white');
        elements.tabRegister?.classList.remove('text-slate-500');
        elements.tabLogin?.classList.remove('text-brand-600', 'border-brand-600', 'bg-white');
        elements.tabLogin?.classList.add('text-slate-500');

        elements.formRegister?.classList.remove('hidden');
        elements.formLogin?.classList.add('hidden');
    }
    refreshLucideIcons();
}

// Helpers
function showToast(icon, title) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true
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
