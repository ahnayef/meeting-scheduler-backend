import { Request, Response } from "express";
import { connectToDatabase } from "../../utils/db.util";
import Joi from "joi";

// Joi schema for optional query parameters
const querySchema = Joi.object({
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

const getHosts = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        const { error, value } = querySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const { page, limit, sort_by, order } = value;

        // Calculate offset for pagination
        const offset = (Number(page) - 1) * Number(limit);

        // Fetch hosts
        const [hosts]: any = await db.query(
            `SELECT user_id, name, email, bio, photo, role, created_at 
            FROM user 
            WHERE role = 'Host'
            ORDER BY ${db.escapeId(sort_by as string)} ${order === 'DESC' ? 'DESC' : 'ASC'}
            LIMIT ? OFFSET ?`,
            [Number(limit), offset]
        );

        // Get total count of hosts
        const [total]: any = await db.query(
            `SELECT COUNT(*) as total FROM user WHERE role = 'Host'`
        );

        return res.status(200).json({
            data: hosts,
            meta: {
                total: total[0].total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total[0].total / Number(limit)),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

export default getHosts;
