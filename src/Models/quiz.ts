import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class Quiz extends Model {
  public id!: string;
  public name!: string;
  public creator!: string;
  public userId!: number;
  public workspaceId!: string;
  public fileId!: string;
  public quizSource!: string;
  public quizSourceType!: string;
  public duration!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Quiz.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    workspaceId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
    fileId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    quizSource: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    quizSourceType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "quiz",
    modelName: "Quiz",
  }
);

export default Quiz;
