-- View: Stock levels across all warehouses
CREATE OR REPLACE VIEW vw_stock_levels AS
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.category,
    p.reorder_threshold,
    w.id AS warehouse_id,
    w.code AS warehouse_code,
    w.name AS warehouse_name,
    COALESCE(i.quantity, 0) AS quantity,
    COALESCE(i.reserved_quantity, 0) AS reserved_quantity,
    COALESCE(i.quantity, 0) - COALESCE(i.reserved_quantity, 0) AS available_quantity,
    i.expiry_date,
    i.batch_number
FROM products p
CROSS JOIN warehouses w
LEFT JOIN inventory i ON i.product_id = p.id AND i.warehouse_id = w.id
WHERE p.is_active = true
ORDER BY p.sku, w.code;

-- View: Reorder list (products below reorder threshold)
CREATE OR REPLACE VIEW vw_reorder_list AS
SELECT 
    p.id AS product_id,
    p.sku,
    p.name AS product_name,
    p.category,
    p.reorder_threshold,
    p.reorder_quantity,
    COALESCE(SUM(i.quantity), 0) AS total_stock,
    COALESCE(SUM(i.reserved_quantity), 0) AS total_reserved,
    COALESCE(SUM(i.quantity), 0) - COALESCE(SUM(i.reserved_quantity), 0) AS total_available,
    CASE 
        WHEN COALESCE(SUM(i.quantity), 0) <= p.reorder_threshold THEN true
        ELSE false
    END AS needs_reorder
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id
WHERE p.is_active = true
GROUP BY p.id, p.sku, p.name, p.category, p.reorder_threshold, p.reorder_quantity
HAVING COALESCE(SUM(i.quantity), 0) <= p.reorder_threshold
ORDER BY total_available ASC, p.sku;

-- View: Warehouse stock summary
CREATE OR REPLACE VIEW vw_warehouse_stock_summary AS
SELECT 
    w.id AS warehouse_id,
    w.code AS warehouse_code,
    w.name AS warehouse_name,
    COUNT(DISTINCT i.product_id) AS product_count,
    SUM(i.quantity) AS total_quantity,
    SUM(i.reserved_quantity) AS total_reserved,
    SUM(i.quantity) - SUM(i.reserved_quantity) AS total_available,
    COUNT(CASE WHEN i.quantity <= p.reorder_threshold THEN 1 END) AS low_stock_items
FROM warehouses w
LEFT JOIN inventory i ON i.warehouse_id = w.id
LEFT JOIN products p ON p.id = i.product_id
WHERE w.status = 'active'
GROUP BY w.id, w.code, w.name
ORDER BY w.code;

