import { DataTypes, Model, Sequelize, Op } from "sequelize";
import sequelize from "../config/Sequelize";

class Workspace extends Model {
  public id!: number;
  public name!: string;
  public userId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Workspace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    enc_id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "0",
    }
  },
  {
    sequelize: sequelize as Sequelize,
    tableName: "workspaces",
    modelName: "Workspace",

    hooks: {
      beforeCreate: async (workspace: any) => {
        if (!workspace.name || workspace.name.trim() === "") {
          const count = await Workspace.count({
            where: {
              name: {
                [Op.like]: 'Untitled-%',
              },
              userId: workspace.userId
            },
          });
          workspace.name = `Untitled-${count + 1}`;
        }
      },
    },
  }
);

export default Workspace;
