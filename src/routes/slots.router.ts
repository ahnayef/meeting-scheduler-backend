import { Router } from "express";
import CreateSlot from "../controllers/slots/slots.create";
import UpdateSlot from "../controllers/slots/slots.update";
import deleteSlot from "../controllers/slots/slots.delete";


const SlotRouter = Router();

SlotRouter.post('/create', CreateSlot);
SlotRouter.get('/update', UpdateSlot);
SlotRouter.delete('/delete/:id', deleteSlot);




export { SlotRouter };