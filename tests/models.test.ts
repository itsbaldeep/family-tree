import { Person, Marriage, Counter } from '@/lib/models'
import { setupTestDB, cleanupTestDB, createTestPerson, createTestMarriage, createPersonWithId, createMarriageWithId } from './test-utils'

describe('Model ID Generation', () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  beforeEach(async () => {
    await cleanupTestDB()
  })

  describe('Person Model', () => {
    test('should auto-generate sequential ID when creating a person without ID', async () => {
      const person1 = await createPersonWithId({ name: 'John Doe' })
      const person2 = await createPersonWithId({ name: 'Jane Doe' })
      
      expect(person1.id).toBe('p1')
      expect(person2.id).toBe('p2')
    })

    test('should use provided ID if given and valid', async () => {
      const customId = 'p100'
      const person = new Person(createTestPerson({ id: customId, name: 'Custom ID Person' }))
      const savedPerson = await person.save()
      
      expect(savedPerson.id).toBe(customId)
    })

    test('should reject invalid ID format', async () => {
      const invalidId = 'invalid123'
      const person = new Person(createTestPerson({ id: invalidId }))
      
      await expect(person.save()).rejects.toThrow()
    })

    test('should ensure ID uniqueness', async () => {
      await createPersonWithId({ id: 'p50', name: 'First Person' })
      
      const duplicatePerson = new Person(createTestPerson({ id: 'p50', name: 'Duplicate Person' }))
      await expect(duplicatePerson.save()).rejects.toThrow()
    })

    test('should not allow ID modification after creation', async () => {
      const person = await createPersonWithId({ name: 'Test Person' })
      const originalId = person.id
      
      person.id = 'p999'
      const savedPerson = await person.save()
      
      expect(savedPerson.id).toBe(originalId) // Should remain unchanged due to immutable
    })

    test('should set isLiving correctly based on deathDate', async () => {
      const livingPerson = await createPersonWithId({ 
        name: 'Living Person',
        deathDate: undefined
      })
      
      const deceasedPerson = await createPersonWithId({ 
        name: 'Deceased Person',
        deathDate: { year: 2020 }
      })
      
      expect(livingPerson.isLiving).toBe(true)
      expect(deceasedPerson.isLiving).toBe(false)
    })

    test('should increment counter properly across multiple saves', async () => {
      const persons = await Promise.all([
        createPersonWithId({ name: 'Person 1' }),
        createPersonWithId({ name: 'Person 2' }),
        createPersonWithId({ name: 'Person 3' }),
      ])
      
      expect(persons[0].id).toBe('p1')
      expect(persons[1].id).toBe('p2')
      expect(persons[2].id).toBe('p3')
      
      // Check that counter was properly incremented
      const counter = await Counter.findById('person')
      expect(counter?.sequence).toBe(3)
    })
  })

  describe('Marriage Model', () => {
    test('should auto-generate sequential ID when creating a marriage without ID', async () => {
      // Create persons first
      const person1 = await createPersonWithId({ name: 'Spouse 1' })
      const person2 = await createPersonWithId({ name: 'Spouse 2' })
      
      const marriage1 = await createMarriageWithId({ 
        spouses: [person1.id, person2.id] 
      })
      const marriage2 = await createMarriageWithId({ 
        spouses: [person1.id, person2.id] 
      })
      
      expect(marriage1.id).toBe('m1')
      expect(marriage2.id).toBe('m2')
    })

    test('should use provided ID if given and valid', async () => {
      const person1 = await createPersonWithId({ name: 'Spouse 1' })
      const person2 = await createPersonWithId({ name: 'Spouse 2' })
      
      const customId = 'm100'
      const marriage = new Marriage(createTestMarriage({ 
        id: customId,
        spouses: [person1.id, person2.id]
      }))
      const savedMarriage = await marriage.save()
      
      expect(savedMarriage.id).toBe(customId)
    })

    test('should reject invalid ID format', async () => {
      const person1 = await createPersonWithId({ name: 'Spouse 1' })
      const person2 = await createPersonWithId({ name: 'Spouse 2' })
      
      const invalidId = 'invalid123'
      const marriage = new Marriage(createTestMarriage({ 
        id: invalidId,
        spouses: [person1.id, person2.id]
      }))
      
      await expect(marriage.save()).rejects.toThrow()
    })

    test('should ensure ID uniqueness', async () => {
      const person1 = await createPersonWithId({ name: 'Spouse 1' })
      const person2 = await createPersonWithId({ name: 'Spouse 2' })
      
      await createMarriageWithId({ 
        id: 'm50',
        spouses: [person1.id, person2.id]
      })
      
      const duplicateMarriage = new Marriage(createTestMarriage({ 
        id: 'm50',
        spouses: [person1.id, person2.id]
      }))
      await expect(duplicateMarriage.save()).rejects.toThrow()
    })

    test('should validate spouses array', async () => {
      // Test with only one spouse
      const person1 = await createPersonWithId({ name: 'Spouse 1' })
      
      const invalidMarriage1 = new Marriage(createTestMarriage({ 
        spouses: [person1.id] as any
      }))
      await expect(invalidMarriage1.save()).rejects.toThrow('Marriage must have exactly 2 different spouses')
      
      // Test with same spouse twice
      const invalidMarriage2 = new Marriage(createTestMarriage({ 
        spouses: [person1.id, person1.id] as any
      }))
      await expect(invalidMarriage2.save()).rejects.toThrow('Marriage must have exactly 2 different spouses')
    })

    test('should increment counter properly across multiple saves', async () => {
      const person1 = await createPersonWithId({ name: 'Spouse 1' })
      const person2 = await createPersonWithId({ name: 'Spouse 2' })
      
      const marriages = await Promise.all([
        createMarriageWithId({ spouses: [person1.id, person2.id] }),
        createMarriageWithId({ spouses: [person1.id, person2.id] }),
        createMarriageWithId({ spouses: [person1.id, person2.id] }),
      ])
      
      expect(marriages[0].id).toBe('m1')
      expect(marriages[1].id).toBe('m2')
      expect(marriages[2].id).toBe('m3')
      
      // Check that counter was properly incremented
      const counter = await Counter.findById('marriage')
      expect(counter?.sequence).toBe(3)
    })
  })

  describe('Counter Model', () => {
    test('should create counter if it does not exist', async () => {
      const person = await createPersonWithId({ name: 'First Person' })
      expect(person.id).toBe('p1')
      
      const counter = await Counter.findById('person')
      expect(counter).toBeTruthy()
      expect(counter?.sequence).toBe(1)
    })

    test('should handle concurrent ID generation', async () => {
      // Create multiple persons concurrently
      const promises = Array.from({ length: 5 }, (_, i) => 
        createPersonWithId({ name: `Person ${i + 1}` })
      )
      
      const persons = await Promise.all(promises)
      const ids = persons.map(p => p.id).sort()
      
      // All IDs should be unique and sequential
      expect(ids).toEqual(['p1', 'p2', 'p3', 'p4', 'p5'])
    })
  })

  describe('Data Validation', () => {
    test('should require name for person', async () => {
      const person = new Person(createTestPerson({ name: '' }))
      await expect(person.save()).rejects.toThrow()
    })

    test('should validate phone number format', async () => {
      const person = new Person(createTestPerson({ phone: 'invalid-phone' }))
      await expect(person.save()).rejects.toThrow()
    })

    test('should validate email format', async () => {
      const person = new Person(createTestPerson({ email: 'invalid-email' }))
      await expect(person.save()).rejects.toThrow()
    })

    test('should validate partial date ranges', async () => {
      const person = new Person(createTestPerson({ 
        dob: { year: 10000 } // Invalid year
      }))
      await expect(person.save()).rejects.toThrow()
    })
  })
})