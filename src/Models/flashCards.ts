import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/Sequelize";

class FlashCard extends Model {
    public id!: string;
    public userId!: string;
    public workspaceId!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

FlashCard.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        workspaceId: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        }
    },
    {
        sequelize: sequelize as Sequelize,
        tableName: "flashCards",
        modelName: "FlashCard",
    }
);

export default FlashCard;
