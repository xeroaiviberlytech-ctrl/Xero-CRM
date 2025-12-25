# Backend Implementation Tasks

## Current State
- ✅ Database schema defined (Prisma)
- ✅ tRPC infrastructure set up
- ✅ Supabase authentication configured
- ✅ RLS policies enabled
- ✅ Frontend UI complete
- ❌ **No backend API routes implemented**
- ❌ **All buttons are UI-only (not connected)**
- ❌ **All data is mock/static**

---

## Phase 1: Core Infrastructure Setup

### Task 1.1: Enhance tRPC Context
- [ ] Update `createTRPCContext` to properly sync Supabase user with Prisma User model
- [ ] Add helper function to get or create Prisma User from Supabase auth
- [ ] Add error handling for database connection issues
- [ ] Add logging for debugging

### Task 1.2: Create Router Structure
- [ ] Create separate router files:
  - `leads.ts` - Lead management
  - `deals.ts` - Deal/Pipeline management
  - `campaigns.ts` - Marketing campaigns
  - `tasks.ts` - Task management
  - `analytics.ts` - Analytics and reports
  - `users.ts` - User management
  - `activities.ts` - Activity feed
- [ ] Update `_app.ts` to combine all routers
- [ ] Add proper TypeScript types for all routers

### Task 1.3: User Management
- [ ] Create `users.getCurrent` - Get current user profile
- [ ] Create `users.updateProfile` - Update user profile
- [ ] Create `users.getOrCreate` - Sync Supabase user with Prisma User
- [ ] Add user sync middleware (auto-create Prisma User on first login)

---

## Phase 2: Leads Management

### Task 2.1: Lead CRUD Operations
- [ ] `leads.list` - Get all leads (with filters: all/hot/warm/cold)
- [ ] `leads.getById` - Get single lead details
- [ ] `leads.create` - Create new lead
- [ ] `leads.update` - Update lead information
- [ ] `leads.delete` - Delete lead
- [ ] `leads.search` - Search leads by company/contact name

### Task 2.2: Lead Features
- [ ] `leads.updateTemperature` - Change lead temperature (hot/warm/cold)
- [ ] `leads.updateRating` - Update lead rating (1-5 stars)
- [ ] `leads.assign` - Assign lead to user
- [ ] `leads.convertToDeal` - Convert lead to deal

### Task 2.3: Lead Validation
- [ ] Add Zod schemas for lead input validation
- [ ] Validate email format
- [ ] Validate phone number format
- [ ] Validate deal value (must be positive)

---

## Phase 3: Pipeline/Deals Management

### Task 3.1: Deal CRUD Operations
- [ ] `deals.list` - Get all deals (with stage filter)
- [ ] `deals.getById` - Get single deal details
- [ ] `deals.create` - Create new deal
- [ ] `deals.update` - Update deal information
- [ ] `deals.delete` - Delete deal

### Task 3.2: Pipeline Features
- [ ] `deals.updateStage` - Move deal between stages (drag & drop)
- [ ] `deals.updateProbability` - Update deal probability
- [ ] `deals.getByStage` - Get deals grouped by stage (for Kanban)
- [ ] `deals.getStageStats` - Get totals and counts per stage
- [ ] `deals.updateOwner` - Reassign deal to different user

### Task 3.3: Deal Validation
- [ ] Add Zod schemas for deal input
- [ ] Validate stage values (must be valid stage)
- [ ] Validate probability (0-100)
- [ ] Validate deal value (must be positive)
- [ ] Validate close date (must be future date)

---

## Phase 4: Marketing/Campaigns

### Task 4.1: Campaign CRUD Operations
- [ ] `campaigns.list` - Get all campaigns (with status filter)
- [ ] `campaigns.getById` - Get single campaign details
- [ ] `campaigns.create` - Create new campaign
- [ ] `campaigns.update` - Update campaign information
- [ ] `campaigns.delete` - Delete campaign

### Task 4.2: Campaign Features
- [ ] `campaigns.updateStatus` - Change campaign status (draft/active/paused/completed)
- [ ] `campaigns.updateMetrics` - Update sent/opened/clicked/converted counts
- [ ] `campaigns.getStats` - Get campaign statistics (total sent, avg open rate, etc.)
- [ ] `campaigns.getPerformance` - Get performance trends over time

### Task 4.3: Campaign Validation
- [ ] Add Zod schemas for campaign input
- [ ] Validate date ranges (start date < end date)
- [ ] Validate campaign type (email/social/sms/etc.)
- [ ] Validate budget values

