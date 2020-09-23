const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
//const key = 'Xn2r5u8x/A?D(G+KbPeShVmYp3s6v9y$';
const key = '99309987242234983301049221557895';

exports.encrypt = (text1) => {
  const iv = crypto.randomBytes(16);
  console.log(iv);
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
  let decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(apikey),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};
