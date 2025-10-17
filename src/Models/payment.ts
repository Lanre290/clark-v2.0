import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class Payments extends Model {
  public id!: number;
  public userId!: number;
  public email!: string;
  public reference!: string;
  public subscriptionCode!: string | null;
  public amount!: number;
  public currency!: string;
  public status!: number;
  public paymentDate!: Date;
  public confirmedAt!: Date | null;
  public dateModified!: Date | null;
  public dateCreated!: Date;
}

Payments.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    subscriptionCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dateModified: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dateCreated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "payments",
    modelName: "Payments",
    timestamps: false,
  }
);

export default Payments;
