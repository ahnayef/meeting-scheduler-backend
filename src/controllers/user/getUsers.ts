import { Request, Response } from "express";
import { connectToDatabase } from "../../utils/db.util";
import Joi from "joi";
import jwt from "jsonwebtoken";

// Middleware to check if the user is Admin
// const isAdmin = (req: any, res: any, next: Function) => {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//         return res.status(403).send("Access denied.");
//     }

//     try {
//         const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '');
//         if (decoded.role !== 'Admin') {
//             return res.status(403).send("Access denied.");
//         }
//         next();
//     } catch (error) {
//         return res.status(401).send("Invalid token.");
//     }
// };

const getUsers = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();



        const { role, page, limit, sort_by, order } = req.query;

        // Calculate offset for pagination
        const offset = (Number(page) - 1) * Number(limit);

        // Base query
        let query = `SELECT user_id, name, email, photo, role, created_at FROM user WHERE role = ?`;



        // Fetch users
        const [users]: any = await db.query(query, [role]);


        return res.status(200).json({
            data: users,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export default getUsers;
// export default [isAdmin, getUsers];
