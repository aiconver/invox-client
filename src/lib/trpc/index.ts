import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { getHeaders } from "../auth";
import type { AppRouter } from "./combined-server";

export const trpc = createTRPCReact<AppRouter>();

const TIMEOUT_MS = 5 * 60_000; // 5 minutes

export const client = trpc.createClient({
	links: [
		// 2) Create a custom ending link
		(runtime) => {
			// initialize the different links for different targets
			const servers = {
				main: httpBatchLink({
					url: `${import.meta.env.VITE_APP_API_BASE_URL}/trpc`,
					headers: getHeaders,
					methodOverride: 'POST',
					maxURLLength: 2083,
					fetch: (url, opts) => {
						// Combine any incoming signal (e.g., from React Query) with your timeout
						const timeoutSignal =
							typeof AbortSignal.timeout === 'function'
								? AbortSignal.timeout(TIMEOUT_MS)
								: (() => {
									const c = new AbortController();
									setTimeout(() => c.abort(), TIMEOUT_MS);
									return c.signal;
								})();

						const signal =
							(AbortSignal as any).any
								? (AbortSignal as any).any([opts?.signal].filter(Boolean).concat(timeoutSignal))
								: timeoutSignal;

						return fetch(url, { ...opts, signal });
					},

				})(runtime),
				calendar: httpBatchLink({
					url: `${import.meta.env.VITE_APP_CALENDAR_API_URL}`,
					headers: getHeaders,
					methodOverride: 'POST',
					maxURLLength: 2083,
				})(runtime),
			};
			return (ctx) => {
				const { op } = ctx;
				// split the path by `.` as the first part will signify the server target name
				const pathParts = op.path.split(".");

				// first part of the query should be `server1` or `server2`
				const serverName = pathParts.shift() as string as keyof typeof servers;

				// combine the rest of the parts of the paths
				// -- this is what we're actually calling the target server with
				const path = pathParts.join(".");

				const link = servers[serverName];

				return link({
					...ctx,
					op: {
						...op,
						// override the target path with the prefix removed
						path,
					},
				});
			};
		},
	],
});
