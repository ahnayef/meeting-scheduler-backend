import { connectToDatabase } from '../../utils/db.util';

const deleteSlot = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        const { id } = req.params;

        // Check if the slot exists
        const [slot]: any = await db.query('SELECT * FROM slot WHERE slot_id = ?', [id]);

        if (slot.length === 0) {
            return res.status(404).send('Slot not found');
        }

        // Check if the slot is already booked
        if (slot[0].is_booked === true) {
            return res.status(400).send('This slot is already booked and cannot be deleted');
        }

        // Check if there are any bookings for this slot
        const [bookings]: any = await db.query('SELECT * FROM booking WHERE slot_id = ?', [id]);

        if (bookings.length > 0) {
            return res.status(400).send('This slot has existing booking and cannot be deleted');
        }

        // Delete the slot
        await db.query('DELETE FROM slot WHERE slot_id = ?', [id]);

        return res.status(200).send('Slot deleted successfully');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
};

export default deleteSlot;
