const servoblaster = require('servoblaster');

let currentServoPosition = 0;

let lastServoPositionDto = null;

const setServoPosition = (servoPositionDto) => {
    lastServoPositionDto = servoPositionDto;

    let newTarget = null;

    if(servoPositionDto.calibration_reverse) {
        newTarget = ((servoPositionDto.calibration_max - servoPositionDto.calibration_min) * ((100 - servoPositionDto.percent) / 100)) + servoPositionDto.calibration_min;
    } else {
        newTarget = ((servoPositionDto.calibration_max - servoPositionDto.calibration_min) * (servoPositionDto.percent / 100)) + servoPositionDto.calibration_min;
    }
    setServoRecur(newTarget);
};

const setServoRecur = (newTarget) => {
    const stepSize = newTarget > currentServoPosition ? 0.1 : -0.1;

    currentServoPosition = currentServoPosition + stepSize;
    console.log('new servo position:' + currentServoPosition);
    //servoblaster.createWriteStream(3).write(currentServoPosition + "%");

    if(Math.abs(newTarget - currentServoPosition) > 0.1){
        setTimeout(() => setServoRecur(newTarget), 25);
    }
};

const getServoPosition = () => currentServoPosition;

exports.setServoPosition = setServoPosition;
exports.getServoPosition = getServoPosition;
exports.getLastServoPositionDto = () => lastServoPositionDto;
