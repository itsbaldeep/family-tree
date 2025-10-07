import { createMocks } from 'node-mocks-http'
import { GET as getPersons, POST as createPerson, PUT as updatePerson, DELETE as deletePerson } from '@/app/api/persons/route'
import { GET as getMarriages, POST as createMarriage, PUT as updateMarriage, DELETE as deleteMarriage } from '@/app/api/marriages/route'
import { setupTestDB, cleanupTestDB, createPersonWithId, createMarriageWithId } from './test-utils'

// Mock middleware to bypass authentication in tests
jest.mock('@/middleware', () => ({
  middleware: jest.fn((req, res, next) => next()),
}))

describe('API Routes', () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  beforeEach(async () => {
    await cleanupTestDB()
  })

  describe('/api/persons', () => {
    describe('GET', () => {
      test('should return empty array when no persons exist', async () => {
        const response = await getPersons()
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data).toEqual([])
      })

      test('should return all persons sorted by birth date', async () => {
        await createPersonWithId({ 
          name: 'Older Person', 
          dob: { year: 1950 }
        })
        await createPersonWithId({ 
          name: 'Younger Person', 
          dob: { year: 1980 }
        })
        
        const response = await getPersons()
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data).toHaveLength(2)
        expect(data[0].name).toBe('Older Person')
        expect(data[1].name).toBe('Younger Person')
      })
    })

    describe('POST', () => {
      test('should create person with auto-generated ID', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: {
            name: 'New Person',
            gender: 'male',
            dob: { year: 1990, month: 6, day: 15 },
            birthPlace: 'Test City'
          },
        })

        const response = await createPerson(req)
        const data = await response.json()
        
        expect(response.status).toBe(201)
        expect(data.id).toBe('p1')
        expect(data.name).toBe('New Person')
        expect(data.isLiving).toBe(true)
      })

      test('should reject person creation without name', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: {
            gender: 'male',
            dob: { year: 1990 }
          },
        })

        const response = await createPerson(req)
        
        expect(response.status).toBe(400)
      })

      test('should create multiple persons with sequential IDs', async () => {
        const person1Data = { name: 'Person 1', gender: 'male' }
        const person2Data = { name: 'Person 2', gender: 'female' }
        
        const { req: req1 } = createMocks({
          method: 'POST',
          body: person1Data,
        })
        
        const { req: req2 } = createMocks({
          method: 'POST',
          body: person2Data,
        })

        const response1 = await createPerson(req1)
        const response2 = await createPerson(req2)
        
        const data1 = await response1.json()
        const data2 = await response2.json()
        
        expect(data1.id).toBe('p1')
        expect(data2.id).toBe('p2')
      })
    })

    describe('PUT', () => {
      test('should update existing person', async () => {
        const person = await createPersonWithId({ name: 'Original Name' })
        
        const { req } = createMocks({
          method: 'PUT',
          body: {
            _id: person._id,
            name: 'Updated Name',
            gender: 'female'
          },
        })

        const response = await updatePerson(req)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.name).toBe('Updated Name')
        expect(data.id).toBe(person.id) // ID should remain unchanged
      })

      test('should return 404 for non-existent person', async () => {
        const { req } = createMocks({
          method: 'PUT',
          body: {
            _id: '507f1f77bcf86cd799439011',
            name: 'Non-existent Person'
          },
        })

        const response = await updatePerson(req)
        
        expect(response.status).toBe(404)
      })
    })

    describe('DELETE', () => {
      test('should delete existing person', async () => {
        const person = await createPersonWithId({ name: 'To Delete' })
        
        const { req } = createMocks({
          method: 'DELETE',
          query: { id: person._id.toString() },
        })

        const response = await deletePerson(req)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.deleted.name).toBe('To Delete')
      })

      test('should return 404 for non-existent person', async () => {
        const { req } = createMocks({
          method: 'DELETE',
          query: { id: '507f1f77bcf86cd799439011' },
        })

        const response = await deletePerson(req)
        
        expect(response.status).toBe(404)
      })
    })
  })

  describe('/api/marriages', () => {
    describe('GET', () => {
      test('should return empty array when no marriages exist', async () => {
        const response = await getMarriages()
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data).toEqual([])
      })

      test('should return all marriages', async () => {
        const person1 = await createPersonWithId({ name: 'Spouse 1' })
        const person2 = await createPersonWithId({ name: 'Spouse 2' })
        
        await createMarriageWithId({ 
          spouses: [person1.id, person2.id],
          place: 'Wedding Venue'
        })
        
        const response = await getMarriages()
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data).toHaveLength(1)
        expect(data[0].spouses).toEqual([person1.id, person2.id])
      })
    })

    describe('POST', () => {
      test('should create marriage with auto-generated ID', async () => {
        const person1 = await createPersonWithId({ name: 'Spouse 1' })
        const person2 = await createPersonWithId({ name: 'Spouse 2' })
        
        const { req } = createMocks({
          method: 'POST',
          body: {
            spouses: [person1.id, person2.id],
            date: { year: 2020, month: 6, day: 15 },
            place: 'Wedding Venue',
            status: 'married'
          },
        })

        const response = await createMarriage(req)
        const data = await response.json()
        
        expect(response.status).toBe(201)
        expect(data.id).toBe('m1')
        expect(data.spouses).toEqual([person1.id, person2.id])
      })

      test('should reject marriage with invalid spouses', async () => {
        const { req } = createMocks({
          method: 'POST',
          body: {
            spouses: ['nonexistent1', 'nonexistent2'],
            date: { year: 2020 }
          },
        })

        const response = await createMarriage(req)
        
        expect(response.status).toBe(400)
      })

      test('should reject marriage with less than 2 spouses', async () => {
        const person1 = await createPersonWithId({ name: 'Spouse 1' })
        
        const { req } = createMocks({
          method: 'POST',
          body: {
            spouses: [person1.id],
            date: { year: 2020 }
          },
        })

        const response = await createMarriage(req)
        
        expect(response.status).toBe(400)
      })
    })

    describe('PUT', () => {
      test('should update existing marriage', async () => {
        const person1 = await createPersonWithId({ name: 'Spouse 1' })
        const person2 = await createPersonWithId({ name: 'Spouse 2' })
        
        const marriage = await createMarriageWithId({ 
          spouses: [person1.id, person2.id],
          place: 'Original Venue'
        })
        
        const { req } = createMocks({
          method: 'PUT',
          body: {
            _id: marriage._id,
            spouses: [person1.id, person2.id],
            place: 'Updated Venue',
            status: 'married'
          },
        })

        const response = await updateMarriage(req)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.place).toBe('Updated Venue')
        expect(data.id).toBe(marriage.id) // ID should remain unchanged
      })
    })

    describe('DELETE', () => {
      test('should delete existing marriage', async () => {
        const person1 = await createPersonWithId({ name: 'Spouse 1' })
        const person2 = await createPersonWithId({ name: 'Spouse 2' })
        
        const marriage = await createMarriageWithId({ 
          spouses: [person1.id, person2.id]
        })
        
        const { req } = createMocks({
          method: 'DELETE',
          query: { id: marriage._id.toString() },
        })

        const response = await deleteMarriage(req)
        const data = await response.json()
        
        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.deleted.spouses).toEqual([person1.id, person2.id])
      })
    })
  })

  describe('Integration Tests', () => {
    test('should create family tree with proper ID relationships', async () => {
      // Create parents
      const { req: father } = createMocks({
        method: 'POST',
        body: { name: 'Father', gender: 'male' },
      })
      
      const { req: mother } = createMocks({
        method: 'POST',
        body: { name: 'Mother', gender: 'female' },
      })
      
      const fatherResponse = await createPerson(father)
      const motherResponse = await createPerson(mother)
      
      const fatherData = await fatherResponse.json()
      const motherData = await motherResponse.json()
      
      // Create marriage
      const { req: marriageReq } = createMocks({
        method: 'POST',
        body: {
          spouses: [fatherData.id, motherData.id],
          date: { year: 1990 }
        },
      })
      
      const marriageResponse = await createMarriage(marriageReq)
      const marriageData = await marriageResponse.json()
      
      // Create child
      const { req: child } = createMocks({
        method: 'POST',
        body: { name: 'Child', gender: 'male' },
      })
      
      const childResponse = await createPerson(child)
      const childData = await childResponse.json()
      
      // Update marriage to include child
      const { req: updateMarriageReq } = createMocks({
        method: 'PUT',
        body: {
          _id: marriageData._id,
          spouses: [fatherData.id, motherData.id],
          children: [childData.id],
          date: { year: 1990 }
        },
      })
      
      const updatedMarriageResponse = await updateMarriage(updateMarriageReq)
      const updatedMarriageData = await updatedMarriageResponse.json()
      
      // Verify the complete family structure
      expect(fatherData.id).toBe('p1')
      expect(motherData.id).toBe('p2')
      expect(childData.id).toBe('p3')
      expect(marriageData.id).toBe('m1')
      expect(updatedMarriageData.children).toContain(childData.id)
    })
  })
})