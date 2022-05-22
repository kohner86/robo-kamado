const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const meaterPoller = require('./meaterPoller')
const api = require('./api');

app.use(express.static(path.join(__dirname, '../build')));
app.use(bodyParser.json());
app.get('/api/getMeaterData', (req, res) => {
    res.send(meaterPoller.getData());
});

api.setup(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
 console.log('Listening on port', port);
});