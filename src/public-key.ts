import * as fs from 'fs';
import path from 'path';

const publicKey = fs.readFileSync(path.join(__dirname, '../public.pem'), 'utf8');

export default publicKey;
