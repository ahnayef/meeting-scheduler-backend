
import { connectToDatabase } from "../../utils/db.util";


const getSingleSlot = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        const { id } = req.params;

        // Query Execution
        const [slot]: any = await db.query(
            `SELECT date, start_tm, end_tm FROM slot WHERE slot_id = ?`, [id]
        );

        return res.status(200).json({
            data: slot[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



export default getSingleSlot;