import { Request, Response } from "express";
import User from "../Models/User";
import bcrypt from "bcrypt";
import { afterVerificationMiddlerwareInterface, AuthControllerInterface } from "../Interfaces/Index";
const jwt = require("jsonwebtoken");
import { OAuth2Client } from "google-auth-library";
import { sendOTP } from "../Mailing/OTPMail";
import { uploadUserPicture } from "../Services/Cloudflare.services";
import UserVerification from "../Models/userVerification";
import { sendForgotMail } from "../Mailing/forgotPassword";
const NodeCache = require("node-cache");
const otpCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });
import crypto from "crypto";
import ForgotPassword from "../Models/forgotPassword";
import { userSchema } from "../utils/zod.utils";


const AuthController: AuthControllerInterface = {
    login: async (req: Request, res: Response) => {
        let { email, password, oauth, oauth_method, oauth_token } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Bad request." });
        }

        try {
            if(oauth && oauth_method && oauth_token) {
                password = '';

                if(oauth_method === 'google') {
                    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

                    try {
                        await client.verifyIdToken({
                            idToken: oauth_token,
                            audience: process.env.GOOGLE_CLIENT_ID,
                        });
                    } catch (error) {
                        return res.status(400).json({ error: "Invalid Google token." });
                    }
                }
            }
            else{
                if (!password) {
                    return res.status(400).json({ error: "Bad request." });
                }
            }

            const user = await User.findOne({
                where: { email },
                attributes: { exclude: ['createdAt', 'updatedAt'] }
              });

            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            const isUserVerified = await UserVerification.findOne({ where: { userEmail: email } });
            if (!isUserVerified) {
                return res.status(400).json({ error: "User email not verified." });
            }

            if(user.dataValues.oauth != ''){
                return res.status(422).json({ error: "Login with google OAuth." });
            }

            const isPasswordValid = await bcrypt.compare(password, user.dataValues.password);
            if (!isPasswordValid) {
                return res.status(422).json({ error: "invalid credentials. 🥲" });
            }

            delete user.dataValues.password;
            delete user.dataValues.id;
            const token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                expiresIn: "90d",
            });

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                user: user,
                toke: token,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    },

    signup: async (req: Request, res: Response) => {
        const requestBody = req.body;
        let { name, email, nickname, password, role, school, department, interests, study_vibe, oauth, oauth_method, oauth_token } = requestBody;
        const user_image = req.file;
        let key = '';
        const requiredKeys = ['name', 'email', 'nickname', 'password', 'role', 'school', 'department', 'interests', 'study_vibe'];

        const missingKey = requiredKeys.find(key => !(key in requestBody));

        if(missingKey){
            return res.status(400).json({error: 'Bad request.', message: `${missingKey} is required.`});
        }

        try {
            if(oauth && oauth_method && oauth_token) {
                password = '';

                if(oauth_method === 'google') {
                    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

                    try {
                        await client.verifyIdToken({
                            idToken: oauth_token,
                            audience: process.env.GOOGLE_CLIENT_ID,
                        });
                    } catch (error) {
                        return res.status(400).json({ error: "Invalid Google token." });
                    }
                }
            }
            else{
                if (!password) {
                    return res.status(400).json({ error: "Bad request." });
                }
            }

            const existingUser = await User.findOne({ where: { email }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
            if (existingUser) {
                return res.status(409).json({ error: "User already exists." });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const stringRegex = /^[a-zA-Z0-9\s]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }

            if (!stringRegex.test(name)) {
                return res.status(400).json({ error: "Name can only contain alphanumeric characters." });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);

            if (user_image && user_image.size > 5 * 1024 * 1024) {
                return res.status(400).json({ error: "File size exceeds 5MB." });
            }

            const isUserVerified = await UserVerification.findOne({ where: { userEmail: email } });
            if (!isUserVerified) {
                return res.status(400).json({ error: "User email not verified." });
            }


            if(user_image){
                const bucket = 'clarkuser'
                key = `${Date.now()}_${user_image.originalname}`;
                const mimeType = user_image.mimetype;
                
                key = key.replace(/[^a-zA-Z0-9.]/g, "_");

                await uploadUserPicture(bucket, key, user_image.buffer, mimeType);
            }

            const user = {
                name,
                email,
                nickname,
                role,
                school,
                password: hashedPassword,
                department,
                interests,
                image_url: user_image ? '' : `https://${process.env.RS_USERS_IMAGES_DOMAIN}/${key}`,
                study_vibe
            }

            await User.create({
                ...user,
            }).then((user) => {
                delete user.dataValues.password;
                delete user.dataValues.id;
                delete user.dataValues.createdAt;
                delete user.dataValues.updatedAt;
                const token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                    expiresIn: "90d",
                });

                return res.status(200).json({
                    success: true,
                    message: "Signup successful.",
                    user: user,
                    token: token,
                });
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    },

    sendOTP: async (req: Request, res: Response) => {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            const otp = Math.floor(1000 + Math.random() * 9000);
            otpCache.set(`${email}`, otp, 7200);
            sendOTP(email, name, otp);
            return res.status(200).json({
                success: true,
                message: "OTP sent successfully.",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    },

    verifyOTP: async (req: Request, res: Response) => {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {

            const cachedOtp = otpCache.get(`${email}`);
            if (!cachedOtp) {
                return res.status(400).json({ error: "OTP expired." });
            }


            if (otp != cachedOtp) {
                return res.status(422).json({ error: "Invalid OTP." });
            }

            otpCache.del(`${email}`);

            UserVerification.create({
                userEmail: email,
                isVerified: true,
            });

            return res.status(200).json({
                success: true,
                message: "Verification successful.",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    },

    refreshToken: async (req: Request & afterVerificationMiddlerwareInterface, res: Response) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({ error: "Unauthorized access." });
            }

            const newToken = jwt.sign(user, process.env.SECRET_KEY, {
                expiresIn: "30d",
            });

            return res.status(200).json({
                success: true,
                message: "Token refreshed successfully.",
                user: user,
                token: newToken,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    },

    sendForgotPasswordEmail: async (req: Request, res: Response) => {
        const { email, url } = req.body;
        if (!email || !url) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            const username = user.name;
            const cryptoToken = crypto.randomBytes(32).toString("hex");

            const info = {
                token: cryptoToken,
                email: email,
            };

            const token = jwt.sign(info, process.env.SECRET_KEY, {
                expiresIn: "1h",
            });

            ForgotPassword.create({
                token: cryptoToken,
                userEmail: email
            });

            const resetLink = `${url}?token=${token}`;
            sendForgotMail(resetLink, email, username);

            return res.status(200).json({
                success: true,
                message: "Password reset email sent successfully.",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    },

    resetPassword: async (req: Request, res: Response) => {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            const decoded: any = jwt.verify(token, process.env.SECRET_KEY);
            const userEmail = decoded.email;
            const derived_token = decoded.token;

            const isTokenValid = await ForgotPassword.findOne({ where: { token: derived_token, userEmail: userEmail } });
            if (!isTokenValid) {
                return res.status(400).json({ error: "Invalid or expired token." });
            }

            const user = await User.findOne({ where: { email: userEmail } });
            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await User.update({ password: hashedPassword }, { where: { email: userEmail } });
            await ForgotPassword.destroy({ where: { userEmail: userEmail } });

            return res.status(200).json({
                success: true,
                message: "Password reset successfully.",
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }
}

export default AuthController;