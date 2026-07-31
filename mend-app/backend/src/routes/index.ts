import { Router } from "express";
import authRoutes from "./auth.js";
import resourceRoutes from "./resources.js";
import eventRoutes from "./events.js";
import notificationRoutes from "./notifications.js";
import userRoutes from "./user.js";
import moderatorRoutes from "./moderator.js";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/resources", resourceRoutes);
router.use("/events", eventRoutes);
router.use("/notifications", notificationRoutes);
router.use("/user", userRoutes);
router.use("/moderator", moderatorRoutes);

export default router;
