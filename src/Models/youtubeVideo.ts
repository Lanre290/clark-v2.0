import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class YouTubeVideo extends Model {
  public id!: number;
  public videoId!: string;
  public title!: string;
  public description!: string;
  public channelTitle!: string;
  public thumbnailUrl!: string;
  public viewCount!: number;
  public likeCount!: number;
  public commentCount!: number;
  public duration!: string;
  public workspaceId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}


YouTubeVideo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    videoId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT, 
      allowNull: false,
    },
    channelTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workspaceId: {
      type: DataTypes.STRING,
      allowNull: false,
  },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "youtube_videos",
    modelName: "YouTubeVideo",
  }
);

export default YouTubeVideo;