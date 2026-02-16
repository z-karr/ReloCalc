# Comprehensive Testing Plan - January 2026

## 🎯 TESTING OBJECTIVES

1. **Performance Testing**: Verify app performance with 164 cities across 40 countries
2. **Beta Testing**: Validate accuracy of calculations across multiple country pairs
3. **Feature Testing**: Ensure new features work correctly (regional filtering, employer assistance)
4. **Edge Case Testing**: Test boundary conditions and unusual scenarios

---

## 📊 PERFORMANCE TESTING

### 1. Data Loading Performance
- [ ] Measure initial app load time with all 164 cities
- [ ] Verify cities data imports correctly
- [ ] Check memory usage with all city data loaded
- [ ] Test CityPicker scrolling performance with 164 cities

### 2. Search & Filter Performance
- [ ] Test CityPicker search with various queries
- [ ] Test country grouping/collapsing performance
- [ ] Test regional filter performance (filter by single region, multiple regions)
- [ ] Verify no lag when typing in search

### 3. Calculation Performance
- [ ] Test salary calculator with various inputs (low, medium, high salaries)
- [ ] Test city comparison across different country pairs
- [ ] Test recommendations screen with all preference combinations
- [ ] Test moving cost calculator with all move types

### 4. UI Responsiveness
- [ ] Test smooth scrolling on long lists
- [ ] Verify no UI freezes during calculations
- [ ] Test concurrent operations (multiple calculations)

**Performance Benchmarks**:
- Initial load: < 2 seconds
- Search response: < 100ms
- Calculation time: < 500ms
- Smooth scrolling: 60fps

---

## 🧪 BETA TESTING - CALCULATION ACCURACY

### Test Scenario 1: USA → Japan (Domestic → International)
**Route**: New York City, NY → Tokyo, Japan
**Salary**: $100,000 USD
**Expected Behavior**:
- NYC COL: 100 (baseline)
- Tokyo COL: 75 (cheaper due to weak yen)
- Should show **gain** in purchasing power
- Equivalent salary needed in Tokyo: ~$75,000
- Tax breakdown should show federal + state for NYC, national + social for Tokyo
- Currency display: $100,000 (¥14,950,000)

**Test**:
- [ ] Salary calculator shows correct equivalent salary
- [ ] Tax calculations accurate for both cities
- [ ] Currency conversion correct (USD → JPY)
- [ ] Purchasing power gain displayed correctly
- [ ] COL comparison shows Tokyo is cheaper

---

### Test Scenario 2: Europe → Europe (Intra-Regional)
**Route**: Berlin, Germany → London, UK
**Salary**: €80,000 EUR
**Expected Behavior**:
- Berlin COL: 90
- London COL: 88
- Similar cost of living
- Tax systems: Germany (progressive + social), UK (progressive + National Insurance)
- Currency conversion: EUR → GBP

**Test**:
- [ ] Salary calculator handles EUR input correctly
- [ ] Tax calculations accurate for both countries
- [ ] Currency display shows both EUR and GBP
- [ ] Moving cost calculator shows "intra-regional" European truck move
- [ ] COL comparison accurate

---

### Test Scenario 3: High COL → Low COL (Intercontinental)
**Route**: San Francisco, CA → Bangkok, Thailand
**Salary**: $150,000 USD
**Expected Behavior**:
- San Francisco COL: 97
- Bangkok COL: 48 (very affordable)
- **Massive gain** in purchasing power
- Equivalent salary in Bangkok: ~$74,000 (฿2,590,000)
- Should show significant lifestyle improvement

**Test**:
- [ ] Salary calculator shows large purchasing power gain
- [ ] Tax calculations accurate (CA state tax vs Thai tax)
- [ ] Currency conversion USD → THB correct
- [ ] Moving cost calculator shows intercontinental options (minimalist, LCL, FCL)
- [ ] Recommendations show Bangkok as high-value option

---

### Test Scenario 4: Low COL → High COL
**Route**: Mexico City, Mexico → Zurich, Switzerland
**Salary**: $60,000 USD (Mexico City salary)
**Expected Behavior**:
- Mexico City COL: 45 (very affordable)
- Zurich COL: 117 (most expensive in dataset)
- **Loss** in purchasing power
- Equivalent salary needed in Zurich: ~$156,000
- Should show this is a difficult move financially

**Test**:
- [ ] Salary calculator shows large salary increase needed
- [ ] Tax calculations accurate for both countries
- [ ] Currency conversion USD → MXN → CHF correct
- [ ] Moving cost shows intercontinental costs
- [ ] Warns about high cost of living in Zurich

---

