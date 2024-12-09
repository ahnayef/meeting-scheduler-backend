import { connectToDatabase } from "../../utils/db.util";

const getOne = async (req: any, res: any) => {

    const { id } = req.params;

    try {
        const db = await connectToDatabase();

        // Base query
        let query = `SELECT user_id, name, email, photo, role, created_at FROM user WHERE user_id = ?`;

        // Fetch user
        const [user]: any = await db.query(query, [id]);

        if (user.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            data: user[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }


}

export default getOne;