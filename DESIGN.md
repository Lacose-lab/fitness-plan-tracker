# Fitness Plan Tracker — Product + UX Direction (Liquid Glass)

## North Star
A **mobile-first “Today” dashboard** that makes it effortless to:
1) complete today’s planned workout (checkbox-driven)
2) hit daily targets (steps / calories / protein / weigh-in)
3) see trend momentum (weekly summaries)

No accounts, no bloat. Offline-first.

## Chosen best-in-class patterns
- **Strong / Hevy**: in-workout interaction model (checklist → fast completion)
- **MyFitnessPal**: fast, repetitive metric logging UX (bottom sheet numeric entry)
- **Apple Fitness / Google Fit**: “Today” as the home scoreboard

## Core objects
- DayLog (per date)
- PlanDay (weekly plan template)
- Settings (targets)

## IA (tabs)
- Today
- Log
- Plan
- Progress
- Settings

## Liquid Glass visual system
- Frosted surfaces (backdrop blur), subtle border highlights
- Gentle depth and glow for primary actions
- Rounded corners, soft gradients, minimal dividers

## P0 Features (MVP)
- Daily checklist (steps/calories/protein/weight)
- Workout checklist per day
- Quick log bottom sheet (weight/steps/calories/protein)
- Targets editable in Settings
- Progress chart (weight) + recent logs
- Backup/restore JSON

## P1 Features (next)
- Log history view (7d list + edit)
- Steps/protein/calories charts (vs target)
- Workout timer (optional) + rest timer
- Routine builder (custom exercises)

## Non-goals (for now)
- Full food database/barcode scanning
- Wearable auto-sync (PWA limitations)
- Social feed
