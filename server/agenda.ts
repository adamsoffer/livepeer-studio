import Agenda from 'agenda'
import fs from 'fs'

const mongoConnectionString =
  'mongodb://admin:bloc-lapboard-inlaid@ds123500.mlab.com:23500/agenda'
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
