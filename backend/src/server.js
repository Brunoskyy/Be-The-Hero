const server = require('./app')

const port = Number(process.env.PORT ?? 3333)
server.listen(port, () => console.log(`Be The Hero API on http://localhost:${port}`))
