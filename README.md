# 🛒 Riftory - Dark Marketplace App

A premium React Native marketplace app with a dark Stranger Things-inspired theme, featuring a secret "Upside Down" section for experimental products.

## ✨ Features

- **Dark Premium UI** - Stranger Things inspired theme with neon accents
- **Product Listings** - Buy and sell products with image galleries
- **For You Feed** - TikTok-style vertical reels of products
- **Favorites** - Save products you love
- **Seller Profiles** - UPI/QR payment integration
- **Secret Upside Down** - Hidden section accessed by triple-overscroll (creepy purple theme!)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/riftory.git
   cd riftory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your API URL (optional for local dev)

5. Start the app:
   ```bash
   npx expo start
   ```

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your credentials:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `CLOUDINARY_*` - Your Cloudinary credentials

5. Start the server:
   ```bash
   npm start
   ```

## 📱 Running the App

- **Expo Go**: Scan QR code with Expo Go app
- **Android Emulator**: Press `a` in terminal
- **iOS Simulator**: Press `i` in terminal (Mac only)
- **Build APK**: `npx eas-cli build --platform android --profile preview`

## 🔒 Security Notes

- **Never commit `.env` files** - They contain sensitive credentials
- `.env.example` files show required variables without actual values
- All secrets should be stored in environment variables
- Backend `.env` contains database and cloud storage credentials

## 🏗️ Project Structure

```
riftory/
├── app/                    # Expo Router pages
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/            # Screen components
│   ├── services/           # API and storage services
│   ├── context/            # React contexts
│   └── types/              # TypeScript types
├── assets/                 # Images and fonts
├── backend/                # Node.js Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   └── config/             # Database config
└── app.config.js           # Expo configuration
```

## 🎨 Theme

The app uses a dark theme with:
- Primary background: `#0d0d0d`
- Card background: `#1a1a2e`
- Accent color: `#e94560`
- Neon glow effects

Upside Down mode features creepy purple tones:
- Background: `#0a0612`
- Accent: `#9b59b6`

## 📄 License

MIT License - feel free to use for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
