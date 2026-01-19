import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class QuizLoaded extends Model {
    public id!: string;
    public userId!: string;
    public quizId!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

QuizLoaded.init(
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
        },
        quizId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize as Sequelize,
        tableName: "quiz_loaded",
        modelName: "QuizLoaded",
    }
);

export default QuizLoaded;
