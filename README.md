# T-06: Smart Hostel Management System

## Domain
**Web Development · IoT · Data Engineering**

## Problem Statement
University hostels manage room allotments, visitor logs, maintenance requests, and mess feedback through manual or fragmented systems. This leads to lost data, delayed responses, and poor student experience.

## Project Objectives
1. Digitize room allotment with preference-based assignment algorithm
2. Implement QR-based visitor entry and exit logging
3. Track maintenance requests with SLA monitoring
4. Collect and analyze mess menu feedback with trend reports
5. Manage student checkout/check-in for holidays
6. Provide warden dashboard with real-time occupancy

## Functional Requirements
- Student portal: profile, room info, maintenance request, mess rating
- Room allotment engine: preference (floor, room type, batch) + availability
- QR code visitor pass: generate, scan, expire after 8 hours
- Maintenance ticketing: category, priority, assignment, status tracking
- SLA breach alerts (maintenance unresolved > 48h)
- Mess feedback: daily rating per dish, weekly trend chart
- Holiday checkout management: approval workflow, return confirmation
- Warden dashboard: live occupancy map, maintenance queue, visitor log

## Non-Functional Requirements
| Attribute | Requirement |
| :--- | :--- |
| Performance | Dashboard refresh < 2s |
| Scalability | 2,000 student records |
| Security | Role-based access (student, warden, admin) |
| Reliability | Offline QR scan fallback |
| Usability | Mobile-responsive UI |

## Suggested Technical Stack
| Layer | Option |
| :--- | :--- |
| Frontend | React.js (Web) + PWA |
| Backend | Django / Node.js |
| Database | PostgreSQL |
| QR | qrcode library + jsQR (browser scanner) |
| Optional | MQTT for IoT door sensor integration |

## System Design Requirements
- **Architecture**: Monolithic-with-modules design suitable for team scale. Core modules are separated by domain (rooms, visitors, maintenance, mess). The QR service generates time-limited signed tokens embedded in QR codes. The allotment engine uses a greedy preference-matching algorithm. The warden dashboard aggregates data from all modules via a unified API. An async notification service handles SLA alerts and approvals.
- **Main Modules**: Auth & Roles, Room Allotment Engine, QR Visitor Service, Maintenance Tracker, Mess Feedback Collector, Holiday Manager, Notification Service, Warden Dashboard.
- **Data Flow**: Student requests pass → QR generated → Guard scans → Entry logged → Auto-expire after duration.

## Expected Deliverables
- [ ] Source code (all modules)
- [ ] Populated demo DB (100 rooms, 200 students)
- [ ] Warden dashboard demo
- [ ] QR scan demo video
- [ ] SLA breach alert test evidence
- [ ] Deployment guide

## Milestones & Timeline
| Week | Goal |
| :--- | :--- |
| 1 | DB schema design + auth system |
| 2 | Room allotment engine + student portal |
| 3 | QR visitor system |
| 4 | Maintenance tracker + SLA alerts |
| 5 | Mess feedback + holiday management |
| 6 | Warden dashboard, testing, documentation |

## Evaluation Criteria
| Criterion | Marks |
| :--- | :--- |
| Feature Completeness | 35 |
| UX Quality (mobile-responsive) | 20 |
| Data Integrity & Role Security | 15 |
| Code Quality | 15 |
| Documentation & Presentation | 15 |

## Bonus Features
- WhatsApp bot for maintenance requests
- Occupancy heatmap by block/floor
- Predictive mess demand forecasting
- IoT door lock integration prototype
