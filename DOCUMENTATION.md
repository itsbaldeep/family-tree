# Family Tree Application - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Database Schema & Models](#database-schema--models)
4. [API Endpoints](#api-endpoints)
5. [Authentication System](#authentication-system)
6. [Frontend Components](#frontend-components)
7. [Tree Visualization Logic](#tree-visualization-logic)
8. [Data Flow & Frontend-Backend Interaction](#data-flow--frontend-backend-interaction)
9. [Development Setup](#development-setup)
10. [Deployment Configuration](#deployment-configuration)
11. [Current Features](#current-features)
12. [Future Features & Roadmap](#future-features--roadmap)
13. [Code Quality & Best Practices](#code-quality--best-practices)
14. [Troubleshooting](#troubleshooting)

## Project Overview

The Family Tree Application is a comprehensive Next.js-based web application for visualizing and managing family relationships. It features an interactive tree visualization built with React Flow and a complete management interface for CRUD operations on family data.

### Key Characteristics
- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript with strict mode
- **Database**: MongoDB with Mongoose ODM
- **Visualization**: React Flow Renderer 10.3.17
- **Authentication**: Google OAuth with JWT
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Headless UI
- **Deployment**: Docker-ready with MongoDB containerization

## Architecture & Tech Stack

### Frontend Stack
- **Next.js 15.5.2** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type safety and development experience
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **React Flow Renderer 10.3.17** - Interactive diagrams and node-based UI
- **Headless UI 2.2.7** - Unstyled, accessible UI components
- **Geist Font** - Modern typography from Vercel

### Backend Stack
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB 7.0** - Document database
- **Mongoose 8.18.0** - MongoDB object modeling
- **JWT (Jose 6.1.0)** - JSON Web Token handling
- **Google OAuth 2.0** - Authentication provider

### Development Tools
- **ESLint 9** - Code linting with Next.js configuration
- **TypeScript 5** - Static type checking
- **PostCSS 8.5.6** - CSS processing
- **Docker & Docker Compose** - Containerization
- **Turbopack** - Fast bundling for development and production

## Database Schema & Models

### Core Data Models

#### 1. Person Interface (`IPerson`)
```typescript
interface IPerson {
  _id: string;           // MongoDB ObjectId
  id: string;           // Virtual field for API responses
  name: string;         // Required: Full name
  gender?: 'male' | 'female' | 'other';
  dob?: PartialDate;    // Date of birth
  birthPlace?: string;  // Birth location
  deathDate?: PartialDate; // Date of death
  deathPlace?: string;  // Death location
  phone?: string;       // Phone number
  email?: string;       // Email address (future feature)
  photos?: Photo[];     // Profile/family photos (future feature)
  socialMedia?: SocialMediaLinks; // Social media links (future feature)
  occupation?: string;  // Job/profession (future feature)
  education?: string;   // Educational background (future feature)
  notes?: string;       // Additional notes
  isLiving?: boolean;   // Computed field based on deathDate
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

#### 2. Marriage Interface (`IMarriage`)
```typescript
interface IMarriage {
  _id: string;
  id: string;
  spouses: [string, string];  // Exactly 2 Person IDs
  date?: PartialDate;         // Marriage date
  place?: string;             // Marriage location
  status?: 'married' | 'divorced' | 'widowed';
  children?: string[];        // Array of Person IDs
  photos?: Photo[];          // Wedding photos (future feature)
  anniversary?: PartialDate; // Anniversary date (future feature)
  officiant?: string;        // Ceremony officiant (future feature)
  witnesses?: string[];      // Witness Person IDs (future feature)
  notes?: string;            // Additional notes
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. PartialDate Interface
```typescript
interface PartialDate {
  year?: number;        // Year (1000-9999)
  month?: number;       // Month (1-12)
  day?: number;         // Day (1-31)
  approximate?: boolean; // Whether date is approximate
  range?: {             // Date range for uncertain dates
    from?: string;
    to?: string;
  };
  notes?: string;       // Additional context about the date
}
```

#### 4. Supporting Interfaces
```typescript
interface Photo {
  url: string;
  caption?: string;
  uploadedAt: Date;
  isProfilePhoto?: boolean;
}

interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}
```

### Database Validation & Constraints

#### Person Schema Validation
- **Required Fields**: `name`
- **Name**: 1-200 characters, trimmed
- **Gender**: Enum validation (male/female/other)
- **Places**: Max 500 characters
- **Phone**: International format regex validation
- **Email**: Email format regex validation
- **Notes**: Max 2000 characters
- **Photos**: URL format validation with supported image formats

#### Marriage Schema Validation
- **Required Fields**: `spouses` (exactly 2 different Person IDs)
- **Status**: Enum validation (married/divorced/widowed)
- **Place**: Max 500 characters
- **Notes**: Max 2000 characters
- **Children**: Array of valid Person ID references

#### PartialDate Schema Validation
- **Year**: 1000-9999 range
- **Month**: 1-12 range
- **Day**: 1-31 range
- **Range**: String fields for flexible date ranges

### Database Indexes

#### Person Collection Indexes
```javascript
db.persons.createIndex({ name: 1 });
db.persons.createIndex({ 'dob.year': 1 });
db.persons.createIndex({ birthPlace: 1 });
db.persons.createIndex({ phone: 1 });
db.persons.createIndex({ email: 1 });
db.persons.createIndex({ isLiving: 1 });
db.persons.createIndex({ createdAt: -1 });
```

#### Marriage Collection Indexes
```javascript
db.marriages.createIndex({ spouses: 1 });
db.marriages.createIndex({ children: 1 });
db.marriages.createIndex({ 'date.year': 1 });
db.marriages.createIndex({ place: 1 });
db.marriages.createIndex({ status: 1 });
db.marriages.createIndex({ createdAt: -1 });
```

### Schema Evolution & Virtuals

#### Pre-save Middleware
- **Person**: Automatically updates `isLiving` based on `deathDate`
- **Data Sanitization**: Trims strings, validates formats

#### Virtual Fields
- **Person.age**: Calculated age based on birth/death dates
- **Marriage.duration**: Years since marriage date
- **JSON Transform**: Converts `_id` to `id`, removes `__v`

## API Endpoints

### Person Management API (`/api/persons`)

#### GET /api/persons
- **Purpose**: Retrieve all persons
- **Response**: Array of persons sorted by birth date (oldest to youngest)
- **Features**: Uses MongoDB aggregation for date sorting
- **Error Handling**: 500 with formatted error message

#### POST /api/persons
- **Purpose**: Create new person
- **Request Body**: Person data (name required)
- **Validation**: 
  - Required: `name` (non-empty string)
  - Mongoose schema validation
- **Response**: 201 with created person data
- **Error Handling**: 400 for validation errors, 500 for server errors

#### PUT /api/persons
- **Purpose**: Update existing person
- **Request Body**: Person data with `_id`
- **Validation**: 
  - Required: `_id` and `name`
  - Mongoose validators with `runValidators: true`
- **Response**: 200 with updated person data
- **Error Handling**: 400 for validation, 404 if not found, 500 for server errors

#### DELETE /api/persons?id={personId}
- **Purpose**: Delete person by ID
- **Query Parameters**: `id` (required)
- **Response**: 200 with success confirmation and deleted person data
- **Error Handling**: 400 for missing ID, 404 if not found, 500 for server errors
- **Note**: TODO - Add referential integrity cleanup for marriages

### Marriage Management API (`/api/marriages`)

#### GET /api/marriages
- **Purpose**: Retrieve all marriages
- **Response**: Array of marriages sorted by creation date (newest first)
- **Error Handling**: 500 with formatted error message

#### POST /api/marriages
- **Purpose**: Create new marriage
- **Request Body**: Marriage data with spouses array
- **Validation**: 
  - Required: `spouses` (exactly 2 different Person IDs)
  - Verifies both spouses exist in database
- **Response**: 201 with created marriage data
- **Error Handling**: 400 for validation errors, 500 for server errors

#### PUT /api/marriages
- **Purpose**: Update existing marriage
- **Request Body**: Marriage data with `_id`
- **Validation**: 
  - Required: `_id`
  - Validates spouses exist (if provided)
  - Validates children exist (if provided)
- **Response**: 200 with updated marriage data
- **Error Handling**: 400 for validation, 404 if not found, 500 for server errors

#### DELETE /api/marriages?id={marriageId}
- **Purpose**: Delete marriage by ID
- **Query Parameters**: `id` (required)
- **Response**: 200 with success confirmation and deleted marriage data
- **Error Handling**: 400 for missing ID, 404 if not found, 500 for server errors

### API Features & Patterns

#### Error Handling Strategy
```typescript
// Consistent error response format
{
  error: string;          // User-friendly message
  details?: string;       // Technical details for validation errors
}
```

#### Request/Response Flow
1. **Connection**: Establish MongoDB connection via `connectToDatabase()`
2. **Validation**: Schema-level and custom business logic validation
3. **Database Operation**: CRUD operation with error handling
4. **Logging**: Console logging for operations and errors
5. **Response**: Consistent JSON format with appropriate HTTP status codes

#### Database Connection Management
- **Connection Pooling**: Max 10 concurrent connections
- **State Management**: Tracks connection state to avoid redundant connections
- **Graceful Shutdown**: SIGINT handler for clean database disconnection
- **Error Recovery**: Automatic reconnection on connection failures

## Authentication System

### Google OAuth 2.0 Implementation

#### Authentication Flow
1. **Start**: `GET /api/auth/google/start`
   - Generates OAuth state parameter
   - Sets secure HTTP-only state cookie (10 min expiry)
   - Redirects to Google OAuth consent screen

2. **Callback**: `GET /api/auth/google/callback`
   - Validates OAuth state parameter against cookie
   - Exchanges authorization code for access tokens
   - Verifies Google's ID token using JWKS
   - Validates email against allowlist
   - Issues application JWT (7 day expiry)
   - Sets secure HTTP-only session cookie
   - Redirects to `/manage` page

3. **Logout**: `POST /api/auth/logout`
   - Clears session cookie
   - Returns success confirmation

#### JWT Management
```typescript
interface AppJwtPayload {
  sub: string;      // Google user ID
  email: string;    // Verified email address
  name?: string;    // Display name
  picture?: string; // Profile picture URL
}
```

#### Security Features
- **State Parameter**: CSRF protection for OAuth flow
- **JWT Secret**: 256-bit secret key for token signing
- **Cookie Security**: HTTP-only, secure, SameSite=lax cookies
- **Email Allowlist**: Environment-based access control
- **Token Verification**: Real-time verification against Google's JWKS

### Middleware Protection
- **Route Coverage**: All `/api/*` routes except GET requests
- **JWT Validation**: Verifies token signature and expiry
- **Email Authorization**: Checks against `ALLOWED_EMAILS` environment variable
- **Error Responses**: 401 Unauthorized with JSON error format

### Environment Configuration
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_256_bit
ALLOWED_EMAILS=email1@domain.com,email2@domain.com
APP_URL=http://localhost:3000
```

## Frontend Components

### Core Architecture

#### 1. Layout Components

**`/src/app/layout.tsx`**
- Root layout with Geist font configuration
- SEO metadata for "Bhamra Family" title
- Full viewport height/width setup
- Typography antialiasing

**`/src/app/page.tsx`**
- Main application entry point
- Renders FamilyTree component in full-screen container

#### 2. Authentication Components

**`/src/app/login/page.tsx`**
- Clean, centered login interface
- Google OAuth integration button
- Custom Google logo SVG component
- Responsive design with hover/active states

**`/src/app/manage/page.tsx`**
- Server-side authentication validation
- JWT token verification
- Email allowlist checking
- Automatic redirect to login if unauthorized
- Renders ManageView component for authenticated users

#### 3. Tree Visualization Components

**`/src/components/tree/index.tsx`** - Main FamilyTree Component
- **State Management**:
  ```typescript
  const [persons, setPersons] = useState<IPerson[]>([])
  const [marriages, setMarriages] = useState<IMarriage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  ```
- **Data Loading**: Parallel API calls to `/api/persons` and `/api/marriages`
- **Layout Algorithm**: Complex recursive positioning system
- **React Flow Integration**: Custom node types and edge configuration

**`/src/components/tree/nodes.tsx`** - Node Components
- **PersonNode**: Individual person display
- **MarriedPersonNode**: Combined spouse display
- **MarriageNode**: Marriage relationship indicator
- **Consistent Styling**: Color-coded by gender, fixed dimensions

#### 4. Management Interface Components

**`/src/components/manage/index.tsx`** - Main Management Interface
- **Dual-section Layout**: Separate persons and marriages management
- **Search & Filtering**: Real-time search with debounced input
- **Pagination**: 10 items per page with navigation controls
- **CRUD Operations**: Full create, read, update, delete functionality
- **Modal Integration**: Person, marriage, and delete confirmation modals

**`/src/components/manage/person-modal.tsx`** - Person Editor
- **Comprehensive Form**: All person fields including future features
- **PartialDate Integration**: Birth/death date inputs
- **Parent Selection**: Dropdown for selecting parent marriage
- **Validation**: Client-side form validation

**`/src/components/manage/marriage-modal.tsx`** - Marriage Editor
- **Spouse Selection**: Dropdowns for selecting spouses
- **Children Management**: Checkbox list and manual ID input
- **Date/Place Fields**: Marriage ceremony details
- **Status Management**: Marriage status selection

**`/src/components/manage/delete-modal.tsx`** - Confirmation Dialog
- **Reusable Component**: Works for both persons and marriages
- **Confirmation Pattern**: Clear warning with confirm/cancel options
- **Headless UI Integration**: Accessible dialog implementation

#### 5. Utility Components

**`/src/components/partial-date-input.tsx`** - Flexible Date Input
- **Multiple Modes**: Specific date vs. date range
- **Approximate Dates**: Checkbox for uncertain dates
- **Notes Field**: Additional context for dates
- **Validation**: Year/month/day range validation
- **Clear Functionality**: Reset date values

### Component Design Patterns

#### 1. State Management Pattern
- **Local State**: useState for component-specific data
- **Prop Drilling**: Parent-child communication via props
- **Event Handlers**: Callback functions for user interactions
- **Loading States**: Consistent loading/error handling

#### 2. Form Handling Pattern
```typescript
// Consistent form update pattern
const handleUpdate = (field: string, value: any) => {
  setEditingItem({ ...editingItem, [field]: value });
};
```

#### 3. Modal Management Pattern
```typescript
// Modal state management
const [editingItem, setEditingItem] = useState<Item | null>(null);
const [deleteConfirm, setDeleteConfirm] = useState<DeleteState | null>(null);
```

#### 4. API Integration Pattern
```typescript
// Consistent API calling pattern
const loadData = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/endpoint');
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    setData(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## Tree Visualization Logic

### Layout Algorithm Overview

The family tree layout algorithm is implemented in `FamilyTree.tsx` and handles complex genealogical relationships through a sophisticated recursive positioning system.

#### Core Algorithm Steps

1. **Data Preparation**
   ```typescript
   const marriageMap = Object.fromEntries(marriages.map((m) => [m.id, m]))
   const spouseToMarriageIds = new Map<string, string[]>()
   ```

2. **Root Detection**
   - Identifies marriages without parent marriages
   - Creates a hierarchy starting from root marriages
   - Handles multiple family trees in the same visualization

3. **Recursive Layout**
   ```typescript
   function layoutMarriage(marriageId: string, depth: number, xOffset: number): 
     { centerX: number; nextX: number }
   ```

### Layout Algorithm Detailed Flow

#### Step 1: Marriage-Person Mapping
```typescript
// Build spouse-to-marriage lookup for quick relationship queries
marriages.forEach((m) => {
  m.spouses.forEach((s) => {
    spouseToMarriageIds.set(s, [...(spouseToMarriageIds.get(s) ?? []), m.id])
  })
})
```

#### Step 2: Root Marriage Detection
```typescript
// Detect which marriages are roots (no parent marriages)
const marriageHasParent = new Map<string, boolean>()
marriages.forEach((m) => {
  m.children?.forEach((childId) => {
    if (m.spouses.includes(childId)) return // Skip if child is actually a spouse
    const childMarriageIds = spouseToMarriageIds.get(childId) ?? []
    childMarriageIds.forEach((mid) => marriageHasParent.set(mid, true))
  })
})
const rootMarriages = marriages.filter((m) => !marriageHasParent.get(m.id))
```

#### Step 3: Recursive Positioning
```typescript
function layoutMarriage(marriageId, depth, xOffset) {
  // 1. Layout all children first (depth-first traversal)
  const childCenters = []
  sortedChildren.forEach((childId) => {
    const childMarriageIds = spouseToMarriageIds.get(childId) ?? []
    const childMarriageId = childMarriageIds.find(mid => !visitedMarriages.has(mid))
    
    if (childMarriageId) {
      // Child has their own marriage - recurse
      const { centerX, nextX } = layoutMarriage(childMarriageId, depth + 2, currentX)
      childCenters.push(centerX)
      currentX = nextX
    } else {
      // Single child - position directly
      nodePositions[childId] = { x: currentX, y: (depth + 1) * vSpacing }
      childCenters.push(currentX)
      currentX += hSpacing
    }
  })

  // 2. Center parent marriage above children
  let centerX = currentX
  if (childCenters.length > 0) {
    const minX = Math.min(...childCenters)
    const maxX = Math.max(...childCenters)
    centerX = (minX + maxX) / 2
  }

  // 3. Create spouse and marriage nodes
  const spouseNodeId = `spouses-${marriageId}`
  const marriageNodeId = `marriage-${marriageId}`
  // Position nodes and create edges...
}
```

#### Step 4: Child Sorting
```typescript
// Sort children by date of birth for consistent display
const sortedChildren = [...(marriage.children ?? [])].sort((a, b) => {
  const pa = persons.find(p => p.id === a)
  const pb = persons.find(p => p.id === b)
  const da = dobToDate(pa)
  const db = dobToDate(pb)
  if (!da && !db) return 0
  if (!da) return 1
  if (!db) return -1
  return da.getTime() - db.getTime()
})
```

### Node Types and Styling

#### Node Type Mapping
```typescript
export const nodeTypes = {
  person: PersonNode,           // Single person
  marriage: MarriageNode,       // Marriage relationship
  marriedPerson: MarriedPersonNode, // Combined spouse display
};
```

#### Color Scheme
```typescript
export const COLORS = {
  male: "#95cdf5",     // Light blue
  female: "#f8a8ec",   // Hot pink  
  other: "#c7d2fe",    // Light purple
  marriage: "#f9f789", // Light yellow
  text: "#222222",     // Dark gray
  edge: "#333333",     // Medium gray
  border: "#444444"    // Border gray
}
```

#### Node Dimensions
- **Width**: 155px (consistent across all node types)
- **Font Size**: 9px (compact for dense trees)
- **Border Width**: 2px
- **Spacing**: 160px horizontal, 80px vertical

### React Flow Integration

#### Flow Configuration
```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  fitView              // Auto-fit tree to viewport
  nodeTypes={nodeTypes}
>
  <Background />       // Grid background
  <Controls />         // Zoom/pan controls
</ReactFlow>
```

#### Edge Configuration
```typescript
// Marriage to children edges (animated)
edges.push({
  id: `${marriageNodeId}-${childNodeId}`,
  source: marriageNodeId,
  target: childNodeId,
  animated: true,
  style: { stroke: COLORS.edge, strokeWidth: 1.25 }
})

// Spouse to marriage edges (static)
edges.push({
  id: `${spouseNodeId}-${marriageNodeId}`,
  source: spouseNodeId,
  target: marriageNodeId,
  animated: false,
  style: { stroke: COLORS.edge, strokeWidth: 1.25 }
})
```

### Algorithm Complexity & Performance

#### Time Complexity
- **O(M + P)** where M = marriages, P = persons
- **Single Pass**: Each marriage and person processed once
- **Efficient Lookups**: Map-based spouse-to-marriage lookup

#### Space Complexity
- **O(M + P)** for node storage
- **O(M * C)** for edge storage (C = average children per marriage)

#### Performance Optimizations
- **Memoized Calculations**: useMemo for node/edge generation
- **Efficient Sorting**: Single sort operation per marriage's children
- **Visited Tracking**: Prevents infinite loops in complex family structures

### Handling Edge Cases

#### 1. Circular References Prevention
```typescript
const visitedMarriages = new Set<string>()
if (visitedMarriages.has(marriageId)) return { centerX: xOffset, nextX: xOffset + hSpacing }
visitedMarriages.add(marriageId)
```

#### 2. Multiple Marriages
- Each person can have multiple marriages
- Algorithm handles sequential marriages correctly
- Orphaned children are positioned appropriately

#### 3. Missing Relationships
- Graceful handling of missing parent/child references
- Standalone persons rendered separately
- Invalid references filtered out

#### 4. Complex Family Structures
- Adopted children (via marriage.children array)
- Step-relationships (multiple marriages)
- Extended family connections

## Data Flow & Frontend-Backend Interaction

### Application Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes     │    │   Database      │
│   Components    │◄──►│   (Next.js)      │◄──►│   (MongoDB)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   State Mgmt    │    │   Middleware     │    │   Mongoose      │
│   (React)       │    │   (Auth/CORS)    │    │   (ODM)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Authentication Flow

#### 1. Login Process
```typescript
// User initiates login
window.location.href = "/api/auth/google/start"

// Google OAuth callback
GET /api/auth/google/callback
├── Validate state parameter
├── Exchange code for tokens  
├── Verify ID token with Google JWKS
├── Check email against allowlist
├── Issue app JWT (7 days)
├── Set HTTP-only cookie
└── Redirect to /manage
```

#### 2. Request Authentication
```typescript
// Middleware checks every non-GET API request
export async function middleware(req: NextRequest) {
  if (req.method == "GET") return NextResponse.next()
  
  const token = req.cookies.get("session")?.value
  if (!token) return unauthorized()
  
  try {
    const payload = await verifyAppJwt(token)
    // Validate email against allowlist
    // Continue if authorized
  } catch {
    return unauthorized()
  }
}
```

### Data Management Flow

#### 1. Loading Data (Frontend → Backend → Database)
```typescript
// Frontend: FamilyTree component
useEffect(() => {
  const loadData = async () => {
    const [personsRes, marriagesRes] = await Promise.all([
      fetch('/api/persons'),     // GET request (no auth needed)
      fetch('/api/marriages')    // GET request (no auth needed)
    ])
    // Process responses...
  }
}, [])

// Backend: API route
export async function GET() {
  await connectToDatabase()
  const persons = await Person.aggregate([...]) // MongoDB aggregation
  return NextResponse.json(persons)
}

// Database: MongoDB with indexes
db.persons.find().sort({ "dob.year": 1 })
```

#### 2. Creating Data (Frontend → Backend → Database)
```typescript
// Frontend: Management interface
const savePerson = async (person: EditingPerson) => {
  const response = await fetch('/api/persons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(person)
  })
  // Handle response...
}

// Backend: API route (authenticated)
export async function POST(request: Request) {
  // Middleware validates JWT token first
  await connectToDatabase()
  const personData = await request.json()
  const newPerson = new Person(personData)
  const savedPerson = await newPerson.save() // Mongoose validation
  return NextResponse.json(savedPerson)
}

// Database: Mongoose pre-save hooks
PersonSchema.pre('save', function(next) {
  // Auto-update isLiving field
  this.isLiving = !this.deathDate
  next()
})
```

### State Management Patterns

#### 1. Component-Level State
```typescript
// Local component state for UI management
const [persons, setPersons] = useState<IPerson[]>([])
const [loading, setLoading] = useState(true)
const [editingPerson, setEditingPerson] = useState<EditingPerson | null>(null)
```

#### 2. Data Synchronization
```typescript
// Optimistic updates with server sync
const savePerson = async (person: EditingPerson) => {
  // 1. Update local state immediately
  if (isNew) {
    setPersons(prev => [...prev, tempPerson])
  } else {
    setPersons(prev => prev.map(p => p.id === person.id ? person : p))
  }
  
  // 2. Sync with server
  const response = await fetch('/api/persons', { ... })
  const savedPerson = await response.json()
  
  // 3. Update with server response
  setPersons(prev => prev.map(p => p.id === savedPerson.id ? savedPerson : p))
}
```

#### 3. Error Handling
```typescript
// Consistent error handling pattern
try {
  const response = await fetch('/api/persons')
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login' // Redirect on auth failure
      return
    }
    throw new Error('Failed to load data')
  }
  const data = await response.json()
  setPersons(data)
} catch (error) {
  setError(error.message)
  // Show user-friendly error message
}
```

### API Communication Patterns

#### 1. RESTful Endpoints
```typescript
// Persons CRUD
GET    /api/persons          # List all persons
POST   /api/persons          # Create person
PUT    /api/persons          # Update person (requires _id in body)
DELETE /api/persons?id={id}  # Delete person

// Marriages CRUD  
GET    /api/marriages        # List all marriages
POST   /api/marriages        # Create marriage
PUT    /api/marriages        # Update marriage (requires _id in body)
DELETE /api/marriages?id={id} # Delete marriage
```

#### 2. Response Formats
```typescript
// Success Response
{
  // Direct data return for successful operations
  id: "507f1f77bcf86cd799439011",
  name: "John Doe",
  // ... other fields
}

// Error Response
{
  error: "User-friendly error message",
  details?: "Technical validation details" // Optional
}
```

#### 3. Request Validation Chain
```
1. Middleware (Authentication for non-GET)
   ├── JWT token validation
   ├── Email allowlist check
   └── Request continues or 401 response

2. API Route Handler
   ├── Request body parsing
   ├── Business logic validation
   └── Database operation

3. Mongoose Schema Validation
   ├── Field type validation
   ├── Required field checks
   ├── Custom validators
   └── Pre/post middleware hooks

4. MongoDB Constraints
   ├── Index constraints
   ├── Document size limits
   └── Collection validation rules
```

### Real-time Data Updates

#### 1. Parent-Child Relationship Management
```typescript
// Complex relationship update flow
const savePerson = async (person: EditingPerson) => {
  // 1. Save/update person
  const savedPerson = await savePersonAPI(person)
  
  // 2. Handle parent marriage changes
  if (parentMarriageId) {
    // Remove from old marriage
    const oldMarriage = marriages.find(m => m.children?.includes(savedPerson.id))
    if (oldMarriage && oldMarriage.id !== parentMarriageId) {
      await updateMarriageChildren(oldMarriage.id, 'remove', savedPerson.id)
    }
    
    // Add to new marriage
    await updateMarriageChildren(parentMarriageId, 'add', savedPerson.id)
  }
  
  // 3. Refresh all data to ensure consistency
  await loadData()
}
```

#### 2. Search and Filtering
```typescript
// Client-side filtering with real-time updates
const filteredPersons = persons.filter(person =>
  person.name.toLowerCase().includes(personSearch.toLowerCase()) ||
  person.birthPlace?.toLowerCase().includes(personSearch.toLowerCase()) ||
  person.phone?.includes(personSearch)
)

// Pagination with filtered results
const paginatedPersons = filteredPersons.slice(
  (personsPage - 1) * itemsPerPage,
  personsPage * itemsPerPage
)
```

### Performance Optimization Patterns

#### 1. Memoization
```typescript
// Expensive tree calculations memoized
const { nodes, edges } = useMemo(() => {
  // Complex tree layout algorithm
  return generateTreeLayout(persons, marriages)
}, [persons, marriages])
```

#### 2. Parallel Data Loading
```typescript
// Simultaneous API calls
const [personsRes, marriagesRes] = await Promise.all([
  fetch('/api/persons'),
  fetch('/api/marriages')
])
```

#### 3. Connection Pooling
```typescript
// Database connection optimization
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return // Use existing connection
  }
  await mongoose.connect(mongoUri, {
    maxPoolSize: 10,           // Connection pooling
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
}
```

## Development Setup

### Prerequisites
- **Node.js 18+** - JavaScript runtime
- **npm** - Package manager
- **Docker** - Container platform (for MongoDB)
- **Git** - Version control
- **MongoDB Compass** (optional) - Database GUI

### Environment Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd family-tree
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Variables
Create `.env` file in root directory:
```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Configuration
APP_URL=http://localhost:3000
JWT_SECRET=your_256_bit_jwt_secret

# Access Control
ALLOWED_EMAILS=email1@domain.com,email2@domain.com

# Database Configuration
MONGODB_URI=mongodb://familytree_user:familytree_password@localhost:27017/familytree
MONGODB_DB_NAME=familytree
```

#### 4. Database Setup
```bash
# Start MongoDB with Docker Compose
docker-compose up -d

# Verify containers are running
docker-compose ps

# View logs
docker-compose logs -f mongodb
```

#### 5. Initialize Database (Optional)
```bash
# Add test data
node scripts/add-test-data.js
```

### Development Commands

#### Core Commands
```bash
# Development server with Turbopack (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Code linting
npm run lint
```

#### Database Commands
```bash
# Start database
docker-compose up -d mongodb

# Stop database
docker-compose down

# View database logs
docker-compose logs -f mongodb

# Access MongoDB shell
docker exec -it family-tree-mongodb mongosh
```

#### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild containers
docker-compose build

# View logs
docker-compose logs -f
```

### Development Workflow

#### 1. Daily Development
```bash
# Start development session
docker-compose up -d     # Start database
npm run dev             # Start Next.js dev server

# Access application
# http://localhost:3000   # Main application
# http://localhost:8081   # Mongo Express (database UI)
```

#### 2. Code Quality
```bash
# Linting
npm run lint

# Type checking (automatic with TypeScript)
npx tsc --noEmit

# Testing (when implemented)
npm test
```

#### 3. Database Management
```bash
# Access MongoDB shell
docker exec -it family-tree-mongodb mongosh

# Use family tree database
use familytree

# Query collections
db.persons.find()
db.marriages.find()

# Create indexes (done automatically)
db.persons.getIndexes()
```

### Project Structure
```
family-tree/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── login/          # Login page
│   │   ├── manage/         # Management interface
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── manage/         # Management UI components
│   │   ├── tree/           # Tree visualization
│   │   └── partial-date-input.tsx
│   ├── lib/                # Utility libraries
│   │   ├── database.ts     # MongoDB connection
│   │   ├── models.ts       # Mongoose schemas
│   │   ├── utils.ts        # Helper functions
│   │   ├── jwt.ts          # JWT handling
│   │   └── http.ts         # HTTP utilities
│   └── middleware.ts       # Authentication middleware
├── public/                 # Static assets
├── scripts/               # Database scripts
├── mongo-init/           # MongoDB initialization
├── docker-compose.yml    # Container configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind CSS config
├── next.config.ts        # Next.js config
└── .env                  # Environment variables
```

### Debugging & Development Tools

#### 1. Browser Developer Tools
- **React Developer Tools** - Component inspection
- **Network Tab** - API request debugging
- **Console** - JavaScript error tracking

#### 2. Database Tools
- **MongoDB Compass** - GUI for database operations
- **Mongo Express** - Web-based database admin (http://localhost:8081)

#### 3. VS Code Extensions
- **TypeScript** - Language support
- **Tailwind CSS IntelliSense** - CSS class suggestions
- **ES7+ React/Redux/React-Native snippets** - Code snippets
- **MongoDB for VS Code** - Database operations

#### 4. Logging & Monitoring
```typescript
// Console logging for development
console.log('✅ Operation successful:', data)
console.error('❌ Operation failed:', error)
console.log('📊 Statistics:', { persons: count, marriages: count })
```

### Performance Monitoring

#### 1. Next.js Built-in Metrics
```bash
# View build analysis
npm run build

# Analyze bundle size
npm run build && npx @next/bundle-analyzer
```

#### 2. Database Performance
```javascript
// MongoDB slow query profiling
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find()
```

#### 3. React Performance
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
})

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(data)
}, [data])
```

## Deployment Configuration

### Production Environment Setup

#### 1. Environment Variables (Production)
```bash
# Google OAuth (Production)
GOOGLE_CLIENT_ID=production_google_client_id
GOOGLE_CLIENT_SECRET=production_google_client_secret

# Application Configuration
APP_URL=https://your-domain.com
JWT_SECRET=secure_production_jwt_secret_256_bit

# Access Control
ALLOWED_EMAILS=admin@domain.com,user@domain.com

# Database Configuration (MongoDB Atlas or self-hosted)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/familytree
MONGODB_DB_NAME=familytree
```

#### 2. Database Migration
```javascript
// Production database initialization
db = db.getSiblingDB('familytree');

// Create production user with minimal privileges
db.createUser({
  user: 'familytree_prod',
  pwd: 'secure_production_password',
  roles: [{ role: 'readWrite', db: 'familytree' }]
});

// Create collections with validation (same as development)
// Create optimized indexes for production
```

### Docker Production Setup

#### 1. Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Production Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:7.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongodb_data:
```

### Cloud Deployment Options

#### 1. Vercel Deployment (Recommended for Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# Configure custom domain
# Enable automatic deployments from Git
```

**Vercel Configuration (`vercel.json`)**:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "GOOGLE_CLIENT_ID": "@google_client_id",
    "GOOGLE_CLIENT_SECRET": "@google_client_secret"
  }
}
```

#### 2. MongoDB Atlas (Managed Database)
```bash
# Connection string format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/familytree?retryWrites=true&w=majority

# Atlas configuration
# - Create cluster in preferred region
# - Set up database user with readWrite permissions
# - Configure IP whitelist (0.0.0.0/0 for serverless)
# - Enable connection string authentication
```

#### 3. AWS Deployment
```yaml
# AWS Elastic Beanstalk configuration (.ebextensions/nodejs.config)
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
    NodeVersion: 18.x
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    MONGODB_URI: your_mongodb_uri
```

#### 4. Google Cloud Platform
```yaml
# app.yaml for App Engine
runtime: nodejs18

env_variables:
  NODE_ENV: production
  MONGODB_URI: your_mongodb_uri
  GOOGLE_CLIENT_ID: your_client_id
  JWT_SECRET: your_jwt_secret

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

### Performance Optimization for Production

#### 1. Next.js Optimizations
```javascript
// next.config.ts
const nextConfig = {
  // Enable Turbopack for faster builds
  experimental: {
    turbopack: true
  },
  
  // Image optimization
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/webp', 'image/avif']
  },
  
  // Compression
  compress: true,
  
  // PWA configuration
  // Service worker caching
}
```

#### 2. Database Optimizations
```javascript
// Production MongoDB configuration
const productionConfig = {
  maxPoolSize: 50,                    // Higher connection pool
  minPoolSize: 5,                     // Minimum connections
  maxIdleTimeMS: 30000,              // Close connections after 30s idle
  serverSelectionTimeoutMS: 5000,     // Fail fast on connection issues
  heartbeatFrequencyMS: 10000,       // Health check frequency
  retryWrites: true,                  // Automatic retry on write failures
  writeConcern: { w: 'majority' }     // Ensure writes are replicated
}

// Production indexes
db.persons.createIndex({ name: "text", birthPlace: "text" }) // Full-text search
db.persons.createIndex({ "dob.year": 1, gender: 1 })       // Compound index
db.marriages.createIndex({ spouses: 1, "date.year": -1 })  // Relationship queries
```

#### 3. CDN and Caching
```javascript
// HTTP caching headers for static assets
const headers = [
  {
    source: '/api/:path*',
    headers: [
      { key: 'Cache-Control', value: 'no-store, max-age=0' }
    ]
  },
  {
    source: '/((?!api).*)',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
    ]
  }
]
```

### Security Hardening

#### 1. Environment Security
```bash
# Use strong, unique passwords
JWT_SECRET=$(openssl rand -base64 64)
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)

# Restrict email access
ALLOWED_EMAILS=admin@company.com,manager@company.com

# Use HTTPS in production
APP_URL=https://familytree.company.com
```

#### 2. Database Security
```javascript
// MongoDB security configuration
{
  authSource: 'admin',              // Authentication database
  ssl: true,                        // Encrypt connection
  sslValidate: true,               // Validate SSL certificates
  tlsAllowInvalidHostnames: false,  // Strict hostname validation
  authMechanism: 'SCRAM-SHA-256'   // Secure authentication
}
```

#### 3. Application Security Headers
```javascript
// security.js middleware
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval';"
}
```

### Monitoring & Maintenance

#### 1. Application Monitoring
```javascript
// Error tracking with Sentry (example)
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
})

// Custom error boundary
export default function GlobalError({ error, reset }) {
  Sentry.captureException(error)
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

#### 2. Database Monitoring
```javascript
// MongoDB health checks
const healthCheck = async () => {
  try {
    await mongoose.connection.db.admin().ping()
    return { status: 'healthy', timestamp: new Date() }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

// Performance monitoring
db.enableFreeMonitoring() // MongoDB Atlas free monitoring
```

#### 3. Backup Strategy
```bash
# Automated database backups
mongodump --uri="$MONGODB_URI" --out="/backup/$(date +%Y%m%d_%H%M%S)"

# S3 backup upload
aws s3 cp /backup/ s3://family-tree-backups/ --recursive

# Backup retention policy (keep 30 days)
find /backup -mtime +30 -delete
```

## Current Features

### 1. Authentication & Authorization
- **Google OAuth 2.0 Integration**: Secure login with Google accounts
- **JWT-based Sessions**: 7-day token expiry with secure HTTP-only cookies
- **Email Allowlist**: Environment-configurable access control
- **Protected API Routes**: Middleware-based route protection
- **Automatic Redirects**: Seamless login/logout flow

### 2. Person Management
#### Data Fields
- **Basic Information**: Name (required), gender, phone number
- **Life Events**: Birth date/place, death date/place with flexible date formats
- **Living Status**: Automatically computed based on death date
- **Notes**: Additional context and information
- **Future-Ready Fields**: Email, photos, social media, occupation, education

#### Flexible Date System (`PartialDate`)
- **Specific Dates**: Full year/month/day precision
- **Partial Dates**: Year-only, month/year combinations
- **Approximate Dates**: Checkbox for uncertain dates
- **Date Ranges**: From/to range for uncertain periods
- **Context Notes**: Additional information about dates
- **Validation**: Range validation for year (1000-9999), month (1-12), day (1-31)

#### Management Interface
- **Search & Filter**: Real-time search across names, places, phone numbers
- **Pagination**: 10 items per page with navigation controls
- **Sorting**: Automatic sorting by birth date (oldest to youngest)
- **CRUD Operations**: Create, read, update, delete with validation
- **Parent Assignment**: Select parent marriage from dropdown
- **Bulk Operations**: Checkbox selection for future bulk actions

### 3. Marriage Management
#### Relationship Data
- **Spouse Pairs**: Exactly two spouses with validation
- **Marriage Details**: Date, place, status (married/divorced/widowed)
- **Children Management**: Multiple selection methods (checkboxes + manual IDs)
- **Future Fields**: Anniversary, officiant, witnesses, wedding photos

#### Validation & Constraints
- **Spouse Validation**: Ensures both spouses exist in database
- **Child Validation**: Verifies all children exist as persons
- **Unique Relationships**: Prevents duplicate marriages
- **Status Tracking**: Marriage status with lifecycle management

### 4. Family Tree Visualization
#### Interactive Tree Display
- **React Flow Integration**: Professional diagram rendering
- **Responsive Layout**: Auto-fit viewport with zoom/pan controls
- **Grid Background**: Visual reference lines for clarity
- **Smooth Animations**: Animated edges for parent-child relationships

#### Node Types & Design
- **Person Nodes**: Individual display with name, age, lifespan
- **Marriage Nodes**: Relationship indicators with date and duration
- **Married Person Nodes**: Combined spouse display for marriages
- **Color Coding**: Gender-based colors (blue/pink/purple)
- **Consistent Sizing**: Fixed dimensions for uniform appearance

#### Layout Algorithm
- **Hierarchical Structure**: Multi-generational family display
- **Root Detection**: Automatically identifies family tree roots
- **Child Sorting**: Birth date ordering for consistent display
- **Centering Logic**: Parent marriages centered above children
- **Complex Relationships**: Handles multiple marriages, step-families

### 5. Data Persistence & Management
#### MongoDB Integration
- **Mongoose ODM**: Schema validation and modeling
- **Connection Pooling**: Efficient database connections (max 10)
- **Index Optimization**: Performance indexes on searchable fields
- **Graceful Handling**: Connection error recovery and retry logic

#### CRUD API Design
- **RESTful Endpoints**: Standard HTTP methods for all operations
- **Validation Pipeline**: Multi-layer validation (client, server, database)
- **Error Handling**: Consistent error responses with user-friendly messages
- **Logging**: Comprehensive operation logging for debugging

### 6. User Interface & Experience
#### Modern Design System
- **Tailwind CSS**: Utility-first styling with custom color scheme
- **Headless UI**: Accessible modal dialogs and form components
- **Geist Typography**: Professional font family from Vercel
- **Responsive Design**: Mobile-friendly interface considerations

#### Interactive Components
- **Modal Dialogs**: Person/marriage editing with form validation
- **Confirmation Dialogs**: Delete confirmation with clear warnings
- **Loading States**: Spinner animations and loading feedback
- **Error States**: User-friendly error messages and retry options

#### Form Management
- **Real-time Validation**: Immediate feedback on form inputs
- **Auto-save Indicators**: Visual feedback for save operations
- **Field Dependencies**: Related field updates (parent marriage changes)
- **Accessibility**: Screen reader support and keyboard navigation

### 7. Search & Discovery
#### Person Search
- **Multi-field Search**: Name, birth place, phone number search
- **Real-time Filtering**: Instant results as user types
- **Pagination Controls**: Navigate through large datasets
- **Search Statistics**: Display of filtered results count

#### Marriage Search
- **Spouse Name Search**: Find marriages by spouse names
- **Location Search**: Search by marriage place
- **Combined Results**: Unified search across all marriage fields

### 8. Development & Maintenance Features
#### Code Quality
- **TypeScript**: Full type safety with strict configuration
- **ESLint**: Code quality enforcement with Next.js rules
- **Component Organization**: Modular, reusable component structure
- **Error Boundaries**: Graceful error handling in React components

#### Development Tools
- **Hot Reload**: Instant development feedback with Turbopack
- **Docker Integration**: Containerized MongoDB for consistent development
- **Database Seeding**: Test data scripts for development
- **Environment Management**: Secure environment variable handling

### 9. Performance Optimizations
#### Frontend Performance
- **Memoization**: Expensive tree calculations cached with useMemo
- **Parallel Loading**: Simultaneous API requests for faster data loading
- **Efficient Rendering**: Optimized React component updates
- **Bundle Optimization**: Next.js automatic code splitting

#### Backend Performance
- **Database Indexes**: Optimized queries with strategic indexing
- **Connection Reuse**: Persistent database connections
- **Aggregation Pipelines**: Efficient data processing in MongoDB
- **Response Caching**: Strategic HTTP caching headers

### 10. Security Features
#### Authentication Security
- **OAuth State Validation**: CSRF protection for OAuth flow
- **Secure Cookie Handling**: HTTP-only, secure, SameSite cookies
- **JWT Validation**: Cryptographic signature verification
- **Session Management**: Automatic token expiry and refresh

#### Data Protection
- **Input Sanitization**: XSS prevention in user inputs
- **SQL Injection Prevention**: MongoDB's BSON protection
- **Schema Validation**: Multi-layer data validation
- **Access Control**: Email-based authorization system

### 11. Accessibility & Usability
#### Accessibility Features
- **Headless UI Components**: Screen reader compatible modals
- **Keyboard Navigation**: Full keyboard access to all features
- **Color Contrast**: High contrast colors for readability
- **Semantic HTML**: Proper HTML structure for assistive technologies

#### User Experience
- **Intuitive Navigation**: Clear breadcrumbs and navigation paths
- **Contextual Help**: Tooltips and placeholder text for guidance
- **Progressive Disclosure**: Complex forms broken into manageable sections
- **Error Recovery**: Clear error messages with actionable solutions

## Future Features & Roadmap

### Phase 1: Core Enhancements (Next 3 months)

#### 1.1 Enhanced Authentication
- **Multi-provider OAuth**: Support for Facebook, GitHub, Microsoft
- **Two-Factor Authentication**: TOTP support with authenticator apps
- **Session Management**: Admin panel for user session management
- **Role-based Access**: Admin, editor, viewer roles with different permissions
- **API Keys**: Programmatic access for third-party integrations

#### 1.2 Improved User Interface
- **Dark Mode Support**: Toggle between light/dark themes
- **Mobile Optimization**: Dedicated mobile interface for tree navigation
- **Accessibility Improvements**: WCAG 2.1 AA compliance
- **Keyboard Shortcuts**: Power user shortcuts for common operations
- **Customizable Layout**: User preferences for interface configuration

#### 1.3 Enhanced Tree Visualization
- **Interactive Node Expansion**: Click to expand/collapse person details
- **Timeline View**: Chronological view of family events
- **Search Highlighting**: Visual highlighting of search results in tree
- **Zoom Levels**: Multiple detail levels (names only, full details, photos)
- **Print Optimization**: Print-friendly tree layouts

### Phase 2: Advanced Features (Months 4-6)

#### 2.1 Media Management System
```typescript
// Photo management interface
interface PhotoManagement {
  uploadPhotos: (files: FileList) => Promise<Photo[]>
  organizeAlbums: (photos: Photo[], albumId: string) => void
  facialRecognition: (photo: Photo) => Promise<Person[]>
  bulkTagging: (photos: Photo[], tags: string[]) => void
}
```
- **Photo Upload & Storage**: Cloud storage integration (AWS S3, Cloudinary)
- **Image Processing**: Automatic resizing, format conversion
- **Facial Recognition**: AI-powered person tagging in photos
- **Photo Albums**: Wedding albums, family events, historical photos
- **Document Attachments**: Birth certificates, marriage licenses, wills

#### 2.2 Extended Relationship Types
```typescript
// Enhanced relationship modeling
interface ExtendedRelationship {
  type: 'biological' | 'adopted' | 'step' | 'foster' | 'godparent'
  startDate?: PartialDate
  endDate?: PartialDate
  legalStatus?: 'legal' | 'informal' | 'ceremonial'
  notes?: string
}
```
- **Adoption Tracking**: Legal and informal adoption relationships
- **Step-family Support**: Complex blended family structures
- **Godparent Relationships**: Religious and ceremonial relationships
- **Foster Care History**: Temporary care arrangements
- **Legal Guardianship**: Legal responsibility tracking

#### 2.3 Genealogical Research Tools
- **Source Citations**: Academic-standard source tracking
- **Research To-do Lists**: Organized research task management
- **Conflicting Information**: Handle multiple versions of facts
- **Research Notes**: Detailed research documentation
- **Evidence Evaluation**: Confidence levels for different facts

### Phase 3: Collaboration & Sharing (Months 7-9)

#### 3.1 Multi-user Collaboration
```typescript
// Collaboration system
interface CollaborationFeatures {
  inviteUsers: (emails: string[], role: UserRole) => Promise<Invitation[]>
  shareTree: (treeId: string, permissions: SharePermissions) => ShareLink
  reviewChanges: (changes: Change[]) => Promise<void>
  commentSystem: (nodeId: string, comment: Comment) => void
}
```
- **User Invitations**: Email-based collaboration invites
- **Permission System**: Granular permissions (read, edit, admin)
- **Change Approval**: Review system for sensitive changes
- **Comment System**: Discussion threads on persons/marriages
- **Activity Feed**: Real-time updates on family tree changes

#### 3.2 Public Sharing & Privacy
- **Shareable Links**: Public/private tree sharing with expiration
- **Privacy Controls**: Living person privacy protection
- **Export Formats**: GEDCOM, PDF, JSON exports
- **Embed Widgets**: Embeddable tree widgets for websites
- **Print Formats**: Professional family tree printing

#### 3.3 Data Import & Export
- **GEDCOM Import**: Standard genealogy format support
- **CSV Import/Export**: Bulk data operations
- **Ancestry.com Integration**: Import from popular genealogy sites
- **FamilySearch Integration**: Connect with LDS genealogy database
- **Backup & Restore**: Automated backup with point-in-time recovery

### Phase 4: Advanced Analytics & AI (Months 10-12)

#### 4.1 Family Analytics Dashboard
```typescript
// Analytics system
interface FamilyAnalytics {
  demographicStats: () => DemographicData
  migrationPatterns: () => GeographicMovement[]
  lifeExpectancy: () => LifespanAnalysis
  occupationTrends: () => OccupationData
  geneticHealth: () => HealthPatterns
}
```
- **Demographic Analysis**: Age distributions, gender ratios
- **Geographic Mapping**: Migration patterns and family dispersal
- **Statistical Reports**: Lifespan, marriage age, family size trends
- **Occupation Tracking**: Professional history and trends
- **Health Patterns**: Medical history and genetic patterns

#### 4.2 AI-Powered Features
- **Smart Duplicate Detection**: AI identification of duplicate entries
- **Relationship Suggestions**: ML suggestions for missing relationships
- **Date Estimation**: AI estimation of missing dates based on context
- **Photo Organization**: Automatic photo categorization and dating
- **Research Suggestions**: AI-powered research recommendations

#### 4.3 Advanced Search & Discovery
- **Fuzzy Name Matching**: Handle spelling variations and nicknames
- **Advanced Queries**: SQL-like queries for complex family searches
- **Relationship Calculator**: Calculate exact family relationships
- **Timeline Search**: Find people by date ranges and events
- **Geographic Search**: Location-based family member discovery

### Phase 5: Enterprise & Professional Features (Year 2)

#### 5.1 Professional Genealogy Tools
- **Research Methodology**: Academic genealogy standards
- **Evidence Documentation**: Primary/secondary source classification
- **Peer Review System**: Professional genealogist collaboration
- **Citation Management**: Academic-standard citation formats
- **Professional Reports**: Client-ready genealogy reports

#### 5.2 Enterprise Features
```typescript
// Enterprise configuration
interface EnterpriseFeatures {
  whiteLabeling: (brandConfig: BrandConfiguration) => void
  apiAccess: (apiKey: string) => FamilyTreeAPI
  customDomains: (domain: string) => void
  ssoIntegration: (ssoProvider: SSOProvider) => void
  auditLogging: () => AuditLog[]
}
```
- **White-label Solutions**: Custom branding for organizations
- **API Access**: RESTful API for third-party integrations
- **Custom Domains**: Organization-specific URLs
- **SSO Integration**: Enterprise single sign-on support
- **Audit Logging**: Detailed change tracking for compliance

#### 5.3 Advanced Security
- **Data Encryption**: End-to-end encryption for sensitive data
- **Compliance Features**: GDPR, CCPA compliance tools
- **Data Residency**: Geographic data storage controls
- **Security Auditing**: Regular security scans and reports
- **Incident Response**: Security incident management

### Database Schema Extensions

#### Future Person Schema Additions
```typescript
interface ExtendedPerson extends IPerson {
  // Professional information
  occupations?: Occupation[]
  education?: Education[]
  military?: MilitaryService[]
  
  // Physical characteristics
  physicalTraits?: PhysicalTraits
  medicalHistory?: MedicalRecord[]
  
  // Social connections
  socialMedia?: ExtendedSocialMedia
  addresses?: Address[]
  contacts?: ContactMethod[]
  
  // Research metadata
  sources?: Source[]
  researchNotes?: ResearchNote[]
  confidenceLevel?: ConfidenceLevel
}
```

#### Future Marriage Schema Additions
```typescript
interface ExtendedMarriage extends IMarriage {
  // Ceremony details
  ceremony?: CeremonyDetails
  witnesses?: WitnessRecord[]
  officiant?: PersonReference
  
  // Legal information
  marriageLicense?: LegalDocument
  divorce?: DivorceRecord
  
  // Relationship history
  engagementDate?: PartialDate
  separationDate?: PartialDate
  reconciliationDates?: PartialDate[]
}
```

### Implementation Priorities

#### High Priority (Essential)
1. **Media Management** - Critical for user engagement
2. **Mobile Optimization** - Essential for accessibility
3. **Data Import/Export** - Required for data portability
4. **Enhanced Authentication** - Security and user management

#### Medium Priority (Important)
1. **Collaboration Features** - Social aspects of genealogy
2. **Analytics Dashboard** - Data insights and patterns
3. **Advanced Search** - Power user functionality
4. **Print/Export Options** - Physical documentation needs

#### Low Priority (Nice to Have)
1. **AI Features** - Cutting-edge but not essential
2. **Enterprise Features** - Specialized market segment
3. **Advanced Security** - Beyond standard security needs
4. **Professional Tools** - Niche genealogy market

### Technical Debt & Infrastructure Improvements

#### Code Quality Improvements
- **Test Coverage**: Comprehensive unit and integration testing
- **Documentation**: API documentation with OpenAPI/Swagger
- **Type Safety**: Stricter TypeScript configuration
- **Performance Monitoring**: Real-time application monitoring
- **Error Tracking**: Production error monitoring and alerting

#### Infrastructure Scaling
- **Microservices**: Split monolith into focused services
- **Caching Layer**: Redis caching for improved performance
- **CDN Integration**: Global content delivery for assets
- **Load Balancing**: Horizontal scaling capabilities
- **Database Optimization**: Query optimization and partitioning

## Code Quality & Best Practices

### TypeScript Configuration

#### Strict Type Safety
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,              // Enable all strict type checking
    "noImplicitAny": true,       // Error on implicit 'any' types
    "noImplicitReturns": true,   // Error on missing return statements
    "noUnusedLocals": true,      // Error on unused local variables
    "noUnusedParameters": true,  // Error on unused function parameters
    "exactOptionalPropertyTypes": true // Strict optional property types
  }
}
```

#### Interface Design Patterns
```typescript
// Consistent interface naming
interface IPerson { }      // Database entities
interface PersonData { }   // API request/response data
interface PersonProps { }  // React component props
interface PersonConfig { } // Configuration objects

// Generic type constraints
interface APIResponse<T> {
  data: T
  error?: string
  timestamp: Date
}

// Union types for enums
type Gender = 'male' | 'female' | 'other'
type MarriageStatus = 'married' | 'divorced' | 'widowed'
```

### React Component Standards

#### Component Structure
```typescript
// Standard component organization
interface ComponentProps {
  // Props interface first
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // 1. State hooks
  const [state, setState] = useState(initialValue)
  
  // 2. Effect hooks
  useEffect(() => {
    // Side effects
  }, [dependencies])
  
  // 3. Memoized values
  const memoizedValue = useMemo(() => calculation(), [dependencies])
  
  // 4. Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies])
  
  // 5. Early returns for loading/error states
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  
  // 6. Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

#### Hook Patterns
```typescript
// Custom hook for API data
function usePersons() {
  const [persons, setPersons] = useState<IPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const loadPersons = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/persons')
      if (!response.ok) throw new Error('Failed to load persons')
      const data = await response.json()
      setPersons(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => { loadPersons() }, [loadPersons])
  
  return { persons, loading, error, refetch: loadPersons }
}
```

### Database Best Practices

#### Schema Design Principles
```typescript
// Embedded vs Referenced Documents
interface Person {
  _id: ObjectId
  name: string
  photos: Photo[]        // Embedded: One-to-few relationship
  marriages: ObjectId[]  // Referenced: Many-to-many relationship
}

// Index Strategy
PersonSchema.index({ name: 1 })                    // Single field
PersonSchema.index({ 'dob.year': 1, gender: 1 })  // Compound index
PersonSchema.index({ name: 'text', birthPlace: 'text' }) // Text search
```

#### Query Optimization
```typescript
// Efficient aggregation pipelines
const getPersonsWithAges = () => Person.aggregate([
  {
    $addFields: {
      age: {
        $subtract: [
          { $year: new Date() },
          '$dob.year'
        ]
      }
    }
  },
  { $sort: { age: -1 } },
  { $limit: 100 }
])

// Projection for performance
const getPersonNames = () => Person.find({}, 'name _id')
```

### API Design Standards

#### RESTful Endpoint Design
```typescript
// Resource-based URLs
GET    /api/persons           # Collection
GET    /api/persons/:id       # Resource (future implementation)
POST   /api/persons           # Create
PUT    /api/persons           # Update (with _id in body)
DELETE /api/persons?id=:id    # Delete

// Consistent response formats
interface APISuccess<T> {
  data?: T
  message?: string
  timestamp: Date
}

interface APIError {
  error: string
  details?: any
  code?: number
  timestamp: Date
}
```

#### Input Validation Chain
```typescript
// 1. TypeScript type checking (compile time)
interface CreatePersonRequest {
  name: string
  gender?: Gender
  dob?: PartialDate
}

// 2. Runtime validation (API handler)
function validatePersonInput(data: any): CreatePersonRequest {
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Name is required and must be a string')
  }
  if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
    throw new Error('Invalid gender value')
  }
  return data as CreatePersonRequest
}

// 3. Mongoose schema validation (database level)
const PersonSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    minlength: 1, 
    maxlength: 200,
    trim: true 
  }
})
```

### Error Handling Patterns

#### Hierarchical Error Handling
```typescript
// 1. Component Level
function Component() {
  const [error, setError] = useState<string | null>(null)
  
  const handleOperation = async () => {
    try {
      await riskyOperation()
    } catch (err) {
      setError(formatErrorMessage(err))
    }
  }
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={handleOperation} />
  }
}

// 2. API Route Level
export async function POST(request: Request) {
  try {
    const data = await request.json()
    validateInput(data)
    const result = await performOperation(data)
    return NextResponse.json(result)
  } catch (error) {
    console.error('API Error:', error)
    
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 3. Global Error Boundary (React)
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary:', error, errorInfo)
    // Send to error tracking service
  }
}
```

### Performance Best Practices

#### Memoization Strategy
```typescript
// Expensive calculations
const TreeNodes = ({ persons, marriages }) => {
  const { nodes, edges } = useMemo(() => {
    return computeTreeLayout(persons, marriages)
  }, [persons, marriages])
  
  return <ReactFlow nodes={nodes} edges={edges} />
}

// Component memoization
const PersonCard = React.memo(({ person }) => {
  return <div>{person.name}</div>
}, (prevProps, nextProps) => {
  return prevProps.person.id === nextProps.person.id &&
         prevProps.person.updatedAt === nextProps.person.updatedAt
})
```

#### Database Performance
```typescript
// Connection pooling
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return // Reuse existing connection
  }
  
  await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 30000
  })
}

// Efficient queries
const getRecentPersons = async (limit = 10) => {
  return Person.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean() // Return plain objects, not Mongoose documents
    .exec()
}
```

### Security Best Practices

#### Input Sanitization
```typescript
// XSS Prevention
function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

// MongoDB Injection Prevention (Mongoose handles this automatically)
// But still validate input types
function validateObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
```

#### Authentication Security
```typescript
// JWT Token Validation
async function validateJWT(token: string): Promise<AppJwtPayload> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as AppJwtPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Secure Cookie Configuration
const cookieOptions = {
  httpOnly: true,        // Prevent XSS access
  secure: true,          // HTTPS only
  sameSite: 'lax' as const, // CSRF protection
  maxAge: 7 * 24 * 60 * 60, // 7 days
  path: '/'
}
```

### Code Organization Standards

#### File Structure Convention
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── (pages)/        # Page components
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   ├── ui/            # Basic UI components
│   ├── forms/         # Form components
│   └── layout/        # Layout components
├── lib/               # Utility libraries
│   ├── api.ts         # API client functions
│   ├── utils.ts       # Helper functions
│   ├── types.ts       # Type definitions
│   └── constants.ts   # Application constants
└── hooks/             # Custom React hooks
```

#### Import Organization
```typescript
// 1. Node modules
import React, { useState, useEffect } from 'react'
import { NextResponse } from 'next/server'

// 2. Internal modules (absolute imports)
import { IPerson, IMarriage } from '@/lib/models'
import { formatDate } from '@/lib/utils'

// 3. Relative imports
import PersonCard from './PersonCard'
import './styles.css'

// 4. Type-only imports
import type { ComponentProps } from 'react'
```

### Testing Strategy (Future Implementation)

#### Unit Testing
```typescript
// Component testing with React Testing Library
describe('PersonCard', () => {
  it('renders person name correctly', () => {
    const person: IPerson = { name: 'John Doe', ... }
    render(<PersonCard person={person} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})

// Utility function testing
describe('formatPartialDate', () => {
  it('formats complete date correctly', () => {
    const date: PartialDate = { year: 1990, month: 6, day: 15 }
    expect(formatPartialDate(date)).toBe('15 Jun 1990')
  })
})
```

#### Integration Testing
```typescript
// API route testing
describe('/api/persons', () => {
  it('creates person successfully', async () => {
    const personData = { name: 'Test Person' }
    const response = await fetch('/api/persons', {
      method: 'POST',
      body: JSON.stringify(personData)
    })
    expect(response.status).toBe(201)
    const result = await response.json()
    expect(result.name).toBe('Test Person')
  })
})
```

## Troubleshooting

### Common Development Issues

#### 1. Database Connection Problems

**Issue**: MongoDB connection failures
```bash
❌ MongoDB connection failed: MongoNetworkError: connect ECONNREFUSED
```

**Solutions**:
```bash
# Check if MongoDB container is running
docker-compose ps

# Start MongoDB if not running
docker-compose up -d mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string
echo $MONGODB_URI

# Test connection manually
docker exec -it family-tree-mongodb mongosh
```

**Environment Variable Issues**:
```bash
# Verify .env file exists and has correct variables
cat .env

# Check if variables are loaded
node -e "console.log(process.env.MONGODB_URI)"

# Restart development server after .env changes
npm run dev
```

#### 2. Authentication & JWT Issues

**Issue**: JWT token validation failures
```bash
❌ Error: Invalid token signature
```

**Solutions**:
```typescript
// Check JWT secret configuration
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and >= 32 chars")
}

// Regenerate JWT secret if needed
const crypto = require('crypto')
const newSecret = crypto.randomBytes(32).toString('hex')
console.log('New JWT_SECRET:', newSecret)
```

**Google OAuth Configuration**:
```bash
# Verify Google OAuth credentials
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$GOOGLE_CLIENT_ID" \
  -d "client_secret=$GOOGLE_CLIENT_SECRET" \
  -d "grant_type=client_credentials"

# Check redirect URI configuration in Google Console
# Must match exactly: http://localhost:3000/api/auth/google/callback
```

#### 3. React Flow Rendering Issues

**Issue**: Family tree not displaying or layout problems
```javascript
// Common causes and solutions

// 1. Data loading issues
useEffect(() => {
  console.log('Persons:', persons.length)
  console.log('Marriages:', marriages.length)
}, [persons, marriages])

// 2. Node positioning problems
const { nodes, edges } = useMemo(() => {
  console.log('Recalculating tree layout')
  const result = generateTreeLayout(persons, marriages)
  console.log('Generated nodes:', result.nodes.length)
  console.log('Generated edges:', result.edges.length)
  return result
}, [persons, marriages])

// 3. React Flow container sizing
<div className="w-full h-full"> {/* Ensure parent has dimensions */}
  <ReactFlow nodes={nodes} edges={edges} />
</div>
```

#### 4. TypeScript Compilation Errors

**Issue**: Type errors in development
```typescript
// Common type issues and fixes

// 1. Mongoose document types
const person = await Person.findById(id).lean() as IPerson | null
// Use .lean() to get plain objects instead of Mongoose documents

// 2. API response types
interface APIResponse<T> {
  data?: T
  error?: string
}
const response: APIResponse<IPerson[]> = await fetch('/api/persons').then(r => r.json())

// 3. Event handler types
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // Explicit event types for better IDE support
}
```

### Production Deployment Issues

#### 1. Environment Configuration

**Issue**: Environment variables not loading in production
```bash
# Vercel deployment
vercel env add MONGODB_URI
vercel env add GOOGLE_CLIENT_ID
vercel env add JWT_SECRET

# Docker deployment
# Use .env.production or pass via docker-compose
environment:
  - NODE_ENV=production
  - MONGODB_URI=${MONGODB_URI}
```

#### 2. Database Performance Issues

**Issue**: Slow query performance
```javascript
// Enable MongoDB profiling
db.setProfilingLevel(2, { slowms: 100 })

// Analyze slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5)

// Add missing indexes
db.persons.createIndex({ name: 1, "dob.year": 1 })
db.marriages.createIndex({ spouses: 1, "date.year": -1 })

// Use explain() to analyze query plans
db.persons.find({ name: /John/ }).explain("executionStats")
```

#### 3. Memory and Performance Issues

**Issue**: High memory usage or slow page loads
```typescript
// Memory leak prevention
useEffect(() => {
  const controller = new AbortController()
  
  fetch('/api/persons', { signal: controller.signal })
    .then(response => response.json())
    .then(data => setPersons(data))
  
  return () => controller.abort() // Cleanup on unmount
}, [])

// React component optimization
const PersonList = React.memo(({ persons }) => {
  return persons.map(person => (
    <PersonCard key={person.id} person={person} />
  ))
})

// Database query optimization
// Instead of loading all data:
const persons = await Person.find()

// Use pagination:
const persons = await Person.find()
  .limit(50)
  .skip(page * 50)
  .lean()
```

### Debugging Strategies

#### 1. Development Debugging

**React Developer Tools**:
```bash
# Install browser extensions
# - React Developer Tools
# - React Flow DevTools (if available)

# Component debugging
console.log('Component props:', props)
console.log('Component state:', state)
```

**Network Debugging**:
```typescript
// API request logging
const apiCall = async (url: string, options: RequestInit = {}) => {
  console.log(`API Call: ${options.method || 'GET'} ${url}`)
  console.log('Request options:', options)
  
  const response = await fetch(url, options)
  
  console.log(`Response: ${response.status} ${response.statusText}`)
  if (!response.ok) {
    const error = await response.text()
    console.error('API Error:', error)
  }
  
  return response
}
```

**Database Query Debugging**:
```typescript
// Mongoose query debugging
mongoose.set('debug', true) // Log all queries

// Manual query inspection
const query = Person.find({ name: /John/ })
console.log('Query:', query.getQuery())
console.log('Options:', query.getOptions())
```

#### 2. Production Monitoring

**Error Tracking Setup**:
```typescript
// Sentry integration example
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter sensitive information
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  }
})

// Custom error boundary
export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])
  
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <details>{error.message}</details>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
```

**Performance Monitoring**:
```typescript
// Custom performance tracking
const trackOperation = async (operationName: string, operation: () => Promise<any>) => {
  const startTime = performance.now()
  
  try {
    const result = await operation()
    const duration = performance.now() - startTime
    
    console.log(`${operationName} completed in ${duration.toFixed(2)}ms`)
    
    // Send to analytics service
    // analytics.track('operation_duration', { name: operationName, duration })
    
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`${operationName} failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

// Usage
const persons = await trackOperation('Load Persons', () => 
  fetch('/api/persons').then(r => r.json())
)
```

### Recovery Procedures

#### 1. Data Recovery

**Database Backup Restoration**:
```bash
# Create backup
mongodump --uri="$MONGODB_URI" --out="backup/$(date +%Y%m%d)"

# Restore from backup
mongorestore --uri="$MONGODB_URI" --drop backup/20240101/

# Partial restore (specific collection)
mongorestore --uri="$MONGODB_URI" --collection=persons backup/20240101/familytree/persons.bson
```

**Data Validation After Recovery**:
```typescript
// Validate data integrity
const validateDatabase = async () => {
  // Check for orphaned relationships
  const orphanedChildren = await Marriage.aggregate([
    { $unwind: '$children' },
    { $lookup: { from: 'persons', localField: 'children', foreignField: '_id', as: 'person' } },
    { $match: { person: { $size: 0 } } }
  ])
  
  console.log('Orphaned children:', orphanedChildren)
  
  // Check for invalid spouse references
  const invalidSpouses = await Marriage.aggregate([
    { $unwind: '$spouses' },
    { $lookup: { from: 'persons', localField: 'spouses', foreignField: '_id', as: 'person' } },
    { $match: { person: { $size: 0 } } }
  ])
  
  console.log('Invalid spouses:', invalidSpouses)
}
```

#### 2. System Recovery

**Application Recovery**:
```bash
# Restart application services
docker-compose restart

# Clear application cache
rm -rf .next/
npm run build

# Reset database connections
docker-compose restart mongodb
```

**Environment Reset**:
```bash
# Reset development environment
docker-compose down -v  # Remove volumes
docker-compose up -d    # Recreate containers
npm install             # Reinstall dependencies
npm run dev            # Start development server
```

This comprehensive documentation provides a complete understanding of the family tree application's architecture, implementation, and future development plans. It serves as both a reference for current development and a roadmap for future enhancements, ensuring that AI agents and developers can effectively work with and extend the codebase.