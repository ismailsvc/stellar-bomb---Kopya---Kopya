# 💣 Stellar Bomb - Web3 Code Challenge Game

> A decentralized, AI-powered code-solving game built on the Stellar blockchain. Challenge yourself, solve programming puzzles in 30 seconds, and compete globally on the leaderboard.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Stellar](https://img.shields.io/badge/Stellar-Blockchain-9f10ff?logo=stellar)

## ✨ Overview

Stellar Bomb is a revolutionary code-solving game that combines competitive gaming with Web3 technology. Players connect their Stellar wallet, solve dynamically generated programming puzzles, and earn points tracked on the blockchain. Each puzzle is AI-generated and validated using OpenAI's GPT models, ensuring unique challenges every playthrough.

## 🎮 Key Features

### Gameplay
- **30-Second Challenges**: High-speed puzzle-solving with real-time countdown
- **AI-Generated Puzzles**: Unique code challenges created by OpenAI API
- **Dynamic Difficulty**: Easy (1pt), Medium (2pt), and Hard (3pt) levels
- **Multiple Languages**: JavaScript and C++ programming puzzles
- **Visual Feedback**: Dramatic explosion animation when time expires
- **Instant Scoring**: Real-time point calculation based on difficulty

### Web3 Integration
- **Freighter Wallet**: Seamless Stellar wallet connection
- **Blockchain Verification**: Player credentials stored on Supabase
- **Decentralized Records**: Game scores immortalized in database
- **Profile Customization**: Avatar, username, and custom avatar frames
- **Multi-Account Support**: Switch between multiple Stellar wallets

### Leaderboards
- **Global Rankings**: Worldwide player competition
- **Local Cache**: Offline gameplay with automatic sync
- **Avatar Display**: Visual player identification with custom frames
- **Real-Time Updates**: Live score tracking and position changes
- **Difficulty Filtering**: Sort by easy, medium, or hard puzzles

### Monetization
- **Sponsorship Placements**: Targeted ad system with 5 placement types
- **Analytics Dashboard**: Impression, click, and CTR tracking
- **Admin Panel**: Full advertisement management and control
- **Smart Rotation**: Auto-rotating ads based on priority levels
- **Flexible Campaigns**: Start/end dates, priority, and placement control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Freighter Wallet Browser Extension
- Supabase account (free tier available)
- OpenAI API key (optional, for AI features)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/stellar-bomb.git
cd stellar-bomb

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your API keys
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# VITE_OPENAI_API_KEY=
# VITE_GITHUB_TOKEN=

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

## ⚙️ Configuration

### Environment Variables

Create `.env.local` with the following variables:

```env
# Supabase (Database)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# OpenAI (AI Puzzle Generation)
VITE_OPENAI_API_KEY=sk-proj-xxxxx...

# GitHub (Optional, for leaderboard integration)
VITE_GITHUB_TOKEN=ghp_xxxxx...
```

### Setting Up Supabase

1. **Create Account**: Visit https://supabase.com and sign up
2. **Create Project**: Create a new project (free tier available)
3. **Run SQL Schema**: 
   - Navigate to SQL Editor
   - Open `supabase_setup_fixed.sql`
   - Copy and execute all SQL
4. **Insert Sample Data**:
   - Run `SUPABASE_INSERT_ADS_FIXED.sql` for sample ads
5. **Get Credentials**:
   - Go to Settings > API
   - Copy Project URL and Anon Key
   - Paste into `.env.local`

### Database Structure

```
user_profiles
├── wallet_address (PK)
├── username
├── avatar
├── photo_url
├── bio
├── level
├── selected_frame
└── timestamps

leaderboard
├── id (UUID)
├── wallet_address (FK)
├── username
├── puzzle_title
├── difficulty
├── remaining_time
├── points
├── avatar
├── selected_frame
└── created_at

advertisements
├── id (PK, TEXT)
├── title
├── description
├── sponsor_name
├── sponsor_logo
├── placement_ids
├── start_date / end_date
├── priority (high/medium/low)
├── active (boolean)
├── impressions
├── clicks
└── timestamps

ad_analytics
├── ad_id (FK)
├── impressions
├── clicks
├── ctr
└── timestamp
```

## 🎮 How to Play

### Step 1: Connect Wallet
- Click "Connect Wallet" button
- Authorize Freighter wallet connection
- Your Stellar address becomes your player ID

### Step 2: Create/Update Profile
- Enter username
- Select avatar emoji
- Choose avatar frame (visual decoration)
- Profile saved to blockchain

### Step 3: Start Game
- Click "Start Game" button
- Game randomly selects a puzzle
- 30-second countdown begins

### Step 4: Solve Puzzle
- Read the buggy code carefully
- Use Monaco Editor to fix the code
- Code must compile and pass logic checks
- Hints available for some puzzles

### Step 5: Submit Solution
- Click "Submit" button
- AI validates your code instantly
- Receive immediate feedback

### Step 6: View Results
- See points earned (1-3 based on difficulty)
- Option to play again or view leaderboard
- Score automatically saved globally

## 📊 Game Statistics

| Metric | Value |
|--------|-------|
| Total Puzzles | 19 |
| JavaScript Puzzles | 8 |
| C++ Puzzles | 11 |
| Difficulty Levels | 3 (Easy, Medium, Hard) |
| Time per Puzzle | 30 seconds |
| Max Points per Game | 40 |
| Easy Points | 1 |
| Medium Points | 2 |
| Hard Points | 3 |

## 🤖 AI Features

### Puzzle Generation
- OpenAI GPT-3.5-turbo creates unique puzzles
- Each puzzle includes: code, bug description, hints
- Difficulty adjusted based on player performance
- Topics: Arrays, Strings, Loops, Algorithms, Data Structures

### Code Validation
- AI analyzes submitted code for correctness
- Checks: Syntax, logic, edge cases, performance
- Instant feedback with error explanations
- Prevents hardcoded solutions

### Analytics
- Tracks player performance metrics
- Analyzes puzzle difficulty ratings
- Provides player insights and stats
- Optional GitHub integration for advanced stats

## 👨‍💼 Admin Panel

### Access
- Connect with admin Freighter wallet
- ⚙️ Admin button appears in menu
- Full advertisement management interface

### Features
- **📢 Ads Tab**: View, toggle, and delete advertisements
- **📊 Analytics Tab**: View impressions, clicks, CTR statistics
- **👥 Users Tab**: Placeholder for future user management

### Admin Functions
- Enable/disable advertisements
- Delete advertisements (with confirmation)
- View real-time analytics (impressions, clicks, CTR)
- Monitor active campaign count
- See total engagement metrics

### Sample Admin Wallet
```
GDSPUJG45447VF2YSW6SIEYHZVPBCVQVBXO2BS3ESA5MHPCXUJHBAFDA
```

## 💰 Monetization Strategy

### Sponsorship System (Feature #4)
1. **Ad Placements**: 5 strategic locations throughout the app
   - Header banner
   - Sidebar spotlight
   - Leaderboard banner
   - Game completion modal
   - Event notification

2. **Priority Levels**: Control ad visibility
   - High: Featured prominently
   - Medium: Regular rotation
   - Low: Occasional display

3. **Analytics**: Track campaign performance
   - Impressions: Each ad load
   - Clicks: CTA button interactions
   - CTR: Click-through rate percentage
   - Real-time metrics dashboard

4. **Campaign Management**: Admin controls
   - Enable/disable ads
   - Delete underperforming campaigns
   - Schedule campaigns by date
   - View performance metrics

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript + Vite | UI Framework |
| **Editor** | Monaco Editor | Code editing |
| **Blockchain** | Stellar SDK + Freighter | Wallet integration |
| **AI** | OpenAI API (GPT-3.5) | Puzzle generation & validation |
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **Styling** | CSS3 + Animations | UI/UX design |
| **Build Tool** | Vite | Fast build process |

## 📁 Project Structure

```
src/
├── components/
│   ├── BombModel.tsx              # Bomb 3D model
│   ├── AdBanner.tsx               # Advertisement display
│   ├── AdminPanel.tsx             # Admin management UI
│   └── multiplayer/               # (Deprecated)
├── config/
│   ├── ads.config.ts              # Ad placements & config
│   └── admin.config.ts            # Admin settings
├── handlers/
│   └── gameHandlers.ts            # Game logic
├── lib/
│   ├── supabase.ts                # Database functions
│   ├── aiGenerator.ts             # AI puzzle generation
│   ├── profileGithub.ts           # GitHub integration
│   └── sorobanSession.ts          # Wallet session
├── services/
│   └── adManager.ts               # Ad management logic
├── types/
│   └── index.ts                   # TypeScript types
├── utils/
│   └── index.ts                   # Utility functions
├── App.tsx                        # Main application
├── main.tsx                       # Entry point
└── index.css                      # Global styles

docs/
├── README.md                      # This file (English)
├── README_TR.md                   # Turkish version
├── ADMIN_PANEL_GUIDE.md          # Admin usage guide
├── SUPABASE_SETUP_GUIDE.md       # Database setup
└── supabase_setup_fixed.sql      # Database schema
```

## 📚 Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Production
npm run build            # Create optimized build
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint checks
npm run lint -- --fix    # Auto-fix linting issues

# Type Checking
npm run type-check       # TypeScript compilation check
```

## 🔒 Security & Privacy

- **Wallet-Based Auth**: No passwords, only Stellar wallet required
- **Row Level Security**: Supabase RLS policies restrict data access
- **Public Read**: Leaderboard data visible to all players
- **Private Write**: Only users can write their own scores
- **Admin Access**: Controlled by wallet address verification

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required**: Freighter Wallet extension

## 📖 Documentation

Detailed guides and setup instructions:

- **[Admin Panel Guide](./ADMIN_PANEL_GUIDE.md)** - Full admin feature documentation
- **[Supabase Setup](./SUPABASE_SETUP_GUIDE.md)** - Database configuration
- **[SQL Schema](./supabase_setup_fixed.sql)** - Complete database structure
- **[Ad System Insert](./SUPABASE_INSERT_ADS_FIXED.sql)** - Sample advertisements

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Connect GitHub repository
# Select "Stellar Bomb" project
# Vercel automatically builds and deploys
# Add environment variables in Vercel dashboard
```

### Manual Deployment
```bash
npm run build
# Deploy 'dist' folder to your hosting provider
```

## 🐛 Troubleshooting

### Wallet Not Connecting
- Install Freighter extension
- Ensure you're on Stellar testnet
- Check browser console for errors

### Supabase Connection Failed
- Verify `.env.local` has correct credentials
- Check Supabase project is running
- Verify network connectivity

### AI Puzzles Not Generating
- Verify OpenAI API key is valid
- Check API quota hasn't been exceeded
- Monitor OpenAI dashboard for errors

### Admin Panel Not Showing
- Ensure wallet address matches admin wallet
- Check browser console: `isAdmin()` should return true
- Verify Freighter is connected

## 📊 Performance Metrics

- **First Paint**: < 1s
- **Bundle Size**: ~450KB (gzipped)
- **Time to Interactive**: < 2s
- **Lighthouse Score**: 85+

## 🎯 Roadmap

- [ ] Multiplayer competitive mode
- [ ] Blockchain rewards (XLM tokens)
- [ ] Advanced AI with GPT-4
- [ ] Mobile app version
- [ ] Social features (teams, challenges)
- [ ] Live streaming integration
- [ ] Tournament system

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support & Contact

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions in GitHub Discussions
- **Email**: support@stellar-bomb.app
- **Discord**: Join our community server

## 🙏 Acknowledgments

- Stellar Development Foundation for blockchain infrastructure
- OpenAI for AI models and API
- Freighter Wallet team for wallet integration
- Supabase for database solutions
- React community for amazing tools

---

**Made with 💣 and ❤️ by the Stellar Bomb Team**

*Last Updated: November 30, 2025*
