var servoblaster = require('servoblaster');

const servoBlaster = servoblaster.createWriteStream(3);

servoBlaster.write(process.argv[2]);