Improve and refine the current VetVik design prototype based on the following product and UX corrections.

Do NOT redesign the project from scratch.
Preserve the current visual identity, design system, layout structure, and overall style.
Focus on improving UX logic, realism, navigation, and product behavior.

IMPORTANT:
The application represents a real veterinary clinic management system with multiple doctors, rooms, and simultaneous appointments.
The system must behave like a realistic SaaS product.

--------------------------------------------------
1. ADMIN CLINIC CALENDAR IMPROVEMENTS
--------------------------------------------------

The current clinic calendar is unrealistic because appointments are displayed one after another in a single linear flow.

Improve the clinic calendar to support:
- multiple simultaneous appointments
- multiple doctors working at the same time
- parallel appointment slots
- realistic clinic scheduling behavior

Redesign the Admin Clinic Calendar to behave like a professional medical scheduling system.

Requirements:
- show multiple appointment columns/lanes
- appointments can overlap in time
- support multiple doctors simultaneously
- allow grouping by doctor
- optionally visualize rooms/cabinets
- use color-coded appointment cards
- maintain clean readability
- avoid clutter

Calendar should support:
- Day view
- Week view
- Doctor filter
- Status filter

Appointment cards should include:
- pet name
- doctor name
- appointment type
- time
- status

The calendar should visually resemble a modern operational scheduling dashboard used in healthcare systems.

--------------------------------------------------
2. USER PROFILE ACCESS
--------------------------------------------------

Currently there is no clear access to the user profile/settings.

Add proper user profile access across all dashboard roles:
- Owner
- Doctor
- Admin

Requirements:
- clickable user avatar in top header
- profile dropdown menu
- profile/settings page
- account settings
- notification preferences
- logout action

Add a realistic “My Profile” page design including:
- avatar upload
- personal information
- contact details
- password change section
- role information
- notification settings

--------------------------------------------------
3. REMOVE DEMO-LIKE FEELING
--------------------------------------------------

The current prototype still feels partially like a demo application.

Improve the realism of the interface:
- reduce obvious placeholder/demo elements
- make data feel more production-like
- improve operational realism
- improve empty states
- improve loading states
- improve navigation logic

The application should feel like:
- a startup MVP
- an actual SaaS product
- a production veterinary clinic platform

NOT:
- a showcase template
- a UI kit demo
- a student mockup

--------------------------------------------------
4. FIX ADMIN NAVIGATION
--------------------------------------------------

Currently the Admin “Clients” and “Settings” sections contain navigation errors.

Fix all navigation issues:
- all sidebar items must work correctly
- all pages should exist
- all navigation transitions should be realistic
- no broken states
- maintain route consistency

Create proper pages for:
- Clients Management
- Settings

CLIENTS PAGE REQUIREMENTS:
- searchable clients table
- owner avatar
- pets count
- last appointment
- contact information
- quick actions

SETTINGS PAGE REQUIREMENTS:
- clinic information
- working hours
- appointment duration settings
- notification settings
- branding/logo settings
- system preferences

--------------------------------------------------
5. PET AVATAR / PHOTO UPLOAD
--------------------------------------------------

Improve pet management UX.

Add support for pet avatar/photo upload:
- add upload button
- drag-and-drop upload area
- preview uploaded image
- editable avatar
- default fallback pet avatar

Pet cards and pet profile pages should support:
- real pet photos
- avatar editing
- image preview states

Maintain clean and elegant UI.

--------------------------------------------------
6. UX POLISHING
--------------------------------------------------

Improve overall UX polish:
- smoother spacing consistency
- better hierarchy
- more realistic dashboard density
- improve cards alignment
- improve calendar readability
- improve table usability
- improve filters UX
- improve sidebar interaction states
- improve hover/focus states

Keep the design:
- modern
- minimal
- clean
- pet-friendly
- implementation realistic

--------------------------------------------------
7. TECHNICAL DESIGN CONSTRAINTS
--------------------------------------------------

The UI must remain realistic for implementation using:
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- React Router
- Recharts
- calendar libraries

Avoid:
- impossible layouts
- unrealistic interactions
- overly artistic UI
- heavy animations
- overcomplicated effects

--------------------------------------------------
8. FINAL GOAL
--------------------------------------------------

The final result should feel like:
- a real veterinary clinic SaaS product
- a polished startup MVP
- a production-ready dashboard system
- a realistic bachelor diploma project with strong UX quality

Preserve the existing VetVik identity while making the product more realistic, operational, scalable, and polished.