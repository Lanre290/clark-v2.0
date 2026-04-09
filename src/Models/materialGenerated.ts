import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class materialGenerated extends Model {
    public id!: string;
    public userId!: string;
    public quizId!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

materialGenerated.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    },
    {
        sequelize: sequelize as Sequelize,
        tableName: "material_generated",
        modelName: "materialGenerated",
    }
);

export default materialGenerated;
