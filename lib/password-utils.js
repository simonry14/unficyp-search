const crypto = require('crypto');

function hashPassword(password, salt) {
  // If no salt is provided, generate a new one
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }

  // Hash the password with the salt
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

  return { salt, hash };
}

function verifyPassword(storedHash, storedSalt, providedPassword) {
  const { hash } = hashPassword(providedPassword, storedSalt);
  return hash === storedHash;
}

module.exports = {
  hashPassword,
  verifyPassword
};