# Walmart SCM System - Complete Testing Guide

## Prerequisites

1. **Database Connection**: Ensure your Neon PostgreSQL database is connected
2. **Backend Running**: `cd backend && npm run dev`
3. **Frontend Running**: `cd frontend && npm run dev`
4. **Database Seeded**: Run `cd backend && npm run seed` if not already done

## Test Flow Overview

### Phase 1: Authentication & User Management
### Phase 2: Master Data (Products, Suppliers, Warehouses)
### Phase 3: Inventory Management
### Phase 4: Sales Orders & Shipments
### Phase 5: Purchase Orders & Receiving
### Phase 6: Returns Processing
### Phase 7: Inventory Transfers
### Phase 8: Analytics & Reports

---

## Phase 1: Authentication & User Management

### 1.1 Test Signup
1. Navigate to `http://localhost:5173/signup`
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: testuser@example.com
   - Role: Select "WAREHOUSE_MANAGER" or "SALES"
   - Password: password123
   - Confirm Password: password123
3. Click "Sign Up"
4. **Expected**: Success message, redirect to login

### 1.2 Test Login
1. Navigate to `http://localhost:5173/login`
2. Use admin credentials:
   - Email: `admin@walmart-scms.com`
   - Password: `password123`
3. Click "Sign in"
4. **Expected**: Redirect to Dashboard, see navigation menu

### 1.3 Test User Management (Admin Only)
1. Navigate to `/users` (only visible to admin)
2. **Expected**: See list of users (admin, warehouse_manager, testuser)
3. Click "Edit" on any user
4. Change role or status
5. Click "Update"
6. **Expected**: User updated successfully

---

## Phase 2: Master Data Management

### 2.1 Test Products CRUD

#### Create Product
1. Navigate to `/products`
2. Click "Add Product"
3. Fill in:
   - SKU: `TEST-001`
   - Name: `Test Product`
   - Description: `This is a test product`
   - Price: `29.99`
   - Cost: `15.00`
   - Category: `Electronics`
   - Brand: `TestBrand`
   - Reorder Threshold: `10`
   - Reorder Quantity: `50`
   - Unit: `piece`
4. Click "Create"
5. **Expected**: Product appears in table

#### Edit Product
1. Click on a product row or "Edit" button
2. Change price to `39.99`
3. Click "Update"
4. **Expected**: Price updated in table

#### Delete Product
1. Click "Delete" on a test product
2. Confirm deletion
3. **Expected**: Product removed from table

### 2.2 Test Suppliers CRUD

#### Create Supplier
1. Navigate to `/suppliers`
2. Click "Add Supplier"
3. Fill in:
   - Supplier Code: `SUP-001`
   - Supplier Name: `Test Supplier Inc.`
   - Address: `123 Test Street`
   - City: `New York`
   - State: `NY`
   - Zip Code: `10001`
   - Country: `USA`
   - Contact Name: `John Doe`
   - Contact Email: `john@testsupplier.com`
   - Contact Phone: `555-1234`
   - Lead Time (Days): `7`
   - Status: `active`
4. Click "Create"
5. **Expected**: Supplier appears in table

#### Edit Supplier
1. Click on supplier row
2. Change status to `inactive`
3. Click "Update"
4. **Expected**: Status updated

### 2.3 Test Warehouses CRUD

#### Create Warehouse
1. Navigate to `/warehouses`
2. Click "Add Warehouse"
3. Fill in:
   - Warehouse Code: `WH-001`
   - Warehouse Name: `Main Warehouse`
   - Address: `456 Warehouse Ave`
   - City: `Chicago`
   - State: `IL`
   - Zip Code: `60601`
   - Country: `USA`
   - Status: `active`
4. Click "Create"
5. **Expected**: Warehouse appears in table

---

## Phase 3: Inventory Management

### 3.1 View Inventory
1. Navigate to `/inventory`
2. **Expected**: See inventory list with products and quantities
3. Filter by warehouse using dropdown
4. **Expected**: List filtered by selected warehouse

### 3.2 Test Inventory Transfer
1. Ensure you have inventory in at least one warehouse
2. Click "Transfer" on any inventory item
3. Select destination warehouse
4. Enter quantity (less than available)
5. Click "Transfer"
6. **Expected**: 
   - Source warehouse quantity decreased
   - Destination warehouse quantity increased
   - Success message shown

---

## Phase 4: Sales Orders & Shipments

### 4.1 Create Sales Order
1. Navigate to `/sales-orders`
2. Click "Create Sales Order"
3. Fill in:
   - Customer Name: `John Customer`
   - Customer Email: `john@customer.com`
   - Customer Phone: `555-5678`
   - Shipping Address: `789 Customer St, City, State`
   - Notes: `Rush order`
4. Click "+ Add Item"
5. Select a product
6. Enter quantity: `5`
7. Unit price should auto-fill (or enter manually)
8. Add more items if needed
9. Click "Create Order"
10. **Expected**: 
    - Order created with order number
    - Status: `confirmed`
    - Inventory reserved for items

### 4.2 View Sales Order
1. Click "View" on any sales order
2. **Expected**: See order details, items, total amount

### 4.3 Cancel Sales Order
1. Find a `pending` or `confirmed` order
2. Click "Cancel"
3. Confirm cancellation
4. **Expected**: 
    - Order status: `cancelled`
    - Reserved inventory released

