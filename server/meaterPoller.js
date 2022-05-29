const axios = require('axios');
const fs = require('fs');
const servoController = require('./servoController');

let currentData = null;

let intervalId = null;

let sessionId = null;

const startPoller = (token) =>{

    sessionId = (new Date().toISOString()).replaceAll(':', "-") + ".txt"

    const updateData = () => {
        axios({
            method:'GET',
            url:'https://public-api.cloud.meater.com/v1/devices',
            headers:{
                Authorization: 'Bearer ' + token
            }
        })
        .then((res) =>{
            console.log('meaterPoller result', res);

            currentData = {
                timestamp: new Date().toISOString(),
                probes: res.data.data.devices.map(device => ({
                    id: device.id,
                    internalTempF: device.temperature.internal * 9 / 5 + 32,
                    ambientTempF: device.temperature.ambient * 9 / 5 + 32
                })),
                servo: servoController.getLastServoPositionDto()
            }; 
            
            fs.appendFile('server/statsDB/' + sessionId, JSON.stringify(currentData) + '\r\n', t => {console.log('cb', t)});
        })
        .catch(function (error) {
            console.log(error);
        });
    };

    updateData();
    if(intervalId != null) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(updateData, 30 * 1000);
};

const getData = () => {
    return currentData;
}

exports.startPoller = startPoller;
exports.getData = getData;
