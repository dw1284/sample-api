// This is a Sequelize model
module.exports = function(sequelize, DataTypes) {
  let User_Role = sequelize.define("user_role", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    }
  }, {
    timestamps: false,
    underscored: true
  });

  return User_Role;
};