### 4.4 Create Shipment
1. Navigate to `/shipments`
2. Click "Create Shipment"
3. Select a `confirmed` sales order
4. Click "Create Shipment"
5. **Expected**: 
    - Shipment created with tracking number
    - Status: `pending`

### 4.5 Update Shipment Status
1. Click "Update Status" on a shipment
2. Change status to `picked`
3. Enter carrier: `FedEx`
4. Enter carrier tracking: `1234567890`
5. Click "Update"
6. **Expected**: Status updated, carrier info saved
7. Repeat for: `packed`, `in_transit`, `delivered`

---

## Phase 5: Purchase Orders & Receiving

### 5.1 Create Purchase Order
1. Navigate to `/purchase-orders`
2. Click "Create Purchase Order"
3. Fill in:
   - Supplier: Select a supplier
   - Expected Delivery Date: Future date
   - Notes: `Urgent order`
4. Click "+ Add Item"
5. Select a product
6. Enter quantity: `100`
7. Enter unit price: `10.00`
8. Add more items if needed
9. Click "Create Order"
10. **Expected**: 
    - PO created with PO number
    - Status: `ordered`

### 5.2 View Purchase Order
1. Click "View" on any purchase order
2. **Expected**: See PO details, items, total amount

### 5.3 Receive Purchase Order
1. Find an `ordered` or `partially_received` purchase order
2. Click "Receive"
3. Select warehouse
4. For each item:
   - Enter received quantity (≤ ordered quantity)
   - Enter batch number (optional): `BATCH-001`
   - Enter expiry date (optional): Future date
5. Click "Receive Order"
6. **Expected**: 
    - Inventory increased in selected warehouse
    - PO status updated
    - Success message shown

---

## Phase 6: Returns Processing

### 6.1 Create Return
1. Navigate to `/returns`
2. Click "Create Return"
3. Select a `delivered` sales order
4. Select reason: `defective`
5. Enter description: `Product arrived damaged`
6. Items from order will auto-populate
7. Adjust quantities for items to return (≤ ordered quantity)
8. Click "Create Return"
9. **Expected**: 
    - Return created with return number
    - Status: `pending`
    - Refund amount calculated

### 6.2 Approve Return
1. Find a `pending` return
2. Click "Approve"
3. Confirm approval
4. **Expected**: Status changed to `approved`

### 6.3 Process Return
1. Click "View" on an `approved` return
2. In the "Process Return" section:
   - Select warehouse to receive returned items
   - Click "Process Return"
3. **Expected**: 
    - Inventory restored to selected warehouse
    - Return status: `processed`
    - Success message shown

---

## Phase 7: Analytics & Dashboard

### 7.1 View Dashboard
1. Navigate to `/` (Dashboard)
2. **Expected**: See:
   - Key statistics (Total Products, Orders, etc.)
   - Charts showing trends
   - Recent activity

### 7.2 View Analytics
1. Navigate to `/analytics`
2. **Expected**: See detailed analytics:
   - Sales trends
   - Inventory levels
   - Order statistics
   - Revenue charts

---

## Common Issues & Troubleshooting

### Issue: "Cannot connect to database"
**Solution**: 
- Check `.env` file has correct `DATABASE_URL`
- Verify Neon database is running
- Check network connection

### Issue: "Unauthorized" errors
**Solution**: 
- Logout and login again
- Check user role has required permissions
- Verify JWT token is valid

### Issue: "Product not found" when creating order
**Solution**: 
- Ensure products exist in database
- Check product is active
- Verify product has inventory

### Issue: "Insufficient inventory"
**Solution**: 
- Create purchase orders and receive them first
- Check inventory levels in `/inventory`
- Transfer inventory between warehouses if needed

### Issue: "Order must be confirmed before creating shipment"
**Solution**: 
- Sales orders are auto-confirmed when created
- If status is `pending`, check order creation was successful
- Verify order has items

---

## Test Data Checklist

Before testing, ensure you have:
- ✅ At least 3 products
- ✅ At least 2 suppliers
- ✅ At least 2 warehouses
- ✅ Inventory in at least one warehouse
- ✅ Admin user account
- ✅ At least one other user account

---

## End-to-End Test Scenario

### Complete Order Fulfillment Flow:
1. **Setup**: Create products, suppliers, warehouses
2. **Inventory**: Receive purchase order to stock inventory
3. **Sales**: Create sales order (inventory auto-allocated)
4. **Shipping**: Create shipment from sales order
5. **Tracking**: Update shipment status through delivery
6. **Return**: Create return for delivered order
7. **Processing**: Approve and process return (inventory restored)

### Complete Procurement Flow:
1. **Order**: Create purchase order with supplier
2. **Receive**: Receive goods into warehouse
3. **Inventory**: Verify inventory increased
4. **Transfer**: Move inventory to another warehouse
5. **Usage**: Use inventory in sales order

---

## Performance Testing

1. **Load Test**: Create 50+ products, 20+ orders
2. **Concurrent Users**: Test with multiple browser tabs
3. **Large Data**: Import CSV with 100+ products
4. **Search/Filter**: Test filtering with large datasets

---

## Security Testing

1. **Authorization**: Try accessing admin pages as non-admin
2. **Authentication**: Test expired tokens
3. **Input Validation**: Try invalid data in forms
4. **SQL Injection**: Test with special characters in inputs

---

## Browser Compatibility

Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

---

## Notes

- All timestamps are in UTC
- Currency is in USD
- Quantities must be positive integers
- Prices support 2 decimal places
- Dates use ISO format (YYYY-MM-DD)

