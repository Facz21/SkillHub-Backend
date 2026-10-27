/**
 * SkillHub API Client - Decoupled REST Integration
 */
const API_BASE_URL = 'http://localhost:5076/api/v1';

export const authStorage = {
    getToken: () => localStorage.getItem('skillhub_token'),
    getUser: () => {
        const user = localStorage.getItem('skillhub_user');
        return user ? JSON.parse(user) : null;
    },
    setSession: (token, user) => {
        localStorage.setItem('skillhub_token', token);
        localStorage.setItem('skillhub_user', JSON.stringify(user));
    },
    clearSession: () => {
        localStorage.removeItem('skillhub_token');
        localStorage.removeItem('skillhub_user');
    },
    isAuthenticated: () => !!localStorage.getItem('skillhub_token')
};

async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = options.headers || {};

    const token = authStorage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            authStorage.clearSession();
            window.dispatchEvent(new CustomEvent('auth-changed'));
            throw new Error('Sesión expirada o credenciales inválidas. Por favor inicia sesión nuevamente.');
        }

        // Handle file downloads (PDF)
        if (response.headers.get('content-type')?.includes('application/pdf')) {
            if (!response.ok) {
                throw new Error('Error al generar la constancia en PDF.');
            }
            return await response.blob();
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMessage = data?.detail || data?.title || 'Ocurrió un error en el servidor.';
            const error = new Error(errorMessage);
            error.status = response.status;
            error.details = data;
            throw error;
        }

        return data;
    } catch (err) {
        throw err;
    }
}

export const api = {
    // Auth
    async login(email, password) {
        const result = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        authStorage.setSession(result.token, {
            email: result.email,
            fullName: result.fullName,
            role: result.role
        });
        window.dispatchEvent(new CustomEvent('auth-changed'));
        return result;
    },

    async register(fullName, email, password) {
        const result = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ fullName, email, password })
        });
        authStorage.setSession(result.token, {
            email: result.email,
            fullName: result.fullName,
            role: result.role
        });
        window.dispatchEvent(new CustomEvent('auth-changed'));
        return result;
    },

    logout() {
        authStorage.clearSession();
        window.dispatchEvent(new CustomEvent('auth-changed'));
    },

    // Workshops
    async getUpcomingWorkshops() {
        return await request('/workshops');
    },

    async getWorkshopById(id) {
        return await request(`/workshops/${id}`);
    },

    // Enrollments
    async enroll(workshopId) {
        return await request('/enrollments', {
            method: 'POST',
            body: JSON.stringify({ workshopId })
        });
    },

    async getMyEnrollments() {
        return await request('/enrollments/mine');
    },

    async cancelEnrollment(id) {
        return await request(`/enrollments/${id}/cancel`, {
            method: 'PATCH'
        });
    },

    async downloadCertificate(enrollmentId, workshopCode = 'Taller') {
        const blob = await request(`/enrollments/${enrollmentId}/certificate`);
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `SkillHub_Constancia_${workshopCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
    }
};