---

## Phase 5: Tasks Management

### Task 5.1: Task CRUD Operations
- [ ] `tasks.list` - Get all tasks (with status filter)
- [ ] `tasks.getById` - Get single task details
- [ ] `tasks.create` - Create new task
- [ ] `tasks.update` - Update task information
- [ ] `tasks.delete` - Delete task

### Task 5.2: Task Features
- [ ] `tasks.updateStatus` - Move task between statuses (To Do/In Progress/Completed)
- [ ] `tasks.updatePriority` - Change task priority (Low/Medium/High)
- [ ] `tasks.getByStatus` - Get tasks grouped by status (for Kanban)
- [ ] `tasks.getStats` - Get task statistics (total, by status counts)
- [ ] `tasks.assign` - Assign task to user
- [ ] `tasks.toggleComplete` - Mark task as complete/incomplete

### Task 5.3: Task Validation
- [ ] Add Zod schemas for task input
- [ ] Validate status values
- [ ] Validate priority values
- [ ] Validate due date (optional, but if set must be valid date)

---

## Phase 6: Analytics & Reports

### Task 6.1: Dashboard Analytics
- [ ] `analytics.getDashboardStats` - Get KPI cards data:
  - Total Revenue
  - Active Leads count
  - Conversion Rate
  - Active Campaigns count
- [ ] `analytics.getRevenueTrend` - Get revenue vs target chart data
- [ ] `analytics.getPipelineDistribution` - Get pipeline distribution chart data
- [ ] `analytics.getRecentActivities` - Get recent activity feed

### Task 6.2: Advanced Analytics
- [ ] `analytics.getDealsClosed` - Get deals closed in period
- [ ] `analytics.getAverageDealSize` - Calculate average deal size
- [ ] `analytics.getTeamPerformance` - Get team performance metrics
- [ ] `analytics.getLeadSources` - Get lead source breakdown
- [ ] `analytics.getCampaignPerformance` - Get campaign performance trends

### Task 6.3: Export Features
- [ ] `analytics.exportReport` - Export report as PDF/CSV
- [ ] `analytics.exportLeads` - Export leads list
- [ ] `analytics.exportDeals` - Export deals list

---

## Phase 7: Activity Feed

### Task 7.1: Activity Tracking
- [ ] `activities.list` - Get activity feed (with pagination)
- [ ] `activities.create` - Create activity log entry
- [ ] `activities.getByUser` - Get activities for specific user
- [ ] `activities.getByLead` - Get activities for specific lead
- [ ] `activities.getByDeal` - Get activities for specific deal

### Task 7.2: Auto-Activity Creation
- [ ] Auto-create activity when lead is created/updated
- [ ] Auto-create activity when deal stage changes
- [ ] Auto-create activity when task is completed
- [ ] Auto-create activity when campaign is created/updated

---

## Phase 8: Search & Filters

### Task 8.1: Global Search
- [ ] `search.global` - Search across leads, deals, contacts
- [ ] `search.leads` - Search leads only
- [ ] `search.deals` - Search deals only
- [ ] `search.contacts` - Search contacts only

### Task 8.2: Advanced Filters
- [ ] `filters.getLeadFilters` - Get available lead filters
- [ ] `filters.getDealFilters` - Get available deal filters
- [ ] `filters.applyFilters` - Apply multiple filters to queries

---

## Phase 9: Frontend Integration

### Task 9.1: Connect Dashboard Page
- [ ] Replace mock stats with `analytics.getDashboardStats`
- [ ] Connect revenue chart with `analytics.getRevenueTrend`
- [ ] Connect pipeline chart with `analytics.getPipelineDistribution`
- [ ] Connect activity feed with `analytics.getRecentActivities`
- [ ] Add loading states
- [ ] Add error handling

### Task 9.2: Connect Leads Page
- [ ] Replace mock leads with `leads.list`
- [ ] Connect filter buttons to API
- [ ] Connect search to `leads.search`
- [ ] Connect "Add Lead" button to `leads.create`
- [ ] Connect table row click to `leads.getById`
- [ ] Connect actions menu (edit/delete)
- [ ] Add form for creating/editing leads

### Task 9.3: Connect Pipeline Page
- [ ] Replace mock deals with `deals.getByStage`
- [ ] Connect stage stats with `deals.getStageStats`
- [ ] Connect drag & drop to `deals.updateStage`
- [ ] Connect "Add Deal" button to `deals.create`
- [ ] Add form for creating/editing deals
- [ ] Add real-time updates (optional: use subscriptions)