### Test Scenario 5: Southern Hemisphere → Northern Hemisphere
**Route**: Sydney, Australia → Vancouver, Canada
**Salary**: A$120,000 AUD
**Expected Behavior**:
- Sydney COL: 75
- Vancouver COL: 67
- Slight purchasing power gain
- Tax systems: Australia (progressive), Canada (federal + provincial)
- Currency conversion: AUD → CAD → USD

**Test**:
- [ ] Salary calculator handles AUD correctly
- [ ] Tax calculations accurate for both countries
- [ ] Distance calculation correct (~12,000 km)
- [ ] Moving cost shows intercontinental shipping options
- [ ] Climate differences noted

---

### Test Scenario 6: Domestic US Move (Cross-Country)
**Route**: Nashville, TN → Seattle, WA
**Salary**: $75,000 USD
**Expected Behavior**:
- Nashville COL: 70
- Seattle COL: 90
- Salary needed in Seattle: ~$96,000
- Tax difference: TN (no state tax) vs WA (no state income tax, but higher COL)
- Domestic moving options (DIY, hybrid, full service)

**Test**:
- [ ] Salary calculator shows correct equivalent salary
- [ ] Tax calculations show difference (TN no state tax)
- [ ] Moving cost calculator shows domestic options
- [ ] Distance calculation correct (~2,100 miles)
- [ ] Regional filtering works (both in North America)

---

### Test Scenario 7: Small European Country → Large European Country
**Route**: Copenhagen, Denmark → Madrid, Spain
**Salary**: DKK 600,000 (~$87,000 USD)
**Expected Behavior**:
- Copenhagen COL: 89 (expensive)
- Madrid COL: 58 (affordable)
- Significant purchasing power gain
- Both in Europe, should show intra-regional move
- Currency: DKK → EUR

**Test**:
- [ ] Salary calculator handles DKK correctly
- [ ] Tax calculations accurate (Denmark high tax, Spain moderate)
- [ ] Currency conversion DKK → EUR correct
- [ ] Moving cost shows European truck move
- [ ] Both cities appear when filtering by Europe region

---

### Test Scenario 8: Emerging Asia → Developed Asia
**Route**: Ho Chi Minh City, Vietnam → Singapore
**Salary**: $40,000 USD
**Expected Behavior**:
- HCMC COL: 42 (very affordable)
- Singapore COL: 88 (expensive)
- Need ~$84,000 to maintain lifestyle
- Tax systems: Vietnam (progressive), Singapore (territorial/low tax)
- Currency: VND → SGD

