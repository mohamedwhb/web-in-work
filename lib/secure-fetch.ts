export async function secureFetch(
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	try {
		// Get a new CSRF token
		console.log("Fetching CSRF token...");
		const csrfResponse = await fetch("/api/csrf", {
			credentials: "include",
		});

		if (!csrfResponse.ok) {
			console.error("Failed to get CSRF token:", await csrfResponse.text());
			throw new Error("Failed to get CSRF token");
		}

		const { csrfToken } = await csrfResponse.json();
		console.log("Got CSRF token");

		// Add CSRF token to headers
		const headers = new Headers(options.headers);
		headers.set("X-CSRF-Token", csrfToken);

		// Make the request with the CSRF token
		console.log("Making request to:", url);
		const response = await fetch(url, {
			...options,
			credentials: "include",
			headers,
		});

		// If we get a 401, try to refresh the token
		if (response.status === 401) {
			console.log("Got 401, attempting token refresh...");
			const refreshResponse = await fetch("/api/auth/refresh", {
				method: "POST",
				credentials: "include",
				headers: {
					"X-CSRF-Token": csrfToken,
				},
			});

			if (refreshResponse.ok) {
				console.log("Token refresh successful, retrying original request");
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
	} catch (error) {
		console.error("Secure fetch error:", error);
		throw error;
	}
}
