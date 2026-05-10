const jwt = require('jsonwebtoken');
try {
  const secret = `4657b4251b83abd63c65d3a907db07e2458ac86a3e8322c8451de644b9751cd41
2605102ee95a4d0e9660d99ae21541a8b21e4dd2667003f43b01d1f4c2ad714`;
  console.log('secret length', secret.length);
  const token = jwt.sign({ userId: '123' }, secret, { expiresIn: '7d' });
  console.log('token generated', token);
} catch (e) {
  console.error('error', e.message);
}
