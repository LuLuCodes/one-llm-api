import { registerAs } from '@nestjs/config';

export default registerAs('while_list', () => ({
  token: [],
  sign: [],
}));
