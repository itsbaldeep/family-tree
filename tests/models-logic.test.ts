import { PartialDate } from '@/lib/models'

describe('Model Logic Tests', () => {
  describe('ID Generation Logic', () => {
    test('should validate person ID format', () => {
      const personIdPattern = /^p\d+$/
      
      expect('p1').toMatch(personIdPattern)
      expect('p123').toMatch(personIdPattern)
      expect('p999999').toMatch(personIdPattern)
      
      expect('m1').not.toMatch(personIdPattern)
      expect('person1').not.toMatch(personIdPattern)
      expect('1p').not.toMatch(personIdPattern)
      expect('p').not.toMatch(personIdPattern)
      expect('pp1').not.toMatch(personIdPattern)
    })

    test('should validate marriage ID format', () => {
      const marriageIdPattern = /^m\d+$/
      
      expect('m1').toMatch(marriageIdPattern)
      expect('m123').toMatch(marriageIdPattern)
      expect('m999999').toMatch(marriageIdPattern)
      
      expect('p1').not.toMatch(marriageIdPattern)
      expect('marriage1').not.toMatch(marriageIdPattern)
      expect('1m').not.toMatch(marriageIdPattern)
      expect('m').not.toMatch(marriageIdPattern)
      expect('mm1').not.toMatch(marriageIdPattern)
    })

    test('should generate sequential IDs correctly', () => {
      // Mock counter logic
      let personCounter = 0
      let marriageCounter = 0
      
      const generatePersonId = () => `p${++personCounter}`
      const generateMarriageId = () => `m${++marriageCounter}`
      
      expect(generatePersonId()).toBe('p1')
      expect(generatePersonId()).toBe('p2')
      expect(generatePersonId()).toBe('p3')
      
      expect(generateMarriageId()).toBe('m1')
      expect(generateMarriageId()).toBe('m2')
      expect(generateMarriageId()).toBe('m3')
    })
  })

  describe('Data Validation Logic', () => {
    test('should validate required fields for person', () => {
      const validatePerson = (data: any) => {
        const errors = []
        if (!data.name || data.name.trim() === '') {
          errors.push('Name is required')
        }
        if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
          errors.push('Invalid gender')
        }
        return errors
      }

      expect(validatePerson({ name: 'John Doe', gender: 'male' })).toEqual([])
      expect(validatePerson({ name: '', gender: 'male' })).toContain('Name is required')
      expect(validatePerson({ name: 'John', gender: 'invalid' })).toContain('Invalid gender')
    })

    test('should validate email format', () => {
      const validateEmail = (email: string) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailPattern.test(email)
      }

      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
    })

    test('should validate phone number format', () => {
      const validatePhone = (phone: string) => {
        // Accept various international formats, clean the string first
        const cleaned = phone.replace(/[\s\-\(\)]/g, '')
        const phonePattern = /^[\+]?[1-9]\d{7,15}$/
        return phonePattern.test(cleaned)
      }

      expect(validatePhone('+1234567890')).toBe(true)
      expect(validatePhone('(555) 123-4567')).toBe(true)
      expect(validatePhone('555-123-4567')).toBe(true)
      expect(validatePhone('invalid-phone')).toBe(false)
      expect(validatePhone('123')).toBe(false)
    })

    test('should validate marriage spouses', () => {
      const validateMarriage = (data: any) => {
        const errors = []
        if (!data.spouses || !Array.isArray(data.spouses)) {
          errors.push('Spouses must be an array')
        } else if (data.spouses.length !== 2) {
          errors.push('Marriage must have exactly 2 spouses')
        } else if (data.spouses[0] === data.spouses[1]) {
          errors.push('Cannot marry oneself')
        }
        return errors
      }

      expect(validateMarriage({ spouses: ['p1', 'p2'] })).toEqual([])
      expect(validateMarriage({ spouses: [] })).toContain('Marriage must have exactly 2 spouses')
      expect(validateMarriage({ spouses: ['p1'] })).toContain('Marriage must have exactly 2 spouses')
      expect(validateMarriage({ spouses: ['p1', 'p1'] })).toContain('Cannot marry oneself')
    })
  })

  describe('Partial Date Logic', () => {
    test('should validate partial date structures', () => {
      const validatePartialDate = (date: any) => {
        if (!date) return { valid: true }
        
        const errors = []
        if (date.year && (date.year < 1000 || date.year > 9999)) {
          errors.push('Year must be between 1000 and 9999')
        }
        if (date.month && (date.month < 1 || date.month > 12)) {
          errors.push('Month must be between 1 and 12')
        }
        if (date.day && (date.day < 1 || date.day > 31)) {
          errors.push('Day must be between 1 and 31')
        }
        
        return { valid: errors.length === 0, errors }
      }

      expect(validatePartialDate({ year: 1990 }).valid).toBe(true)
      expect(validatePartialDate({ year: 1990, month: 6 }).valid).toBe(true)
      expect(validatePartialDate({ year: 1990, month: 6, day: 15 }).valid).toBe(true)
      expect(validatePartialDate({ year: 10000 }).valid).toBe(false)
      expect(validatePartialDate({ year: 1990, month: 13 }).valid).toBe(false)
      expect(validatePartialDate({ year: 1990, day: 32 }).valid).toBe(false)
    })

    test('should handle approximate dates', () => {
      const partialDate: PartialDate = { year: 1990, approximate: true }
      
      expect(partialDate.approximate).toBe(true)
      expect(partialDate.year).toBe(1990)
    })

    test('should handle date ranges', () => {
      const dateRange: PartialDate = {
        from: { year: 1990, month: 1 },
        to: { year: 1995, month: 12 }
      }
      
      expect(dateRange.from?.year).toBe(1990)
      expect(dateRange.to?.year).toBe(1995)
    })
  })

  describe('Business Logic', () => {
    test('should determine if person is living based on death date', () => {
      const isLiving = (deathDate?: PartialDate) => !deathDate
      
      expect(isLiving()).toBe(true)
      expect(isLiving(undefined)).toBe(true)
      expect(isLiving({ year: 2020 })).toBe(false)
    })

    test('should calculate approximate age', () => {
      const calculateAge = (birthDate?: PartialDate) => {
        if (!birthDate?.year) return null
        const currentYear = new Date().getFullYear()
        return currentYear - birthDate.year
      }

      const currentYear = new Date().getFullYear()
      expect(calculateAge({ year: 1990 })).toBe(currentYear - 1990)
      expect(calculateAge({ year: 2000, month: 6 })).toBe(currentYear - 2000)
      expect(calculateAge()).toBeNull()
    })

    test('should validate family relationships', () => {
      const validateParentChild = (parentMarriageId: string, childId: string) => {
        // Mock validation - in real app this would check database
        return parentMarriageId.startsWith('m') && childId.startsWith('p')
      }

      expect(validateParentChild('m1', 'p2')).toBe(true)
      expect(validateParentChild('invalid', 'p2')).toBe(false)
      expect(validateParentChild('m1', 'invalid')).toBe(false)
    })
  })
})