// Mock Mongoose module for testing
const mockDocument = {
  save: jest.fn().mockResolvedValue({}),
  remove: jest.fn().mockResolvedValue({}),
  deleteOne: jest.fn().mockResolvedValue({}),
  toObject: jest.fn().mockReturnValue({}),
  toJSON: jest.fn().mockReturnValue({}),
}

const mockModel = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  findOneAndUpdate: jest.fn().mockResolvedValue({}),
  findOneAndDelete: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue(mockDocument),
  insertMany: jest.fn().mockResolvedValue([]),
  updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  countDocuments: jest.fn().mockResolvedValue(0),
  populate: jest.fn().mockReturnThis(),
}

module.exports = {
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn(),
  },
  models: {}, // Empty models object to avoid undefined errors
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn(),
    post: jest.fn(),
    virtual: jest.fn().mockReturnValue({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    }),
    index: jest.fn(),
  })),
  model: jest.fn().mockImplementation(() => mockModel),
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => ({
      toString: () => id || 'mock-object-id',
    })),
  },
}
