import Agenda from 'agenda'
import fs from 'fs'

require('dotenv').load()

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
  require('./jobs/' + fileName)(agenda)
})

if (jobTypes.length) {
  agenda.start()
}

export default agenda
