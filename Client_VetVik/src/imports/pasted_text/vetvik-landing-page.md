Create a modern, clean, pet-friendly SaaS web application design for a veterinary clinic management system called “VetVik”.

VetVik is a web platform for automating veterinary clinic workflows. The system has three main user roles: Pet Owner, Doctor, and Admin. The design should look like a polished production-ready dashboard product, not like a simple student CRUD application.

Overall visual style:
- Modern healthcare SaaS dashboard
- Clean, minimal, friendly, calm
- Pet-friendly but not childish
- Soft rounded cards, clear spacing, strong visual hierarchy
- Light theme first
- Responsive desktop-first design
- Professional enough for a clinic, warm enough for pet owners
- Avoid overly complex visuals, glassmorphism, heavy gradients, or unrealistic decorative elements
- The UI should be easy to implement later in React + TypeScript using TailwindCSS and shadcn/ui components

Brand direction:
- Product name: VetVik
- Brand personality: trustworthy, caring, modern, organized, calm
- Use subtle pet-related visual details such as paw icons, pet avatars, soft illustrations, or small animal-related accents, but keep the interface professional

Color palette:
- Primary color: teal / mint, similar to #14B8A6 and #0F766E
- Secondary color: soft blue, similar to #3B82F6
- Accent color: warm orange, similar to #F59E0B
- Background: #F8FAFC
- Surface cards: #FFFFFF
- Primary text: #0F172A
- Secondary text: #475569
- Border color: #E2E8F0
- Success: green
- Warning: amber
- Error: red
- Info: blue

Typography:
- Use Inter or a similar modern sans-serif font
- Clear hierarchy:
  - Large page titles
  - Medium section headings
  - Readable body text
  - Small secondary labels
- Avoid tiny unreadable text

Layout system:
Create a consistent dashboard layout with:
- Left sidebar navigation
- Top header
- Main content area
- Optional right-side context panel on some pages
- Cards, tables, forms, calendars, timelines, badges, empty states, and filters

Sidebar requirements:
- Clean vertical sidebar with logo at the top
- Use icons for navigation
- Active item must be clearly highlighted
- Sidebar should feel modern and simple
- Include different navigation items depending on role

Public pages:
1. Landing Page
2. Login Page
3. Register Page

Owner pages:
1. Owner Dashboard
2. My Pets
3. Pet Profile
4. Appointments
5. Medical History

Doctor pages:
1. Doctor Dashboard
2. Doctor Schedule
3. Doctor Appointments
4. Medical Notes / Appointment Details

Admin pages:
1. Admin Dashboard
2. Clinic Calendar
3. Appointment Management
4. Doctor Management

Design all pages as high-fidelity UI screens.

PUBLIC PAGE 1: Landing Page

Create a modern landing page for VetVik.

Sections:
- Header with logo, navigation links, Login button, Register / Get Started button
- Hero section with headline:
  “Smart veterinary clinic management for pets, doctors, and clinics”
- Subheadline:
  “VetVik helps veterinary clinics manage appointments, pets, medical history, doctor schedules, and daily operations in one clean dashboard.”
- Primary CTA: “Book a visit”
- Secondary CTA: “View demo”
- Hero visual: dashboard preview card with pet appointment cards and clinic calendar
- Features section with 4 feature cards:
  1. Appointment scheduling
  2. Pet profiles
  3. Medical history
  4. Doctor schedule management
- Role-based section:
  - For pet owners
  - For doctors
  - For clinic administrators
- Simple “How it works” section:
  1. Register
  2. Add pet
  3. Book appointment
  4. Track medical history
- Final CTA section
- Footer with product links

Landing page should be warm, clean, and professional. Use soft pet-friendly illustrations or abstract veterinary shapes.

PUBLIC PAGE 2: Login Page

Create a clean login screen:
- Centered auth card
- VetVik logo
- Title: “Welcome back”
- Email input
- Password input
- Remember me checkbox
- Forgot password link
- Primary button: “Sign in”
- Secondary link: “Create an account”
- Optional right-side illustration with pet owner and veterinarian
- Validation states should be visually supported

PUBLIC PAGE 3: Register Page

Create a registration screen:
- Centered or split layout
- Title: “Create your VetVik account”
- Fields:
  - Full name
  - Email
  - Password
  - Confirm password
  - Role selector: Pet Owner / Doctor / Admin
- Primary button: “Create account”
- Link to login
- Keep it clean and not overloaded

OWNER DASHBOARD

Create a dashboard for a pet owner.

Purpose:
The owner should quickly understand upcoming appointments, pet health updates, and recent medical activity.

