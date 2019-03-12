import Agendash from 'agendash'
import bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import next from 'next'
import url from 'url'
import { dispatch, sendConfirmation } from './controllers/users'
import agenda from './agenda'
import basicAuth from 'express-basic-auth'

let port = parseInt(process.env.PORT, 10) || 3000
let dev = process.env.NODE_ENV !== 'production'
let app = next({ dev })
let handle = app.getRequestHandler()

app.prepare().then(async () => {
  let server = express()
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))
  server.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
  })
  server.use(
    '/dash',
    basicAuth({
      users: {
        [process.env.DASH_USERNAME]: process.env.DASH_PASSWORD,
      },
      challenge: true,
    }),
    Agendash(agenda, {
      title: 'Staking Alerts',
    })
  )

  // Redirect to destination if redirect url contained in query
  server.get('/staking-alerts', (req, res) => {
    let currentUrl = req.protocol + '://' + req.get('host') + req.originalUrl
    let { redirect }: any = url.parse(currentUrl, true).query
    if (redirect) {
      res.redirect(redirect)
    }
    return app.render(req, res, '/staking-alerts', req.query)
  })

  server.post('/confirmEmail', sendConfirmation)
  server.post('/dispatch', dispatch)
  server.get('*', (req: Request, res: Response) => {
    return handle(req, res)
  })
  server.listen(port, (err: Error) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
