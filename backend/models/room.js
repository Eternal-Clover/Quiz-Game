"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    static associate(models) {
      Room.belongsTo(models.User, {
        foreignKey: "hostId",
        as: "host",
      });

      // Room belongs to Quiz
      Room.belongsTo(models.Quiz, {
        foreignKey: "quizId",
        as: "quiz",
      });

      // Room has many Leaderboard entries
      Room.hasMany(models.Leaderboard, {
        foreignKey: "roomId",
        as: "leaderboard",
      });
    }
  }
  Room.init(
    {
      code: {
        type: DataTypes.STRING(6),
        allowNull: false,
        unique: true,
        validate: {
          len: [6, 6],
        },
      },
      hostId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      quizId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Quizzes",
          key: "id",
        },
      },
      maxPlayers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
          min: 2,
          max: 50,
        },
      },
      status: {
        type: DataTypes.ENUM("waiting", "playing", "finished"),
        allowNull: false,
        defaultValue: "waiting",
      },
      currentQuestion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      players: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
      },
    },
    {
      sequelize,
      modelName: "Room",
      tableName: "Rooms",
      timestamps: true,
    }
  );
  return Room;
};
