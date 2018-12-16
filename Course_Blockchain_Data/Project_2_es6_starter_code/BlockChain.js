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
      const genesisBlock = new Block.Block('Genesis Block')
      genesisBlock.time = time()
      genesisBlock.hash = hash(genesisBlock)
      this.bd.addLevelDBData(genesisBlock.height, JSON.stringify(genesisBlock)).then(_ => console.log('Genesis block created'))
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
    newBlock.time = time()
    if (newBlock.height > 0) {
      const previousBlock = await this.getBlock(height)
      newBlock.previousBlockHash = previousBlock.hash
    } else {
      // if no genesis block create one
      await this.generateGenesisBlock()
    }
    newBlock.hash = hash(newBlock)
    return this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock))
  }

  // Get Block By Height
  async getBlock (height) {
    return JSON.parse(await this.bd.getLevelDBData(height))
  }

  // Validate if Block is being tampered by Block Height
  async validateBlock (height) {
    const block = await this.getBlock(height)
    const blockHash = block.hash
    block.hash = ''
    const validBlockHash = hash(block)
    if (validBlockHash === blockHash) {
      return true
    } else {
      return false
    }
  }

  // Validate Blockchain
  async validateChain () {
    const height = await this.getBlockHeight()
    const promisesArray = []
    for (let i = 0; i < height + 1; i++) {
      promisesArray.push(await this.validateBlock(i))
    }
    return Promise.all(promisesArray).then(valuesArray => {
      return !valuesArray.toString().includes('f')
    })
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

// HELPERS
// Get time
function time () {
  return new Date().getTime().toString().slice(0, -3)
}

// Hash data
function hash (objData) {
  return SHA256(JSON.stringify(objData)).toString()
}

module.exports.Blockchain = Blockchain
