import { Request, Response } from "express";
import { connectToDatabase } from "../../utils/db.util";
import Joi from "joi";

// Joi schema for booking validation
const bookingSchema = Joi.object({
    slot_id: Joi.number().integer().required(),
    user_id: Joi.number().integer().required(),
});

const CreateBooking = async (req:any, res:any) => {
    try {
        const db = await connectToDatabase();
        const { error, value } = bookingSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const { slot_id, user_id } = value;

        // Step 1: Check if the slot exists
        const [slot]: any = await db.query("SELECT * FROM slot WHERE slot_id = ?", [slot_id]);

        if (slot.length === 0) {
            return res.status(404).send("Slot not found.");
        }

        const slotDetails = slot[0];

        // Step 2: Check if the slot is already booked
        if (slotDetails.is_booked) {
            return res.status(400).send("Slot is already booked.");
        }

        // Step 3: Check if the user is trying to book a slot that belongs to another host
        const [host]: any = await db.query("SELECT * FROM user WHERE user_id = ?", [slotDetails.user_id]);

        if (host.length === 0 || host[0].user_id !== user_id) {
            return res.status(403).send("You can only book slots owned by you.");
        }

        // Step 4: Create the booking entry
        await db.query("INSERT INTO booking (user_id, slot_id) VALUES (?, ?)", [
            user_id,
            slot_id,
        ]);

        // Step 5: Mark the slot as booked
        await db.query("UPDATE slot SET is_booked = ? WHERE slot_id = ?", [true, slot_id]);

        return res.status(200).send("Booking successful.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error.");
    }
};

export default CreateBooking;
