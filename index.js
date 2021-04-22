const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
var router = express.Router();
const jsonParser = bodyParser.json();

var account = require('./account');

app.use(jsonParser);
router.use(cors())

app.get('/', async function(request, response){
    var jsonResponse = {};

    jsonResponse.result = 'ok';
    jsonResponse.body = "Hello World";

    response.send(jsonResponse);
});


app.use('/', account);


app.listen(3000);

module.exports = app;