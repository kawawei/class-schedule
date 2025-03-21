const { sequelize } = require('../config/database');
const Teacher = require('./teacher')(sequelize);

// 定義模型關聯 Define model associations
Object.values({ Teacher }).forEach((model) => {
    if (model.associate) {
        model.associate({ Teacher });
    }
});

module.exports = {
    sequelize,
    Teacher
}; 