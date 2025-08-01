import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class userAnswers extends Model {
  public id!: string;
  public name!: string;
  public userEmail!: string;
  public quizId!: string;
  public userScore!: string;
  public totalQuestions!: string;
  public timeTaken!: number | null; // Nullable if not provided
  public userAnswers!: any;
  public percentage!: string;
  public timeRemaining?: string | null; // Nullable if not provided
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

userAnswers.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quizId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userScore: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalQuestions: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timeTaken: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userAnswers: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    timeRemaining: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "0:00",
    },
    percentage: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0%',  
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "userAnswers",
    modelName: "userAnswers",
  }
);

export default userAnswers;
