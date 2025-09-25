import { initTRPC } from "@trpc/server";
import { appRouter as mainRouter } from '../../../../invox-backend/src/api/trpc/router'

const t = initTRPC.context().create();

export const router = t.router;

// this object is not actually used - we just use it to combine the two servers with different prefixes
const appRouter = router({
	main: mainRouter,
});

export type AppRouter = typeof appRouter;
