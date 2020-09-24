const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPTION_KEY;

exports.encrypt = (text1) => {
  const iv = crypto.randomBytes(16);
  let text = JSON.stringify(text1);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    Refno: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
  };
};

exports.decrypt = (Refno, encryptedData1, apikey) => {
  let iv = Buffer.from(Refno, 'hex');
  let encryptedText = Buffer.from(encryptedData1, 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(apikey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
