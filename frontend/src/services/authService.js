// Basic auth & API service with token persistence and photo upload helper
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://us-app-42e964cf340b.herokuapp.com/api';
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
			const res = await fetch('/api/photos', {
				method: 'POST',
				headers: token ? { 'Authorization': `Bearer ${token}` } : {},
				body: fd
			});
			if (!res.ok) throw new Error('Upload failed');
			return res.json();
		}
	}
};

authService.init();

