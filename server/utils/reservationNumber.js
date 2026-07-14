const crypto = require('crypto');

/**
 * Generate a unique readable reservation number format: RSV-YYYYMMDD-XXXX
 * @returns {string}
 */
const generateReservationNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // 4 characters alphanumeric suffix
  const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  
  return `RSV-${year}${month}${day}-${suffix}`;
};

module.exports = { generateReservationNumber };
