const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const app = express()
app.use(express.json({extended: true}))
app.use(bodyParser.json())

app.use('/api/auth', require('./routes/auth.routes'))

port = config.get('port') || 5000

async function start () {

  await mongoose.connect(config.get('mongoUri'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })

  app.listen(port, () => {
    console.log(`Server has been started on port ${port}...`)
  })

}

start()