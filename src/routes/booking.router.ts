import { Router } from "express";
import CreateSlot from "../controllers/slots/slots.create";
import UpdateSlot from "../controllers/slots/slots.update";
import deleteSlot from "../controllers/slots/slots.delete";
import getSlots from "../controllers/slots/slots.getAll";


const bookingRouter = Router();

bookingRouter.post('/create', CreateSlot);
bookingRouter.put('/update', UpdateSlot);
bookingRouter.delete('/delete/:id', deleteSlot);
bookingRouter.get('/getall', getSlots);




export { bookingRouter };