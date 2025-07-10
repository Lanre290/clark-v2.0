import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class FlashcardQuestions extends Model {
    public id!: string;
    public question!: string;
    public answer!: string;
    public flashcardId!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

FlashcardQuestions.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        answer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        explanation: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        flashcardId: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    {
        sequelize: sequelize as Sequelize,
        tableName: "flashcard_questions",
        modelName: "FlashcardQuestions",
    }
);

export default FlashcardQuestions;