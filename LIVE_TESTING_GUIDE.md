# Live App Testing Guide - January 2026

## 🚀 GETTING STARTED

### 1. Start the App
```bash
# Run the development server
npm start
# or
yarn start
# or
expo start
```

### 2. Open the App
- Web: Open in browser (usually http://localhost:19006)
- Mobile: Scan QR code with Expo Go app

---

## ✅ QUICK VERIFICATION CHECKLIST

Before detailed testing, verify these basics:

### Data Loading
- [ ] App loads without errors
- [ ] No console errors related to city data
- [ ] CityPicker shows cities when opened
- [ ] All 40 countries appear in CityPicker
- [ ] Cities are grouped by country

### Navigation
- [ ] All screens accessible
- [ ] Can navigate between screens
- [ ] No crashes or freezes

---

## 🧪 BETA TEST SCENARIOS (Priority Order)

### 🔥 CRITICAL - Test Scenario 1: USA → Japan

**Why Critical**: Tests baseline (NYC=100), currency conversion, international taxes

**Steps**:
1. Go to **Salary Calculator** screen
2. Select **From City**: New York City, NY
3. Select **To City**: Tokyo, Japan
4. Enter Salary: **$100,000**
5. Click Calculate

**Expected Results**:
- ✅ NYC COL: 100
- ✅ Tokyo COL: 75
- ✅ Shows "GAIN in purchasing power" or Tokyo is cheaper
- ✅ Equivalent salary in Tokyo: ~$75,000 USD (or ¥11,175,000)
- ✅ Tax breakdown shows:
  - NYC: Federal Tax + NY State Tax + FICA
  - Tokyo: Income Tax + Social Contributions
- ✅ Currency display: $100,000 (¥14,950,000) format

**Test Results**:
- [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

### 🔥 CRITICAL - Test Scenario 2: High COL → Low COL

**Why Critical**: Tests large COL differences, user benefit calculation

**Steps**:
1. **Salary Calculator** screen
2. **From**: San Francisco, CA
3. **To**: Bangkok, Thailand
4. Enter: **$150,000**
5. Calculate

**Expected Results**:
- ✅ SF COL: 97 (expensive)
- ✅ Bangkok COL: 48 (cheap)
- ✅ **Massive purchasing power gain**
- ✅ Equivalent salary: ~$74,000 (or ฿2,590,000)
- ✅ Should highlight this is a great financial move

**Test Results**:
- [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

### 🟡 IMPORTANT - Test Scenario 3: Europe → Europe

**Why Important**: Tests intra-regional moves, EUR currency

**Steps**:
1. **Salary Calculator** screen
2. **From**: Berlin, Germany
3. **To**: London, UK
4. Enter: **€80,000** (or USD equivalent)
5. Calculate

**Expected Results**:
- ✅ Berlin COL: 90
- ✅ London COL: 88
- ✅ Similar purchasing power
- ✅ Tax breakdowns different (German vs UK system)
- ✅ Currency shows EUR and GBP

**Moving Cost Estimator**:
- Go to **Moving Cost Estimator**
- Select same cities (Berlin → London)
- Should show: **"Intra-Regional Move"** (European truck)
- Distance: ~930 km
- Method options: European Truck Movers

**Test Results**:
- [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

### 🟡 IMPORTANT - Test Scenario 4: Low COL → High COL

**Why Important**: Tests financial warning, high cost cities

**Steps**:
1. **Salary Calculator**
2. **From**: Mexico City, Mexico
3. **To**: Zurich, Switzerland
4. Enter: **$60,000**
5. Calculate

**Expected Results**:
- ✅ Mexico City COL: 45 (very cheap)
- ✅ Zurich COL: 117 (most expensive!)
- ✅ **Loss in purchasing power**
- ✅ Need ~$156,000 in Zurich to maintain lifestyle
- ✅ Should show warning or highlight difficulty

**Test Results**:
- [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

### 🟢 NICE TO HAVE - Test Scenario 5: Domestic US Move

**Steps**:
1. **Salary Calculator**
2. **From**: Nashville, TN
3. **To**: Seattle, WA
4. Enter: **$75,000**
5. Calculate

**Expected Results**:
- ✅ Nashville COL: 70
- ✅ Seattle COL: 90
- ✅ Need ~$96,000 in Seattle
- ✅ Tax: TN has no state income tax, WA also no state income tax
- ✅ Moving Cost: Shows domestic options (DIY, Hybrid, Full Service)

**Test Results**:
- [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

## 🎨 FEATURE TESTING

### Feature 1: Regional Filtering (Recommendations)

**Steps**:
1. Go to **Recommendations** screen
2. Scroll down to "Filter by Region" section
3. Toggle the section open

**Test A: Single Region Filter**
1. Click **"Europe"** chip
2. Click **"Find My Ideal Cities"**
3. Verify: Only European cities appear in results
   - [ ] No US cities shown
   - [ ] No Asian cities shown
   - [ ] European cities only (London, Berlin, Madrid, etc.)

**Test B: Multiple Region Filter**
1. Click **"Europe"** and **"North America"**
2. Click **"Find My Ideal Cities"**
3. Verify: Only cities from these two regions appear
   - [ ] US/Canada cities shown
   - [ ] European cities shown
   - [ ] No Asian/Latin American cities

**Test C: Clear Filter**
1. Click **"Show All"** button
2. Verify: All regions selected, all cities shown
3. Badge should disappear

**Test D: Oceania Region**
1. Click **"Oceania"** only
2. Click **"Find My Ideal Cities"**
3. Verify: Only Australia & New Zealand cities appear
   - [ ] Sydney, Melbourne, Brisbane
   - [ ] Auckland, Wellington, Queenstown
   - [ ] No Asian cities (this was the bug we fixed!)

**Test Results**:
- Regional Filter: [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

### Feature 2: Employer Relocation Assistance

**Steps**:
1. Go to **Moving Cost Estimator**
2. Select cities: **San Francisco, CA** → **Austin, TX**
3. Select home size: **2 BR Apartment**
4. Keep defaults for other options
5. Click **"Estimate Moving Costs"**
6. Note the total cost (e.g., $8,500)

**Test A: Toggle On (50%)**
1. Toggle **"Employer relocation assistance?"** ON
2. Default slider should be at **50%**
3. Verify display shows:
   - Total Moving Cost: $8,500
   - Employer Contribution (50%): -$4,250
   - **Your Cost: $4,250** (emphasized, larger font)

**Test B: Adjust Percentage**
1. Move slider to **75%**
2. Verify:
   - Employer Contribution (75%): -$6,375
   - Your Cost: $2,125
3. Move slider to **100%**
4. Verify:
   - Employer Contribution (100%): -$8,500
   - Your Cost: $0

**Test C: Toggle Off**
1. Toggle assistance OFF
2. Verify: Display returns to normal (just shows total, no breakdown)

**Test Results**:
- Employer Assistance: [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

### Feature 3: Currency Display

**Test A: USD User (Default)**
1. Go to **Salary Calculator**
2. Select: New York → Tokyo
3. Enter: $100,000
4. Verify currency display format:
   - Primary amount: **$100,000** (larger)
   - Secondary: **(¥14,950,000)** (smaller, in parentheses)

**Test B: Non-USD Currency**
1. Select: Berlin → London
2. Try entering EUR amount
3. Verify: Displays both EUR and GBP correctly

**Test Results**:
- Currency Display: [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

### Feature 4: Visa Badges

**Test in CityPicker**:
1. Open CityPicker (any screen)
2. Look for "Visa" badges next to city names

**Verify**:
- [ ] US cities → No visa badge for US users
- [ ] Canadian cities → No visa badge (visa-free for US)
- [ ] European cities → Visa badge shows (most require visa)
- [ ] Japanese cities → Visa badge shows
- [ ] Badge says just "Visa" (not "Visa for US citizens")

**Test Results**:
- Visa Badges: [ ] PASS / [ ] FAIL
- Notes: _______________________________________________

---

## 🔍 EDGE CASE TESTING

### Edge Case 1: Very Low Salary
- Enter: **$15,000** (minimum wage)
- Verify: Calculations work, no crashes
- [ ] PASS / [ ] FAIL

### Edge Case 2: Very High Salary
- Enter: **$500,000** (executive)
- Verify: Calculations work, large numbers display correctly
- [ ] PASS / [ ] FAIL

### Edge Case 3: Zero Salary
- Enter: **$0**
- Verify: Handles gracefully (shows message or calculates)
- [ ] PASS / [ ] FAIL

### Edge Case 4: Most Expensive City
- Select: **Zurich, Switzerland**
- Verify: COL shows **117** (highest)
- [ ] PASS / [ ] FAIL

### Edge Case 5: Least Expensive City
- Select: **Delhi, India**
- Verify: COL shows **30** (lowest)
- [ ] PASS / [ ] FAIL

---

## 🐛 BUG TRACKING

### Bugs Found During Testing

**Bug #1**: _______________________________________________
- **Severity**: Critical / High / Medium / Low
- **Screen**: _______________________________________________
- **Steps to Reproduce**: _______________________________________________
- **Expected**: _______________________________________________
- **Actual**: _______________________________________________

**Bug #2**: _______________________________________________

**Bug #3**: _______________________________________________

---

## 📊 PERFORMANCE OBSERVATIONS

### App Performance
- [ ] Loads quickly (< 2 seconds)
- [ ] No lag when scrolling city lists
- [ ] Search is instant (< 100ms)
- [ ] Calculations are instant
- [ ] No freezes or crashes

### Issues Noticed
- _______________________________________________
- _______________________________________________

---

## ✅ FINAL CHECKLIST

After completing all tests above:

- [ ] All 5 beta scenarios tested
- [ ] Regional filtering works correctly
- [ ] Employer assistance feature works
- [ ] Currency display correct
- [ ] Visa badges accurate
- [ ] Edge cases handled
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] All bugs documented (if any)

---

## 📝 TESTING NOTES

**Date Tested**: _______________________________________________
**Device/Browser**: _______________________________________________
**App Version**: _______________________________________________

**Overall Assessment**:
- [ ] Ready for production
- [ ] Needs minor fixes
- [ ] Needs major fixes

**Priority Issues to Fix**: _______________________________________________

---

## 🎯 NEXT STEPS AFTER TESTING

1. Document all bugs found in TEST_RESULTS_JAN2026.md
2. Fix critical bugs immediately
3. Fix high-priority bugs before production
4. Note minor issues for future enhancement
5. Update documentation with any limitations found
6. Prepare for production deployment

---

**Good luck with testing! 🚀**

*Note: Take screenshots of any bugs found for easier debugging later.*
