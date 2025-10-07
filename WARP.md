# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.2 family tree visualization application built with TypeScript, React, and Tailwind CSS. The app displays family relationships using React Flow Renderer with interactive node-based diagrams, and includes a comprehensive management interface for full CRUD operations on family data with MongoDB persistence.

**📚 Complete Documentation**: See `DOCUMENTATION.md` for comprehensive technical documentation covering all aspects of the codebase including architecture, database schema, API endpoints, authentication system, frontend components, deployment configuration, and troubleshooting guides.

## Development Commands

### Core Commands
```bash
# Development server (with Turbopack)
npm run dev

# Production build (with Turbopack) 
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database Setup
```bash
# Start MongoDB using Docker Compose
docker-compose up -d

# Stop MongoDB
docker-compose down

# View logs
docker-compose logs -f mongodb
```

### Running Specific Features
- Main family tree visualization: `npm run dev` then visit `http://localhost:3000`
- Family data management interface: Visit `http://localhost:3000/manage`
- MongoDB database runs on `mongodb://localhost:27017/familytree`

## Architecture & Code Organization

### Core Data Structure
The application is built around enhanced MongoDB-backed data models in `src/lib/models.ts`:
- **IPerson**: Enhanced person interface with future-ready fields (photos, social media, occupation, education)
- **IMarriage**: Marriage interface with comprehensive relationship data, including anniversaries, officiants, witnesses
- **PartialDate**: Flexible date system supporting incomplete, approximate, and range dates

### Key Architectural Patterns

**Data Persistence**: 
- MongoDB with Mongoose ODM for robust data modeling and validation
- Full CRUD API routes (`/api/persons`, `/api/marriages`) with proper error handling
- Connection pooling and graceful shutdown handling
- Indexed collections for optimal performance

**UI/UX Enhancement**:
- **Expandable Nodes**: Click any person node to toggle between minimal (name + lifespan) and detailed views (all biographical data)
- **Interactive Family Tree**: Custom PersonNode component with hover states and smooth transitions
- **Management Interface**: Comprehensive forms with validation, search, pagination, and confirmation dialogs

