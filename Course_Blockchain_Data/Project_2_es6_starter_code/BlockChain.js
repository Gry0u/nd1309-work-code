/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain      |
|  ================================================ */

const SHA256 = require('crypto-js/sha256')
const LevelSandbox = require('./LevelSandbox.js')
const Block = require('./Block.js')

class Blockchain {
  constructor () {
    this.bd = new LevelSandbox.LevelSandbox()
    this.generateGenesisBlock()
  }

  /* Auxiliar method to create a Genesis Block (always with height= 0)
  You have to options, because the method will always execute when you
  create your blockchain you will need to set this up statically or instead you
  can verify if the height !== 0 then you will not create the genesis block */
  async generateGenesisBlock () {
    const height = await this.getBlockHeight()
    if (height < 0) {
      this.addBlock(new Block.Block('Genesis block')).then(_ => console.log('Created Genesis block'))
    } else {
      console.log('Genesis block exists already')
    }
  }

  // Get block height, it is auxiliar method that return the height of the blockchain
  async getBlockHeight () {
    const blocksCount = await this.bd.getBlocksCount() - 1
    return blocksCount
  }

  // Add new block
  async addBlock (newBlock) {
    const height = await this.getBlockHeight()
    newBlock.height = height + 1
    newBlock.time = new Date().getTime().toString().slice(0, -3)
    if (newBlock.height > 0) {
      const previousBlock = await this.getBlock(height)
      newBlock.previousBlockHash = previousBlock.hash
    }
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
    return this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock))
  }

  // Get Block By Height
  async getBlock (height) {
    return JSON.parse(await this.bd.getLevelDBData(height))
  }

  // Validate if Block is being tampered by Block Height
  validateBlock (height) {
  }

  // Validate Blockchain
  validateChain () {
  }

  // Utility Method to Tamper a Block for Test Validation
  // This method is for testing purpose
  _modifyBlock (height, block) {
    let self = this
    return new Promise((resolve, reject) => {
      self.bd.addLevelDBData(height, JSON.stringify(block).toString())
        .then(blockModified => {
          resolve(blockModified)
        })
        .catch(err => {
          console.log(err)
          reject(err)
        })
    })
  }
}

module.exports.Blockchain = Blockchain
