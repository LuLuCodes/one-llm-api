const crypto = require('crypto');
const dayjs = require('dayjs');
const { Kit } = require('@easy-front-core-sdk/kits');

function md5(data) {
  return hash(data, 'md5');
}

function hash(data, algorithm) {
  return crypto.createHash(algorithm).update(data, 'utf8').digest('hex');
}

const app_key = 'ly202110261453';
const app_secret = '054c9568941529f175e5510486edc2fa';

const base_body = {
  app_key,
  timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  v: '1.0',
  sign: '',
};

const data_body = {
  id: 0,
};

const reqeust_body = { ...base_body, ...data_body };
const sort_str = Kit.makeSortStr(reqeust_body, ['sign']);
reqeust_body.sign = md5(`${app_secret}${sort_str}${app_secret}`).toUpperCase();
console.log(JSON.stringify(reqeust_body));
