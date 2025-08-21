import AuthController from "./src/Controllers/auth.controller";
import { createWorkspace } from "./src/Controllers/workspace/createWorkspace.controller";
import waitlistActions from "./src/Controllers/waitlist.controller";
import middleware from "./src/Middlewares/Auth.middleware";
import { sanitizeRequest } from "./src/Middlewares/sanitizeRequest.middleware";
import { upload } from "./src/Services/Multer.services";
import sequelize from "./src/config/Sequelize";
import { askQuestion } from "./src/Controllers/userActions/askQuestion.controller";
import { generateMaterial } from "./src/Controllers/userActions/generateMaterial.controller";
import { addFiles } from "./src/Controllers/userActions/addFiles.controller";
import { generateQuiz } from "./src/Controllers/userActions/generateQuiz.controller";
import { assessUserAnswers } from "./src/Controllers/userActions/assessUserAnswers.controllers";
import { fetchQuizLeaderBoard } from "./src/Controllers/userActions/fetchQuizLeaderBoard.controller";
import { fetchUserQuizScore } from "./src/Controllers/userActions/fetchUserQuizScore.controller";
import { deleteEntryFromQuiz } from "./src/Controllers/userActions/deleteEntryFromQuiz.controller";
import { getUserProgress } from "./src/Controllers/userActions/getUserProgress.controller";
import { generateFlashcards } from "./src/Controllers/userActions/generateFlashcards.controller";
import { getFlashCard } from "./src/Controllers/userActions/fetchFlashcards.controller";
import { deleteFlashCard } from "./src/Controllers/userActions/deleteFlashcard.controller";
import { getWorkspace } from "./src/Controllers/userActions/getWorkspace.controller";
import { getYoutubeVideo } from "./src/Controllers/userActions/getYoutubeVideo.controller";
import { addYoutubeVideo } from "./src/Controllers/userActions/addYoutubeVideo.controller";
import { generateRandomFact } from "./src/Controllers/userActions/generateRandomFact.controller";
import { suggestQuestion } from "./src/Controllers/userActions/suggestQuestions.controller";
import { getQuiz } from "./src/Controllers/userActions/getQuiz.controller";
import { deleteQuiz } from "./src/Controllers/userActions/deleteQuiz.controller";
import { deleteFiles } from "./src/Controllers/userActions/deleteFiles.controller";
import { getFile } from "./src/Controllers/userActions/getFile.controller";
import { sendChat } from "./src/Controllers/userActions/sendChat.controller";
import { createChat } from "./src/Controllers/userActions/createchat.controller";
import { getChat } from "./src/Controllers/userActions/getChat.controller";
import { generateRandomQuestion } from "./src/Controllers/userActions/generateRandomQuestion.controller";
import { deleteChat } from "./src/Controllers/userActions/deleteChat.controller";
import { deleteWorkspace } from "./src/Controllers/userActions/deleteWorkspace.controller";
import { fetchWorkspaceQuiz } from "./src/Controllers/userActions/fetchWorkspaceQuiz.controller";
import { fetchWorkspaceFlashCard } from "./src/Controllers/userActions/fetchWorkspaceFlashcard.controller";
import { generateSummary } from "./src/Controllers/userActions/generateSummaryy.controller";
import { search } from "./src/Controllers/userActions/search.controller";

const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
var bodyParser = require("body-parser");

const app = express();
dotenv.config();

const FRONTEND_URL: any = process.env.FRONTEND_URL;
const PORT = process.env.PORT || 8000;

interface corsInterface {
  origin: string;
  methods: string[];
  allowedHeaders?: string[];
}

const allowedCorsUrls = FRONTEND_URL
    ? FRONTEND_URL.split(',')
    : [];

    console.log(allowedCorsUrls)

const corsOption: corsInterface = {
  origin: allowedCorsUrls,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV == 'dev' ? 'false' : 'true' },
  })
);

app.use(sanitizeRequest);  // Sanitize request body middleware


