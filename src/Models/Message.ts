import { DataTypes, Sequelize, Model, Op } from "sequelize";
import sequelize from '.././config/Sequelize';

class Messages extends Model {
    public id!: number;
    public text!: string;
    public chatId!: string;
    public forUser!: boolean;
    public fromUser!: boolean;
    public isFile!: boolean;
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
        }
    },
    {
        sequelize: sequelize as Sequelize,
        modelName: 'Messages',
        tableName: 'messages',
    }
);


export default Messages;