const { MongoMemoryServer } = require('mongodb-memory-server')

module.exports = async () => {
  // Start the in-memory MongoDB instance
  const mongod = new MongoMemoryServer({
    instance: {
      dbName: 'familytree-test',
    },
  })
  
  await mongod.start()
  const uri = mongod.getUri()
  
  // Store the URI for tests to use
  process.env.MONGODB_URI = uri
  
  // Store the mongod instance for cleanup
  global.__MONGOD__ = mongod
}