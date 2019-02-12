import Agendash from 'agendash'
import bodyParser from 'body-parser'
import express from 'express'
import localtunnel from 'localtunnel'
import morgan from 'morgan'
import next from 'next'
import agenda from './agenda'
import { addUser, sendConfirmation, sendEmail } from './controllers/users'

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
  server.post('/testEmail', sendEmail)
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
