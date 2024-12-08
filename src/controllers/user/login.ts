import Joi from "joi";
import { connectToDatabase } from "../../utils/db.util";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

require('dotenv').config();

const schema = Joi.object({
    role: Joi.string().valid("Host", "Guest", "Admin").required(), // Updated role options
    identification: Joi.string().required(),
    password: Joi.string().required()
});

const Login = async (req: any, res: any) => {
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

        const { role, identification, password } = value;

        if (role === 'Guest' || role === 'Host') {
            // Check for user by email (for Host and Guest roles)
            const [rows]: any = await db.query(
                `SELECT email FROM \`user\` WHERE email = ?`,
                [identification]
            );

            if (rows.length === 0) {
                return res.status(404).send('User not found');
            } else {
                const [user]: any = await db.query(
                    `SELECT * FROM \`user\` WHERE email = ?`,
                    [identification]
                );

                const passwordMatch = await bcrypt.compare(password, user[0].password);

                if (!passwordMatch) {
                    return res.status(401).send('Wrong password');
                }

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
                            email: user[0].email,
                            role: user[0].role,
                            bio: user[0].bio,
                            photo: user[0].photo,
                        }
                    }
                });
            }
        } else if (role === 'Admin') {
            // Admin login by email (assuming admins use email for login)
            const [rows]: any = await db.query(
                `SELECT email FROM \`user\` WHERE email = ?`,
                [identification]
            );

            if (rows.length === 0) {
                return res.status(404).send('User not found');
            } else {
                const [user]: any = await db.query(
                    `SELECT * FROM \`user\` WHERE email = ?`,
                    [identification]
                );

                const passwordMatch = await bcrypt.compare(password, user[0].password);

                if (!passwordMatch) {
                    return res.status(401).send('Wrong password');
                }

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
                            email: user[0].email,
                            role: user[0].role,
                            bio: user[0].bio,
                            photo: user[0].photo,
                        }
                    }
                });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};

export default Login;
