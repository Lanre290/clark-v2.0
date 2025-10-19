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
  public study_vibe!: object;
  public image_url!: string;
  public oauth!: string;
  public plan!: string;
  public subscriptionstatus!: number;
  public paystackcustomercode!: string | null;
  public paystackauthorizationcode!: string | null;
  public nextbillingdate!: Date | null;
  public streakCount!: number;
  public lastStreakDate!: Date | null;
  public account_completed!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    nickname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    school: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    interests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    study_vibe: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    oauth: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Free',
    },
    subscriptionstatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paystackcustomercode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    paystackauthorizationcode: {
      type: DataTypes.STRING(255),
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
    lastStreakDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    account_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "users",
    timestamps: true, 
  }
);

export default User;
