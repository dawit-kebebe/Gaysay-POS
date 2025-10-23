import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;


export const baseQuery = fetchBaseQuery({
	baseUrl: BASE_URL,

	prepareHeaders: (headers) => {
		headers.set('Content-Type', 'application/json');
		return headers;
	},

	// Provide a responseHandler that returns parsed JSON when possible,
	// and ensures RTK Query receives a structured error when status >= 400.
	responseHandler: async (response: Response) => {
		if (response.status === 204) return null;

		const text = await response.text().catch(() => '');
		if (!text) return null;

		try {
			const parsed = JSON.parse(text);
			if (!response.ok) {
				return Promise.reject({ status: response.status, data: parsed });
			}
			return parsed;
		} catch {
			if (!response.ok) {
				return Promise.reject({ status: response.status, data: text });
			}
			return text;
		}
	},
});