### Task 9.4: Connect Marketing Page
- [ ] Replace mock campaigns with `campaigns.list`
- [ ] Connect stats with `campaigns.getStats`
- [ ] Connect "Create Campaign" button to `campaigns.create`
- [ ] Connect "View Details" to `campaigns.getById`
- [ ] Connect performance chart with `campaigns.getPerformance`
- [ ] Add form for creating/editing campaigns

### Task 9.5: Connect Tasks Page
- [ ] Replace mock tasks with `tasks.getByStatus`
- [ ] Connect stats with `tasks.getStats`
- [ ] Connect drag & drop to `tasks.updateStatus`
- [ ] Connect "Add Task" button to `tasks.create`
- [ ] Connect checkboxes to `tasks.toggleComplete`
- [ ] Add form for creating/editing tasks

### Task 9.6: Connect Analytics Page
- [ ] Connect stats with `analytics.getDealsClosed` and `analytics.getAverageDealSize`
- [ ] Connect charts with respective analytics endpoints
- [ ] Connect "Export PDF" button to `analytics.exportReport`

### Task 9.7: Connect Header Actions
- [ ] Connect "Refresh Data" button (refetch queries)
- [ ] Connect "Export Report" button
- [ ] Connect "Add Lead/Deal/Task" buttons
- [ ] Connect "Filter" buttons
- [ ] Connect global search bar

---

## Phase 10: Error Handling & Validation

### Task 10.1: Error Handling
- [ ] Add try-catch blocks to all procedures
- [ ] Create custom error types
- [ ] Add proper error messages
- [ ] Add error logging
- [ ] Handle database errors gracefully
- [ ] Handle authentication errors

### Task 10.2: Input Validation
- [ ] Add Zod schemas for all inputs
- [ ] Validate all required fields
- [ ] Validate data types
- [ ] Validate data ranges
- [ ] Add custom validation messages

### Task 10.3: Authorization
- [ ] Verify user owns resource before update/delete
- [ ] Check user permissions for sensitive operations
- [ ] Add role-based access control (if needed)
- [ ] Verify RLS policies are working correctly

---

## Phase 11: Performance & Optimization

### Task 11.1: Database Optimization
- [ ] Add database indexes (check Prisma schema)
- [ ] Optimize queries (avoid N+1 problems)
- [ ] Add pagination to list endpoints
- [ ] Add caching where appropriate

### Task 11.2: API Optimization
- [ ] Add request batching
- [ ] Add response caching
- [ ] Optimize data fetching
- [ ] Add loading states
- [ ] Add optimistic updates

---

## Phase 12: Testing & Documentation

### Task 12.1: Testing
- [ ] Test all CRUD operations
- [ ] Test error scenarios
- [ ] Test authentication/authorization
- [ ] Test validation
- [ ] Test edge cases

### Task 12.2: Documentation
- [ ] Document all API endpoints
- [ ] Add JSDoc comments
- [ ] Create API usage examples
- [ ] Document error codes

---

## Priority Order (Suggested)

### High Priority (Core Functionality)
1. Phase 1: Core Infrastructure
2. Phase 2: Leads Management
3. Phase 3: Pipeline/Deals Management
4. Phase 9.1-9.3: Connect Dashboard, Leads, Pipeline pages

### Medium Priority (Essential Features)
5. Phase 5: Tasks Management
6. Phase 9.5: Connect Tasks page
7. Phase 6: Analytics & Reports
8. Phase 9.1, 9.6: Connect Analytics

### Lower Priority (Nice to Have)
9. Phase 4: Marketing/Campaigns
10. Phase 7: Activity Feed
11. Phase 8: Search & Filters
12. Phase 11: Performance Optimization

---

## Estimated Effort

- **Phase 1**: 2-3 hours
- **Phase 2**: 3-4 hours
- **Phase 3**: 3-4 hours
- **Phase 4**: 2-3 hours
- **Phase 5**: 2-3 hours
- **Phase 6**: 3-4 hours
- **Phase 7**: 1-2 hours
- **Phase 8**: 2-3 hours
- **Phase 9**: 6-8 hours (all frontend connections)
- **Phase 10**: 2-3 hours
- **Phase 11**: 2-3 hours
- **Phase 12**: 2-3 hours

**Total Estimated Time**: 30-40 hours

---

## Notes

- Start with Phase 1 to establish foundation
- Test each phase before moving to next
- Use TypeScript strictly for type safety
- Follow tRPC best practices
- Ensure RLS policies are respected
- Add proper error handling from the start

