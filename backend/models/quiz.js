"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    static associate(models) {
      // Quiz has many Questions
      Quiz.hasMany(models.Question, {
        foreignKey: "quizId",
        as: "questions",
      });

      // Quiz has many Rooms
      Quiz.hasMany(models.Room, {
        foreignKey: "quizId",
        as: "rooms",
      });
      // define association here
    }
  }
  Quiz.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 200],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isIn: [
            [
              "Science",
              "History",
              "Geography",
              "Pop Culture",
              "Sports",
              "Technology",
              "General Knowledge",
              "Other",
            ],
          ],
        },
      },
      difficulty: {
        type: DataTypes.ENUM("easy", "medium", "hard"),
        allowNull: false,
        defaultValue: "medium",
      },
      isAIGenerated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Quiz",
      tableName: "Quizzes",
      timestamps: true,
    }
  );
  return Quiz;
};
