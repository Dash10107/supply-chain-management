-- Trigger: Decrement inventory on sales order item creation
-- This trigger fires when a sales order item is inserted and decrements the inventory

CREATE OR REPLACE FUNCTION decrement_inventory_on_sale()
RETURNS TRIGGER AS $$
DECLARE
    v_warehouse_id UUID;
    v_current_quantity INTEGER;
BEGIN
    -- Get the allocated warehouse ID from the order item
    v_warehouse_id := NEW.allocated_warehouse_id;
    
    IF v_warehouse_id IS NOT NULL THEN
        -- Check current inventory
        SELECT quantity INTO v_current_quantity
        FROM inventory
        WHERE product_id = NEW.product_id
          AND warehouse_id = v_warehouse_id;
        
        -- Decrement inventory if available
        IF v_current_quantity >= NEW.quantity THEN
            UPDATE inventory
            SET quantity = quantity - NEW.quantity,
                reserved_quantity = GREATEST(0, reserved_quantity - NEW.quantity)
            WHERE product_id = NEW.product_id
              AND warehouse_id = v_warehouse_id;
        ELSE
            RAISE EXCEPTION 'Insufficient inventory: product_id=%, warehouse_id=%, requested=%, available=%',
                NEW.product_id, v_warehouse_id, NEW.quantity, v_current_quantity;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_inventory_on_sale
AFTER INSERT ON sales_order_items
FOR EACH ROW
EXECUTE FUNCTION decrement_inventory_on_sale();

-- Trigger: Increment inventory on purchase order receipt
-- This trigger fires when a purchase order item's received_quantity is updated

CREATE OR REPLACE FUNCTION increment_inventory_on_po_receipt()
RETURNS TRIGGER AS $$
DECLARE
    v_warehouse_id UUID;
    v_received_qty INTEGER;
BEGIN
    -- Only process if received quantity increased
    IF NEW.received_quantity > OLD.received_quantity THEN
        v_received_qty := NEW.received_quantity - OLD.received_quantity;
        
        -- Get warehouse from purchase order (would need to join, simplified here)
        -- Note: In practice, you'd pass warehouse_id when receiving
        -- This is a simplified version - actual implementation should handle warehouse assignment
        
        -- For now, we'll use a default warehouse or handle it in application logic
        -- This trigger is more of a template - actual implementation depends on your receive flow
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The purchase order receipt trigger is better handled in application logic
-- as it requires warehouse assignment which is done during the receive process

-- Trigger: Revert inventory on sales order cancellation or return
CREATE OR REPLACE FUNCTION revert_inventory_on_return()
RETURNS TRIGGER AS $$
BEGIN
    -- When a return is processed (status changes to 'processed')
    IF NEW.status = 'processed' AND OLD.status != 'processed' THEN
        -- Increment inventory for returned items
        -- This would need to join with return_items and sales_order_items
        -- For simplicity, this is handled in application logic
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

