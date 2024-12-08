import { Request, Response } from "express";
import { connectToDatabase } from "../../utils/db.util";
import Joi from "joi";
import jwt from "jsonwebtoken";

// Joi schema for optional query parameters
const querySchema = Joi.object({
    role: Joi.string().valid('Host', 'Guest', 'Admin').optional(),
    page: Joi.number().integer().min(1).default(1).messages({
        "number.base": "Page must be a number.",
        "number.min": "Page must be at least 1.",
    }),
    limit: Joi.number().integer().min(1).default(10).messages({
        "number.base": "Limit must be a number.",
        "number.min": "Limit must be at least 1.",
    }),
    sort_by: Joi.string().valid("name", "email", "created_at").default("name").messages({
        "any.only": "Sort by must be one of 'name', 'email', or 'created_at'.",
    }),
    order: Joi.string().valid("ASC", "DESC").default("ASC").messages({
        "any.only": "Order must be either 'ASC' or 'DESC'.",
    }),
});

// Middleware to check if the user is Admin
const isAdmin = (req: Request, res: Response, next: Function) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(403).send("Access denied.");
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET_KEY || '');
        if (decoded.role !== 'Admin') {
            return res.status(403).send("Access denied.");
        }
        next();
    } catch (error) {
        return res.status(401).send("Invalid token.");
    }
};

const getUsers = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();

        const { error, value } = querySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const { role, page, limit, sort_by, order } = value;

        // Calculate offset for pagination
        const offset = (Number(page) - 1) * Number(limit);

        // Base query
        let query = `SELECT user_id, name, email, bio, photo, role, created_at FROM user`;

        // If a role is provided, filter by role
        if (role) {
            query += ` WHERE role = ?`;
        }

        query += ` ORDER BY ${db.escapeId(sort_by as string)} ${order === 'DESC' ? 'DESC' : 'ASC'}
            LIMIT ? OFFSET ?`;

        // Fetch users
        const users = await db.query(query, [role, Number(limit), offset]);

        // Get total count of users (applying filter if needed)
        let countQuery = `SELECT COUNT(*) AS total FROM user`;
        if (role) {
            countQuery += ` WHERE role = ?`;
        }

        // Execute count query
        const countResult: any = await db.query(countQuery, [role]);

        // Debugging the result to check its structure
        console.log("Count Result: ", countResult);

        // Extract total count from the result
        const total = countResult[0] ? countResult[0].total : 0;

        return res.status(200).json({
            data: users,
            meta: {
                total: total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export default [isAdmin, getUsers];
