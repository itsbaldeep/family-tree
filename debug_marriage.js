const { connectToDatabase } = require('./src/lib/database');
const { Marriage } = require('./src/lib/models');

async function testMarriageCreation() {
  try {
    // Connect to database
    await connectToDatabase();
    
    console.log('Connected to database successfully');
    
    // Create a test marriage without ID
    const testMarriage = new Marriage({
      spouses: ['p1036', 'p1035'],
      status: 'married',
      children: ['p1013']
    });
    
    console.log('Marriage before save:', testMarriage.toObject());
    console.log('ID before save:', testMarriage.id);
    
    // This should trigger the pre-save middleware
    const savedMarriage = await testMarriage.save();
    
    console.log('Marriage after save:', savedMarriage.toObject());
    console.log('ID after save:', savedMarriage.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  }
}

testMarriageCreation();
