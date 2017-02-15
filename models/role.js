// This is a Sequelize model
module.exports = function(sequelize, DataTypes) {
  let Role = sequelize.define("role", {
    name: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    timestamps: false,
    hooks: {
      afterSync: function (options) {
        let self = this;
        // Here is where you can add roles to the table. There may be a better way to do this.
        return self.count().then(function (c) {
          // Increment this if you want to add a role
          let roleCount = 1;
          if (c < roleCount) {
            // Insert roles if they do not yet exist
            // Note: Additions will only take effect on app restart
            return self.findOrCreate({ where: { name: 'admin' } }).then(function () {
              return self.findOrCreate({ where: { name: 'readonly' } });
            }).then(function () {
              return self.findOrCreate({ where: { name: 'samplerole1' } });
            }).then(function () {
              return self.findOrCreate({ where: { name: 'samplerole2' } });
            });
          }
        });
      }
    },
    classMethods: {
      // Foreign key to the user_roles table
      associate: function (models) {
        Role.belongsToMany(models.user, { through: 'user_role', foreignKey: 'role_id' });
      }
    }
  });

  return Role;
};