import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/database'
import { Person, Marriage, Counter } from '@/lib/models'

export async function setupTestDB() {
  await connectToDatabase()
}

export async function cleanupTestDB() {
  if (mongoose.connection.readyState === 1) {
    // Clear all collections
    await Person.deleteMany({})
    await Marriage.deleteMany({})
    await Counter.deleteMany({})
  }
}

export async function closeTestDB() {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close()
  }
}

// Test data factories
export const createTestPerson = (overrides = {}) => ({
  name: 'Test Person',
  gender: 'male' as const,
  dob: { year: 1990, month: 6, day: 15 },
  birthPlace: 'Test City, Test State',
  phone: '+1234567890',
  ...overrides,
})

export const createTestMarriage = (overrides = {}) => ({
  spouses: ['p1', 'p2'],
  date: { year: 2010, month: 8, day: 20 },
  place: 'Test Wedding Venue',
  status: 'married' as const,
  children: [],
  ...overrides,
})

// Helper to create a person with auto-generated ID
export async function createPersonWithId(data = {}) {
  const person = new Person(createTestPerson(data))
  return await person.save()
}

// Helper to create a marriage with auto-generated ID
export async function createMarriageWithId(data = {}) {
  const marriage = new Marriage(createTestMarriage(data))
  return await marriage.save()
}