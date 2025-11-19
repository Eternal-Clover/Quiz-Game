"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Question belongs to Quiz
      Question.belongsTo(models.Quiz, {
        foreignKey: "quizId",
        as: "quiz",
      });
    }
  }
  Question.init(
    {
      quizId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Quizzes",
          key: "id",
        },
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      options: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          notEmpty: true,
          isValidOptions(value) {
            if (!Array.isArray(value) || value.length < 2 || value.length > 4) {
              throw new Error("Options must be an array with 2 to 4 items");
            }
          },
        },
      },
      correctAnswer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 3,
          isValidIndex(value) {
            // This will be checked after options validation
            // Just make sure it's a valid integer
            if (!Number.isInteger(value)) {
              throw new Error("correctAnswer must be an integer");
            }
          },
        },
      },
      timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        validate: {
          min: 5,
          max: 120,
        },
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
        validate: {
          min: 10,
          max: 1000,
        },
      },
    },
    {
      sequelize,
      modelName: "Question",
      tableName: "Questions",
      timestamps: true,
    }
  );
  return Question;
};
