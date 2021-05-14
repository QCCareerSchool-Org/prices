import crypto from 'crypto';
import fs from 'fs';

try {
  const privateKey = fs.readFileSync('./private.pem', { encoding: 'utf8' });
  const publicKey = fs.readFileSync('./public.pem', { encoding: 'utf8' });

  const createSignature = (data: string): string => {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign({ key: privateKey, passphrase: 'CoUrSe123' }).toString('base64');
  };

  const verifySignature = (data: string, signature: string): boolean => {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKey, Buffer.from(signature, 'base64'));
  };

  const discount = {
    default: 50,
  };
  const sig = createSignature(JSON.stringify(discount));
  if (!verifySignature(JSON.stringify(discount), sig)) {
    throw Error('invalid signature');
  }
  // eslint-disable-next-line no-console
  console.log(sig);

  //   const oldDiscount = 75;
  //   const oldSig = createSignature(oldDiscount.toString());
  //   if (!verifySignature(oldDiscount.toString(), oldSig)) {
  //      throw Error('invalid signature');
  //   }
  //   // eslint-disable-next-line no-console
  //   console.log(oldSig);

} catch (err) {
  //
}
