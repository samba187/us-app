// Basic auth & API service with token persistence and photo upload helper
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || 'http://localhost:5000';

function getToken() {
	return localStorage.getItem('access_token');
}

export const authService = {
	api: null,
	init() {
		if (this.api) return this.api;
		this.api = axios.create({
			baseURL: API_BASE,
			headers: { 'Content-Type': 'application/json' }
		});
		this.api.interceptors.request.use(cfg => {
			const t = getToken();
			if (t) cfg.headers.Authorization = `Bearer ${t}`;
			return cfg;
		});
		return this.api;
	},
	me: {
		async get() {
			return (await authService.api.get('/api/me')).data;
		},
		async update(fields) {
			return (await authService.api.put('/api/me', fields)).data;
		},
		async uploadAvatar(file) {
			const fd = new FormData();
			fd.append('file', file);
			const token = getToken();
			const res = await fetch(`${API_BASE}/api/me`, {
				method: 'PUT',
				headers: token ? { 'Authorization': `Bearer ${token}` } : {},
				body: fd
			});
			if (!res.ok) throw new Error('Upload failed');
			return res.json();
		}
	},
	setToken(token) {
		localStorage.setItem('access_token', token);
	},
	clearToken() { localStorage.removeItem('access_token'); },
	async login(email, password) {
		this.init();
		const res = await this.api.post('/api/login', { email, password });
		if (res.data?.access_token) this.setToken(res.data.access_token);
		return res.data;
	},
	async register(name, email, password) {
		this.init();
		const res = await this.api.post('/api/register', { name, email, password });
		if (res.data?.access_token) this.setToken(res.data.access_token);
		return res.data;
	},
	photoService: {
		async uploadMultipart(files) {
			const fd = new FormData();
			files.forEach(f => fd.append('files', f));
			const token = getToken();
			const res = await fetch(`${API_BASE}/api/photos`, {
				method: 'POST',
				headers: token ? { 'Authorization': `Bearer ${token}` } : {},
				body: fd
			});
			if (!res.ok) throw new Error('Upload failed');
			return res.json();
		},
		async uploadGeneric(files) {
			const fd = new FormData();
			files.forEach(f => fd.append('files', f));
			const token = getToken();
			const res = await fetch(`${API_BASE}/api/upload`, {
				method: 'POST',
				headers: token ? { 'Authorization': `Bearer ${token}` } : {},
				body: fd
			});
			if (!res.ok) throw new Error('Upload generic failed');
			const data = await res.json();
			return data.files || [];
		}
	}

};

authService.init();

