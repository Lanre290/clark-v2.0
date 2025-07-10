import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class userAnswers extends Model {
  public id!: string;
  public name!: string;
  public userEmail!: string;
  public quizId!: string;
  public userScore!: string;
  public totalQuestions!: string;
  public userAnswers!: any;
  public percentage!: string;
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
    userAnswers: {
      type: DataTypes.JSON,
      allowNull: false,
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
