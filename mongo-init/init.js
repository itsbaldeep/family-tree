// MongoDB initialization script for Family Tree application

// Switch to the familytree database
db = db.getSiblingDB('familytree');

// Create application user
db.createUser({
  user: 'familytree_user',
  pwd: 'familytree_password',
  roles: [
    {
      role: 'readWrite',
      db: 'familytree'
    }
  ]
});

// Create collections with validation
db.createCollection('persons', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Name is required and must be a string'
        },
        gender: {
          enum: ['male', 'female', 'other', null],
          description: 'Gender must be male, female, other, or null'
        },
        dob: {
          bsonType: ['object', 'null'],
          description: 'Date of birth partial date object'
        },
        birthPlace: {
          bsonType: ['string', 'null'],
          description: 'Birth place must be a string or null'
        },
        deathDate: {
          bsonType: ['object', 'null'],
          description: 'Date of death partial date object'
        },
        deathPlace: {
          bsonType: ['string', 'null'],
          description: 'Death place must be a string or null'
        },
        phone: {
          bsonType: ['string', 'null'],
          description: 'Phone number must be a string or null'
        },
        photos: {
          bsonType: ['array', 'null'],
          description: 'Array of photo URLs'
        },
        socialMedia: {
          bsonType: ['object', 'null'],
          description: 'Social media links object'
        },
        notes: {
          bsonType: ['string', 'null'],
          description: 'Additional notes'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

db.createCollection('marriages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['spouses'],
      properties: {
        spouses: {
          bsonType: 'array',
          minItems: 2,
          maxItems: 2,
          items: {
            bsonType: 'string'
          },
          description: 'Spouses array must contain exactly 2 person IDs'
        },
        date: {
          bsonType: ['object', 'null'],
          description: 'Marriage date partial date object'
        },
        place: {
          bsonType: ['string', 'null'],
          description: 'Marriage place must be a string or null'
        },
        status: {
          enum: ['married', 'divorced', 'widowed', null],
          description: 'Marriage status must be married, divorced, widowed, or null'
        },
        children: {
          bsonType: ['array', 'null'],
          items: {
            bsonType: 'string'
          },
          description: 'Children array must contain person IDs'
        },
        photos: {
          bsonType: ['array', 'null'],
          description: 'Array of wedding photo URLs'
        },
        notes: {
          bsonType: ['string', 'null'],
          description: 'Additional notes about the marriage'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Create indexes for better performance
db.persons.createIndex({ name: 1 });
db.persons.createIndex({ 'dob.year': 1 });
db.persons.createIndex({ birthPlace: 1 });
db.persons.createIndex({ phone: 1 });
db.persons.createIndex({ createdAt: 1 });

db.marriages.createIndex({ spouses: 1 });
db.marriages.createIndex({ children: 1 });
db.marriages.createIndex({ 'date.year': 1 });
db.marriages.createIndex({ place: 1 });
db.marriages.createIndex({ createdAt: 1 });

print('✅ Family Tree MongoDB database initialized successfully!');
print('📊 Collections created: persons, marriages');
print('👤 Application user created: familytree_user');
print('📈 Indexes created for optimal performance');
