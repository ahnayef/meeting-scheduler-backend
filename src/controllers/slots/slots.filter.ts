import { Request, Response } from "express";
import { connectToDatabase } from "../../utils/db.util";
import json2csv from "json2csv";

const HostAnalytics = async (req: Request, res: Response) => {
    try {
        const db = await connectToDatabase();
        const hostId = req.user?.user_id; // Assuming user ID is available in req.user from authentication middleware

        if (!hostId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Query for Most Booked Slots
        const [mostBookedSlots]: any = await db.query(
            `SELECT s.date, s.start_tm, s.end_tm, COUNT(b.booking_id) AS total_bookings
             FROM slot s
             LEFT JOIN booking b ON s.slot_id = b.slot_id
             WHERE s.user_id = ?
             GROUP BY s.date, s.start_tm, s.end_tm
             ORDER BY total_bookings DESC
             LIMIT 10`,
            [hostId]
        );

        // Query for Booking Trends Over Time
        const [bookingTrends]: any = await db.query(
            `SELECT DATE(b.created_at) AS booking_date, COUNT(b.booking_id) AS total_bookings
             FROM booking b
             JOIN slot s ON b.slot_id = s.slot_id
             WHERE s.user_id = ?
             GROUP BY booking_date
             ORDER BY booking_date`,
            [hostId]
        );

        // Query for Popular Booking Times
        const [popularTimes]: any = await db.query(
            `SELECT s.start_tm, COUNT(b.booking_id) AS total_bookings
             FROM slot s
             LEFT JOIN booking b ON s.slot_id = b.slot_id
             WHERE s.user_id = ?
             GROUP BY s.start_tm
             ORDER BY total_bookings DESC
             LIMIT 5`,
            [hostId]
        );

        // Combine analytics into a single response
        const analytics = {
            mostBookedSlots,
            bookingTrends,
            popularTimes,
        };

        // Export functionality
        const exportType = req.query.export as string; // 'csv' or 'json'

        if (exportType === "csv") {
            const csv = json2csv.parse(analytics);
            res.header("Content-Type", "text/csv");
            res.attachment("host_analytics.csv");
            return res.send(csv);
        }

        res.status(200).json(analytics);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default HostAnalytics;
