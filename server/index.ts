import Agendash from 'agendash'
import bodyParser from 'body-parser'
import express from 'express'
import next from 'next'
import agenda from './agenda'
import { dispatch, sendConfirmation } from './controllers/users'
import shell from 'shelljs'

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = express()
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  server.use(
    '/dash',
    Agendash(agenda, {
      title: 'Staking Digest'
    })
  )
  server.post('/confirmEmail', sendConfirmation)
  server.post('/dispatch', dispatch)
  server.get('*', (req, res) => {
    return handle(req, res)
  })
  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })

  // Set up localtunnel for testing sendgrid webhooks locally
  if (dev) {
    const localtunnel = require('localtunnel')
    const tunnel = localtunnel(port, { subdomain: 'livepeer' }, function(
      err,
      tunnel
    ) {
      if (err) {
        // retry if error
        shell.exec('./localtunnel.sh')
        console.log(err)
      } else {
        console.log(tunnel.url)
      }
    })

    tunnel.on('close', function() {
      shell.exec('./localtunnel.sh')
      console.log('tunnel closed')
    })
  }
})
