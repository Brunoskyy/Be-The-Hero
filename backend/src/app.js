const express = require('express')
const cors = require('cors')
const { errors } = require('celebrate')
const routes = require('./routes')

const app = express()

const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(cors())
// Habilita o uso de JSON no envio via POST como request body de JSON
app.use(express.json())
app.use(routes)
app.use(errors())

io.on('connection', function(socket) {
  console.log('[IO] Connect => A new Connection in SERVER => ' + socket.id)

  socket.on('Generated New incident', data => {
    io.sockets.emit('Send data', data)
  })
})

module.exports = server;