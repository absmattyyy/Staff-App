import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import eventsRouter from "./events.js";
import shiftsRouter from "./shifts.js";
import feedRouter from "./feed.js";
import swapsRouter from "./swaps.js";
import timeRecordsRouter from "./timeRecords.js";
import unavailabilitiesRouter from "./unavailabilities.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(eventsRouter);
router.use(shiftsRouter);
router.use(feedRouter);
router.use(swapsRouter);
router.use(timeRecordsRouter);
router.use(unavailabilitiesRouter);

export default router;
