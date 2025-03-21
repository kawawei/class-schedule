const Joi = require('joi');
const ApiError = require('../utils/apiError');

/**
 * 驗證中間件 Validation Middleware
 */
const validationMiddleware = {
  /**
   * 驗證老師數據 Validate teacher data
   * @param {Object} req - 請求對象 Request object
   * @param {Object} res - 響應對象 Response object
   * @param {Function} next - 下一個中間件 Next middleware
   */
  validateTeacher: (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string()
        .required()
        .trim()
        .max(50)
        .messages({
          'string.empty': '姓名不能為空 Name cannot be empty',
          'string.max': '姓名不能超過50個字符 Name cannot exceed 50 characters',
          'any.required': '姓名為必填欄位 Name is required'
        }),
      
      email: Joi.string()
        .email()
        .allow('')
        .max(100)
        .messages({
          'string.email': '電子郵件格式不正確 Invalid email format',
          'string.max': '電子郵件不能超過100個字符 Email cannot exceed 100 characters'
        }),
      
      phone: Joi.string()
        .required()
        .pattern(/^09\d{8}$|^0[1-8]\d{7,8}$/)
        .messages({
          'string.empty': '電話不能為空 Phone cannot be empty',
          'string.pattern.base': '電話格式不正確 Invalid phone format',
          'any.required': '電話為必填欄位 Phone is required'
        }),
      
      line_id: Joi.string()
        .allow('')
        .max(50)
        .messages({
          'string.max': 'LINE ID不能超過50個字符 LINE ID cannot exceed 50 characters'
        }),
      
      county: Joi.string()
        .required()
        .trim()
        .max(20)
        .messages({
          'string.empty': '縣市不能為空 County cannot be empty',
          'string.max': '縣市不能超過20個字符 County cannot exceed 20 characters',
          'any.required': '縣市為必填欄位 County is required'
        }),
      
      district: Joi.string()
        .required()
        .trim()
        .max(20)
        .messages({
          'string.empty': '區域不能為空 District cannot be empty',
          'string.max': '區域不能超過20個字符 District cannot exceed 20 characters',
          'any.required': '區域為必填欄位 District is required'
        }),
      
      address: Joi.string()
        .allow('')
        .max(200)
        .messages({
          'string.max': '地址不能超過200個字符 Address cannot exceed 200 characters'
        }),
      
      teaching_categories: Joi.array()
        .items(Joi.string())
        .min(1)
        .required()
        .messages({
          'array.min': '至少選擇一個教學種類 Please select at least one teaching category',
          'any.required': '教學種類為必填欄位 Teaching categories is required'
        }),
      
      level: Joi.string()
        .required()
        .valid('初級', '中級', '高級')
        .messages({
          'string.empty': '等級不能為空 Level cannot be empty',
          'any.only': '等級必須是初級、中級或高級 Level must be 初級, 中級 or 高級',
          'any.required': '等級為必填欄位 Level is required'
        }),
      
      years_of_experience: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
          'number.base': '教學年資必須為數字 Years of experience must be a number',
          'number.integer': '教學年資必須為整數 Years of experience must be an integer',
          'number.min': '教學年資不能小於0 Years of experience cannot be less than 0',
          'any.required': '教學年資為必填欄位 Years of experience is required'
        }),
      
      specialty: Joi.string()
        .allow('')
        .max(1000)
        .messages({
          'string.max': '專長描述不能超過1000個字符 Specialty cannot exceed 1000 characters'
        }),
      
      hourly_rate: Joi.number()
        .integer()
        .min(0)
        .required()
        .messages({
          'number.base': '時薪必須為數字 Hourly rate must be a number',
          'number.integer': '時薪必須為整數 Hourly rate must be an integer',
          'number.min': '時薪不能小於0 Hourly rate cannot be less than 0',
          'any.required': '時薪為必填欄位 Hourly rate is required'
        }),
      
      emergency_contact_name: Joi.string()
        .allow('')
        .max(50)
        .messages({
          'string.max': '緊急聯絡人姓名不能超過50個字符 Emergency contact name cannot exceed 50 characters'
        }),
      
      emergency_contact_relation: Joi.string()
        .allow('')
        .max(20)
        .messages({
          'string.max': '緊急聯絡人關係不能超過20個字符 Emergency contact relation cannot exceed 20 characters'
        }),
      
      emergency_contact_phone: Joi.string()
        .allow('')
        .pattern(/^09\d{8}$|^0[1-8]\d{7,8}$/)
        .messages({
          'string.pattern.base': '緊急聯絡人電話格式不正確 Invalid emergency contact phone format'
        }),
      
      notes: Joi.string()
        .allow('')
        .max(1000)
        .messages({
          'string.max': '備註不能超過1000個字符 Notes cannot exceed 1000 characters'
        }),
      
      is_active: Joi.boolean()
        .default(true)
    });

    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join('; ');
      throw new ApiError(400, errorMessage);
    }

    next();
  }
};

module.exports = validationMiddleware; 