export interface ReacherBackend {
	/**
	 * Is bulk email verification enabled
	 */
	hasBulk: boolean;
	/**
	 * IP address of the backend (if known).
	 */
	ip?: string;
	/**
	 * Human-readable name of the backend.
	 */
	name: string;
	/**
	 * Backend URL.
	 */
	url: string;
}

// Cache the result of the getReacherBackends parsing function.
let cachedReacherBackends: ReacherBackend[] | undefined;

/**
 * Get all of Reacher's internal backends, as an array.
 */
export function getReacherBackends(): ReacherBackend[] {
	if (cachedReacherBackends) {
		return cachedReacherBackends;
	}
	cachedReacherBackends;
	if (!process.env.RCH_BACKENDS) {
		throw new Error("Got empty RCH_BACKENDS env var.");
	}

	// RCH_BACKENDS is an array of all Reacher's internal backends.
	cachedReacherBackends = JSON.parse(
		process.env.RCH_BACKENDS
	) as ReacherBackend[];

	return cachedReacherBackends;
}
