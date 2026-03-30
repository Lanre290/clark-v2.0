import { Request, Response } from "express";
import User from "../../Models/User";
import { afterVerificationMiddlerwareInterface } from "../../Interfaces/Index";

export const updateUserDetails = async (req: Request & afterVerificationMiddlerwareInterface, res: Response) => {
  const userId = req.user.id;
  const userDetails = req.body;

    delete userDetails.password;
    delete userDetails.id;
    delete userDetails.plan;
    delete userDetails.subscriptionstatus;
    delete userDetails.paystackcustomercode;
    delete userDetails.paystackauthorizationcode;
    delete userDetails.nextbillingdate;
    delete userDetails.streakCount;
    delete userDetails.lastStreakDate;
    delete userDetails.account_completed;
    delete userDetails.oauth;
    delete userDetails.image_url;
    
    console.log(userDetails);

  try {
    await User.update(userDetails, {
      where: { id: userId },
    });

    res.status(200).json({success: true});
  } catch (error) {
    res.status(500).json({ error: "Failed to update user details" });
  }
};