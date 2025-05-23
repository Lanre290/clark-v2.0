import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class ImageFiles extends Model {
  public id!: string;
  public workspaceId!: string;
  public userId!: string;
  public filePath!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
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
      allowNull: false,
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
