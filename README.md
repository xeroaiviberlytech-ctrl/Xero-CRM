# Xero CRM

A modern, premium CRM application built with Next.js 16, TypeScript, Tailwind CSS, and Supabase. Features a beautiful light silver glassmorphism design aesthetic.

## Features

- ✨ **Modern Design**: Light silver glassmorphism UI with premium aesthetics
- 📊 **Dashboard**: KPI cards, charts, and activity feed
- 👥 **Leads Management**: Table view with filters and detailed drawer
- 🔄 **Sales Pipeline**: Kanban board for deal management
- 📧 **Marketing**: Campaign management and tracking
- ✅ **Tasks**: Kanban-style task management
- 📈 **Analytics**: Data insights and reporting
- ⚙️ **Settings**: User profile and preferences

## Tech Stack

- **Framework**: Next.js 16 (App Router + SSR)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components with glassmorphism effects
- **Backend**: tRPC for type-safe APIs
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (via tRPC)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or Supabase account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd xero-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your:
   - Database URL (PostgreSQL connection string)
   - Supabase URL and anon key

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
xero-crm/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── images/                # Static assets (logos, etc.)
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Dashboard route group
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── leads/         # Leads page
│   │   │   ├── pipeline/      # Pipeline page
│   │   │   ├── marketing/     # Marketing page
│   │   │   ├── tasks/         # Tasks page
│   │   │   ├── analytics/     # Analytics page
│   │   │   ├── settings/      # Settings page
│   │   │   └── layout.tsx     # Dashboard layout
│   │   ├── (auth)/            # Auth route group
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Root page
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   └── ui/                # UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       └── table.tsx
│   └── lib/
│       ├── prisma/            # Prisma client
│       ├── supabase/          # Supabase client
│       ├── trpc/              # tRPC setup
│       └── utils.ts           # Utility functions
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Design System

### Glassmorphism Effects

The application uses a light silver glassmorphism design with the following CSS classes:

- `.glass` - Standard glass effect
- `.glass-strong` - Stronger glass effect
- `.glass-subtle` - Subtle glass effect
- `.glass-silver` - Premium silver glass effect (primary)

### Color Palette

- Background: Gradient from silver to blue-gray to subtle indigo
- Primary: Blue (#3b82f6)
- Text: Dark gray (#171717)
- Borders: White with opacity

## Database Schema

The Prisma schema includes models for:

- **User**: User accounts and authentication
- **Lead**: Lead management
- **Deal**: Sales pipeline deals
- **Campaign**: Marketing campaigns
- **Task**: Task management
- **Activity**: Activity tracking and timeline

## Authentication

Authentication is handled via Supabase Auth. To set up:

1. Create a Supabase project
2. Enable authentication providers in Supabase dashboard
3. Add your Supabase URL and anon key to `.env.local`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, email support@xerocrm.com or open an issue in the repository.
