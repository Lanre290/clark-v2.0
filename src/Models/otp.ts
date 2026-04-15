import { DataTypes, Sequelize, Model } from "sequelize";
import sequelize from "../config/Sequelize";    

class UserOtp extends Model {
    public id!: number;
    public userEmail!: string;
    public otp!: number;
}

UserOtp.init(
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
        otp: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize as Sequelize,
        modelName: "UserOtp",
        tableName: "user_otp",
        timestamps: true,
    }
);

export default UserOtp;