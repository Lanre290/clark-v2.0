import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class ImageFiles extends Model {
  public id!: string;
  public fileName!: string;
  public workspaceId!: string;
  public chatId!: string | null;
  public userId!: string;
  public filePath!: string;
  public summary!: string | null;
  public size!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ImageFiles.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workspaceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    chatId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "image_files",
    modelName: "ImageFiles",
  }
);

export default ImageFiles;
