import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class Question extends Model {
  public id!: number;
  public quizId!: number;
  public question!: string;
  public options!: string;
  public correctAnswer!: string;
  public explanation!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quizId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    correctAnswer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "questions",
    modelName: "Question",
  }
);

export default Question;