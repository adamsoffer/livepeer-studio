import Agenda from 'agenda'
import fs from 'fs'
import path from 'path'

require('now-env')

const mongoConnectionString = `mongodb+srv://${process.env.MONGO_USERNAME}:${
  process.env.MONGO_PASSWORD
}@cluster0-hkwht.mongodb.net/${process.env.MONGO_DB}`

const agenda = new Agenda({
  db: {
    address: mongoConnectionString,
    options: {
      useNewUrlParser: true
    }
  }
})

const jobTypes = []

fs.readdirSync('server/jobs').forEach(fileName => {
  jobTypes.push(fileName)
  require('./jobs/' + path.parse(fileName).name)(agenda)
})

if (jobTypes.length) {
  agenda.start()
}

export default agenda
