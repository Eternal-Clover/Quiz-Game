"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Leaderboard extends Model {
    static associate(models) {
      // Leaderboard belongs to Room
      Leaderboard.belongsTo(models.Room, {
        foreignKey: "roomId",
        as: "room",
      });

      // Leaderboard belongs to User
      Leaderboard.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  Leaderboard.init(
    {
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Rooms",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      correctAnswers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      timeBonus: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Leaderboard",
      tableName: "Leaderboards",
      timestamps: true,
    }
  );
  return Leaderboard;
};
