
import { connectToDatabase } from "../../utils/db.util";

import Joi from "joi";

// // Joi schema for query parameters
// const querySchema = Joi.object({
//     page: Joi.number().integer().min(1).default(1).messages({
//         "number.base": "Page must be a number.",
//         "number.min": "Page must be at least 1.",
//     }),
//     limit: Joi.number().integer().min(1).default(10).messages({
//         "number.base": "Limit must be a number.",
//         "number.min": "Limit must be at least 1.",
//     }),
//     sort_by: Joi.string().valid("date", "start_tm", "end_tm", "is_booked").default("date").messages({
//         "any.only": "Sort by must be one of 'date', 'start_tm', 'end_tm', or 'is_booked'.",
//     }),
//     order: Joi.string().valid("ASC", "DESC").default("ASC").messages({
//         "any.only": "Order must be either 'ASC' or 'DESC'.",
//     }),
//     user_id: Joi.number().integer().messages({
//         "number.base": "User ID must be a number.",
//     }),
//     is_booked: Joi.boolean().messages({
//         "boolean.base": "Is Booked must be a boolean value.",
//     }),
// });


const getSlots = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        

        const { page, limit, sort_by, order, user_id, is_booked } = req.query;

        

    

        // Query Execution
        const [slots]: any = await db.query(
            `SELECT slot_id, user_id, date, start_tm, end_tm, is_booked 
            FROM slot WHERE user_id = ?`,[user_id]
        );

        

        return res.status(200).json({
            data: slots,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



export default getSlots;