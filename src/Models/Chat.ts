import { DataTypes, Sequelize, Model, Op } from "sequelize";
import sequelize from '.././config/Sequelize';

class Chats extends Model {
    public id!: number;
    public userId!: number;
    public workspaceId!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Chats.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        workspaceId: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        sequelize: sequelize as Sequelize,
        modelName: 'Chats',
        tableName: 'chats',

        hooks: {
            beforeCreate: async (chat: any) => {
            if (!chat.name || chat.name.trim() === "") {
                const count = await Chats.count({
                where: {
                    name: {
                    [Op.like]: 'Untitled-%',
                    },
                    userId: chat.userId
                },
                });
                chat.name = `Untitled-${count + 1}`;
            }
            },
        },
    }
);


export default Chats;