const axios = require('axios');
const meaterPoller = require('./meaterPoller');
const servoController = require('./servoController');
const path = require('path');
const fs = require('fs');

exports.setup = (app) => {
    app.post('/api/setServoPosition', (req, res) => {
        console.log('setServoPosition called', req.body);
        servoController.setServoPosition(req.body);
    
        res.send("OK");
    });
    
    app.post('/api/meaterLogin', (req, res) => {
        axios({
            method:'POST',
            url:'https://public-api.cloud.meater.com/v1/login',
            data:{
                'email': req.body.userName,
                'password': req.body.password
            }
        })
        .then((meaterRes) =>{
            console.log('meaterLogin result', meaterRes);
            res.send("OK");
            meaterPoller.startPoller(meaterRes.data.data.token);
        })
        .catch(function (error) {
            console.log(error);
        });
    });

    const getSessions = (cb) => {
        const directoryPath = path.join(__dirname, 'statsDB');
            fs.readdir(directoryPath, function (err, files) {
                cb(files);
            });
    };

    app.get('/api/sessions', (req, res) => {
        getSessions((files) => res.send({
                sessionIds: files
            })
        )
    });

    app.get('/api/sessions/:idx', (req, res)=>{
        getSessions((sessions) => {
            const sessionId = sessions[parseInt(req.params.idx)];
            console.log('called /api/sessions/' + req.params.idx, sessionId);
            if(!sessionId) {
                res.send('');
            } else {
                const statsPath = path.join(__dirname, 'statsDB', sessionId);
                fs.readFile(statsPath, 'utf8', function (err,data) {
                    res.send(data);
                });
            }
        });
    });
};