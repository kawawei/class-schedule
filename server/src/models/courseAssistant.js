const { DataTypes } = require('sequelize');

/**
 * 課程助教模型 Course Assistant Model
 */
module.exports = (sequelize) => {
  const CourseAssistant = sequelize.define('course_assistant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '助教排課ID Assistant Schedule ID'
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '課程排課ID Course Schedule ID'
    },
    assistant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '助教ID Assistant ID'
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '助教鐘點費 Assistant Fee'
    },
    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '公司代碼 Company Code'
    }
  }, {
    // 添加時間戳 Add timestamps
    timestamps: true,
    
    // 自定義時間戳字段名 Customize timestamp field names
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    // 添加索引 Add indexes
    indexes: [
      {
        fields: ['schedule_id'],
        name: 'idx_assistant_schedule_id'
      },
      {
        fields: ['assistant_id'],
        name: 'idx_assistant_assistant_id'
      },
      {
        fields: ['company_code'],
        name: 'idx_assistant_company_code'
      }
    ]
  });

  CourseAssistant.associate = (models) => {
    CourseAssistant.belongsTo(models.CourseSchedule, {
      foreignKey: 'schedule_id',
      as: 'schedule'
    });
  };

  return CourseAssistant;
}; 