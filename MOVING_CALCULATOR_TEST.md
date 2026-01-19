# Moving Calculator - Cost Comparison Feature Test Plan

## Bug Fix Applied
✅ **FIXED:** formatCurrency error - moved formatting logic from utility to component

## Test Scenarios

### Scenario 1: Raleigh to NYC (Your Reported Issue)
**Setup:**
- From: Raleigh, NC
- To: New York City, NY
- Distance: ~490 miles (domestic)
- Home Size: 2BR Apartment

**Expected Behavior:**
1. Shows "Domestic Move" badge
2. Distance shown: ~490 miles
3. **Cost Comparison Card** should appear with 3 options:
   - DIY (Truck Rental) - Lowest cost
   - Hybrid (Container) - ⭐ Recommended (marked with gold star)
   - Full Service - Highest cost
4. Each option shows:
   - Total cost
   - Timeline (e.g., "2-3 weeks")
   - Physical effort (High/Medium/Low)
   - Popularity percentage
   - "Save $X" or "Upgrade for $X more"
5. Clicking "Select This Option" should switch the method WITHOUT ERROR

**Test Steps:**
1. Select Raleigh → NYC
2. Choose 2BR Apartment
3. Click "Estimate Moving Costs"
4. Verify comparison card appears
5. Click "Select This Option" on DIY
6. Verify no error occurs
7. Click "Select This Option" on Full Service
8. Verify no error occurs
9. Switch back to Hybrid
10. Verify all calculations update correctly

---

### Scenario 2: Local Move (< 50 miles)
**Setup:**
- From: San Francisco, CA
- To: Los Angeles, CA
- Distance: ~380 miles (actually not local, this will be medium)

**Better Local Test:**
- From: Dallas, TX
- To: Dallas, TX (if available) OR use distance slider at 30 miles

**Expected Behavior:**
1. For <50 mile moves:
   - DIY should be ⭐ Recommended for studio/1BR/2BR
   - Full Service recommended for 3BR+
2. Should show 78% popularity for DIY in local moves
3. Cost difference should be $200-500 range

---

### Scenario 3: Container Sweet Spot (250-1000 miles)
**Setup:**
- From: Chicago, IL
- To: Miami, FL
- Distance: ~1,200 miles (slightly over sweet spot)
- Home Size: 2BR

**Expected Behavior:**
1. Hybrid (Container) should be ⭐ Recommended
2. Should show ~30% popularity
3. Savings vs Full Service: $500-$1,500 range
4. Timeline: 2-3 weeks

---

### Scenario 4: Cross-Country (1000+ miles)
**Setup:**
- From: Los Angeles, CA
- To: New York City, NY
- Distance: ~2,800 miles
- Home Size: 3BR House

**Expected Behavior:**
1. Full Service should be ⭐ Recommended (3BR+)
2. Should show ~45% popularity for full service
3. DIY should show "Save $X" message
4. Container should show as middle option

---

### Scenario 5: Different Home Sizes
**Test each home size with same route (Raleigh to NYC):**

**Studio:**
- Expected: DIY or Hybrid recommended
- Should show lowest costs overall

**1BR:**
- Expected: Similar to studio

**2BR:**
- Expected: Hybrid recommended
- Middle-range costs

**3BR:**
- Expected: Hybrid or Full Service recommended
- Higher costs

**4BR+:**
- Expected: Full Service recommended
- Should warn about high physical effort for DIY

**Small House:**
- Expected: Full Service recommended

**Large House:**
- Expected: Full Service strongly recommended

---

### Scenario 6: Method Switching Test
**Setup:**
- Any domestic move
- Start with DIY selected

**Test Steps:**
1. Click "Estimate Moving Costs"
2. Verify comparison shows current selection highlighted
3. Click "Select This Option" on Hybrid
4. Verify:
   - Hybrid now highlighted as current selection
   - Costs update
   - Comparison cards re-sort by cost
   - No errors in console
5. Click "Select This Option" on Full Service
6. Verify same behavior
7. Click back to DIY
8. Verify everything updates correctly

---

### Scenario 7: Edge Cases

**No Cities Selected:**
- Should NOT show comparison card (domestic moves only)

**International Move:**
- From: New York City, NY
- To: London, UK
- Should NOT show comparison card (intercontinental uses different logic)

**European Move:**
- From: Berlin, Germany
- To: Paris, France
- Should NOT show comparison card (only one option: euro_truck)

---

## What to Look For

### ✅ Success Indicators:
- No JavaScript errors
- Comparison card renders smoothly
- All costs display correctly with currency formatting
- "Save $X" shows green badge with down arrow
- "Upgrade for $X" shows gray italic text
- ⭐ Recommended badge shows on research-backed option
- Timeline, effort, and popularity all display
- "Select This Option" button switches method correctly
- Current selection has blue border and "Current Selection" badge

### ❌ Potential Issues to Watch:
- formatCurrency errors (should be FIXED now)
- Missing comparison data
- Incorrect recommendations
- Cost calculations wrong
- UI layout broken
- Button clicks not working
- Slow performance

---

## Known Limitations

1. **Only works for domestic moves** - Intercontinental/regional moves don't show comparison (intentional)
2. **Requires cities selected** - Won't work with distance slider only
3. **Updates on estimate click** - Not real-time while adjusting inputs

---

## Console Debugging

If you see errors, check browser/React Native console for:
- `Property 'formatCurrency' doesn't exist` - SHOULD BE FIXED
- `Cannot read property 'map' of undefined` - Check if comparisons array is null
- `Invalid hook call` - Check React hooks usage

---

## Success Criteria

✅ All 7 scenarios work without errors
✅ Cost comparisons are accurate and sensible
✅ Recommendations match research data
✅ UI is clean and readable
✅ Method switching works smoothly
✅ No performance issues
