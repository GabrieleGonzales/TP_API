const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const fs = require('fs')
const util = require('util');
//const app = express();
var router = express.Router();
const jsonParser = bodyParser.json();

//var dbConnect = require('./dbCalendar.js');

router.use(jsonParser);
router.use(cors())

let fileContent = []
const readF = util.promisify(fs.readFile);
const writeF = util.promisify(fs.writeFile);

router.post('/createAccount', async function(request, response){
    console.log(request.body);      // your JSON
    var jsonResponse = {};

    const parameters = {name: request.body.name, balance: request.body.balance}

    const operationResult = await updateAccount(parameters, 'Create')
    
    jsonResponse.result = operationResult.status;
    jsonResponse.body = operationResult.msg;

    response.send(jsonResponse);
});

router.post('/deposit', async function(request, response){
    console.log(request.body);      // your JSON
    var jsonResponse = {};

    const parameters = {id: request.body.id, balance: request.body.balance}

    const operationResult = await updateAccount(parameters, 'Put')
    
    jsonResponse.result = operationResult.status;
    jsonResponse.body = operationResult.msg;

    response.send(jsonResponse);
});


router.post('/withdraw', async function(request, response){
    console.log(request.body);      // your JSON
    var jsonResponse = {};

    const parameters = {id: request.body.id, balance: request.body.balance}

    const operationResult = await updateAccount(parameters, 'Push')
    
    jsonResponse.result = operationResult.status;
    jsonResponse.body = operationResult.msg;

    response.send(jsonResponse);
});

router.get('/checkBalance/:id', async function(request, response){
    //console.log(request.body);      // your JSON
    var jsonResponse = {};
    const operationResult = await updateAccount({id: request.params.id}, 'GetInfo')
    console.log(operationResult)
    
    jsonResponse.result = operationResult.status;
    jsonResponse.body = operationResult.msg;

    response.send(jsonResponse);
});

router.delete('/delete/:id', async function(request, response){
    //console.log(request.body);      // your JSON
    var jsonResponse = {};
    const operationResult = await updateAccount({id: request.params.id}, 'Remove')
    
    jsonResponse.result = operationResult.status;
    jsonResponse.body = operationResult.msg;

    response.send(jsonResponse);
});

async function updateAccount(parameters, operation){
    let returnResult = []
    let userInfo = [] 
    let newBalance = 0
    let newInfo = []
    switch (operation){
        case 'Create':
            let lastId = await getLastId()
            const newUser = {id: lastId+1, name: parameters.name, balance: parameters.balance}
            fileContent.push(newUser)
            returnResult = await writeFileAccount(fileContent)
            break
        case 'Put':
            userInfo = await getInfo(parameters.id)
            if(userInfo == null) return {status: 'err', msg: 'A conta não existe'}
            console.log('here')
            console.log(parameters)
            newBalance = userInfo.balance + parameters.balance
            newInfo = {id: parameters.id, balance: newBalance}
            returnResult = await changeInfo(newInfo, 'Put')
            break
        case 'Push':
            userInfo = await getInfo(parameters.id)
            if(userInfo == null) return {status: 'err', msg: 'A conta não existe'}
            newBalance = userInfo.balance - parameters.balance
            if(newBalance < 0) return {status: 'err', msg: 'O saldo não é suficiente para a operação'}
            newInfo = {id: parameters.id, balance: newBalance}
            returnResult = await changeInfo(newInfo, 'Push')
            break
        case 'Remove':
            userInfo = await getInfo(parameters.id)
            if(userInfo == null) return {status: 'err', msg: 'A conta não existe'}
            returnResult = await changeInfo(parameters, 'Remove')
            break
        case 'GetInfo':
            userInfo = await getInfo(parameters.id)
            if(userInfo == null) return {status: 'err', msg: 'A conta não existe'}
            returnResult = {status: 'ok', msg: 'O seu saldo é de: R$' + userInfo.balance}
            break
            
    }
    return returnResult
}

async function changeInfo(parameter, operation){
    const newContentFiltered = fileContent.filter(x => x.id != parameter.id)
    const oldContentName = fileContent.filter(x => x.id == parameter.id)
    if(operation != 'Remove') {
        const newObj = {id: parameter.id, name: oldContentName[0].name, balance: parameter.balance}
        newContentFiltered.push(newObj)
    }
    const returnF = await writeFileAccount(newContentFiltered)
    return returnF
}

async function getInfo(id){
    await readFileAccount()
    console.log('FILE CONTENT : ')
    console.log(fileContent)
    return fileContent.find(x => x.id == id)
}

async function getLastId(){
    await readFileAccount()
    let lastId = 0
    fileContent.forEach(x => {
        if(x.id > lastId) lastId = x.id
    })
    return lastId
}

const readFileAccount = async filePath => {
    try {
      const data = await fs.promises.readFile('accounts.json')
      fileContent = JSON.parse(data)
      return 
    }
    catch(err) {
        console.log('erro: ' + err)
        return {status: 'error', msg: 'Falha na leitura da base de dados'}
    }
  }

  const writeFileAccount = async newContent => {
    try {
      console.log('AQUI')
      console.log(newContent)
      let data = JSON.stringify(newContent, null, 2);
      const aux = await fs.promises.writeFile('accounts.json', data)
      return {status: 'ok', msg: 'Operação realizada com sucesso'}
    }
    catch(err) {
        console.log('erro: ' + err)
        return {status: 'error', msg: 'Falha na leitura da base de dados'}
    }
  }

module.exports = router;