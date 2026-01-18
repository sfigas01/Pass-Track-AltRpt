# PassTrack Short-Term Product Roadmap

## Executive Summary

PassTrack is a fitness class pass and activity tracking application that helps users manage prepaid class packs, usage-based memberships, and spending across multiple studios. This roadmap outlines high-impact feature enhancements prioritized by user value and implementation complexity.

---

## Current State Assessment

### Strengths
- Solid dual-mode tracking (class packs + usage-based activities)
- Clean, mobile-first UI with dark/light themes
- Strong security practices and data isolation
- Recent momentum with usage-based tracking features

### Gaps Identified
- No ability to edit/delete usage sessions after logging
- No expiration notifications or reminders
- Limited analytics beyond basic pie chart
- No user profile or settings page
- Class bookings feature underutilized
- Debug logging in production code

---

## Roadmap Priorities

### Phase 1: Core Experience Polish

#### 1.1 Usage Session Management
**Priority:** High | **Effort:** Low

**Problem:** Users cannot edit or delete usage sessions once logged. Mistakes require workarounds.

**Solution:**
- Add edit capability for existing usage sessions
- Add delete capability with confirmation dialog
- Show session history list in an expandable section on usage-based pass cards

**Acceptance Criteria:**
- [ ] Edit button on each session row opens edit modal
- [ ] Delete button with "Are you sure?" confirmation
- [ ] Toast notification on successful edit/delete
- [ ] Query cache invalidation to refresh analytics

---

#### 1.2 Quick Check-In Improvements
**Priority:** High | **Effort:** Low

**Problem:** Check-in for class packs could be more streamlined.

**Solution:**
- Add "Undo" capability after check-in (5-second window)
- Show last check-in date on pass card
- Optional: Quick notes field on check-in

**Acceptance Criteria:**
- [ ] Undo toast appears after check-in with action button
- [ ] "Last used: [date]" shown on pass card
- [ ] Check-in animates remaining count change

---

#### 1.3 Remove Debug Logging
**Priority:** Medium | **Effort:** Very Low

**Problem:** Console debug statements in production code (`server/routes.ts`).

**Solution:**
- Remove or replace with structured logging (pino/winston)
- Add NODE_ENV-aware logging level

---

### Phase 2: Proactive User Engagement

#### 2.1 Expiration Alerts Dashboard Banner
**Priority:** High | **Effort:** Medium

**Problem:** Users forget about expiring passes and lose value.

**Solution:**
- Dashboard banner showing passes expiring within 7 days
- Visual urgency indicators (amber for 7 days, red for 3 days)
- Quick link to extend or use pass

**Acceptance Criteria:**
- [ ] Banner appears at top of dashboard when passes expiring soon
- [ ] Clicking banner scrolls/highlights the relevant pass
- [ ] Dismissible but reappears on next visit if still relevant

---

#### 2.2 Pass Expiration Email Notifications (Optional)
**Priority:** Medium | **Effort:** High

**Problem:** Users don't always open the app to see expiring passes.

**Solution:**
- Email notification 7 days before expiration
- Email notification 1 day before expiration
- User preference toggle in settings

**Dependencies:** Email service integration (SendGrid, Resend, etc.)

---

### Phase 3: Enhanced Analytics

#### 3.1 Spending Insights Dashboard
**Priority:** High | **Effort:** Medium

**Problem:** Users want to understand their fitness spending patterns.

**Solution:**
- Monthly spending trend line chart
- Studio-by-studio cost comparison
- "Cost per class" calculation for class packs
- Average cost per session for usage-based activities

**Acceptance Criteria:**
- [ ] New "Insights" tab or expandable section on dashboard
- [ ] Date range selector (last 30/60/90 days, all time)
- [ ] Visual charts using existing Recharts integration

---

#### 3.2 Usage Trends
**Priority:** Medium | **Effort:** Medium

**Problem:** Users want to see their activity patterns.

**Solution:**
- Classes/sessions per week trend
- Busiest days of week visualization
- Streak tracking (consecutive weeks with check-ins)

---

### Phase 4: User Experience Enhancements

#### 4.1 User Profile & Settings Page
**Priority:** Medium | **Effort:** Medium

**Problem:** No way to manage account preferences.

**Solution:**
- Profile page showing user info
- Theme preference persistence
- Notification preferences (if email implemented)
- Data export functionality

**Acceptance Criteria:**
- [ ] Profile accessible from header/menu
- [ ] Theme toggle in settings
- [ ] Export data as CSV/JSON

---

#### 4.2 Pass Sorting & Organization
**Priority:** Medium | **Effort:** Low

**Problem:** As users accumulate passes, finding the right one becomes harder.

**Solution:**
- Sort options: Recently used, Expiring soon, Alphabetical, Most remaining
- Drag-to-reorder passes (persist order)
- Favorite/pin passes to top

**Acceptance Criteria:**
- [ ] Sort dropdown in dashboard header
- [ ] Sort preference persisted in localStorage

---

#### 4.3 Bulk Actions
**Priority:** Low | **Effort:** Medium

**Problem:** Managing multiple expired passes individually is tedious.

**Solution:**
- Multi-select mode for passes
- Bulk archive expired passes
- Bulk delete archived passes

---

### Phase 5: Mobile Experience

#### 5.1 Touch-Friendly Interactions
**Priority:** Medium | **Effort:** Medium

**Problem:** Mobile guidelines mention swipe/haptic features not yet implemented.

**Solution:**
- Swipe left on pass to reveal quick actions (check-in, archive)
- Pull-to-refresh on dashboard
- Haptic feedback on check-in (where supported)

---

#### 5.2 Progressive Web App (PWA)
**Priority:** Low | **Effort:** Medium

**Problem:** Users want app-like experience on mobile.

**Solution:**
- Add service worker for offline support
- App manifest for "Add to Home Screen"
- Cache pass data for offline viewing

---

## Quick Wins Summary

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Edit/delete usage sessions | High | Low | Do First |
| Remove debug logging | Medium | Very Low | Do First |
| Check-in undo capability | High | Low | Do First |
| Expiration banner | High | Medium | Do Second |
| Pass sorting options | Medium | Low | Do Second |
| Spending insights charts | High | Medium | Do Third |

---

## Success Metrics

- **Engagement:** Average check-ins per user per week
- **Retention:** % of users returning weekly
- **Value Saved:** $ value of classes used before expiration (vs. expired unused)
- **Feature Adoption:** % of users using usage-based tracking

---

## Technical Debt to Address

1. Remove console.log debug statements
2. Add pagination for large pass lists
3. Move analytics calculations to backend
4. Add unit tests for critical paths
5. Implement structured logging

---

## Not In Scope (Future Consideration)

- Social features / sharing workouts
- Studio directory / booking integration
- Payment processing for renewals
- Multi-user family accounts
- Native mobile apps

---

*Last Updated: January 2026*
*Product Owner: PM Team*
