const express = require('express')
const cors = require('cors')
const path = require('path');

const dynamoDBController = require('./dynamoDBController');

const { json, urlencoded } = express
const app = express()

const host = process.env.IP  || '0.0.0.0'
const port = process.env.PORT || 3000

app.use(json())
app.use(urlencoded({ extended: false }))

const corsOptions = { origin: '*', optionsSuccessStatus: 200 }
app.use(cors(corsOptions))

app.get('/getQuery', dynamoDBController.getMusicQuery)
app.get('/getScan', dynamoDBController.getMusicScan)
app.post('/add', dynamoDBController.addMusic)
app.delete('/del', dynamoDBController.deleteMusic)
app.put('/put', dynamoDBController.updateMusic)

app.listen(port,host, () => { console.log(`Server listening on port ${port} in the host ${host}`); })
