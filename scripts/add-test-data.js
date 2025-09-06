// MongoDB script to add test family data
// Run this with: node scripts/add-test-data.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://familytree_user:familytree_password@localhost:27017/familytree';

async function addTestData() {
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('familytree');
    
    // Clear existing data
    await db.collection('persons').deleteMany({});
    await db.collection('marriages').deleteMany({});
    console.log('🗑️ Cleared existing data');
    
    // Add test persons
    const persons = [
      {
        name: 'John Smith',
        gender: 'male',
        dob: { year: 1975, month: 3, day: 15 },
        birthPlace: 'New York, NY',
        phone: '+1-555-0101',
        isLiving: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Johnson',
        gender: 'female', 
        dob: { year: 1978, month: 7, day: 22 },
        birthPlace: 'Los Angeles, CA',
        phone: '+1-555-0102',
        isLiving: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Michael Smith',
        gender: 'male',
        dob: { year: 2005, month: 12, day: 8 },
        birthPlace: 'Chicago, IL',
        isLiving: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sarah Smith',
        gender: 'female',
        dob: { year: 2008, month: 4, day: 30 },
        birthPlace: 'Chicago, IL',
        isLiving: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const insertedPersons = await db.collection('persons').insertMany(persons);
    console.log('👥 Added persons:', Object.keys(insertedPersons.insertedIds).length);
    
    // Get person IDs for marriage creation
    const personIds = Object.values(insertedPersons.insertedIds);
    
    // Add test marriage
    const marriage = {
      spouses: [personIds[0].toString(), personIds[1].toString()], // John & Jane
      date: { year: 1999, month: 6, day: 15 },
      place: 'Chicago, IL',
      status: 'married',
      children: [personIds[2].toString(), personIds[3].toString()], // Michael & Sarah
      witnesses: [],
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const insertedMarriage = await db.collection('marriages').insertOne(marriage);
    console.log('💑 Added marriage:', insertedMarriage.insertedId);
    
    // Verify data
    const personCount = await db.collection('persons').countDocuments();
    const marriageCount = await db.collection('marriages').countDocuments();
    
    console.log(`\n✅ Test data added successfully!`);
    console.log(`📊 Persons: ${personCount}`);
    console.log(`💑 Marriages: ${marriageCount}`);
    console.log(`\n🌐 You can now visit http://localhost:3000 to see the family tree!`);
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the script
addTestData();
