import { connectToDatabase } from '@/lib/database';
import { IPerson, Person } from '@/lib/models';
import { formatErrorMessage } from '@/lib/utils';
import { NextResponse } from 'next/server';

/**
 * Get all persons
 */
export async function GET() {
  try {
    await connectToDatabase();
    
    const persons = await Person.aggregate([
    {
      $addFields: {
        effectiveDob: {
          $dateFromParts: {
            year: "$dob.year",
            month: { $ifNull: ["$dob.month", 1] },
            day: { $ifNull: ["$dob.day", 1] }
          }
        }
      }
    },
    {
      $sort: { effectiveDob: 1 } // oldest → youngest
    }
  ]);
    
    console.log(`✅ Retrieved ${persons.length} persons`);
    return NextResponse.json(persons);
  } catch (error) {
    console.error('❌ Error reading persons:', error);
    return NextResponse.json({ 
      error: formatErrorMessage(error) 
    }, { status: 500 });
  }
}

/**
 * Create a new person
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const personData = await request.json();
    
    // Validate required fields
    if (!personData.name || !personData.name.trim()) {
      return NextResponse.json({ 
        error: 'Name is required' 
      }, { status: 400 });
    }
    
    // Create new person with validation
    const newPerson = new Person({
      ...personData,
      name: personData.name.trim()
    });
    
    const savedPerson = await newPerson.save();
    
    console.log(`✅ Created person: ${savedPerson.name} (${savedPerson._id})`);
    return NextResponse.json(savedPerson, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating person:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: formatErrorMessage(error) 
    }, { status: 500 });
  }
}

/**
 * Update an existing person
 */
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const updatedPersonData = await request.json();
    
    if (!updatedPersonData._id) {
      return NextResponse.json({ 
        error: 'Person ID is required' 
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!updatedPersonData.name || !updatedPersonData.name.trim()) {
      return NextResponse.json({ 
        error: 'Name is required' 
      }, { status: 400 });
    }
    
    const updatedPerson = await Person.findByIdAndUpdate(
      updatedPersonData._id,
      {
        ...updatedPersonData,
        name: updatedPersonData.name.trim(),
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).lean() as IPerson | null;
    
    if (!updatedPerson) {
      return NextResponse.json({ 
        error: 'Person not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Updated person: ${updatedPerson.name} (${updatedPerson._id})`);
    return NextResponse.json(updatedPerson);
  } catch (error) {
    console.error('❌ Error updating person:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: formatErrorMessage(error) 
    }, { status: 500 });
  }
}

/**
 * Delete a person
 */
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Person ID is required' 
      }, { status: 400 });
    }
    
    const deletedPerson = await Person.findByIdAndDelete(id).lean() as IPerson | null;
    
    if (!deletedPerson) {
      return NextResponse.json({ 
        error: 'Person not found' 
      }, { status: 404 });
    }
    
    // TODO: In future, also clean up references in marriages
    // This should be handled with proper referential integrity
    
    console.log(`✅ Deleted person: ${deletedPerson.name} (${deletedPerson._id})`);
    return NextResponse.json({ 
      success: true, 
      deleted: deletedPerson 
    });
  } catch (error) {
    console.error('❌ Error deleting person:', error);
    return NextResponse.json({ 
      error: formatErrorMessage(error) 
    }, { status: 500 });
  }
}