Layout:
- Sidebar navigation:
  - Dashboard
  - My Pets
  - Appointments
  - Medical History
  - Profile / Settings
- Top header:
  - Page title: “Dashboard”
  - Search input
  - Notification icon
  - User avatar
- Main content:
  - Welcome card: “Good morning, Anna”
  - Short supportive text: “Here is what is happening with your pets today.”
  - Primary CTA: “Book appointment”
- Stats cards:
  1. My pets
  2. Upcoming appointments
  3. Completed visits
  4. Active treatments
- Upcoming appointment card:
  - Pet avatar
  - Pet name
  - Doctor name
  - Date and time
  - Visit reason
  - Status badge
  - Button: “View details”
- My pets preview:
  - Pet cards with pet photo/avatar, name, species, breed, age
  - Health status badge
- Recent medical history:
  - Timeline list with recent visits, diagnoses, prescriptions, vaccinations
- Right-side panel:
  - Next visit reminder
  - Quick actions:
    - Add pet
    - Book appointment
    - View medical history

OWNER PAGE: My Pets

Create a page where pet owners manage their pets.

Layout:
- Page title: “My Pets”
- Button: “Add pet”
- Search and filter by species
- Grid of pet cards
Each pet card should include:
- Pet avatar/photo
- Pet name
- Species
- Breed
- Age
- Gender
- Last visit date
- Health status badge
- Button: “Open profile”
- More actions menu

Also include an empty state design:
- Friendly pet illustration
- Text: “No pets added yet”
- Button: “Add your first pet”

OWNER PAGE: Pet Profile

Create a detailed pet profile page.

Layout:
- Header area with pet avatar, pet name, species, breed, age, gender
- Health status badge
- Button: “Book appointment”
- Button: “Edit pet”
- Tabs:
  1. Overview
  2. Appointments
  3. Medical History
  4. Vaccinations
- Overview section:
  - Basic information card
  - Owner information card
  - Last visit card
  - Upcoming appointment card
- Medical timeline:
  - Date
  - Doctor
  - Visit reason
  - Diagnosis
  - Treatment notes
- Vaccination card:
  - Vaccine name
  - Date
  - Next due date
  - Status badge

OWNER PAGE: Appointments

Create an appointments management page for pet owners.

Layout:
- Page title: “Appointments”
- Primary button: “Book appointment”
- Filters:
  - Status
  - Pet
  - Date
- Appointments list with cards or table
Appointment item should include:
- Pet name
- Doctor
- Date and time
- Service type
- Status: Scheduled / Completed / Cancelled
- Actions: View, Reschedule, Cancel
- Include a simple appointment booking modal or side panel:
  - Select pet
  - Select service
  - Select doctor
  - Select date
  - Select time slot
  - Add notes
  - Confirm appointment

OWNER PAGE: Medical History

Create a medical history page.

Layout:
- Page title: “Medical History”
- Filter by pet, date, doctor
- Timeline-based layout
- Each medical record card:
  - Pet name
  - Date
  - Doctor
  - Reason for visit
  - Diagnosis
  - Treatment
  - Prescription if available
  - Button: “View details”
- Use clean medical-style cards, not too dense

DOCTOR DASHBOARD

Create a dashboard for a veterinarian doctor.

Purpose:
Doctor needs quick access to today’s schedule, upcoming appointments, and patient information.

Layout:
- Sidebar navigation:
  - Dashboard
  - Schedule
  - Appointments
  - Medical Notes
  - Profile
- Top header with search, notifications, doctor avatar
- Welcome card:
  “Good morning, Dr. Smith”
- Stats cards:
  1. Today’s appointments
  2. Completed visits
  3. Pending notes
  4. Patients today
- Today’s schedule:
  - Timeline list of appointments
  - Time
  - Pet name
  - Owner name
  - Visit reason
  - Status
  - Button: “Open”
- Next appointment large focus card
- Pending medical notes card
- Small weekly workload chart

DOCTOR PAGE: Schedule

Create a doctor schedule page.

Layout:
- Page title: “Schedule”
- Calendar view with day/week toggle
- Left area: calendar or timeline
- Right panel: selected appointment details
- Appointment blocks should show:
  - Time
  - Pet name
  - Visit type
  - Status
- Include filters:
  - Today
  - Week
  - Status
- Use a clean calendar design that can be implemented with React calendar libraries

DOCTOR PAGE: Appointments

Create a doctor appointments page.

Layout:
- Table or structured list
Columns:
- Time
- Pet
- Owner
- Reason
- Status
- Actions
Statuses:
- Scheduled
- In progress
- Completed
- Cancelled
Actions:
- Start visit
- Add note
- View pet profile

