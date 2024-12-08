import { Request, Response } from 'express';
import Joi from 'joi';
import { connectToDatabase } from '../../utils/db.util';

const schema = Joi.object({
    dates: Joi.array().items(Joi.date().required()).min(1).required().messages({
        'array.base': 'Dates must be an array of valid date(s)',
        'array.min': 'At least one date must be provided',
        'date.base': 'Each date must be a valid date',
    }), // Array of dates for multiple slots
    start_tm: Joi.string().required(), // Start time
    end_tm: Joi.string().required(),   // End time
});

const CreateSlot = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        // Validate input
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).send(error.message);
        }

        const { dates, start_tm, end_tm } = value;

        // Check if the user is a Host
        const userId = req.user.id; // Assuming the user ID is stored in `req.user`
        const [user]: any = await db.query('SELECT role FROM users WHERE id = ?', [userId]);

        if (user.length === 0) {
            return res.status(404).send('User not found');
        }

        if (user[0].role !== 'Host') {
            return res.status(403).send('Only Hosts can create slots');
        }

        // Check if any of the slots overlap with existing ones
        const dateConditions = dates.map((date: string) => {
            return `(date = ? AND start_tm < ? AND end_tm > ?)`;
        }).join(' OR ');

        const query = `
            SELECT * FROM slots WHERE (${dateConditions})
        `;

        const params = dates.flatMap((date: string) => [date, start_tm, end_tm]);

        const [existingSlots]: any = await db.query(query, params);

        if (existingSlots.length > 0) {
            return res.status(400).send('One or more slots overlap with existing slots');
        }

        // Insert new slots for each date
        for (let date of dates) {
            await db.query(
                'INSERT INTO slots (user_id, date, start_tm, end_tm, is_booked) VALUES (?, ?, ?, ?, ?)',
                [userId, date, start_tm, end_tm, false]
            );
        }

        return res.status(201).send('Slots created successfully');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

export default CreateSlot;
