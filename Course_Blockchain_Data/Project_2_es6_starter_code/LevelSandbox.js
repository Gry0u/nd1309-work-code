/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/=================================================== */

const level = require('level')
// TODO: change to ./chaindata when ready
const chainDB = './chaindata'

class LevelSandbox {
  constructor () {
    this.db = level(chainDB)
  }

  // Get data from levelDB with key (Promise)
  getLevelDBData (key) {
    let self = this
    return new Promise((resolve, reject) => {
      // Add your code here, remember un Promises you need to resolve() or reject()
      self.db.get(key, (err, value) => {
        if (err) {
          if (err.type === 'NotFoundError') {
            resolve('undefined')
          } else {
            console.log('Block' + key + ' get failed', err)
            reject(err)
          }
        } else {
          resolve(value)
        }
      })
    })
  }

  // Add data to levelDB with key and value (Promise)
  addLevelDBData (key, value) {
    let self = this
    return new Promise((resolve, reject) => {
    // Add your code here, remember un Promises you need to resolve() or reject()
      self.db.put(key, value, err => {
        if (err) {
          console.log('Block' + key + ' submission failed', err)
          reject(err)
        } else {
          resolve(value)
        }
      })
    })
  }

  // Method that return the lenght of DB (height +1)
  getBlocksCount () {
    let self = this
    let count = 0
    return new Promise((resolve, reject) => {
      // Add your code here, remember un Promises you need to resolve() or reject()
      self.db.createReadStream()
        .on('data', data => {
          count++
        })
        .on('error', err => {
          reject(err)
        })
        .on('close', () => {
          resolve(count)
        })
    })
  }
}

module.exports.LevelSandbox = LevelSandbox
