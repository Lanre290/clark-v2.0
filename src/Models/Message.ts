import { DataTypes, Sequelize, Model, Op } from "sequelize";
import sequelize from '.././config/Sequelize';

class Messages extends Model {
    public id!: number;
    public text!: string;
    public chatId!: string;
    public forUser!: boolean;
    public fromUser!: boolean;
    public isFile!: boolean;
    public filePath?: string;
    public size?: string;
    public isFlashcard!: boolean;
    public flashcardId?: string;
    public isQuiz!: boolean;
    public quizId?: string;
    public isGeneratedMaterial!: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Messages.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        chatId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fromUser: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        isFile: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        filePath: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        size: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        isFlashcard: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        flashcardId: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null
        },
        isQuiz:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        quizId: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null
        },
        isGeneratedMaterial: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        sequelize: sequelize as Sequelize,
        modelName: 'Messages',
        tableName: 'messages',
    }
);


export default Messages;