// This is a Sequelize model
module.exports = function(sequelize, DataTypes) {
  let User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV1
    },
    must_update_username: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    must_update_password: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    paranoid: true,
    underscored: true,
    classMethods: {
      // Foreign key to the user_roles table
      associate: function (models) {
        User.belongsToMany(models.role, { through: 'user_role', foreignKey: 'user_id' });
      }
    }
  });

  return User;
};