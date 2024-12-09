
import { connectToDatabase } from "../../utils/db.util";


const getSlots = async (req: any, res: any) => {
    try {
        const db = await connectToDatabase();

        

        const { page, limit, sort_by, order, user_id, is_booked } = req.query;

    

        // Query Execution
        const [slots]: any = await db.query(
            `SELECT slot_id, user_id, date, start_tm, end_tm, is_booked 
            FROM slot WHERE user_id = ? AND is_booked = FALSE`,[user_id]
        );


        const [bookedSlots]: any = await db.query(
            `SELECT slot_id, user_id, date, start_tm, end_tm, is_booked 
            FROM slot WHERE user_id = ? AND is_booked = TRUE`,[user_id]
        );

        // const userName: string = = `SELECT name from user`

        

        return res.status(200).json({
            data: {slots, bookedSlots},
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



export default getSlots;