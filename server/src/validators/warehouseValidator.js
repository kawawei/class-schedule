const Joi = require('joi');

// 倉庫驗證模式 Warehouse validation schema
const warehouseSchema = Joi.object({
  // 倉庫名稱 Warehouse name
  name: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.empty': '倉庫名稱不能為空 Warehouse name cannot be empty',
      'string.min': '倉庫名稱最少需要 {#limit} 個字符 Warehouse name must be at least {#limit} characters',
      'string.max': '倉庫名稱不能超過 {#limit} 個字符 Warehouse name cannot exceed {#limit} characters',
      'any.required': '倉庫名稱為必填項 Warehouse name is required'
    }),

  // 倉庫地址 Warehouse address
  address: Joi.string()
    .required()
    .min(1)
    .max(200)
    .messages({
      'string.empty': '倉庫地址不能為空 Warehouse address cannot be empty',
      'string.min': '倉庫地址最少需要 {#limit} 個字符 Warehouse address must be at least {#limit} characters',
      'string.max': '倉庫地址不能超過 {#limit} 個字符 Warehouse address cannot exceed {#limit} characters',
      'any.required': '倉庫地址為必填項 Warehouse address is required'
    }),

  // 聯繫人 Contact person
  contact_person: Joi.string()
    .required()
    .min(1)
    .max(50)
    .messages({
      'string.empty': '聯繫人不能為空 Contact person cannot be empty',
      'string.min': '聯繫人最少需要 {#limit} 個字符 Contact person must be at least {#limit} characters',
      'string.max': '聯繫人不能超過 {#limit} 個字符 Contact person cannot exceed {#limit} characters',
      'any.required': '聯繫人為必填項 Contact person is required'
    }),

  // 聯繫電話 Contact phone
  contact_phone: Joi.string()
    .required()
    .max(20)
    .messages({
      'string.empty': '聯繫電話不能為空 Contact phone cannot be empty',
      'string.max': '聯繫電話不能超過 {#limit} 個字符 Contact phone cannot exceed {#limit} characters',
      'any.required': '聯繫電話為必填項 Contact phone is required'
    }),

  // 備註 Notes
  notes: Joi.string()
    .allow('')
    .max(500)
    .messages({
      'string.max': '備註不能超過 {#limit} 個字符 Notes cannot exceed {#limit} characters'
    }),

  // 公司代碼 Company code
  company_code: Joi.string()
    .required()
    .messages({
      'any.required': '公司代碼為必填項 Company code is required'
    })
});

// 驗證倉庫數據 Validate warehouse data
exports.validateWarehouse = (data) => {
  return warehouseSchema.validate(data, { abortEarly: false });
}; 