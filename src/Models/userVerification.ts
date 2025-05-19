import { DataTypes, Sequelize, Model } from "sequelize";
import sequelize from "../config/Sequelize";    

class UserVerification extends Model {
    public id!: number;
    public userEmail!: number;
    public isVerified!: boolean;
}

UserVerification.init(
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
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize: sequelize as Sequelize,
        modelName: "UserVerification",
        tableName: "user_verification",
        timestamps: true,
    }
);

export default UserVerification;