// Auth Routes
app.post("/api/v1/login", AuthController.login);
app.post("/api/v1/signup", AuthController.signup);
app.get("/api/v1/refreshToken", middleware.verifyToken, AuthController.refreshToken);
app.post("/api/v1/verifyOTP", AuthController.verifyOTP);
app.post("/api/v1/otp", AuthController.sendOTP);
app.post("/api/v1/forgotPassword", AuthController.sendForgotPasswordEmail);
app.post("/api/v1/resetPassword", AuthController.resetPassword);
app.post("/api/v1/verifyToken", AuthController.verifyToken);
app.post("/api/v1/completeSignup", upload.single('user_image'), AuthController.completeSignup);

app.get("/api/v1/waitlist/:email?", waitlistActions.getUser);
app.post("/api/v1/waitlist", waitlistActions.addUser);
app.delete("/api/v1/waitlist", waitlistActions.deleteUser);
app.post("/api/v1/waitlist/mail", waitlistActions.sendWaitlistMail);


app.post("/api/v1/askQuestion", middleware.verifyToken, askQuestion);
app.post("/api/v1/workspace", middleware.verifyToken, createWorkspace);
app.get("/api/v1/workspace/:id?", middleware.verifyToken, getWorkspace);

app.post("/api/v1/files", middleware.verifyToken, upload.array('files', 10), addFiles);
app.delete("/api/v1/files", middleware.verifyToken, deleteFiles);


app.post("/api/v1/generateMaterial", middleware.verifyToken, upload.array('files', 10), generateMaterial);
app.post("/api/v1/generateQuiz", middleware.verifyToken, generateQuiz);
app.post("/api/v1/generateFlashcards", middleware.verifyToken, generateFlashcards);
app.get("/api/v1/flashcard/:flashcard_id?", getFlashCard);

app.get("/api/v1/youtube/:id?", middleware.verifyToken, getYoutubeVideo);
app.post("/api/v1/youtube", middleware.verifyToken, addYoutubeVideo);
app.get("/api/v1/facts", middleware.verifyToken, generateRandomFact);
app.post("/api/v1/suggestQuestion",middleware.verifyToken, suggestQuestion);
app.get("/api/v1/quiz/:quiz_id?", getQuiz);
app.get("/api/v1/files/:file_id?", middleware.verifyToken, getFile);
app.get("/api/v1/randomQuestion", middleware.verifyToken, generateRandomQuestion);
app.post("/api/v1/assessAnswers", middleware.tokenRequired, assessUserAnswers);
app.get("/api/v1/leaderboard/:quiz_id?", middleware.verifyToken, fetchQuizLeaderBoard);
app.get("/api/v1/userProgress/:id", middleware.verifyToken, getUserProgress);
app.delete("/api/v1/userAnswer", middleware.verifyToken, deleteEntryFromQuiz);
app.delete("/api/v1/quiz/:quiz_id", middleware.verifyToken, deleteQuiz);
app.delete("/api/v1/flashcard/:flashcard_id", middleware.verifyToken, deleteFlashCard);
app.delete("/api/v1/chat/:chat_id", middleware.verifyToken, deleteChat);
app.delete("/api/v1/workspace/:id", middleware.verifyToken, deleteWorkspace);
app.get("/api/v1/quizScore/:quiz_id", middleware.verifyToken, fetchUserQuizScore);
app.get("/api/v1/workspaceQuiz", middleware.verifyToken, fetchWorkspaceQuiz);
app.get("/api/v1/workspaceFlashCard", middleware.verifyToken, fetchWorkspaceFlashCard);
app.post("/api/v1/generateSummary", middleware.verifyToken, upload.array('files', 10), generateSummary);

app.post("/api/v1/chats", middleware.verifyToken, createChat);

app.post("/api/v1/aichat", middleware.verifyToken, upload.array('files', 10), sendChat);
app.get("/api/v1/aichat", middleware.verifyToken, getChat);

app.get("/api/v1/search", middleware.verifyToken, search)

console.log("starting server...");


const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connection established");

    await sequelize.sync({ alter: true });
    console.log("Database synced");

    app.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
  }
};

startServer();


// scoring users and storing it
// sorting and organizing workspace
// streaks tracking
// rate limiting