SkillSync Frontend
A React (Vite, TypeScript) frontend for a freelancing platform, built with Material-UI, Zustand, Context API, Axios, and react-router-dom.
Prerequisites

Node.js 18.x or later
npm 8.x or later
Backend running at http://localhost:3000

Installation

Clone the repository:
git clone <repository-url>
cd skillsync-frontend


Install dependencies:
npm install


Start the development server:
npm run dev


Open http://localhost:3001 in your browser.


Features

Home, Login, Register pages
Client Dashboard: Freelancer search, project management, bids, messages, files, milestones, invoices
Freelancer Dashboard: Project browsing, bidding, project details
Profile management with skills dropdown (freelancers only)
Dark/light theme toggle
Message polling (5 seconds)
File uploads/downloads, invoice PDF downloads

Directory Structure

src/api: API calls
src/components: Reusable UI components
src/context: Theme and snackbar contexts
src/pages: Page components
src/stores: Zustand stores
src/types: TypeScript interfaces

Backend APIs
Ensure the backend implements all APIs, including GET /files/:id and GET /invoices/:id/pdf.
