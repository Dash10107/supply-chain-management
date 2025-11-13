# Quick Test Checklist - Walmart SCM System

## 🚀 Quick Start Testing

### Step 1: Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Step 2: Verify Setup
- ✅ Backend running on `http://localhost:3000`
- ✅ Frontend running on `http://localhost:5173`
- ✅ Database connected (check backend logs)

---

## 📋 5-Minute Smoke Test

### Test 1: Login (30 seconds)
1. Go to `http://localhost:5173/login`
2. Login: `admin@walmart-scms.com` / `password123`
3. ✅ Should see Dashboard

### Test 2: View Products (30 seconds)
1. Click "Products" in nav
2. ✅ Should see product list
3. Click on a product row
4. ✅ Should open edit modal

### Test 3: Create Sales Order (2 minutes)
1. Click "Sales Orders"
2. Click "Create Sales Order"
3. Fill customer info
4. Add 1-2 items
5. Click "Create Order"
6. ✅ Order created, status: confirmed

### Test 4: Create Shipment (1 minute)
1. Click "Shipments"
2. Click "Create Shipment"
3. Select the order you just created
4. ✅ Shipment created with tracking number

### Test 5: View Inventory (30 seconds)
1. Click "Inventory"
2. ✅ See inventory list
3. Filter by warehouse
4. ✅ List updates

---

## 🔄 Complete Flow Test (15 minutes)

### Flow: Order to Delivery to Return

#### 1. Create Sales Order (2 min)
- Navigate: Sales Orders → Create
- Customer: Test Customer
- Add 2 products, quantities: 5 each
- Create order
- ✅ Order number generated

#### 2. Create Shipment (1 min)
- Navigate: Shipments → Create
- Select the order
- ✅ Tracking number generated

#### 3. Update Shipment Status (2 min)
- Click "Update Status" on shipment
- Change to: Picked → Packed → In Transit → Delivered
- Add carrier info
- ✅ Status updates correctly

#### 4. Create Return (2 min)
- Navigate: Returns → Create
- Select delivered order
- Select items to return (partial return OK)
- Reason: Customer Request
- ✅ Return created

#### 5. Process Return (2 min)
- Click "View" on return
- Click "Approve"
- Select warehouse
- Click "Process Return"
- ✅ Inventory restored

---

## 🛠️ CRUD Tests (10 minutes)

### Products
- ✅ Create product
- ✅ Edit product (change price)
- ✅ Delete product
- ✅ CSV upload (if available)

### Suppliers
- ✅ Create supplier
- ✅ Edit supplier
- ✅ View supplier details

### Warehouses
- ✅ Create warehouse
- ✅ Edit warehouse
- ✅ View warehouse

### Users (Admin only)
- ✅ View users list
- ✅ Edit user role/status
- ✅ Delete user

---

## 🔍 What to Look For

### ✅ Success Indicators
- Green success toasts appear
- Data appears in tables immediately
- Modals close after save
- No console errors
- Smooth page transitions

### ❌ Error Indicators
- Red error toasts
- Console errors (F12 → Console)
- Blank pages
- Loading spinners that never stop
- Network errors in browser DevTools

---

## 🐛 Common Issues

### "Network Error" or "Failed to fetch"
- ✅ Check backend is running
- ✅ Check CORS settings
- ✅ Check API URL in frontend

### "Unauthorized" or 401
- ✅ Logout and login again
- ✅ Check JWT token in localStorage
- ✅ Verify user role permissions

### "Cannot read property X"
- ✅ Check browser console for full error
- ✅ Verify data structure matches
- ✅ Check API response format

### Database connection errors
- ✅ Check `.env` file
- ✅ Verify DATABASE_URL is correct
- ✅ Check Neon database is accessible

---

## 📊 Expected Results

### Dashboard Should Show:
- Total Products count
- Total Orders count
- Total Inventory Value
- Monthly Sales
- Charts (if implemented)

### Products Page Should Show:
- Product table with columns: SKU, Name, Price, Category, etc.
- "Add Product" button
- CSV Upload button
- Edit/Delete actions

### Sales Orders Should Show:
- Order number
- Customer name
- Status
- Total amount
- Order date
- Actions: View, Cancel

### Inventory Should Show:
- Product name
- Warehouse
- Quantity
- Available quantity
- Transfer button

---

## 🎯 Test Completion Criteria

### Minimum Viable Test:
- ✅ Can login
- ✅ Can view all pages
- ✅ Can create sales order
- ✅ Can create shipment
- ✅ Can view inventory

### Full Test:
- ✅ All CRUD operations work
- ✅ Complete order flow works
- ✅ Returns process correctly
- ✅ Inventory transfers work
- ✅ User management works (admin)
- ✅ No console errors
- ✅ All forms validate correctly

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

✅ Login: PASS / FAIL
✅ Products CRUD: PASS / FAIL
✅ Suppliers CRUD: PASS / FAIL
✅ Warehouses CRUD: PASS / FAIL
✅ Sales Orders: PASS / FAIL
✅ Shipments: PASS / FAIL
✅ Purchase Orders: PASS / FAIL
✅ Returns: PASS / FAIL
✅ Inventory Transfer: PASS / FAIL
✅ User Management: PASS / FAIL

Issues Found:
1. _______________________
2. _______________________
3. _______________________

Notes:
_______________________
```

---

## 🚨 If Something Breaks

1. **Check Browser Console** (F12)
   - Look for red errors
   - Check Network tab for failed requests

2. **Check Backend Logs**
   - Look for error messages
   - Check database connection

3. **Verify Environment**
   - `.env` file exists
   - Database URL is correct
   - Ports are not in use

4. **Restart Services**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Start again

5. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R)
   - Clear localStorage
   - Try incognito mode

---

## 💡 Pro Tips

- Use browser DevTools (F12) to monitor network requests
- Check the Network tab to see API calls
- Use React DevTools extension for React debugging
- Keep backend terminal visible to see errors
- Test with different user roles
- Try edge cases (empty forms, invalid data)

---

## 🎉 Success!

If all tests pass, your system is working end-to-end! 🚀

