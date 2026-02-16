# Currency Preference Testing Guide

## 🧪 Test Plan: Verify Currency Display Integration

Follow these steps to verify that user currency preferences now work correctly in the Salary Calculator.

---

## Pre-Test Setup

1. **Make sure app is running:**
   - Expo is already running (confirmed ✓)
   - Open the app in your iOS Simulator or physical device
   - App should reload automatically with the new changes

2. **If app doesn't reload automatically:**
   - Press `r` in the terminal where Expo is running to reload
   - Or shake device/press Cmd+D in simulator → "Reload"

---

## Test 1: Default Behavior (US User)

### Expected: US users should see USD first by default

**Steps:**
1. Open the app
2. Navigate to **Settings** screen
3. **Verify Auto-Detection:**
   - Home Country should show "United States" (auto-detected from device)
   - Currency Display Mode should show "USD first" selected
4. Navigate to **Salary Calculator**
5. Select cities:
   - Current City: **New York**
   - Target City: **Tokyo**
6. Enter salary: **100000** ($100,000)
7. Click **"Calculate Salary"**

**Expected Results:**
- ✅ Monthly Take-Home should show: **$X,XXX (¥XXX,XXX)**
  - USD shown first (larger, bold)
  - Yen shown second (smaller, gray, in parentheses)
- ✅ Annual Take-Home should show: **$XX,XXX (¥X,XXX,XXX)**
  - Same pattern: USD first, Yen second
- ✅ Equivalent Salary should show: **$XX,XXX (¥X,XXX,XXX)**
  - Same pattern

**Screenshot this for comparison!**

---

## Test 2: Change to German User - "My Currency First"

### Expected: German users should see EUR first when mode is "My currency first"

**Steps:**
1. Navigate to **Settings** screen
2. Click on **Home Country** row
3. Scroll to **Europe** section
4. Select **Germany** 🇩🇪
5. Verify Currency Display Mode options appear
6. Select **"My currency first (€, $)"** radio button
7. Click **"Save Settings"** or navigate back
8. Navigate to **Salary Calculator**
9. Select cities:
   - Current City: **Berlin**
   - Target City: **Tokyo**
10. Enter salary: **100000** ($100,000)
11. Click **"Calculate Salary"**

**Expected Results:**
- ✅ Monthly Take-Home should show: **€X,XXX (¥XXX,XXX)**
  - EUR shown first (larger, bold)
  - Yen shown second (smaller, gray, in parentheses)
- ✅ Annual Take-Home should show: **€XX,XXX (¥X,XXX,XXX)**
  - Same pattern: EUR first, Yen second
- ✅ Equivalent Salary should show: **€XX,XXX (¥X,XXX,XXX)**
  - Same pattern

**Screenshot this for comparison!**

---

## Test 3: German User - Switch to "USD First"

### Expected: Even with Germany as home country, can choose to see USD first

**Steps:**
1. Navigate to **Settings** screen
2. Keep Home Country as **Germany**
3. Select **"USD first ($, €)"** radio button
4. Go back to **Salary Calculator**
5. **Verify the display changes:**

**Expected Results:**
- ✅ Monthly Take-Home should now show: **$X,XXX (¥XXX,XXX)**
  - USD shown first (even though home country is Germany)
  - Yen shown second
- ✅ Pattern holds for all salary displays

---

## Test 4: Different Country Combinations

### Test various country pairs to verify flexibility

**Test Cases:**

| Home Country | Display Mode | Current City | Target City | Expected Primary Currency |
|-------------|--------------|--------------|-------------|---------------------------|
| Germany | My currency first | Berlin | Paris | € (EUR) |
| Japan | My currency first | Tokyo | Osaka | ¥ (JPY) |
| UK | My currency first | London | New York | £ (GBP) |
| Australia | My currency first | Sydney | Melbourne | A$ (AUD) |
| USA | USD first | Any | Any | $ (USD) |

**For each test:**
1. Set Home Country and Display Mode in Settings
2. Navigate to Salary Calculator
3. Select the city pair
4. Enter salary: $100,000
5. Calculate
6. Verify the primary (larger, bold) currency matches expectations

---

## Test 5: Same-Country Moves (Single Currency)

