import { Router } from "express";
import CreateBooking from "../controllers/booking/createBooking";


const bookingRouter = Router();

bookingRouter.post('/create', CreateBooking);





export { bookingRouter };