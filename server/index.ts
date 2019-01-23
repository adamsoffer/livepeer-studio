import next from 'next'
import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import agenda from './agenda'
import Agendash from 'agendash'
import localtunnel from 'localtunnel'

import { sendConfirmation, addUser } from './controllers/users'

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = express()
  server.use(morgan('combined'))
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  server.use(
    '/dash',
    Agendash(agenda, {
      title: 'Staking Digest'
    })
  )

  server.post('/confirmEmail', sendConfirmation)
  server.post('/signup', addUser)
  server.get('*', (req, res) => {
    return handle(req, res)
  })
  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })

  const tunnel = localtunnel(port, { subdomain: 'livepeer' }, function(
    err,
    tunnel
  ) {
    if (err) {
      console.log(err)
    } else {
      console.log(tunnel.url)
    }
  })

  tunnel.on('close', function() {
    console.log('tunnel closed')
  })
})
