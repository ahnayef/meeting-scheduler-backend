
import { connectToDatabase } from "../../utils/db.util";

import Joi from "joi";

// Joi schema for query parameters
const querySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
        "number.base": "Page must be a number.",
        "number.min": "Page must be at least 1.",
    }),
    limit: Joi.number().integer().min(1).default(10).messages({
        "number.base": "Limit must be a number.",
        "number.min": "Limit must be at least 1.",
    }),
    sort_by: Joi.string().valid("date", "start_tm", "end_tm", "is_booked").default("date").messages({
        "any.only": "Sort by must be one of 'date', 'start_tm', 'end_tm', or 'is_booked'.",
    }),
    order: Joi.string().valid("ASC", "DESC").default("ASC").messages({
        "any.only": "Order must be either 'ASC' or 'DESC'.",
    }),
    user_id: Joi.number().integer().messages({
        "number.base": "User ID must be a number.",
    }),
    is_booked: Joi.boolean().messages({
        "boolean.base": "Is Booked must be a boolean value.",
    }),
});


const getSlots = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        const { error, value } = querySchema.validate(req.query);
        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const { page, limit, sort_by, order, user_id, is_booked } = value;

        // Query Building
        const whereConditions: string[] = [];
        const queryParams: any[] = [];

        if (user_id) {
            whereConditions.push("user_id = ?");
            queryParams.push(user_id);
        }
        if (is_booked !== undefined) {
            whereConditions.push("is_booked = ?");
            queryParams.push(is_booked);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : '';
        const offset = (Number(page) - 1) * Number(limit);

        // Query Execution
        const [slots]: any = await db.query(
            `SELECT slot_id, user_id, date, start_tm, end_tm, is_booked 
            FROM slot 
            ${whereClause}
            ORDER BY ${db.escapeId(sort_by as string)} ${order === 'DESC' ? 'DESC' : 'ASC'}
            LIMIT ? OFFSET ?`,
            [...queryParams, Number(limit), offset]
        );

        const [total]: any = await db.query(
            `SELECT COUNT(*) as total FROM slot ${whereClause}`,
            queryParams
        );

        return res.status(200).json({
            data: slots,
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

