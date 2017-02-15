// This is a Sequelize model
module.exports = function(sequelize, DataTypes) {
  let Question = sequelize.define("question", {
    text: {
      type: DataTypes.STRING
    },
    answer: {
      type: DataTypes.STRING
    }
  }, {
    paranoid: true,
    underscored: true
  });

  return Question;
};