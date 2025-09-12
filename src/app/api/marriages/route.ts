import { connectToDatabase } from '@/lib/database';
import { IMarriage, Marriage, Person } from '@/lib/models';
import { formatErrorMessage } from '@/lib/utils';
import { NextResponse } from 'next/server';

/**
 * Get all marriages
 */
export async function GET() {
  try {
    await connectToDatabase();
    
    const marriages = await Marriage.find({}).sort({ createdAt: -1 }).lean();
    
    console.log(`✅ Retrieved ${marriages.length} marriages`);
    return NextResponse.json(marriages);
  } catch (error) {
    console.error('❌ Error reading marriages:', error);
    return NextResponse.json({ 
      error: formatErrorMessage(error) 
    }, { status: 500 });
  }
}

/**
 * Create a new marriage
 */
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const marriageData = await request.json();
    
    // Validate required fields
    if (!marriageData.spouses || marriageData.spouses.length !== 2) {
      return NextResponse.json({ 
        error: 'Marriage must have exactly 2 spouses' 
      }, { status: 400 });
    }
    
    const [spouse1, spouse2] = marriageData.spouses;
    
    if (!spouse1 || !spouse2 || spouse1 === spouse2) {
      return NextResponse.json({ 
        error: 'Marriage must have 2 different spouses' 
      }, { status: 400 });
    }
    
    // Verify that both spouses exist
    const spouseCount = await Person.countDocuments({
      id: { $in: [spouse1, spouse2] }
    });
    
    if (spouseCount !== 2) {
      return NextResponse.json({ 
        error: 'One or both spouses do not exist' 
      }, { status: 400 });
    }
    
    // Create new marriage with validation
    const newMarriage = new Marriage(marriageData);
    const savedMarriage = await newMarriage.save();
    
    console.log(`✅ Created marriage: ${spouse1} & ${spouse2} (${savedMarriage._id})`);
    return NextResponse.json(savedMarriage, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating marriage:', error);
    
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
 * Update an existing marriage
 */
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const updatedMarriageData = await request.json();
    
    if (!updatedMarriageData._id) {
      return NextResponse.json({ 
        error: 'Marriage ID is required' 
      }, { status: 400 });
    }
    
    // Validate spouses if provided
    if (updatedMarriageData.spouses) {
      if (updatedMarriageData.spouses.length !== 2) {
        return NextResponse.json({ 
          error: 'Marriage must have exactly 2 spouses' 
        }, { status: 400 });
      }
      
      const [spouse1, spouse2] = updatedMarriageData.spouses;
      
      if (!spouse1 || !spouse2 || spouse1 === spouse2) {
        return NextResponse.json({ 
          error: 'Marriage must have 2 different spouses' 
        }, { status: 400 });
      }
      
      // Verify that both spouses exist
      const spouseCount = await Person.countDocuments({
        id: { $in: [spouse1, spouse2] }
      });
      
      if (spouseCount !== 2) {
        return NextResponse.json({ 
          error: 'One or both spouses do not exist' 
        }, { status: 400 });
      }
    }
    
    // Validate children if provided
    if (updatedMarriageData.children && updatedMarriageData.children.length > 0) {
      const childrenCount = await Person.countDocuments({
        id: { $in: updatedMarriageData.children }
      });
      
      if (childrenCount !== updatedMarriageData.children.length) {
        return NextResponse.json({ 
          error: 'One or more children do not exist' 
        }, { status: 400 });
      }
    }
    
    const updatedMarriage = await Marriage.findByIdAndUpdate(
      updatedMarriageData._id,
      {
        ...updatedMarriageData,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).lean() as IMarriage | null;
    
    if (!updatedMarriage) {
      return NextResponse.json({ 
        error: 'Marriage not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Updated marriage: ${updatedMarriage.spouses[0]} & ${updatedMarriage.spouses[1]} (${updatedMarriage._id})`);
    return NextResponse.json(updatedMarriage);
  } catch (error) {
    console.error('❌ Error updating marriage:', error);
    
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
 * Delete a marriage
 */
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ 
        error: 'Marriage ID is required' 
      }, { status: 400 });
    }
    
    const deletedMarriage = await Marriage.findByIdAndDelete(id).lean() as IMarriage | null;
    
    if (!deletedMarriage) {
      return NextResponse.json({ 
        error: 'Marriage not found' 
      }, { status: 404 });
    }
    
    console.log(`✅ Deleted marriage: ${deletedMarriage.spouses[0]} & ${deletedMarriage.spouses[1]} (${deletedMarriage._id})`);
    return NextResponse.json({ 
      success: true, 
      deleted: deletedMarriage 
    });
  } catch (error) {
    console.error('❌ Error deleting marriage:', error);
    return NextResponse.json({ 
      error: formatErrorMessage(error) 
    }, { status: 500 });
  }
}
