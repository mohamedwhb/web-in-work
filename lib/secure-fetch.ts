export async function secureFetch(
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	// Get a new CSRF token
	const csrfResponse = await fetch("/api/csrf", {
		credentials: "include",
	});
	const { csrfToken } = await csrfResponse.json();

	// Add CSRF token to headers
	const headers = new Headers(options.headers);
	headers.set("X-CSRF-Token", csrfToken);

	// Make the request with the CSRF token
	const response = await fetch(url, {
		...options,
		credentials: "include",
		headers,
	});

	// If we get a 401, try to refresh the token
	if (response.status === 401) {
		const refreshResponse = await fetch("/api/auth/refresh", {
			method: "POST",
			credentials: "include",
			headers: {
				"X-CSRF-Token": csrfToken,
			},
		});

		if (refreshResponse.ok) {
			// Get a new CSRF token
			const newCsrfResponse = await fetch("/api/csrf", {
				credentials: "include",
			});
			const { csrfToken: newCsrfToken } = await newCsrfResponse.json();

			// Retry the original request with the new CSRF token
			const newHeaders = new Headers(options.headers);
			newHeaders.set("X-CSRF-Token", newCsrfToken);

			return fetch(url, {
				...options,
				credentials: "include",
				headers: newHeaders,
			});
		}
	}

	return response;
}
