import { Router } from "express";
import createNotice from "../controllers/notices/notice.create";
import getNotice from "../controllers/notices/notice.read";
import deleteNotice from "../controllers/notices/notice.delete";


const NoticesRouter = Router();

NoticesRouter.post('/create', createNotice);
NoticesRouter.get('/get', getNotice);
NoticesRouter.delete('/delete/:id', deleteNotice);




export { NoticesRouter };