const { sequelize } = require('../config/database');
const Teacher = require('./teacher')(sequelize);
const CourseSchedule = require('./courseSchedule')(sequelize);
const CourseAssistant = require('./courseAssistant')(sequelize);
const Course = require('./course');
const TeacherReport = require('./teacherReport');

// 定義模型關聯 Define model associations
Object.values({ Teacher, CourseSchedule, CourseAssistant }).forEach((model) => {
    if (model.associate) {
        model.associate({ Teacher, CourseSchedule, CourseAssistant });
    }
});

// 老師報告關聯 Teacher report associations
TeacherReport.belongsTo(CourseSchedule, {
  foreignKey: 'scheduleId',
  as: 'schedule'
});

TeacherReport.belongsTo(Teacher, {
  foreignKey: 'teacherId',
  as: 'reportTeacher'
});

CourseSchedule.hasMany(TeacherReport, {
  foreignKey: 'scheduleId',
  as: 'reports'
});

Teacher.hasMany(TeacherReport, {
  foreignKey: 'teacherId',
  as: 'reports'
});

module.exports = {
    sequelize,
    Teacher,
    CourseSchedule,
    CourseAssistant,
    Course,
    TeacherReport
}; 