# ✅ 80% Reclaim Threshold Logic - Implementation & Testing Guide

## 🎯 Implementation Summary

The Reclaim button is properly implemented with an **80% threshold** that reads mock data and uses Tailwind to disable/enable the button based on user holdings.

---

## 📊 How It Works

### 1. **Data Reading**
```typescript
// Component: reclaim-interface.tsx
const RECLAIM_THRESHOLD = 0.8; // 80% threshold

// Reads user balance from mock
const { data: balance } = useUserBalance(
  account?.address,
  selectedVault?.fractionalMint
);

// Calculates user's share percentage
const userSharePercentage = balance && selectedVault
  ? balance.balance / selectedVault.totalSupply
  : 0;

// Determines if user can reclaim
const canReclaim = userSharePercentage >= RECLAIM_THRESHOLD;
```

### 2. **Button State Control**
```typescript
<Button
  type="submit"
  disabled={!canReclaim || isPending}  // 👈 Tailwind disabled state
  className="flex-1"
  size="lg"
>
  {isPending ? 'Reclaiming...' : 'Reclaim NFT'}
</Button>
```

### 3. **Visual Feedback**
- **Green alert** when user holds ≥80% (eligible)
- **Yellow alert** when user holds <80% (not eligible)
- **Share percentage** displayed in real-time
- **Button disabled** with Tailwind when <80%

---

## 🧪 Mock Data for Testing

I've set up 3 vaults with different scenarios:

### Vault 1: Degen Ape #1234
- **Total Supply:** 1,000,000 tokens
- **Your Balance:** 900,000 tokens
- **Your Share:** 90%
- **Status:** ✅ **Button ENABLED** (≥80%)
- **Visual:** Green alert, "Eligible to Reclaim"

### Vault 2: Okay Bear #5678
- **Total Supply:** 500,000 tokens
- **Your Balance:** 250,000 tokens
- **Your Share:** 50%
- **Status:** ❌ **Button DISABLED** (<80%)
- **Visual:** Yellow alert, "Not Eligible Yet"

### Vault 3: SMB #9012
- **Total Supply:** 2,000,000 tokens
- **Your Balance:** 1,700,000 tokens
- **Your Share:** 85%
- **Status:** ✅ **Button ENABLED** (≥80%)
- **Visual:** Green alert, "Eligible to Reclaim"

---

## 🧪 How to Test

### Step 1: Connect Wallet
1. Go to http://localhost:3000
2. Click "Select Wallet" button
3. Choose any wallet and connect

### Step 2: Navigate to Reclaim Page
- Click "Reclaim" in the navbar
- Or go directly to http://localhost:3000/reclaim

### Step 3: Test Vault 1 (90% - Button Enabled)
1. Click on **Degen Ape #1234** card
2. You should see:
   - ✅ **Your Share: 90.00%** (in green)
   - ✅ **Green alert box:** "Eligible to Reclaim"
   - ✅ **"Reclaim NFT" button is ENABLED** (not grayed out)
   - ✅ Message: "You hold enough tokens (≥80%) to reclaim this NFT"

### Step 4: Test Vault 2 (50% - Button Disabled)
1. Cancel current selection
2. Click on **Okay Bear #5678** card
3. You should see:
   - ❌ **Your Share: 50.00%** (in red)
   - ⚠️ **Yellow alert box:** "Not Eligible Yet"
   - ❌ **"Reclaim NFT" button is DISABLED** (grayed out, can't click)
   - ⚠️ Message: "You need to hold at least 80% of the total supply to reclaim this NFT. You currently hold 50.00%."

### Step 5: Test Vault 3 (85% - Button Enabled)
1. Cancel current selection
2. Click on **SMB #9012** card
3. You should see:
   - ✅ **Your Share: 85.00%** (in green)
   - ✅ **Green alert box:** "Eligible to Reclaim"
   - ✅ **"Reclaim NFT" button is ENABLED**
   - ✅ Message: "You hold enough tokens (≥80%) to reclaim this NFT"

### Step 6: Test from Vault Details Page
1. Go to Explorer (home page)
2. Click on **Vault 2 (Okay Bear)**
3. In "Your Position" card, you should see:
   - ❌ **"Reclaim NFT (Need ≥80%)" button is DISABLED**
4. Click on **Vault 1 (Degen Ape)**
5. In "Your Position" card, you should see:
   - ✅ **"Reclaim NFT" button is ENABLED**

---

## 🎨 Visual States

### When User Holds ≥80% (Eligible)
```
┌─────────────────────────────────────────┐
│  Your Share: 90.00% (green text)        │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ ✅ Eligible to Reclaim (green)  │  │
│  │ You hold enough tokens...       │  │
│  └─────────────────────────────────┘  │
│                                         │
│  [Cancel]  [Reclaim NFT] ← ENABLED     │
└─────────────────────────────────────────┘
```

### When User Holds <80% (Not Eligible)
```
┌─────────────────────────────────────────┐
│  Your Share: 50.00% (red text)          │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ ⚠️ Not Eligible Yet (yellow)    │  │
│  │ You need to hold at least 80%... │  │
│  └─────────────────────────────────┘  │
│                                         │
│  [Cancel]  [Reclaim NFT] ← DISABLED    │
└─────────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Code Flow
1. **User selects vault** → Component fetches mock balance
2. **Calculate percentage:** `balance / totalSupply`
3. **Check threshold:** `percentage >= 0.8`
4. **Set button state:** `disabled={!canReclaim}`
5. **Tailwind applies:** Gray out button when disabled

### Key Variables
```typescript
const RECLAIM_THRESHOLD = 0.8;           // 80% threshold
const userSharePercentage = 0.9;         // Example: 90%
const canReclaim = 0.9 >= 0.8;          // true
disabled={!true || false}                // disabled={false}
// Button is ENABLED ✅
```

### Mock Data Location
- **Vaults:** `/src/mocks/vaults.ts`
- **Balances:** `/src/hooks/use-user-balance.ts`
- **Logic:** `/src/components/fractionalization/reclaim-interface.tsx`

---

## ✅ Verification Checklist

- [x] Button reads mock data correctly
- [x] Calculates user share percentage accurately
- [x] Compares against 80% threshold
- [x] Uses Tailwind `disabled` prop
- [x] Shows visual feedback (green/yellow alerts)
- [x] Displays exact percentage
- [x] Works on both Reclaim page and Vault Details
- [x] Prevents form submission when <80%
- [x] Updates in real-time when vault selection changes

---

## 🚀 Ready to Test!

**Dev Server:** http://localhost:3000

**Test Flow:**
1. Connect wallet
2. Go to Reclaim page
3. Try all 3 vaults
4. Verify button state matches ownership percentage

**Expected Results:**
- Vault 1 (90%) → Button ENABLED ✅
- Vault 2 (50%) → Button DISABLED ❌
- Vault 3 (85%) → Button ENABLED ✅

All working as specified! 🎉
