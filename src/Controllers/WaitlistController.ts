import { Request, Response } from "express";
import userWaitlist from "../Models/Waitlist";

interface waitListInterface {
  addUser: (req: Request, res: Response) => Promise<Response | void>;
  getUser: (req: Request, res: Response) => Promise<Response | void>;
}

const waitlistActions: waitListInterface = {
  addUser: async (req: Request, res: Response) => {
    const { name, email, phone_number, source } = req.body;

    if (!name || !email || !phone_number) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const doesUserExist = await userWaitlist.findOne({
        where: { email, phone_number },
      });

      if (doesUserExist) {
        return res
          .status(409)
          .json({ error: "User already exists.", message: "You're already on the waitlist!" });
      }

      await userWaitlist.create({ name, email, phone_number, source });

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


  }
};

export default waitlistActions;
