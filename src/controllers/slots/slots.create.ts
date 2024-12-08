import { Request, Response } from "express";
import Joi from "joi";
import { connectToDatabase } from "../../utils/db.util";

const schema = Joi.object({
    dates: Joi.array().items(Joi.string().isoDate()).required(),
    start_tm: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(),
    end_tm: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/).required(),
});

const createSlots = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).send(error.message);
        }

        const { dates, start_tm, end_tm } = value;
        const user_id = req.user.id;

        if (new Date(`1970-01-01T${start_tm}`) >= new Date(`1970-01-01T${end_tm}`)) {
            return res.status(400).send("Start time must be before end time");
        }

        // Construct date conditions for SQL query
        const dateConditions = dates.map((date: string) => {
            return `(date = ? AND start_tm < ? AND end_tm > ?)`;
        }).join(" OR ");

        const params: any[] = [];
        dates.forEach((date: string) => {
            params.push(date, end_tm, start_tm);
        });

        // Check for overlapping slots
        const [overlappingSlots]: any = await db.query(
            `
            SELECT * 
            FROM slot 
            WHERE user_id = ? AND (${dateConditions})
            `,
            [user_id, ...params]
        );

        if (overlappingSlots.length > 0) {
            return res.status(400).send("Overlapping slots exist for the same host");
        }

        // Insert slots
        const slotValues = dates.map((date: string) => {
            return [user_id, date, start_tm, end_tm, false];
        });

        await db.query(
            `INSERT INTO slot (user_id, date, start_tm, end_tm, is_booked) VALUES ?`,
            [slotValues]
        );

        return res.status(201).send("Slots created successfully");
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
    }
};

export default createSlots;
