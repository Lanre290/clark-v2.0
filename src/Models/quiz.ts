import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class Quiz extends Model {
  public id!: number;
  public name!: string;
  public creator!: string;
  public userId!: string;
  public workspaceId!: string;
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    workspaceId: {
      type: DataTypes.STRING,
      allowNull: false,
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
