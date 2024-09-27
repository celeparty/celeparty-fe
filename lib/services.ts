import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: process.env.URL_API,
});

export const config = {
	headers: {
		Authorization: `Bearer ${process.env.KEY_API}`,
	},
};

export const getData = (url: string) =>
	axios
		.get(`${process.env.URL_API + url}`, config)
		.then((res) => {
			return res;
		})
		.catch((error) => {
			console.log(error);
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
			console.log(error);
		});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const putDataToken = (url: string, token: string, data: any) =>
	axios
		.put(`${process.env.URL_API + url}`, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		.then((res) => {
			console.log(res);
			return res;
		})
		.catch((error) => {
			console.log(error);
		});

export const getDataOpen = (url: string) =>
	axios
		.get(`${process.env.URL_API + url}`)
		.then((res) => {
			return res;
		})
		.catch((error) => {
			console.log(error);
		});

export const postDataOpen = (url: string, data: []) =>
	axios
		.post(`${process.env.URL_API + url}`, data)
		.then((res) => {
			return res;
		})
		.catch((error) => {
			console.log(error);
		});
