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
  public plan!: string;
  public subscriptionstatus!: string;
  public paystackcustomercode!: string | null;
  public paystackauthorizationcode!: string | null;
  public nextbillingdate!: Date | null;
  public streakCount!: number;
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
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
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
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Free',
    },
    subscriptionstatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "None", // or another default enum-like value
    },
    paystackcustomercode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paystackauthorizationcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nextbillingdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    streakCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "users",
  }
);

export default User;
