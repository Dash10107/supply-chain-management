# Test Scripts - Step by Step

## Prerequisites Check

```bash
# Check if backend dependencies are installed
cd backend
npm list --depth=0

# Check if frontend dependencies are installed  
cd ../frontend
npm list --depth=0

# Check database connection
cd ../backend
npm run seed  # This will test DB connection
```

---

## Manual Test Scripts

### Script 1: Authentication Flow
```
1. Open browser: http://localhost:5173
2. Should redirect to /login
3. Enter: admin@walmart-scms.com / password123
4. Click "Sign in"
5. Expected: Redirect to Dashboard
6. Check: Navigation menu visible
7. Check: User name shown in header
```

### Script 2: Product Management
```
1. Navigate to /products
2. Click "Add Product"
3. Fill form:
   - SKU: PROD-TEST-001
   - Name: Test Product
   - Price: 19.99
   - Category: Test
   - Reorder Threshold: 10
   - Reorder Quantity: 50
4. Click "Create"
5. Expected: Product appears in table
6. Click product row
7. Change price to 24.99
8. Click "Update"
9. Expected: Price updated
10. Click "Delete"
11. Confirm deletion
12. Expected: Product removed
```

### Script 3: Sales Order Creation
```
1. Navigate to /sales-orders
2. Click "Create Sales Order"
3. Fill customer info:
   - Name: Test Customer
   - Email: test@customer.com
4. Click "+ Add Item"
5. Select product from dropdown
6. Enter quantity: 5
7. Unit price auto-fills (or enter manually)
8. Click "Create Order"
9. Expected: 
   - Order created
   - Order number shown
   - Status: confirmed
   - Inventory reserved
```

### Script 4: Shipment Creation & Tracking
```
1. Navigate to /shipments
2. Click "Create Shipment"
3. Select a confirmed sales order
4. Click "Create Shipment"
5. Expected: Shipment created with tracking number
6. Click "Update Status"
7. Change status: pending → picked
8. Enter carrier: "FedEx"
9. Enter tracking: "1234567890"
10. Click "Update"
11. Expected: Status updated
12. Repeat for: packed, in_transit, delivered
```

### Script 5: Purchase Order & Receiving
```
1. Navigate to /purchase-orders
2. Click "Create Purchase Order"
3. Select supplier
4. Add items:
   - Product: Select one
   - Quantity: 100
   - Unit Price: 10.00
5. Click "Create Order"
6. Expected: PO created
7. Click "Receive" on the PO
8. Select warehouse
9. Enter received quantities
10. Enter batch number (optional)
11. Click "Receive Order"
12. Expected: 
    - Inventory increased
    - PO status updated
```

### Script 6: Return Processing
```
1. Navigate to /returns
2. Click "Create Return"
3. Select a delivered sales order
4. Select reason: "defective"
5. Adjust return quantities
6. Click "Create Return"
7. Expected: Return created
8. Click "Approve"
9. Expected: Status: approved
10. Click "View"
11. Select warehouse
12. Click "Process Return"
13. Expected: 
    - Inventory restored
    - Status: processed
```

### Script 7: Inventory Transfer
```
1. Navigate to /inventory
2. Note: Available quantity for a product
3. Click "Transfer" on that product
4. Select destination warehouse
5. Enter quantity (less than available)
6. Click "Transfer"
7. Expected: 
    - Source quantity decreased
    - Destination quantity increased
    - Success message
```

---

## Automated Test Checklist

Copy this and check off as you test:

```
AUTHENTICATION
[ ] Can login with admin credentials
[ ] Can logout
[ ] Redirects to login when not authenticated
[ ] Signup page works

PRODUCTS
[ ] View products list
[ ] Create new product
[ ] Edit existing product
[ ] Delete product
[ ] CSV upload works

SUPPLIERS
[ ] View suppliers list
[ ] Create new supplier
[ ] Edit supplier
[ ] View supplier details

WAREHOUSES
[ ] View warehouses list
[ ] Create new warehouse
[ ] Edit warehouse
[ ] View warehouse details

SALES ORDERS
[ ] View sales orders list
[ ] Create new sales order
[ ] View order details
[ ] Cancel order
[ ] Order status updates correctly

SHIPMENTS
[ ] View shipments list
[ ] Create shipment from order
[ ] Update shipment status
[ ] Add carrier information

PURCHASE ORDERS
[ ] View purchase orders list
[ ] Create purchase order
[ ] View PO details
[ ] Receive purchase order
[ ] Inventory updates on receive

RETURNS
[ ] View returns list
[ ] Create return
[ ] Approve return
[ ] Process return
[ ] Inventory restored on process

INVENTORY
[ ] View inventory list
[ ] Filter by warehouse
[ ] Transfer inventory
[ ] View available quantities

USERS (Admin)
[ ] View users list
[ ] Edit user
[ ] Change user role
[ ] Change user status

DASHBOARD
[ ] Statistics display correctly
[ ] Charts render
[ ] Data is current

ANALYTICS
[ ] Page loads
[ ] Charts display
[ ] Data is accurate
```

---

## Error Testing

### Test Invalid Inputs
```
1. Try creating product with empty SKU
2. Try negative quantity
3. Try invalid email format
4. Try creating order with no items
5. Try transferring more than available
6. Expected: Validation errors shown
```

### Test Authorization
```
1. Login as non-admin
2. Try accessing /users page
3. Expected: Not accessible or 403 error
4. Try editing product without permission
5. Expected: Error or no access
```

### Test Edge Cases
```
1. Create order with zero quantity
2. Create order with very large quantity
3. Transfer all inventory
4. Cancel already cancelled order
5. Process return without approval
6. Expected: Appropriate error messages
```

---

## Performance Testing

### Load Test
```
1. Create 20 products
2. Create 10 sales orders
3. Create 5 purchase orders
4. Check page load times
5. Expected: < 2 seconds per page
```

### Concurrent Operations
```
1. Open 3 browser tabs
2. Create orders in each tab
3. Check for conflicts
4. Expected: All orders created successfully
```

---

## Browser Console Checks

Open DevTools (F12) and check:

```
✅ No red errors in Console tab
✅ Network requests return 200/201 status
✅ No CORS errors
✅ No 401/403 errors (unless testing auth)
✅ React warnings are minimal
✅ No memory leaks (check Performance tab)
```

---

## Database Verification

After testing, verify in database:

```sql
-- Check products created
SELECT COUNT(*) FROM products;

-- Check orders created
SELECT COUNT(*) FROM sales_orders;
SELECT COUNT(*) FROM purchase_orders;

-- Check inventory levels
SELECT product_id, warehouse_id, quantity FROM inventory;

-- Check shipments
SELECT COUNT(*) FROM shipments;

-- Check returns
SELECT COUNT(*) FROM returns;
```

---

## Success Criteria

### Minimum Success:
- ✅ Can login
- ✅ Can navigate all pages
- ✅ Can create/view orders
- ✅ No critical errors

### Full Success:
- ✅ All CRUD operations work
- ✅ Complete workflows function
- ✅ Data persists correctly
- ✅ No console errors
- ✅ Good user experience
- ✅ Proper error handling

