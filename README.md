# Walmart-like Supply Chain Management System (SCM)

A comprehensive full-stack supply chain management system built with TypeScript, Express, TypeORM, PostgreSQL, React, and Tailwind CSS.

## Features

- **User Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Warehouse Manager, Procurement, Sales, Logistics)
- **Product Management**: CRUD operations for products with SKU, pricing, categories, and reorder thresholds
- **Inventory Management**: Multi-warehouse inventory tracking with allocation algorithms
- **Order Processing**: Sales orders and purchase orders with automated inventory updates
- **Shipment Tracking**: Full shipment lifecycle management
- **Returns Processing**: Return handling with inventory reconciliation
- **Supplier Management**: Supplier information and purchase order tracking
- **Analytics Dashboard**: Sales analytics, top products, and low stock alerts
- **Database Views & Triggers**: Automated inventory updates via PostgreSQL triggers

## Tech Stack

### Backend
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **TypeORM** - ORM with PostgreSQL
- **JWT** - Authentication
- **class-validator** - DTO validation
- **Jest** - Testing framework

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Router** - Routing
- **Recharts** - Charts

## Project Structure

```
walmart-scms/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & app config
│   │   ├── controllers/      # Request handlers
│   │   ├── dto/              # Data transfer objects
│   │   ├── entities/         # TypeORM entities
│   │   ├── middlewares/      # Auth, error handling, validation
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── database/
│   │   │   ├── migrations/   # Database migrations
│   │   │   ├── seeders/      # Seed data
│   │   │   ├── triggers/      # PostgreSQL triggers
│   │   │   └── views/        # Database views
│   │   └── index.ts          # Entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   └── main.tsx          # Entry point
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml        # Docker orchestration
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd walmart-scms
```

2. Start all services:
```bash
docker-compose up -d
```

3. Seed the database:
```bash
docker-compose exec backend npm run seed
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=walmart_scms
JWT_SECRET=your-secret-key
```

5. Start PostgreSQL and create database:
```sql
CREATE DATABASE walmart_scms;
```

6. Run migrations (if any):
```bash
npm run migration:run
```

7. Seed the database:
```bash
npm run seed
```

8. Start the backend:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Default Credentials

After seeding, you can login with:

- **Admin**: `admin@walmart-scms.com` / `password123`
- **Warehouse Manager**: `warehouse@walmart-scms.com` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/profile` - Get current user profile

### Products
- `GET /api/products` - List products (paginated)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin, Procurement)
- `PATCH /api/products/:id` - Update product (Admin, Procurement)
- `DELETE /api/products/:id` - Delete product (Admin)

### Inventory
- `GET /api/inventory` - List inventory (with filters)
- `GET /api/inventory/:id` - Get inventory details

### Orders
- `GET /api/sales-orders` - List sales orders
- `POST /api/sales-orders` - Create sales order
- `GET /api/sales-orders/:id` - Get sales order details
- `PATCH /api/sales-orders/:id/cancel` - Cancel order
- `GET /api/sales-orders/purchase` - List purchase orders
- `POST /api/sales-orders/purchase` - Create purchase order
- `POST /api/purchase-orders/:id/receive` - Receive purchase order

### Shipments
- `GET /api/shipments` - List shipments
- `POST /api/shipments` - Create shipment
- `PATCH /api/shipments/:id/status` - Update shipment status

### Returns
- `GET /api/returns` - List returns
- `POST /api/returns` - Create return
- `PATCH /api/returns/:id/approve` - Approve return
- `PATCH /api/returns/:id/process` - Process return

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/sales` - Sales by period
- `GET /api/analytics/top-products` - Top selling products
- `GET /api/analytics/low-stock` - Low stock products

## Database Schema

### Key Entities
- **User** - System users with roles
- **Role** - User roles (admin, warehouse_manager, procurement, sales, logistics)
- **Product** - Products catalog
- **Supplier** - Supplier information
- **Warehouse** - Warehouse locations
- **Inventory** - Product stock per warehouse
- **SalesOrder** - Customer orders
- **PurchaseOrder** - Supplier orders
- **Shipment** - Order shipments
- **Return** - Product returns

### Database Views
- `vw_stock_levels` - Stock levels across warehouses
- `vw_reorder_list` - Products below reorder threshold
- `vw_warehouse_stock_summary` - Warehouse stock summaries

### Triggers
- Inventory decrement on sales order creation
- Inventory increment on purchase order receipt
- Inventory reversion on returns

## Business Logic

### Inventory Allocation
- Prefers nearest warehouse (by coordinates if available)
- For products with expiry, prioritizes earliest expiry (FIFO)
- Falls back to highest available quantity
- Supports multi-warehouse allocation if single warehouse insufficient

### Purchase Order Auto-Generation
- Monitors products below reorder threshold
- Can be triggered via scheduled job (implementation pending)

### Shipment Lifecycle
1. **Pending** - Created but not picked
2. **Picked** - Items picked from warehouse (inventory decremented)
3. **Packed** - Items packed for shipment
4. **In Transit** - Shipped to customer
5. **Delivered** - Delivered to customer

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=walmart_scms
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Production Deployment

1. Build backend:
```bash
cd backend
npm run build
```

2. Build frontend:
```bash
cd frontend
npm run build
```

3. Use production Docker images or deploy to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

