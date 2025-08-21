import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class Payment extends Model {
  public id!: number;
  public userId!: number;
  public email!: string;
  public reference!: string;
  public subscriptionCode!: string | null;
  public amount!: number;
  public currency!: string;
  public status!: string;
  public paymentDate!: Date;
  public confirmedAt!: Date | null;
  public dateModified!: Date | null;
  public dateCreated!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "userId",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subscriptionCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "subscriptionCode",
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "paymentDate",
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "confirmedAt",
    },
    dateModified: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "dateModified",
    },
    dateCreated: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "dateCreated",
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "payments",
    timestamps: false,
  }
);

export default Payment;
