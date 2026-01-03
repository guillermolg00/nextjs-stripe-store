export async function api<T>(
	input: RequestInfo,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(input, init);
	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}
	return (await response.json()) as T;
}
