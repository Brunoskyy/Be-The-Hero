const express = require('express')
const cors = require('cors')
const routes = require('./routes')

const app = express()

app.use(cors())
// Habilita o uso de JSON no envio via POST como request body de JSON
app.use(express.json())
app.use(routes)

app.listen(3333)