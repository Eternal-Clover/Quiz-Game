"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Rooms (as host)
      User.hasMany(models.Room, {
        foreignKey: "hostId",
        as: "hostedRooms",
      });

      // User has many Leaderboard entries
      User.hasMany(models.Leaderboard, {
        foreignKey: "userId",
        as: "leaderboardEntries",
      });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 50],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 255],
        },
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "https://ui-avatars.com/api/?name=User",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
    }
  );
  return User;
};
