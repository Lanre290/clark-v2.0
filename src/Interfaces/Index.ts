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

export interface userActionsInterface {
  createWorkspace: UserActionFn;
  askQuestion: UserActionFn;
  generateMaterial: UserActionFn;
  addFiles: UserActionFn;
  generateQuiz: UserActionFn;
  generateFlashcards: UserActionFn;
  getWorkspace: UserActionFn;
  getYoutubeVideo: UserActionFn;
  addYoutubeVideo: UserActionFn;
  generateRandomFact: UserActionFn;
  suggestQuestion: UserActionFn;
  getQuiz: UserActionFn;
  deleteFiles: UserActionFn;
  getFile: UserActionFn;
  sendChat: UserActionFn;
  createChat: UserActionFn;
  getChat: UserActionFn;
  generateRandomQuestion: UserActionFn;
  assessUserAnswers: UserActionFn;
  fetchQuizLeaderBoard: UserActionFn;
  getFlashCard: UserActionFn;
  getUserProgress: UserActionFn;
  deleteEntryFromQuiz: UserActionFn;
  deleteQuiz: UserActionFn;
  deleteFlashCard: UserActionFn;
  deleteChat: UserActionFn; 
  deleteWorkspace: UserActionFn;
  fetchUserQuizScore: UserActionFn;
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
