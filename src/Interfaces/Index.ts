import { Request, Response } from "express";

type UserActionFn = (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;


type AuthActionFn = (
    req: Request,
    res: Response
) => Promise<Response | void>;

export interface prefileInterface {
    originalname: string;
    size: string;
    mimetype: string;
    url: string;   
    workspaceId: string;
}

export interface AuthControllerInterface {
  login: AuthActionFn;
  signup: AuthActionFn;
  refreshToken: UserActionFn;
  sendOTP: AuthActionFn;
  verifyOTP: AuthActionFn;
  sendForgotPasswordEmail: AuthActionFn;
  resetPassword: AuthActionFn;
  verifyToken: AuthActionFn;
  completeSignup: UserActionFn
}
export interface waitListInterface {
  addUser: AuthActionFn;
  getUser: AuthActionFn;
  deleteUser: AuthActionFn;
  sendWaitlistMail: AuthActionFn;
}

export interface afterVerificationMiddlerwareInterface {
  user: {
    id: number;
    name: string;
    email: string;
  };
}
