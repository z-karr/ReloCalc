# ReloCalc - Global Relocation Calculator App

A cross-platform relocation calculator that helps you make smarter moving decisions worldwide. Compare **332 cities across 40 countries** with accurate salary calculations, cost of living comparisons, moving expense estimates, and personalized city recommendations.

**Latest Update (Feb 2026)**: Added 146 new US cities, enhanced recommendation engine with exponential priority weighting, contextual country filtering, and improved city highlights.

## 🚀 Features

### 1. **Salary Calculator**
- Calculate take-home pay with accurate tax systems (2026 data)
- **40 Countries Supported** with country-specific tax calculations
- US: Federal + State tax + FICA
- International: Progressive national, flat tax, and VAT-based systems
- **27 Currencies** with accurate exchange rates
- Cost-of-living adjusted salary comparisons (NYC = 100 baseline)
- Equivalent salary calculations between any cities worldwide
- Effective tax rate display for both current and target cities

### 2. **Moving Cost Estimator**
- Distance-based cost calculations
- **Three Move Types**: Domestic (within country), Intra-Regional (e.g., European truck), Intercontinental
- Multiple moving methods: DIY, Hybrid (container), Full-service, Professional Truck Movers
- **NEW: Employer Relocation Assistance** - Adjustable slider (0-100%) to calculate out-of-pocket costs
- Home size considerations
- Vehicle shipping estimates
- Pet transport costs
- Temporary housing and deposit calculations
- Comprehensive expense breakdown with real-time cost updates

### 3. **City Recommendations** 🆕 Enhanced!
- AI-powered city matching based on preferences
- **Exponential Priority Weighting** - "Very Important" priorities now have 81x more impact than "Important" (5)
- Customizable priorities: cost, safety, transit, outdoors, entertainment, healthcare, education
- **Contextual Country Filtering** - Select region first, then drill down to specific countries
- Regional Filtering - Filter by 7 regions (North America, Europe, Asia Pacific, Latin America, Middle East, Africa, Oceania)
- Multi-region selection for targeted searches
- **Show More Button** - Load 10 additional cities at a time (up to 50 total)
- Match scores for **332 cities across 40 countries** (166 US + 166 international)
- Smart highlights system with granular tiers (e.g., "Great" vs "Exceptional" outdoor recreation)
- Context-aware highlights (no obvious facts like "English widely spoken" for US cities)
- Tax information in recommendations (low/high tax warnings)
- Considerations for each city (warnings about potential drawbacks)
- Equivalent salary needed in each location

### 4. **City Data Includes** (January 2026)
- **Cost of Living Index** (100 = New York City baseline, international standard)
- Median rent and home prices (in USD and local currency)
- Country-specific tax systems (federal/national, regional/state, social insurance)
- Walk scores and transit scores
- Crime indexes
- Job growth rates
- Healthcare, education, and entertainment indexes
- Visa requirements
- Language barrier ratings
- Time zone offsets
- Expat community sizes

## 🌎 Supported Countries & Regions

### 40 Countries Across 7 Regions

**North America (3)**
- 🇺🇸 United States (20 cities)
- 🇨🇦 Canada (4 cities)
- 🇲🇽 Mexico (3 cities)

**Europe (17)**
- Belgium, Czechia, Denmark, France, Germany, Greece, Ireland, Italy, Netherlands, Norway, Poland, Portugal, Spain, Sweden, Switzerland, United Kingdom

**Asia Pacific (10)**
- China, India, Indonesia, Japan, Philippines, Singapore, South Korea, Taiwan, Thailand, Vietnam

**Latin America (5)**
- Argentina, Brazil, Chile, Costa Rica, El Salvador, Guatemala

**Oceania (2)**
- 🇦🇺 Australia (3 cities)
- 🇳🇿 New Zealand (3 cities)

**Middle East (1)**
- 🇦🇪 United Arab Emirates (2 cities)

**Africa (2)**
- Morocco, South Africa

**Total: 164 cities** with accurate COL, tax, and quality of life data.

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
│   │   ├── CityPicker.tsx     # Grouped by country with search
│   │   ├── CurrencyDisplay.tsx # Dual currency formatting
│   │   └── index.ts
│   ├── screens/               # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── SalaryCalculatorScreen.tsx
│   │   ├── MovingEstimatorScreen.tsx
│   │   ├── RecommendationsScreen.tsx
│   │   ├── CityComparisonScreen.tsx
│   │   ├── FullAnalysisScreen.tsx
│   │   └── index.ts
│   ├── data/                  # City and country database
│   │   ├── countries.ts       # 40 country definitions
│   │   ├── cities/
│   │   │   ├── index.ts       # City aggregation
│   │   │   ├── us.ts          # 20 US cities
│   │   │   ├── canada.ts      # 4 Canadian cities
│   │   │   ├── uk.ts          # 4 UK cities
│   │   │   ├── ... (40 country files)
│   │   └── taxSystems/        # Country-specific tax calculators
│   │       ├── us.ts
│   │       ├── canada.ts
│   │       ├── uk.ts
│   │       └── ... (40 tax calculators)
│   ├── utils/                 # Business logic
│   │   ├── taxCalculator/     # Tax calculation factory
│   │   │   └── index.ts
│   │   ├── currency/          # Currency service
│   │   │   └── exchangeRates.ts
│   │   ├── movingCalculator.ts
│   │   └── recommendations.ts
│   ├── types/                 # TypeScript definitions
│   │   └── index.ts           # City, Country, Currency, Region types
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

- **Cost of Living**: Numbeo.com (January 2026 data update)
- **Tax Systems**: Official government sources (IRS, CRA, HMRC, BMF, NTA, etc.)
  - US: 2026 Federal + State tax brackets
  - Canada: CRA federal + provincial brackets
  - UK: HMRC income tax + National Insurance
  - Germany: Progressive tax + Solidarity surcharge
  - Japan: National + local resident tax
  - And 35+ more countries
- **Currency Exchange Rates**: January 2026 rates (27 currencies)
- **Walk/Transit Scores**: Walk Score methodology
- **City Metrics**: BLS, Census, Eurostat, national statistics offices
- **Quality of Life**: Numbeo, WHO, OECD data

**Note**: Tax calculations are approximate. Consult a professional tax advisor for your specific situation.

## 🔜 Future Enhancements

### Already Completed (Version 2.0)
- ✅ International city support (164 cities, 40 countries)
- ✅ Multi-currency support (27 currencies)
- ✅ Regional filtering (7 regions)
- ✅ Employer relocation assistance calculator
- ✅ Country-specific tax systems
- ✅ Intra-regional move types

### Upcoming Features
- [ ] Live exchange rate API integration (auto-updates)
- [ ] More cities (target: 300+ cities, 80+ countries)
- [ ] User accounts and saved scenarios
- [ ] Digital nomad mode (multi-country comparisons)
- [ ] Claude AI integration for conversational guidance
- [ ] Advanced visualizations and charts
- [ ] Community features (user reviews, cost submissions)
- [ ] Remote work tax calculator (digital nomad tax implications)
- [ ] Family relocation calculations (spouse, children costs)

## 📄 License

MIT License - feel free to use and modify for your projects.

---

Built with ❤️ using React Native and Expo
