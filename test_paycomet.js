const crypto = require('crypto');
const password = 'zb7xda55myp4wz397pxa';
const merchant = 'na5kxz27';
const terminal = '85645';
const operation = '1';
const amount = '1500';
const currency = 'EUR';
const order = 'TEST001';

const raw = merchant + terminal + operation + amount + currency + order + password;
const sig = crypto.createHash('sha512').update(raw).digest('hex').toLowerCase();
console.log('Signature:', sig);
