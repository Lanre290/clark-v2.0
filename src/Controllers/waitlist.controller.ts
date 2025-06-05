import { Request, Response } from "express";
import userWaitlist from "../Models/Waitlist";
import { sendWaitlistMail } from "../Mailing/waitlistWelcome";
import xss from 'xss';
import { GoogleGenAI, Type } from "@google/genai";
import { waitListInterface } from "../Interfaces/Index";
import { sendWaitlistForm1 } from "../Mailing/waitlistForm1";
import UserWaitlist from "../Models/Waitlist";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "GEMINI_API_KEY" });



const waitlistActions: waitListInterface = {
  addUser: async (req: Request, res: Response) => {
    let { name, email } = req.body;

    name = xss(name);
    email = xss(email);
    
    if (!name || !email) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const doesUserExist = await userWaitlist.findOne({
        where: { email },
      });

      if (doesUserExist) {
        return res
          .status(409)
          .json({ error: "User already exists.", message: "You're already on the waitlist!" });
      }

      await userWaitlist.create({ name, email});
      sendWaitlistMail(email, name);

      return res
        .status(201)
        .json({ success: true, message: "Your waitlist entry has been recorded." });

    } catch (error) {
        console.error(error);
      return res
        .status(500)
        .json({ error: "Server error.", message: "Error connecting to the database." });
    }
  },

  getUser: async (req:Request, res: Response) => {
    const email =  req.params.email;

    if(!email){
        userWaitlist.findAll().then((users) => {
            return res.status(200).json({success: true, data: users});
        })
        .catch((error) => {
            return res.status(500).json({error: 'Server error.'});
        });
    }
    else{
        const user = await userWaitlist.findOne({where: {email: email}});

        if(!user){
            return res.status(404).json({error: 'User not found.'});
        }
        else{
            return res.status(200).json({success: true, data: user});
        }
    }


  },

  deleteUser : async (req, res) => {
    const email = req.query.email;

    if(!email){
      return res.status(400).json({error: "Bad request.", message: "Email is not provided."});
    }

    userWaitlist.destroy({where: {email}})
    .then(() => {
      return res.status(204).json({success: true, message: 'User deleted sucessfully.'});
    })
    .catch(() => {
      return res.status(500).json({error: "Error deleting user."});
    })
  },

  sendWaitlistMail: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if(!token){
        return res.status(401).json({error: 'Unauthorized access.'});
      }
      let emails: string[] = [];

      if(token !== process.env.ADMIN_TOKEN){
        return res.status(401).json({error: 'Unauthorized access.'});
      }

      const waitlistUsers = await UserWaitlist.findAll({
        attributes: ['email', 'name'],
      });
  
      if (waitlistUsers.length === 0) {
        return res.status(404).json({ error: "No users found in the waitlist." });
      }
  
      for (const user of waitlistUsers) {
        try {
          if(emails.includes(user.email)){
            console.warn(`Email already sent to ${user.email}, skipping...`);
            continue;
          }
          await sendWaitlistForm1(user.email, user.name);
          emails.push(user.email);
        } catch (err: any) {
          console.warn(`Failed to send email to ${user.email}:`, err.message);
        }
      }
  
      return res.status(200).json({
        success: true,
        message: "Welcome emails processed (some may have failed).",
      });
    } catch (error) {
      console.error("Error sending waitlist mail:", error);
      return res.status(500).json({
        error: "Server error.",
        message: "Error sending welcome emails.",
      });
    }
  }
  

};

export default waitlistActions;
