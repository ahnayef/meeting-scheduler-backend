import { Request, Response } from 'express';
import Joi from 'joi';
import { connectToDatabase } from '../../utils/db.util';

const schema = Joi.object({
    slot_id: Joi.number().required(),  // The slot ID to update
    start_tm: Joi.string().required(), // New start time
    end_tm: Joi.string().required(),   // New end time
    date: Joi.date().required(),       // New date
});

const UpdateSlot = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        // Validate input
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).send(error.message);
        }

        const { slot_id, start_tm, end_tm, date } = value;

        // Check if the slot exists
        const [slot]: any = await db.query('SELECT * FROM slot WHERE slot_id = ?', [slot_id]);

        if (slot.length === 0) {
            return res.status(404).send('Slot not found');
        }

        // Check if the slot is already booked
        if (slot[0].is_booked === true) {
            return res.status(400).send('This slot is already booked and cannot be updated');
        }


        // Update the slot with the new values
        await db.query(
            'UPDATE slot SET date = ?, start_tm = ?, end_tm = ? WHERE slot_id = ?',
            [date, start_tm, end_tm, slot_id]
        );

        return res.status(200).send('Slot updated successfully');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

export default UpdateSlot;
