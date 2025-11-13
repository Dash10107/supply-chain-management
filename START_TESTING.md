# 🚀 Start Testing Now!

## Quick Commands

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
**Expected Output**: 
```
Server running on port 3000
Database connected successfully
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
**Expected Output**:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🎯 First 5 Things to Test

### 1. Login (30 seconds)
- URL: http://localhost:5173/login
- Email: `admin@walmart-scms.com`
- Password: `password123`
- ✅ Should see Dashboard

### 2. View Products (30 seconds)
- Click "Products" in navigation
- ✅ Should see list of products
- ✅ Can click on product to view/edit

### 3. Create Sales Order (2 minutes)
- Click "Sales Orders" → "Create Sales Order"
- Fill customer info
- Add 1-2 products
- Click "Create Order"
- ✅ Order created successfully

### 4. Create Shipment (1 minute)
- Click "Shipments" → "Create Shipment"
- Select the order you just created
- ✅ Shipment created with tracking number

### 5. View Inventory (30 seconds)
- Click "Inventory"
- ✅ See inventory levels
- ✅ Can filter by warehouse

---

## 📊 What You Should See

### Dashboard
- Statistics cards (Total Products, Orders, etc.)
- Charts (if implemented)
- Recent activity

### Products Page
- Table with columns: SKU, Name, Price, Category, Status
- "Add Product" button
- Edit/Delete actions

### Sales Orders Page
- Table with: Order Number, Customer, Status, Total, Date
- "Create Sales Order" button
- View/Cancel actions

### Inventory Page
- Table with: Product, Warehouse, Quantity, Available
- Warehouse filter dropdown
- Transfer button

---

## ✅ Success Indicators

- ✅ Green success toasts appear
- ✅ Data appears in tables
- ✅ Modals open and close smoothly
- ✅ No red errors in browser console
- ✅ Pages load quickly (< 2 seconds)

## ❌ Error Indicators

- ❌ Red error toasts
- ❌ Console errors (press F12)
- ❌ Blank pages
- ❌ Loading spinners that never stop
- ❌ "Network Error" messages

---

## 🐛 If You See Errors

### "Cannot connect to database"
1. Check backend terminal for errors
2. Verify `.env` file has `DATABASE_URL`
3. Check Neon database is accessible

### "Unauthorized" or 401
1. Logout and login again
2. Check if token expired
3. Clear browser localStorage

### "Failed to fetch"
1. Check backend is running (port 3000)
2. Check CORS settings
3. Check network tab in DevTools

### Page not loading
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Check console for errors

---

## 📝 Test Checklist

Quick checklist - check as you go:

```
[ ] Can login
[ ] Can view Dashboard
[ ] Can view Products
[ ] Can create Product
[ ] Can edit Product
[ ] Can view Suppliers
[ ] Can create Supplier
[ ] Can view Warehouses
[ ] Can create Warehouse
[ ] Can view Inventory
[ ] Can create Sales Order
[ ] Can view Sales Order
[ ] Can create Shipment
[ ] Can update Shipment status
[ ] Can create Purchase Order
[ ] Can receive Purchase Order
[ ] Can create Return
[ ] Can approve Return
[ ] Can process Return
[ ] Can transfer Inventory
```

---

## 🎬 Complete Test Flow (15 minutes)

### Step 1: Setup (2 min)
1. Create a test product
2. Create a test supplier
3. Create a test warehouse

### Step 2: Stock Inventory (3 min)
1. Create purchase order
2. Receive purchase order
3. Verify inventory increased

### Step 3: Create Order (3 min)
1. Create sales order
2. Add products
3. Verify order created

### Step 4: Ship Order (2 min)
1. Create shipment
2. Update status to delivered
3. Verify status updated

### Step 5: Handle Return (3 min)
1. Create return
2. Approve return
3. Process return
4. Verify inventory restored

### Step 6: Transfer (2 min)
1. Transfer inventory between warehouses
2. Verify quantities updated

---

## 💡 Pro Tips

1. **Keep DevTools Open** (F12)
   - Monitor Network tab
   - Check Console for errors
   - Use React DevTools extension

2. **Test Different Roles**
   - Admin: Full access
   - Warehouse Manager: Limited access
   - Sales: Order access only

3. **Test Edge Cases**
   - Empty forms
   - Invalid data
   - Large numbers
   - Special characters

4. **Verify Data Persistence**
   - Refresh page
   - Check data still there
   - Verify in database

---

## 🎉 You're Ready!

Start with the Quick Commands above, then follow the test flow.

**Remember**: 
- Backend must be running first
- Database must be connected
- Check console for any errors

Happy Testing! 🚀

