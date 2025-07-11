import AuthController from "./Controllers/auth.controller";
import userActions from "./Controllers/user.controller";
import waitlistActions from "./Controllers/waitlist.controller";
import middleware from "./Middlewares/Auth.middleware";
import { sanitizeRequest } from "./Middlewares/sanitizeRequest.middleware";
import { upload } from "./Services/Multer.services";
import sequelize from "./config/Sequelize";

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
app.post("/api/v1/signup", upload.single('user_image'), AuthController.signup);
app.get("/api/v1/refreshToken", middleware.verifyToken, AuthController.refreshToken);
app.post("/api/v1/verifyOTP", AuthController.verifyOTP);
app.post("/api/v1/otp", AuthController.sendOTP);
app.post("/api/v1/forgotPassword", AuthController.sendForgotPasswordEmail);
app.post("/api/v1/resetPassword", AuthController.resetPassword);
app.post("/api/v1/verifyToken", AuthController.verifyToken);
app.post("/api/v1/completeSignup", middleware.verifyToken, AuthController.completeSignup);

app.get("/api/v1/waitlist/:email?", waitlistActions.getUser);
app.post("/api/v1/waitlist", waitlistActions.addUser);
app.delete("/api/v1/waitlist", waitlistActions.deleteUser);
app.post("/api/v1/waitlist/mail", waitlistActions.sendWaitlistMail);


app.post("/api/v1/askQuestion", middleware.verifyToken, userActions.askQuestion);
app.post("/api/v1/workspace", middleware.verifyToken, userActions.createWorkspace);
app.get("/api/v1/workspace/:id?", middleware.verifyToken, userActions.getWorkspace);

app.post("/api/v1/files", middleware.verifyToken, upload.array('files', 10), userActions.addFiles);
app.delete("/api/v1/files", middleware.verifyToken, userActions.deleteFiles);


app.post("/api/v1/generateMaterial", middleware.verifyToken, upload.array('files', 10), userActions.generateMaterial);
app.post("/api/v1/generateQuiz", middleware.verifyToken, userActions.generateQuiz);
app.post("/api/v1/generateFlashcards", middleware.verifyToken, userActions.generateFlashcards);
app.get("/api/v1/flashcard/:flashcard_id?", userActions.getFlashCard);

app.get("/api/v1/youtube/:id?", middleware.verifyToken, userActions.getYoutubeVideo);
app.post("/api/v1/youtube", middleware.verifyToken, userActions.addYoutubeVideo);
app.get("/api/v1/facts", middleware.verifyToken, userActions.generateRandomFact);
app.post("/api/v1/suggestQuestion",middleware.verifyToken, userActions.suggestQuestion);
app.get("/api/v1/quiz/:quiz_id?", userActions.getQuiz);
app.get("/api/v1/files/:file_id?", middleware.verifyToken, userActions.getFile);
app.get("/api/v1/randomQuestion", middleware.verifyToken, userActions.generateRandomQuestion);
app.post("/api/v1/assessAnswers", userActions.assessUserAnswers);
app.get("/api/v1/leaderboard/:quiz_id?", middleware.verifyToken, userActions.fetchQuizLeaderBoard);
app.get("/api/v1/userProgress/:id", middleware.verifyToken, userActions.getUserProgress);
app.delete("/api/v1/userAnswer", middleware.verifyToken, userActions.deleteEntryFromQuiz);
app.delete("/api/v1/quiz/:quiz_id", middleware.verifyToken, userActions.deleteQuiz);
app.delete("/api/v1/flashcard/:flashcard_id", middleware.verifyToken, userActions.deleteFlashCard);
app.delete("/api/v1/chat/:chat_id", middleware.verifyToken, userActions.deleteChat);
app.delete("/api/v1/workspace/:id", middleware.verifyToken, userActions.deleteWorkspace);
app.get("/api/v1/quizScore/:quiz_id", middleware.verifyToken, userActions.fetchUserQuizScore);
app.get("/api/v1/workspaceQuiz", middleware.verifyToken, userActions.fetchWorkspaceQuiz);
app.get("/api/v1/workspaceFlashCard", middleware.verifyToken, userActions.fetchWorkspaceFlashCard);

app.post("/api/v1/ai_chat", middleware.verifyToken, userActions.sendChat);
app.post("/api/v1/chats", middleware.verifyToken, userActions.createChat);

app.post("/api/v1/aichat", middleware.verifyToken, upload.array('files', 10), userActions.sendChat);
app.get("/api/v1/aichat", middleware.verifyToken, userActions.getChat)

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