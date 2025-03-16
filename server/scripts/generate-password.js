// 導入依賴 Import dependencies
const bcrypt = require('bcrypt');

/**
 * 生成加密密碼 Generate encrypted password
 * @param {String} password - 原始密碼 Original password
 * @returns {Promise<String>} 加密後的密碼 Encrypted password
 */
async function generateEncryptedPassword(password) {
  try {
    // 生成鹽值 Generate salt
    const salt = await bcrypt.genSalt(10);
    
    // 加密密碼 Encrypt password
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 返回加密後的密碼 Return encrypted password
    return hashedPassword;
  } catch (error) {
    console.error('加密密碼時出錯 Error encrypting password:', error);
    throw error;
  }
}

// 要加密的密碼 Password to encrypt
const password = '123456';

// 生成加密密碼 Generate encrypted password
generateEncryptedPassword(password)
  .then(hashedPassword => {
    console.log('原始密碼 Original password:', password);
    console.log('加密後的密碼 Encrypted password:', hashedPassword);
  })
  .catch(error => {
    console.error('生成加密密碼時出錯 Error generating encrypted password:', error);
  }); 