### Expected: When both cities use same currency, show only that currency

**Steps:**
1. Settings: Home Country = **USA**, Mode = "My currency first"
2. Salary Calculator:
   - Current City: **New York**
   - Target City: **Los Angeles**
3. Enter salary: $100,000
4. Calculate

**Expected Results:**
- ✅ Monthly Take-Home: **$X,XXX** (no second currency)
- ✅ Annual Take-Home: **$XX,XXX** (no second currency)
- ✅ No "(currency)" in parentheses since both cities use USD

---

## Test 6: Tax Breakdown Still Shows Correctly

### Verify tax deductions haven't been affected by our changes

**Steps:**
1. In Salary Calculator with calculated results
2. Look at the tax breakdown section

**Expected Results:**
- ✅ Gross Salary: Shows as single currency (USD)
- ✅ Federal Tax: Shows as single currency with minus sign
- ✅ State Tax: Shows as single currency with minus sign
- ✅ FICA/Social: Shows as single currency with minus sign
- ✅ All tax line items use basic formatCurrency (not dual currency)
- ✅ Tax labels are country-appropriate (e.g., "Income Tax" for non-US)

---

## Known Issues to Watch For

### Issue 1: CurrencyDisplay Component Not Found
**Symptoms:** App crashes with "CurrencyDisplay is not defined"
**Cause:** Import issue in components/index.ts
**Fix:** Verify CurrencyDisplay is exported from components/index.ts

### Issue 2: Preferences Not Loading
**Symptoms:** Settings show "United States" but changes don't persist
**Cause:** UserPreferencesContext not wrapped around App
**Fix:** Verify App.tsx has UserPreferencesProvider wrapper

### Issue 3: Currency Doesn't Change
**Symptoms:** Changed settings but currency display stays the same
**Cause:** emphasize prop not set to "auto"
**Fix:** Verify all CurrencyDisplay components use emphasize="auto"

### Issue 4: Multiple Currencies Shown Incorrectly
**Symptoms:** Shows weird format like "$X,XXX (€X,XXX) (¥X,XXX)"
**Cause:** Nested CurrencyDisplay or mixed formatting
**Fix:** Check that we removed old formatting code

---

## Success Criteria

### ✅ All Tests Pass When:

1. **Auto-detection works:**
   - App detects device country on first launch
   - Preferences persist across app restarts

2. **Currency display respects preferences:**
   - "My currency first" shows home currency prominently
   - "USD first" always shows USD prominently
   - Changes take effect immediately after setting

3. **Dual currency works:**
   - Shows both currencies when cities differ
   - Primary currency is larger and bold
   - Secondary currency is smaller, gray, in parentheses

4. **Single currency works:**
   - Shows only one currency when cities use same currency
   - No empty parentheses or placeholder text

5. **Tax breakdowns unchanged:**
   - Tax line items still show correctly
   - No dual currency in tax deductions
   - Tax labels appropriate for country

6. **Visual consistency:**
   - Styling matches design system
   - No layout breaks or wrapping issues
   - Readable on all screen sizes

---

## Bug Report Template

If you find issues, report them with this format:

```
**Test Case:** [Test number and name]
**Steps to Reproduce:**
1.
2.
3.

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach if possible]

**Device/Simulator:**
[e.g., iPhone 15 Simulator, Physical iPhone 12]
```

---

## Next Steps After Testing

### If All Tests Pass ✅
- Celebrate! The integration works
- Move to Priority 2: Add save feedback
- Consider adding more polish

### If Tests Fail ❌
- Document the specific failure
- Share screenshots/error messages
- We'll debug and fix together

---

## Quick Test Summary

**Minimum viable test:**
1. ✅ Open app → Settings
2. ✅ Change Home Country to Germany
3. ✅ Select "My currency first"
4. ✅ Go to Salary Calculator
5. ✅ Select Berlin → Tokyo
6. ✅ Enter $100,000 salary
7. ✅ Calculate
8. ✅ Verify: **€XX,XXX (¥XXX,XXX)** format (EUR first, not USD)

**If step 8 shows EUR first = SUCCESS! 🎉**
**If step 8 still shows USD first = BUG, needs fixing ❌**

---

Let's test! 🚀
