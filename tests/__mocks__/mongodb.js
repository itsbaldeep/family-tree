// Mock MongoDB module for testing
module.exports = {
  MongoClient: {
    connect: jest.fn().mockResolvedValue({
      db: () => ({
        collection: () => ({
          find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
          findOne: jest.fn().mockResolvedValue(null),
          insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' }),
          insertMany: jest.fn().mockResolvedValue({ insertedIds: ['mock-id-1', 'mock-id-2'] }),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
          deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        }),
      }),
      close: jest.fn(),
    }),
  },
  ObjectId: jest.fn((id) => ({ toString: () => id || 'mock-object-id' })),
}