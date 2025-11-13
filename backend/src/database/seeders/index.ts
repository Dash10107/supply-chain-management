import { AppDataSource } from '../../config/data-source';
import { Role, RoleName } from '../../schemas/Role';
import { User, UserStatus } from '../../schemas/User';
import { Product } from '../../schemas/Product';
import { Supplier } from '../../schemas/Supplier';
import { Warehouse } from '../../schemas/Warehouse';
import { Inventory } from '../../schemas/Inventory';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding');

    const roleRepository = AppDataSource.getRepository(Role);
    const userRepository = AppDataSource.getRepository(User);
    const productRepository = AppDataSource.getRepository(Product);
    const supplierRepository = AppDataSource.getRepository(Supplier);
    const warehouseRepository = AppDataSource.getRepository(Warehouse);
    const inventoryRepository = AppDataSource.getRepository(Inventory);

    // Seed Roles
    console.log('Seeding roles...');
    const roles = [
      { name: RoleName.ADMIN, description: 'System Administrator' },
      { name: RoleName.WAREHOUSE_MANAGER, description: 'Warehouse Manager' },
      { name: RoleName.PROCUREMENT, description: 'Procurement Officer' },
      { name: RoleName.SALES, description: 'Sales Representative' },
      { name: RoleName.LOGISTICS, description: 'Logistics Coordinator' },
    ];

    const savedRoles: Role[] = [];
    for (const roleData of roles) {
      let role = await roleRepository.findOne({ where: { name: roleData.name } });
      if (!role) {
        role = roleRepository.create(roleData);
        role = await roleRepository.save(role);
      }
      savedRoles.push(role);
    }

    // Seed Users
    console.log('Seeding users...');
    const adminRole = savedRoles.find((r) => r.name === RoleName.ADMIN)!;
    const warehouseManagerRole = savedRoles.find(
      (r) => r.name === RoleName.WAREHOUSE_MANAGER
    )!;

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        email: 'admin@walmart-scms.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole.id,
        status: UserStatus.ACTIVE as UserStatus,
      },
      {
        email: 'warehouse@walmart-scms.com',
        password: hashedPassword,
        firstName: 'Warehouse',
        lastName: 'Manager',
        roleId: warehouseManagerRole.id,
        status: UserStatus.ACTIVE as UserStatus,
      },
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: { email: userData.email },
      });
      if (!existingUser) {
        const user = userRepository.create({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roleId: userData.roleId,
          status: userData.status,
        });
        await userRepository.save(user);
        console.log(`Created user: ${userData.email}`);
      }
    }

    // Seed Products
    console.log('Seeding products...');
    const products = [
      {
        sku: 'PROD-001',
        name: 'Laptop Computer',
        description: 'High-performance laptop',
        price: 999.99,
        cost: 650.0,
        category: 'Electronics',
        brand: 'TechBrand',
        reorderThreshold: 10,
        reorderQuantity: 50,
        unit: 'piece',
        hasExpiry: false,
        isActive: true,
      },
      {
        sku: 'PROD-002',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 29.99,
        cost: 12.0,
        category: 'Electronics',
        brand: 'TechBrand',
        reorderThreshold: 20,
        reorderQuantity: 100,
        unit: 'piece',
        hasExpiry: false,
        isActive: true,
      },
      {
        sku: 'PROD-003',
        name: 'Office Chair',
        description: 'Comfortable office chair',
        price: 199.99,
        cost: 120.0,
        category: 'Furniture',
        brand: 'ComfortSeat',
        reorderThreshold: 5,
        reorderQuantity: 25,
        unit: 'piece',
        hasExpiry: false,
        isActive: true,
      },
      {
        sku: 'PROD-004',
        name: 'Coffee Beans',
        description: 'Premium coffee beans',
        price: 24.99,
        cost: 15.0,
        category: 'Food & Beverage',
        brand: 'CoffeeCo',
        reorderThreshold: 15,
        reorderQuantity: 75,
        unit: 'bag',
        hasExpiry: true,
        isActive: true,
      },
      {
        sku: 'PROD-005',
        name: 'Notebook Set',
        description: 'Set of 5 notebooks',
        price: 12.99,
        cost: 6.0,
        category: 'Office Supplies',
        brand: 'WriteWell',
        reorderThreshold: 30,
        reorderQuantity: 150,
        unit: 'set',
        hasExpiry: false,
        isActive: true,
      },
    ];

    const savedProducts: Product[] = [];
    for (const productData of products) {
      let product = await productRepository.findOne({
        where: { sku: productData.sku },
      });
      if (!product) {
        product = productRepository.create(productData);
        product = await productRepository.save(product);
      }
      savedProducts.push(product);
    }

    // Seed Suppliers
    console.log('Seeding suppliers...');
    const suppliers = [
      {
        code: 'SUP-001',
        name: 'Global Electronics Inc.',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
        contactName: 'John Smith',
        contactEmail: 'john@globalelectronics.com',
        contactPhone: '+1-555-0101',
        status: 'active',
        leadTimeDays: 7,
      },
      {
        code: 'SUP-002',
        name: 'Furniture World Ltd.',
        address: '456 Furniture Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
        contactName: 'Jane Doe',
        contactEmail: 'jane@furnitureworld.com',
        contactPhone: '+1-555-0102',
        status: 'active',
        leadTimeDays: 14,
      },
      {
        code: 'SUP-003',
        name: 'Food Distributors Co.',
        address: '789 Food Boulevard',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        contactName: 'Bob Johnson',
        contactEmail: 'bob@fooddist.com',
        contactPhone: '+1-555-0103',
        status: 'active',
        leadTimeDays: 5,
      },
    ];

    const savedSuppliers: Supplier[] = [];
    for (const supplierData of suppliers) {
      let supplier = await supplierRepository.findOne({
        where: { code: supplierData.code },
      });
      if (!supplier) {
        supplier = supplierRepository.create(supplierData);
        supplier = await supplierRepository.save(supplier);
      }
      savedSuppliers.push(supplier);
    }

    // Seed Warehouses
    console.log('Seeding warehouses...');
    const warehouses = [
      {
        code: 'WH-001',
        name: 'Main Distribution Center',
        address: '1000 Warehouse Road',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        country: 'USA',
        latitude: 32.7767,
        longitude: -96.797,
        status: 'active',
      },
      {
        code: 'WH-002',
        name: 'East Coast Warehouse',
        address: '2000 Storage Street',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30301',
        country: 'USA',
        latitude: 33.749,
        longitude: -84.388,
        status: 'active',
      },
      {
        code: 'WH-003',
        name: 'West Coast Warehouse',
        address: '3000 Logistics Lane',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        status: 'active',
      },
    ];

    const savedWarehouses: Warehouse[] = [];
    for (const warehouseData of warehouses) {
      let warehouse = await warehouseRepository.findOne({
        where: { code: warehouseData.code },
      });
      if (!warehouse) {
        warehouse = warehouseRepository.create(warehouseData);
        warehouse = await warehouseRepository.save(warehouse);
      }
      savedWarehouses.push(warehouse);
    }

    // Seed Inventory
    console.log('Seeding inventory...');
    for (const product of savedProducts) {
      for (const warehouse of savedWarehouses) {
        const existingInventory = await inventoryRepository.findOne({
          where: {
            productId: product.id,
            warehouseId: warehouse.id,
          },
        });

        if (!existingInventory) {
          const quantity = Math.floor(Math.random() * 100) + 20; // Random quantity between 20-120
          const inventory = inventoryRepository.create({
            productId: product.id,
            warehouseId: warehouse.id,
            quantity,
            reservedQuantity: 0,
            expiryDate: product.hasExpiry
              ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
              : undefined,
            batchNumber: `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          });
          await inventoryRepository.save(inventory);
        }
      }
    }

    console.log('Seeding completed successfully!');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