**Layout Algorithm**: 
The `FamilyTree.tsx` component implements a sophisticated recursive layout system:
- Detects root marriages (marriages whose spouses aren't children of other marriages)
- Uses depth-first traversal to position nodes hierarchically
- Handles complex scenarios like second marriages and prevents infinite loops
- Automatically centers parent marriages above their children
- Dynamic node spacing based on content (expandable nodes)

**Flexible Date System**: 
The `PartialDate` type handles genealogical data complexities:
- Supports incomplete dates (year-only, month/year, full dates)
- Handles approximate dates and date ranges
- Includes notes for conflicting or uncertain information
- UI components (PartialDateInput) for intuitive date entry

### Component Structure
- `src/app/page.tsx`: Main entry point displaying the interactive family tree
- `src/components/FamilyTree.tsx`: Core visualization component with custom PersonNode and React Flow integration
- `src/components/PartialDateInput.tsx`: Sophisticated date input component handling all genealogical date scenarios
- `src/app/manage/page.tsx`: Full-featured CRUD interface with search, pagination, and comprehensive forms
- `src/app/layout.tsx`: Root layout with Geist font configuration and metadata
- `src/app/api/`: RESTful API routes for persons and marriages with full validation

### Database Layer
- `src/lib/models.ts`: Mongoose schemas with validation, indexing, virtual fields, and pre-save hooks
- `src/lib/database.ts`: Connection management with pooling, error handling, and graceful shutdown
- `src/lib/utils.ts`: Comprehensive utility functions for date formatting, validation, and data transformation

### Styling & Design
- **Tailwind CSS 4.1** for utility-first styling
- **Custom color scheme**: Female nodes (hot pink), male nodes (sea green), marriage nodes (lemon/orange)
- **Typography**: Geist font family for modern, clean appearance
- **Responsive design**: Full viewport layouts with proper spacing and mobile considerations
- **Interactive elements**: Hover states, loading spinners, confirmation dialogs, form validation feedback

## Technical Considerations

### Database Architecture
- **MongoDB 7.0** with authentication and proper user permissions
- **Connection pooling** with max 10 concurrent connections
- **Indexing strategy**: Optimized indexes on frequently queried fields (name, dates, relationships)
- **Data validation**: Schema-level validation with Mongoose validators and custom validation logic
- **Future-ready schema**: Provisions for photos, social media links, occupational data, and extended relationship metadata

### React Flow Integration
- Uses `react-flow-renderer` v10.3.17 for interactive diagrams
- Custom node types with expandable functionality
- Implements custom node positioning with animated edges
- Background grid for visual clarity
- Auto-fit viewport to show entire family tree
- Disabled dragging/connecting to focus on pure visualization

### State Management
- Local component state for UI interactions (expanded nodes, form editing)
- API-driven data fetching with proper error handling and loading states
- Real-time updates between management interface and visualization
- No external state management library needed (complexity appropriate for app size)

### Type Safety
- Strict TypeScript configuration with no implicit any types
- Comprehensive interfaces for all data structures
- Proper type assertions for Mongoose operations
- Path aliasing configured (`@/*` maps to `src/*`)

### Development Tools
- **ESLint**: Strict linting with Next.js configuration and TypeScript rules
- **PostCSS**: CSS processing for Tailwind
- **Turbopack**: Fast bundling for development and production builds
- **Docker Compose**: Containerized MongoDB for consistent development environment

### API Design
- RESTful endpoints following Next.js 13+ app router conventions
- Comprehensive error handling with appropriate HTTP status codes
- Input validation and sanitization
- Consistent response format with detailed error messages
- Logging for debugging and monitoring

## Data Management

### Adding New Family Members
1. Use the management interface at `/manage` for intuitive form-based data entry
2. API automatically generates MongoDB ObjectIds for new records
3. All data is immediately persisted to MongoDB with full validation
4. Changes are instantly reflected in the family tree visualization

### ID Conventions
- MongoDB ObjectIds are used for all primary keys
- Relationships stored as string references to person IDs
- Automatic ID generation ensures uniqueness

### Date Handling
When working with dates, use the comprehensive `PartialDate` structure:
```typescript
// Full date
{ year: 1985, month: 6, day: 15 }

// Approximate date
{ year: 1985, approximate: true }

// Date range
{ range: { from: "1985", to: "1987" } }

// With notes
{ year: 1985, approximate: true, notes: "Birth certificate lost, estimated from census" }
```

### Search and Filtering
- Full-text search across person names, places, and phone numbers
- Marriage search by spouse names and locations
- Pagination for large datasets
- Real-time filtering as you type

## Future Development Roadmap

### Planned Features
1. **Authentication & Authorization**
   - Google OAuth integration (infrastructure already prepared)
   - User-specific family trees
   - Sharing and collaboration permissions

2. **Media Management**
   - Photo uploads and management (schema already defined)
   - Profile photo selection
   - Wedding photo albums
   - Document attachments (birth certificates, marriage licenses)

3. **Extended Data**
   - Social media integration (schema prepared)
   - Occupation and education tracking
   - Extended relationship types (godparents, adoptions)
   - Medical/genetic information tracking

4. **Advanced Visualization**
   - Timeline view of family events
   - Geographical mapping of family locations
   - Statistical dashboards and family analytics
   - Export options (PDF family trees, GEDCOM format)

5. **Enhanced UX**
   - Advanced search with filters
   - Bulk import/export functionality
   - Mobile-optimized interface
   - Offline support with sync

### Technical Debt & Improvements
- Implement proper caching strategy (Redis)
- Add comprehensive test coverage (Jest, React Testing Library)
- Implement rate limiting for API endpoints
- Add monitoring and logging (Winston, application insights)
- Optimize bundle size and performance
- Add internationalization support

## Environment Configuration

### Required Environment Variables
```bash
# MongoDB connection string
MONGODB_URI=mongodb://familytree_user:secure_password@localhost:27017/familytree

# Future: Authentication
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# NEXTAUTH_SECRET=your_nextauth_secret
# NEXTAUTH_URL=http://localhost:3000
```

### Docker Configuration
- `docker-compose.yml`: MongoDB 7.0 with authentication
- `docker/mongodb/init/`: Database initialization scripts
- Persistent data volumes for development consistency

## Browser Compatibility

The app targets modern browsers with ES2017+ support. React Flow requires JavaScript enabled and works best in current versions of Chrome, Firefox, Safari, and Edge. MongoDB operations require a stable internet connection for the hosted database or local Docker setup.

## Troubleshooting

### Common Issues
1. **MongoDB Connection Errors**: Ensure Docker is running and MongoDB container is healthy
2. **Build Errors**: Check TypeScript strict mode compliance and import paths
3. **React Flow Rendering**: Verify node data structure matches expected interfaces
4. **API Route Issues**: Check MongoDB connection state and proper async/await usage

### Development Tips
- Use MongoDB Compass for database inspection
- Check browser console for React Flow warnings
- Monitor network tab for API request/response debugging
- Use React Developer Tools for component state inspection
