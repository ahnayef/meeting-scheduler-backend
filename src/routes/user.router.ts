import { Router } from "express";
import Login from "../controllers/user/login";
import Register from "../controllers/user/resgister";
import authMiddleware from "../middlewares/authMiddleware";
import getUsers from "../controllers/user/getUsers";

const UsersRouter = Router();

// UsersRouter.get('/profile', authMiddleware, getProfile);

UsersRouter.post('/login', Login)
UsersRouter.post('/register', Register)
UsersRouter.get('/getusers', getUsers);

export { UsersRouter };