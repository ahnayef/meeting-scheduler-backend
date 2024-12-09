import { Request, Response } from "express";
import Joi from "joi";
import { connectToDatabase } from "../../utils/db.util";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

require('dotenv').config();

// const schema = Joi.object({
//     role: Joi.string().valid("Host", "Guest", "Admin").required(), // Updated to include Admin
//     name: Joi.string().min(5).required(),
//     email: Joi.string().allow(null).optional()
//         .pattern(/^[a-zA-Z0-9._%+-]+@neub\.edu\.bd$/)
//         .messages({
//             'string.pattern.base': 'Email must be a valid neub.edu.bd address',
//         }),
//     password: Joi.string()
//         .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
//         .required()
//         .messages({
//             'string.pattern.base': 'Password must be 8+ characters with upper, lower, number, and special characters',
//         }),
//     bio: Joi.string().min(10).required(),
//     photo: Joi.string().uri().required(),
// });


const schema = Joi.object({
    role: Joi.string().valid("Host", "Guest", "Admin").required(), // Updated to include Admin
    name: Joi.string().min(1).required(),
    email: Joi.string().required(),
    password: Joi.string().required()
});

const Register = async (req: Request, res: any) => {
    try {
        const db = await connectToDatabase();

        const secretKey = process.env.JWT_SECRET_KEY;

        if (!secretKey) {
            return res.status(500).send('JWT secret key is not defined. Check environment variables');
        }

        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).send(error.message);
        }

        const { role, name, email, password, bio, photo } = value;

        const hashedPassword = await bcrypt.hash(password, 10);

        
        const [existingUser]: any = await db.query("SELECT email FROM `user` WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).send("User already exists");
        }

        // Insert user into the database
        const result: any = await db.query(
            "INSERT INTO `user` (role, name, email, password, bio, photo) VALUES (?, ?, ?, ?, ?, ?)",
            [role, name, email, hashedPassword, bio, photo]
        );

        // Fetch the newly created user
        const [user]: any = await db.query("SELECT * FROM `user` WHERE user_id = ?", [result[0].insertId]);

        const token = jwt.sign(
            { id: user[0].user_id, role: user[0].role, email: user[0].email },
            secretKey,
            { expiresIn: '1w' }
        );

        return res.status(200).json({
            data: {
                token,
                user: {
                    name: user[0].name,
                    id: user[0].user_id,
                    email: user[0].email,
                    role: user[0].role,
                    bio: user[0].bio,
                    photo: user[0].photo,
                }
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

export default Register;
