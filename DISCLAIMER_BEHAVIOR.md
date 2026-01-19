# Regional Pricing Disclaimer - Behavior Documentation

## Implemented: Option 2 + Option 3

✅ **Option 2:** Only show **after clicking "Estimate Moving Costs"**
✅ **Option 3:** Show for **all domestic moves**

---

## Current Behavior

### When You Open the Page
- ❌ **Disclaimer does NOT show** on page load
- ✅ Input fields are ready to use
- ✅ No interruptions or banners

### When You Click "Estimate Moving Costs"
The system checks the move type:

**If DOMESTIC move** (same country):
- ✅ **Disclaimer appears** at the top of the results section
- ✅ Shows for ALL domestic moves:
  - US → US (detailed formulas)
  - Japan → Japan (regional pricing)
  - France → France (regional pricing)
  - Australia → Australia (dedicated calculator)
  - etc.

**If INTRA-REGIONAL move** (different countries, same region):
- ✅ **Disclaimer appears** at the top of the results section
- ✅ Shows for ALL intra-regional moves:
  - Paris → Berlin (European truck freight)
  - Madrid → Rome (European truck freight)
  - etc.
- These ALSO use regional pricing estimates

**If INTERCONTINENTAL move** (different continents):
- ❌ **Disclaimer does NOT show**
- Different pricing logic (shipping containers, international freight)

### When You Dismiss the Disclaimer
- ✅ Click the **X button** to hide it
- ✅ Stays hidden for the rest of that session
- ✅ User can continue viewing/modifying results without the banner

### When You Navigate Away and Come Back
- ✅ **Disclaimer resets** (will show again on next domestic move calculation)
- ✅ Fresh session = fresh disclaimer
- ✅ User sees it every time they visit the page and calculate a domestic move

---

## User Flow Examples

### Example 1: Tokyo → Osaka (Domestic Japan)
1. Open Moving Estimator page → **No disclaimer**
2. Select Tokyo → Osaka
3. Select 2BR, Full Service
4. Click "Estimate Moving Costs"
5. Results appear with **disclaimer banner at top** ✅
6. User reads it, clicks X to dismiss
7. Disclaimer hidden
8. User changes to 3BR, recalculates
9. Disclaimer stays hidden (already dismissed this session)
10. User navigates to another screen
11. User comes back to Moving Estimator
12. Selects new cities, clicks calculate
13. **Disclaimer shows again** ✅

### Example 2: New York → London (Intercontinental)
1. Open Moving Estimator page → **No disclaimer**
2. Select New York → London
3. Click "Estimate Moving Costs"
4. Results appear **without disclaimer** ❌
5. This is an intercontinental move (shipping containers, different logic)
6. Regional pricing disclaimer not relevant

### Example 3: Paris → Berlin (Intra-Regional Europe)
1. Select Paris → Berlin
2. Click "Estimate Moving Costs"
3. Results appear **with disclaimer** ✅
4. Uses European truck freight pricing (regional estimates)

---

## Technical Implementation

### State Management
```typescript
const [showDisclaimer, setShowDisclaimer] = useState(false); // Starts hidden
```

### Show Logic
```typescript
const handleCalculate = () => {
  setShowResults(true);

  // Show disclaimer for domestic and intra-regional moves (both use regional pricing)
  if (moveType === 'domestic' || moveType === 'intra_regional') {
    setShowDisclaimer(true);
  }
};
```

### Dismiss Logic
```typescript
const dismissDisclaimer = () => {
  setShowDisclaimer(false);
};
```

### Placement
Disclaimer appears **inside the results section**, just before the total cost card:
```jsx
{showResults && (
  <View style={styles.resultsSection}>
    {/* Disclaimer appears here if showDisclaimer is true */}
    {showDisclaimer && <DisclaimerBanner />}

    {/* Total Estimate Card */}
    <Card>...</Card>
  </View>
)}
```

---

## Why This Approach?

### ✅ Advantages

1. **Non-Intrusive:** Doesn't interrupt users before they calculate
2. **Contextual:** Only shows when relevant (domestic moves with regional pricing)
3. **Persistent Reminder:** Resets each session so users see it regularly
4. **Dismissible:** Users can hide it if they've read it
5. **Appears with Results:** Connected to the data it's describing

### 🎯 Use Cases Covered

- **First-time users:** See the disclaimer on first calculation
- **Regular users:** See it every session as a reminder
- **Multi-calculation sessions:** Can dismiss it and keep working
- **International moves:** Doesn't clutter UI when not relevant

---

## Disclaimer Content

**Title:** "Regional Pricing Estimates"

**Message:**
"Moving costs shown use regional averages and may vary significantly by location, season, and specific providers. We recommend contacting local moving companies for accurate quotes in your area."

**Actions:**
- Read the message
- Click X to dismiss for this session

---

## Edge Cases

### User calculates multiple moves in one session
- First domestic move: Disclaimer shows
- User dismisses it
- Second domestic move: Disclaimer stays hidden (already dismissed)
- Third intercontinental move: Disclaimer doesn't apply anyway

### User switches from intercontinental to domestic
- Intercontinental calculation: No disclaimer
- Switch to domestic cities, recalculate: **Disclaimer appears** ✅
- Logic checks moveType on every calculation

### User navigates between tabs
- Calculate domestic move → disclaimer shows
- Navigate to "Salary Calculator"
- Come back to "Moving Estimator"
- **Disclaimer will show again on next domestic calculation** ✅

---

## Summary

The disclaimer now:
- ✅ Shows **after calculation**, not on page load (Option 2)
- ✅ Shows for **all domestic moves** (Option 3)
- ✅ Shows for **all intra-regional moves** (also use regional pricing)
- ✅ Resets **every time you visit the page**
- ✅ Is **dismissible** for the current session
- ✅ Appears **with the results** it describes
- ✅ Only skipped for intercontinental moves (shipping containers, different logic)

Perfect balance of information transparency and user experience! 🎉
