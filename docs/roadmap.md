# Project Roadmap

This document outlines the development phases, active releases, and upcoming milestones for the Drivly MVP.

## Phase 1: Core Sharing (Completed)
* Register & login users with gated residential society grouping.
* Switch between Renter, Owner, and Dual membership profile configurations.
* Display society-isolated vehicle feeds with dynamic SVG silhouettes.
* Block non-lister profiles (`RENTER`) from uploading vehicles.
* Automate demo login via seeded accounts + real password login (no OTP-bypass endpoint) and database seeding for developer review.

## Phase 2: Pre-Trip Safety Inspections (Completed)
* Design lock-out pre-trip verification overlay (`InspectionModal`).
* Enforce starting odometer registration and exterior inspection dent/scratch checks.
* Prevent start-trip state progression until checklist is approved.

## Phase 3: Payments & Penalties (Next Up)
* Integrate a sandbox payment provider interface.
* Implement a security deposit hold-and-release workflow.
* Create a database model for tracking deposits, refunds, and transaction references.
* Design a traffic violation (challan) logger allowing owners to submit penal actions.
* Automate challan notifications and deduct fines from held deposits.

## Phase 4: Feedback Loops & Safety Reviews (Future)
* Build feedback routes restricted to completed bookings.
* Prevent ratings spam (gating at exactly one review per booking).
* Calculate real-time reputation score indicators for owners and renters.

## Phase 5: Notifications & Logging (Future)
* Set up in-app notification alerts for booking states (Approve/Reject requests).
* Integrate mock email templates for booking approvals.
* Transition debug statements to structured system logging.
