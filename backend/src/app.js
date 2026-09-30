const express = require('express')
const cors = require('cors')
const { errors } = require('celebrate')
const { Server } = require('socket.io')
const routes = require('./routes')

const app = express()
const server = require('http').createServer(app)
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN ?? '*' } })

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', exposedHeaders: ['X-Total-Count'] }))
app.use(express.json())
app.use(routes)
app.use(errors())

// A new incident from one browser is announced to every other one, so the
// profile page refreshes without polling.
io.on('connection', (socket) => {
  socket.on('incident:created', (data) => {
    socket.broadcast.emit('incident:created', data)
  })
})

module.exports = server
