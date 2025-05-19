import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public nickname!: string;
  public password!: string;
  public role!: string;
  public school!: string;
  public department!: string;
  public interests!: string;
  public study_vibe!: string;
  public image_url!: string;
  public oauth!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    school: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    interests: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    study_vibe: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    oauth: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "users",
  }
);

export default User;
