# Crate Drop - MVP PRD

## Overview

**Goal:** Validate the core discovery loop - walking to find something hidden feels magical.

**Hypothesis:** People will walk to collect digital crates if the radar/discovery mechanic is satisfying, even with simple content inside.

---

## MVP Scope

### What We're Building

A mobile app (iOS + Android) where users:
1. See crates on a radar as they walk
2. Auto-collect crates when they get close enough
3. Open crates from their inventory to reveal fortune cookie messages

### What We're NOT Building (Yet)

- User-created crates / dropping
- Multiple crate types or shapes
- Crate coins / economy
- Inventory management (Tetris grid)
- Depot / delivery system
- Quests / multi-crate chains
- Social features
- User accounts / profiles

---

## Core User Flow

```
Open app → See radar with nearby crates → Walk toward a crate →
Auto-collect when in range → Tap inventory → Tap crate →
Fortune revealed → Crate disappears
```

---

## Features

### 1. Radar Screen (Home)

**Purpose:** Show crates in the area, entice user to walk.

**Requirements:**
- Display user's current position (center)
- Show crate icons at their relative positions
- Update in real-time as user moves
- Visual indicator of distance (closer = larger/brighter)
- Crates within ~50m radius visible on radar

**Visual Direction:**
- Simple 2D radar aesthetic (like a sonar ping)
- Crates shown as simple icons/dots
- Pulsing animation to indicate "alive"

### 2. Auto-Collection

**Purpose:** Reward arriving at a location without friction.

**Requirements:**
- When user is within ~10m of a crate, auto-collect
- Satisfying visual/haptic feedback on collection
- Crate moves from radar to inventory
- Simple animation (crate flies to inventory icon)

### 3. Inventory

**Purpose:** Store collected crates until opened.

**Requirements:**
- Simple list or grid of collected crates
- Tap a crate to open it
- No limit on inventory size (MVP simplification)
- Show count of unopened crates

### 4. Crate Opening

**Purpose:** The payoff moment - reveal the fortune.

**Requirements:**
- Tap to open (no unlock mechanics for MVP)
- Simple but satisfying open animation
- Fortune text displayed prominently
- Option to dismiss / close
- Crate removed from inventory after opening

### 5. Fortune Content

**Purpose:** Give users something delightful to discover.

**Requirements:**
- Single sentence fortune cookie style messages
- Pre-seeded database of ~100 fortunes
- Random assignment to crates
- Examples:
  - "The path you didn't take is still being built."
  - "Someone is thinking about you right now."
  - "Your next big idea is already waiting for you."
  - "The detour becomes the destination."

---

## Technical Requirements

### Platform
- React Native (Expo) for iOS + Android
- Single codebase

### Location
- GPS-based location tracking
- Background location updates (battery-optimized)
- Geofencing for collection triggers

### Backend
- Supabase for database + auth
- Store crate locations (lat/lng)
- Store fortunes
- Track which crates user has collected

### Data Model

```
crates
- id (uuid)
- latitude (float)
- longitude (float)
- fortune_id (uuid, foreign key)
- created_at (timestamp)

fortunes
- id (uuid)
- message (text)
- created_at (timestamp)

user_collections
- id (uuid)
- user_id (uuid)
- crate_id (uuid)
- collected_at (timestamp)
- opened_at (timestamp, nullable)
```

---

## Crate Spawning (MVP)

For MVP, crates are **manually seeded** or **randomly generated** within a test area.

**Option A: Manual Seeding**
- Place 20-50 crates in a specific neighborhood
- Good for controlled testing

**Option B: Algorithmic Spawning**
- Generate crates within X radius of user
- Respawn when collected
- Ensures there's always something to find

**MVP Decision:** Start with Option A for testing, add Option B for broader release.

---

## Success Metrics

1. **Collection Rate** - Do users walk to crates?
2. **Session Length** - How long do users keep the app open?
3. **Return Rate** - Do users come back the next day?
4. **Distance Walked** - Are users actually moving?
5. **Fortunes Opened** - Do users open what they collect?

---

## Out of Scope (Future)

- [ ] User-generated crates
- [ ] Multiple crate shapes/types
- [ ] Inventory grid puzzle
- [ ] Crate coins economy
- [ ] Social/sharing features
- [ ] AR visualization
- [ ] 3D crate rendering
- [ ] Unlock mechanics (passcode, duo, etc.)
- [ ] Quest chains
- [ ] Depot/delivery system

---

## Milestones

### M1: Core Loop
- [ ] Radar displays crates
- [ ] Location tracking works
- [ ] Auto-collection triggers
- [ ] Inventory shows collected crates
- [ ] Crate opening reveals fortune

### M2: Polish
- [ ] Satisfying animations (collect, open)
- [ ] Haptic feedback
- [ ] Sound design
- [ ] Empty state handling

### M3: Content
- [ ] 100 fortune messages written
- [ ] Test area seeded with crates
- [ ] Basic analytics tracking

---

## Design Principles (MVP)

1. **Simple over clever** - No complex mechanics
2. **Satisfying feedback** - Every action should feel good
3. **Low friction** - Auto-collect, tap to open, done
4. **Mystery preserved** - Don't show fortune until opened
5. **Works offline-ish** - Graceful degradation

---

## Open Questions

1. **Collection radius** - 10m? 15m? 25m? Need to test.
2. **Radar range** - How far should users see crates?
3. **Crate density** - How many per square km?
4. **Respawn** - Do collected crates respawn? For all users or just that user?
5. **Anonymous vs auth** - Require sign-up or allow anonymous?

---

## The Test

**Question we're answering:** Will someone walk a few blocks to collect a digital crate, knowing the only reward is a fortune cookie message?

If **yes** → The core mechanic works. Layer on richer content.
If **no** → The discovery/collection loop needs work before adding complexity.

---

*This is the smallest thing we can build to learn if the core idea has legs.*
