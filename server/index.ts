import Agendash from 'agendash'
import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import next from 'next'
import shell from 'shelljs'
import { dispatch, sendConfirmation } from './controllers/users'
import agenda from './agenda'

let port = parseInt(process.env.PORT, 10) || 3000
let dev = process.env.NODE_ENV !== 'production'
let app = next({ dev })
let handle = app.getRequestHandler()

app.prepare().then(async () => {
  let server = express()
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  server.use(
    '/dash',
    Agendash(agenda, {
      title: 'Staking Alerts'
    })
  )
  server.post('/confirmEmail', sendConfirmation)
  server.post('/dispatch', dispatch)
  server.get('*', (req: Request, res: Response) => {
    return handle(req, res)
  })
  server.listen(port, (err: Error) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })

  // Set up localtunnel for testing sendgrid webhooks locally
  if (dev) {
    let localtunnel = require('localtunnel')
    let tunnel = localtunnel(port, { subdomain: 'livepeer' }, function(
      err: Error,
      tunnel: any
    ) {
      if (err) {
        // retry if error
        shell.exec('./localtunnel.sh')
        console.log(err)
      } else {
        console.log(tunnel.url)
      }
    })

    tunnel.on('close', () => {
      shell.exec('./localtunnel.sh')
      console.log('tunnel closed')
    })
  }
})
