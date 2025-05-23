import { DataTypes, Sequelize, Model, Op } from "sequelize";
import sequelize from '.././config/Sequelize';

class Messages extends Model {
    public id!: number;
    public userId!: number;
    public workspaceId!: string;
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
            type: DataTypes.STRING,
            allowNull: false,
        },
        chatId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isFile: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        file_ref: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
    },
    {
        sequelize: sequelize as Sequelize,
        modelName: 'Messages',
        tableName: 'messages',
    }
);


export default Messages;