Include search and filters.

DOCTOR PAGE: Medical Notes / Appointment Details

Create a detailed appointment page for doctor.

Layout:
- Header:
  - Pet name
  - Owner name
  - Appointment date/time
  - Status badge
- Main two-column layout:
  Left:
  - Pet information
  - Previous medical history
  - Vaccination info
  Right:
  - Medical note form
Fields:
- Symptoms
- Diagnosis
- Treatment
- Prescription
- Recommendations
- Follow-up date
Buttons:
- Save draft
- Complete visit

The form should be clean, professional, and easy to fill quickly.

ADMIN DASHBOARD

Create an admin dashboard for clinic operations.

Purpose:
Admin manages clinic appointments, doctors, workload, and general operational overview.

Layout:
- Sidebar navigation:
  - Dashboard
  - Clinic Calendar
  - Appointments
  - Doctors
  - Clients
  - Settings
- Top header with search, notifications, admin avatar
- Stats cards:
  1. Appointments today
  2. Active doctors
  3. Registered pets
  4. Completed visits
- Clinic workload chart
- Today’s appointments table
- Doctor availability section
- Recent activity feed
- Quick actions:
  - Create appointment
  - Add doctor
  - Manage schedule

ADMIN PAGE: Clinic Calendar

Create a clinic-wide calendar page.

Layout:
- Page title: “Clinic Calendar”
- Calendar with day/week/month switcher
- Filter by doctor
- Filter by appointment status
- Appointment blocks color-coded by status
- Right-side details panel when appointment is selected
- Button: “Create appointment”
- Keep calendar visually clean and not too colorful

ADMIN PAGE: Appointment Management

Create appointment management page.

Layout:
- Page title: “Appointment Management”
- Search bar
- Filters:
  - Doctor
  - Status
  - Date
  - Service type
- Data table with columns:
  - Pet
  - Owner
  - Doctor
  - Date
  - Time
  - Service
  - Status
  - Actions
- Row actions:
  - View
  - Edit
  - Cancel
  - Mark completed
- Include status badges with clear colors

ADMIN PAGE: Doctor Management

Create doctor management page.

Layout:
- Page title: “Doctor Management”
- Button: “Add doctor”
- Doctor cards or table
Each doctor item:
- Doctor avatar
- Full name
- Specialization
- Email
- Phone
- Working status
- Today’s appointments count
- Button: “View schedule”
- Button: “Edit”
- Include availability status:
  - Available
  - Busy
  - Off duty

COMPONENT SYSTEM

Create reusable components and make the design visually consistent:
- Sidebar
- Top header
- Page header
- Stat cards
- Pet cards
- Appointment cards
- Doctor cards
- Status badges
- Search input
- Filters
- Data table
- Calendar blocks
- Timeline
- Empty states
- Form fields
- Buttons
- Modal or side panel
- Notification icon
- Avatar components

Button styles:
- Primary button: teal background, white text
- Secondary button: white background, border
- Destructive button: subtle red
- Ghost button for table actions

Status badge examples:
- Scheduled: blue
- Completed: green
- Cancelled: red
- In progress: amber
- Available: green
- Busy: amber
- Off duty: gray

UX requirements:
- Prioritize clarity over decoration
- Use enough whitespace
- Make pages feel connected as one product
- Avoid too many different layouts
- Make the Owner interface warmer and more card-based
- Make the Doctor interface more schedule-focused and efficient
- Make the Admin interface more data/table/calendar-focused
- Ensure all screens look like they belong to the same design system

Responsive behavior:
- Desktop screens should be fully designed
- Also show at least one mobile-friendly example for the Owner Dashboard or My Pets page
- On mobile:
  - Sidebar becomes bottom navigation or hamburger menu
  - Cards stack vertically
  - Tables become cards
  - Calendar becomes agenda list

Data examples:
Use realistic demo data:
- Pet names: Luna, Max, Bella, Rocky
- Species: Dog, Cat, Rabbit
- Doctors: Dr. Olivia Carter, Dr. Mark Wilson, Dr. Emily Brown
- Services: General checkup, Vaccination, Dental care, Dermatology consultation, Surgery follow-up
- Appointment statuses: Scheduled, Completed, Cancelled, In progress

Important:
The final design should be visually polished, realistic, and suitable for a bachelor diploma project. It should demonstrate a complete product concept, role-based dashboards, appointment management, pet profiles, medical history, clinic calendar, and doctor schedule. Keep the UI beautiful but feasible to implement in React + TypeScript.