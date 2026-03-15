const fs = require('fs');
try {
  fs.copyFileSync('linklite logo.png', 'client/public/logo.png');
  console.log('Successfully copied linklite logo.png to client/public/logo.png');
} catch (e) {
  console.error('Error copying file:', e);
}
