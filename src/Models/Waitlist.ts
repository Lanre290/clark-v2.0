import { DataTypes, Model } from "sequelize";
const sequelize = require("./../Setup/Sequelize");

class userWaitlist extends Model {
  public id!: number;
  public name!: string;
  public phone_number!: string;
  public email!: string;
  public source!: string;
}

userWaitlist.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "users_waitlist",
  }
);

export default userWaitlist;