**Test**:
- [ ] Salary calculator shows large salary increase needed
- [ ] Tax calculations accurate (Singapore's favorable tax)
- [ ] Currency conversion VND → SGD correct
- [ ] Both cities appear when filtering by Asia Pacific region
- [ ] Moving cost shows intercontinental options

---

### Test Scenario 9: Latin America Internal Move
**Route**: São Paulo, Brazil → Buenos Aires, Argentina
**Salary**: R$180,000 BRL (~$36,000 USD)
**Expected Behavior**:
- São Paulo COL: 48
- Buenos Aires COL: 48 (similar)
- Similar purchasing power
- Both use $ symbol but different currencies
- Currency: BRL → ARS

**Test**:
- [ ] Salary calculator handles BRL correctly
- [ ] Currency symbols don't confuse display (R$ vs $)
- [ ] Tax calculations accurate for both countries
- [ ] Both cities appear when filtering by Latin America
- [ ] Moving cost shows intercontinental or intra-regional

---

### Test Scenario 10: Middle East → North America
**Route**: Dubai, UAE → Miami, FL
**Salary**: AED 400,000 (~$109,000 USD)
**Expected Behavior**:
- Dubai COL: 74
- Miami COL: 81
- Slight cost increase
- Tax advantage: UAE (no income tax) vs US (federal + 0% state)
- Currency: AED → USD

**Test**:
- [ ] Tax calculator shows UAE has no income tax
- [ ] Shows tax impact when moving to US (will pay federal tax)
- [ ] Currency conversion AED → USD correct
- [ ] Moving cost shows intercontinental shipping
- [ ] Regional filter shows correct regions

---

## 🎨 FEATURE TESTING

### Regional Filtering (Recommendations Screen)
- [ ] Default shows all 164 cities from all regions
- [ ] Filter by single region (e.g., "Europe only") works correctly
- [ ] Filter by multiple regions (e.g., "Europe + North America") works
- [ ] "Show All" button clears filters
- [ ] Badge shows number of selected regions
- [ ] Filtered results only show cities from selected regions
- [ ] Test all 7 regions: North America, Europe, Asia Pacific, Latin America, Middle East, Africa, Oceania

### Employer Relocation Assistance
- [ ] Toggle on/off works correctly
- [ ] Slider adjusts percentage (0% to 100%)
- [ ] Calculations update dynamically as slider moves
- [ ] Display shows: Total Cost, Employer Contribution, Your Cost
- [ ] Works with all move types (domestic, intra-regional, intercontinental)
- [ ] Works with optional expenses toggle
- [ ] Test edge cases: 0%, 50%, 100% coverage

### Currency Display Preferences
- [ ] User's home currency displays first when set
- [ ] USD displays first for US users
- [ ] Dual currency display works (primary + secondary in parentheses)
- [ ] Currency preferences persist across app sessions
- [ ] All 27 currencies display correctly with proper symbols

### Visa Badge Logic
- [ ] Dynamic visa badges based on user's home country
- [ ] Same country = no visa badge
- [ ] Visa-free pairs don't show badge (e.g., US → Canada)
- [ ] Visa required pairs show badge correctly
- [ ] Badge text is nationality-agnostic ("Visa" not "Visa for US citizens")

---

## 🔍 EDGE CASE TESTING

### Salary Edge Cases
- [ ] Very low salary: $15,000
- [ ] Very high salary: $500,000
- [ ] Negative salary (should handle gracefully)
- [ ] Zero salary (should handle gracefully)
- [ ] Non-numeric input (should validate)

### City Edge Cases
- [ ] Cities with same name in different countries
- [ ] Cities with special characters in names
- [ ] Cities with very high COL (Zurich: 117)
- [ ] Cities with very low COL (Delhi: 30)
- [ ] Cities with missing optional data (walk score, transit score)

### Currency Edge Cases
- [ ] Currencies with very high exchange rates (VND: 24,500)
- [ ] Currencies with very low exchange rates (GBP: 0.79)
- [ ] Converting between non-USD currencies
- [ ] Very large amounts (display formatting)
- [ ] Very small amounts

### Tax Edge Cases
- [ ] Zero income tax locations (UAE)
- [ ] No state income tax locations (TN, FL, TX, WA, etc.)
- [ ] Very high tax locations (Denmark, Sweden)
- [ ] Progressive tax bracket boundaries
- [ ] Social security contribution caps

### Moving Cost Edge Cases
- [ ] Very short distance (<10 miles)
- [ ] Very long distance (>10,000 miles)
- [ ] Same city to same city (0 miles)
- [ ] Intercontinental with minimalist method (cheapest)
- [ ] Intercontinental with 40ft container (most expensive)

---

## 📝 DATA ACCURACY VERIFICATION

### Spot-Check Cities (Compare against Numbeo Jan 2026)
- [ ] New York City: COL = 100 (baseline) ✓
- [ ] Tokyo: COL = 75 (weak yen effect) ✓
- [ ] Zurich: COL = 117 (most expensive) ✓
- [ ] Delhi: COL = 30 (least expensive) ✓
- [ ] London: COL = 88
- [ ] Sydney: COL = 75

### Exchange Rate Verification (Compare against current rates)
- [ ] USD/JPY: ~149.50 ✓
- [ ] USD/EUR: ~0.92 ✓
- [ ] USD/GBP: ~0.79 ✓
- [ ] USD/CAD: ~1.35 ✓
- [ ] USD/AUD: ~1.52 ✓
- [ ] USD/CHF: ~0.88 ✓

### Tax Rate Verification (Spot-check a few countries)
- [ ] US: Federal progressive + state rates
- [ ] UK: Progressive + National Insurance
- [ ] UAE: 0% income tax
- [ ] Japan: Progressive + social insurance
- [ ] Germany: Progressive + social contributions

---

## 🐛 BUG TRACKING

### Known Issues
(To be filled during testing)

### Critical Bugs
(To be filled during testing)

### Minor Issues
(To be filled during testing)

### Enhancement Opportunities
(To be filled during testing)

---

## ✅ TEST EXECUTION STATUS

**Started**: January 19, 2026
**Status**: In Progress
**Completion**: TBD

### Summary Results
- **Performance Tests**: ___ / ___ passed
- **Beta Test Scenarios**: ___ / 10 passed
- **Feature Tests**: ___ / ___ passed
- **Edge Cases**: ___ / ___ passed
- **Data Accuracy**: ___ / ___ verified

---

## 🎯 SUCCESS CRITERIA

- ✅ All performance benchmarks met
- ✅ 10/10 beta test scenarios pass
- ✅ All new features work correctly
- ✅ No critical bugs found
- ✅ Data accuracy verified
- ✅ Edge cases handled gracefully
- ✅ App remains responsive and fast

---

**Next Steps After Testing**:
1. Fix any critical bugs found
2. Document any known limitations
3. Update user-facing documentation
4. Prepare for production deployment
