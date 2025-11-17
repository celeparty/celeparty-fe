import axios, { Method } from "axios";

export const axiosInstance = axios.create({
	baseURL: process.env.URL_API,
});

export const config = {
	headers: {
		Authorization: `Bearer ${process.env.KEY_API}`,
	},
};

export const axiosData = async (method: Method, url: string, data?: any) => {
	try {
		const headers: Record<string, string> = {};
		headers["Authorization"] = `Bearer ${process.env.KEY_API}`;
		const response = await axios({
			method,
			url: `${process.env.BASE_API}${url}`,
			data,
			headers,
		});
		return response?.data;
	} catch (err) {
		console.error("Request failed:", err);
		throw err;
	}
};

export const axiosUser = async (method: Method, url: string, token?: string, data?: any) => {
	try {
		const headers: Record<string, string> = {};
		headers["Authorization"] = `Bearer ${token}`;
		const response = await axios({
			method,
			url: `${process.env.BASE_API}${url}`,
			data,
			headers,
		});
		return response?.data;
	} catch (err) {
		console.error("Request failed:", err);
		throw err;
	}
};

export const axiosRegion = async (method: Method, region: string, subregioncode?: string, data?: any) => {
	try {
		const response = await axios({
			method,
			url: `${process.env.BASE_API_REGION}${region}?api_key=${process.env.KEY_REGION}${subregioncode ? `&id_provinsi=${subregioncode}` : ""}`,
			data,
		});
		return response?.data;
	} catch (err) {
		console.error("Request failed:", err);
		throw err;
	}
};

export const getData = (url: string) =>
	axios
		.get(`${process.env.URL_API + url}`, config)
		.then((res) => {
			return res;
		})
		.catch((error) => {
			console.error("Request failed:", error);
		});

export const getDataToken = (url: string, token: string) =>
	axios
		.get(`${process.env.URL_API + url}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		.then((res) => {
			return res;
		})
		.catch((error) => {
			console.error("Request failed:", error);
});

export const putDataToken = (url: string, token: string, data: any) =>
	axios
		.put(`${process.env.URL_API + url}`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		.then((res) => {
			return res;
		})
		.catch((error) => {
			console.error("Request failed:", error);
		});

export const getDataOpen = (url: string) =>
	axios
		.get(`${process.env.URL_API + url}`)
		.then((res) => {
			return res;
		})
		.catch((error) => {
			console.error("Request failed:", error);
		});

export const postDataOpen = (url: string, data: []) =>
	axios
		.post(`${process.env.URL_API + url}`, data)
		.then((res) => {
			return res;
		})
		.catch((error) => {
			console.error("Request failed:", error);
		});
