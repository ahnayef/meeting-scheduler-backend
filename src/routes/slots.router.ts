import { Router } from "express";
import CreateSlot from "../controllers/slots/slots.create";
import UpdateSlot from "../controllers/slots/slots.update";
import deleteSlot from "../controllers/slots/slots.delete";
import getSlots from "../controllers/slots/slots.getAll";


const SlotRouter = Router();

SlotRouter.post('/create', CreateSlot);
SlotRouter.get('/update', UpdateSlot);
SlotRouter.delete('/delete/:id', deleteSlot);
SlotRouter.get('/getall', getSlots);




export { SlotRouter };