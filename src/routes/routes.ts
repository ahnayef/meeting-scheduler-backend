import { Router, Request, Response } from "express";
import { UsersRouter } from "./user.router";
import authMiddleware from "../middlewares/authMiddleware";
import { NoticesRouter } from "./notices.router";
import { SlotRouter } from "./slots.router";
import { bookingRouter } from "./booking.router";

const router = Router();

router.get('/health', (req: Request, res: any) => {
    return res.status(200).json({
        status: 'ok',
        device: req.headers.device,
    });
});

router.use('/users', UsersRouter);
router.use('/notices', authMiddleware, NoticesRouter);
router.use('/slots', authMiddleware, SlotRouter);
router.use('/booking ', authMiddleware, bookingRouter);


export { router };