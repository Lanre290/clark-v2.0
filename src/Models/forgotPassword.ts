import { DataTypes, Sequelize, Model } from "sequelize";
import sequelize from "../config/Sequelize";

class ForgotPassword extends Model {
    public id!: number;
    public userEmail!: string;
    public token!: string;
    public isValid!: boolean;
}

ForgotPassword.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userEmail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isValid: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize: sequelize as Sequelize,
        modelName: "ForgotPassword",
        tableName: "forgot_password",
        timestamps: true,
    }
);

export default ForgotPassword;