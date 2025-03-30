const { sequelize } = require('../config/database');
const Teacher = require('./teacher')(sequelize);
const CourseSchedule = require('./courseSchedule')(sequelize);
const CourseAssistant = require('./courseAssistant')(sequelize);

// 定義模型關聯 Define model associations
Object.values({ Teacher, CourseSchedule, CourseAssistant }).forEach((model) => {
    if (model.associate) {
        model.associate({ Teacher, CourseSchedule, CourseAssistant });
    }
});

module.exports = {
    sequelize,
    Teacher,
    CourseSchedule,
    CourseAssistant
}; 