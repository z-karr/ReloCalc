# ReloCalc - Relocation Calculator App

A cross-platform relocation calculator that helps you make smarter moving decisions by combining salary calculations, cost of living comparisons, moving expense estimates, and personalized city recommendations.

## 🚀 Features

### 1. **Salary Calculator**
- Calculate take-home pay with accurate federal tax brackets (2024)
- State and local tax calculations
- FICA (Social Security + Medicare) deductions
- Cost-of-living adjusted salary comparisons
- Equivalent salary calculations between cities

### 2. **Moving Cost Estimator**
- Distance-based cost calculations
- Multiple moving methods: DIY, Hybrid (container), Full-service
- Home size considerations
- Vehicle shipping estimates
- Pet transport costs
- Temporary housing and deposit calculations
- Comprehensive expense breakdown

### 3. **City Recommendations**
- AI-powered city matching based on preferences
- Customizable priorities: cost, safety, transit, outdoors, entertainment, healthcare, education
- Match scores for 20+ major US cities
- Highlights and considerations for each city
- Equivalent salary needed in each location

### 4. **City Data Includes**
- Cost of Living Index (100 = national average)
- Median rent and home prices
- State and local tax rates
- Walk scores and transit scores
- Crime indexes
- Job growth rates
- Healthcare, education, and entertainment indexes

## 📱 Platform Support

Built with **React Native + Expo** for deployment to:
- ✅ iOS App Store
- ✅ Google Play Store
- ✅ Web browsers (PWA)
- ✅ Desktop via web

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **Styling**: Custom theme system with StyleSheet
- **Icons**: Expo Vector Icons (Ionicons)

## 📦 Project Structure

```
relocate-calculator/
├── App.tsx                    # Main app with navigation
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── CityPicker.tsx
│   │   └── index.ts
│   ├── screens/               # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── SalaryCalculatorScreen.tsx
│   │   ├── MovingEstimatorScreen.tsx
│   │   ├── RecommendationsScreen.tsx
│   │   └── index.ts
│   ├── data/                  # City database
│   │   └── cities.ts
│   ├── utils/                 # Business logic
│   │   ├── taxCalculator.ts
│   │   ├── movingCalculator.ts
│   │   └── recommendations.ts
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts
│   └── theme/                 # Design system
│       └── index.ts
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

```bash
# Navigate to the project
cd relocate-calculator

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Different Platforms

```bash
# Web
npm run web

# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android
```

## 📲 Building for App Stores

### Using EAS Build (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure the build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### App Store Requirements

**iOS (App Store)**:
- Apple Developer Account ($99/year)
- App Store Connect setup
- Required assets: App icon (1024x1024), screenshots

**Android (Google Play)**:
- Google Play Developer Account ($25 one-time)
- Required assets: App icon, feature graphic, screenshots

## 🎨 Design System

The app uses a custom theme with:
- **Primary**: Deep midnight blue (#1E3A5F)
- **Accent**: Warm coral (#E8735A)
- **Secondary**: Soft teal (#4ECDC4)
- Consistent spacing, typography, and shadow system

## 📊 Data Sources

- **Tax Brackets**: 2024 Federal tax brackets (single filer)
- **Cost of Living**: Based on C2ER index methodology
- **City Metrics**: BLS and Census data
- **Walk/Transit Scores**: Industry-standard methodologies

## 🔜 Future Enhancements

Phase 2 features to consider:
- [ ] Claude AI integration for conversational guidance
- [ ] Image upload for expense scanning (receipts, inventory)
- [ ] User accounts and saved scenarios
- [ ] Real-time API data integration (Numbeo, etc.)
- [ ] Advanced visualizations and charts
- [ ] Community features (user reviews, cost submissions)

## 📄 License

MIT License - feel free to use and modify for your projects.

---

Built with ❤️ using React Native and Expo
