import { Request, Response } from "express";
import User from "../../Models/User";
const jwt = require('jsonwebtoken');

export const loginWithGoogle = async (req: Request, res: Response) => {
    const { name, email, image_url } = req.body;

    try {
        let user = await User.findOne({ where: { email } });

        if (!user) {
            if(!email || !name || !image_url) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            const user = await User.create({
                email,
                name,
                image_url,
                oauth: 'google',
                password: ''
            });

            delete user?.dataValues.password;
            delete user?.dataValues.id;
            delete user?.dataValues.paystackcustomercode;
            delete user?.dataValues.paystackauthorizationcode;
            delete user?.dataValues.nextbillingdate;
            delete user?.dataValues.subscriptionstatus;

            const token = jwt.sign(user?.dataValues, process.env.SECRET_KEY, {
                expiresIn: "30d",
            });

            return res.status(200).json({ user, token });
        }

        delete user?.dataValues.password;
        delete user?.dataValues.id;
        delete user?.dataValues.paystackcustomercode;
        delete user?.dataValues.paystackauthorizationcode;
        delete user?.dataValues.nextbillingdate;
        delete user?.dataValues.subscriptionstatus;

        const token = jwt.sign(user?.dataValues, process.env.SECRET_KEY, {
            expiresIn: "30d",
        });

        return res.status(200).json({ user, token });
    } catch (error) {
        console.error('Error logging in with Google:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
