const { DataTypes } = require('sequelize');

/**
 * 課程排課模型 Course Schedule Model
 */
module.exports = (sequelize) => {
  const CourseSchedule = sequelize.define('course_schedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '排課ID Schedule ID'
    },
    school_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '補習班名稱 School Name'
    },
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '班級名稱 Class Name'
    },
    course_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '課程種類 Course Type'
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '授課老師ID (null 表示待訂教師) Teacher ID (null means pending assignment)'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '上課日期 Course Date'
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: '開始時間 Start Time'
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: '結束時間 End Time'
    },
    course_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '課程鐘點費 Course Fee'
    },
    teacher_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '老師實拿鐘點 Teacher Fee'
    },
    company_code: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '公司代碼 Company Code'
    },
    // 新增重複性課程相關欄位 Add fields for recurring courses
    is_recurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否為重複性課程 Is this a recurring course'
    },
    series_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: '重複性課程系列ID Recurring course series ID'
    },
    recurring_days: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: '重複性課程的星期幾 [1-7] Recurring days of the week [1-7]'
    },
    recurring_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '重複性課程開始日期 Recurring course start date'
    },
    recurring_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '重複性課程結束日期 Recurring course end date'
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
        fields: ['teacher_id'],
        name: 'idx_schedule_teacher_id'
      },
      {
        fields: ['date'],
        name: 'idx_schedule_date'
      },
      {
        fields: ['company_code'],
        name: 'idx_schedule_company_code'
      },
      {
        fields: ['is_recurring'],
        name: 'idx_schedule_is_recurring'
      },
      {
        fields: ['series_id'],
        name: 'idx_schedule_series_id'
      },
      {
        fields: ['recurring_start_date'],
        name: 'idx_schedule_recurring_start_date'
      },
      {
        fields: ['recurring_end_date'],
        name: 'idx_schedule_recurring_end_date'
      }
    ]
  });

  CourseSchedule.associate = (models) => {
    CourseSchedule.belongsTo(models.Teacher, {
      foreignKey: 'teacher_id',
      as: 'teacher'
    });

    CourseSchedule.hasMany(models.CourseAssistant, {
      foreignKey: 'schedule_id',
      as: 'assistants'
    });
  };

  return CourseSchedule;
}; 