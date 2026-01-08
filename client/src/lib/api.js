const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    async get(endpoint) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: getHeaders()
        });
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    async post(endpoint, data) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || res.statusText);
        }
        return res.json();
    },

    async delete(endpoint) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },

    async put(endpoint, data) {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    }
};
