# Shemachoch

A comprehensive digital solution for managing Shemachoch operations in Ethiopia. This system digitizes manual operations to improve transparency, fairness, and efficiency in goods distribution.

**Location Context:** Bosa Addis Kebele, Jimma City, Ethiopia

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Default Credentials](#-default-credentials)
- [Telegram Bot Setup](#-telegram-bot-setup)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Member Features
- ✅ Register with phone number and kebele ID
- ✅ Login with credentials
- ✅ Browse available products with search and filter
- ✅ View product details and availability
- ✅ Place orders digitally
- ✅ View order history and status
- ✅ Receive order status notifications
- ✅ Access system via Telegram Mini App
- ✅ View profile and account status

### Store Manager Features
- ✅ Manage product catalog (add, edit, delete)
- ✅ Update product stock levels
- ✅ View all member orders
- ✅ Process and update order status
- ✅ Track inventory changes
- ✅ View inventory logs
- ✅ Receive low stock alerts

### Admin Features
- ✅ Manage all users (members, managers)
- ✅ Verify member identity before granting order access
- ✅ Generate detailed reports (inventory, orders, members)
- ✅ Monitor all system activity
- ✅ Send broadcast notifications
- ✅ Export reports

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS |
| **Backend** | Laravel 11 |
| **Database** | MySQL |
| **Authentication** | Laravel Sanctum (JWT tokens) |
| **Telegram** | Telegram Web Apps + Bot API |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |

---

## 📁 Project Structure

```
CBTP-pahse3/
├── backend/                          # Laravel API
│   ├── app/
│   │   ├── Models/                   # Eloquent Models
│   │   ├── Http/
│   │   │   ├── Controllers/          # API Controllers
│   │   │   └── Middleware/           # RoleMiddleware
│   │   └── Policies/                 # Authorization Policies
│   ├── database/
│   │   ├── migrations/               # Database migrations
│   │   └── seeders/                  # Database seeders
│   ├── routes/
│   │   └── api.php                   # API Routes
│   ├── config/                       # Configuration files
│   ├── storage/
│   │   └── app/public/products/      # Product images
│   ├── composer.json
│   └── .env.example
│
├── frontend/                         # React Vite App
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/                 # Login, Register
│   │   │   ├── member/               # Member views
│   │   │   ├── manager/              # Manager views
│   │   │   └── admin/                # Admin views
│   │   ├── components/               # Reusable components
│   │   ├── context/                  # AuthContext
│   │   ├── hooks/                    # Custom hooks (useTelegram, useAuth)
│   │   ├── services/                 # API service
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── public/
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
└── README.md                         # This file
```

---

## Prerequisites

- **PHP** 8.2 or higher
- **Composer** (for Laravel)
- **Node.js** 18+ and **npm** or **yarn**
- **MySQL** 8.0 or higher
- **Git**
- **Telegram Bot Token** (from BotFather)

---

## 🚀 Installation

### Backend Setup (Laravel)

#### 1. Clone the repository and navigate to backend

```bash
cd backend
```

#### 2. Install PHP dependencies

```bash
composer install
```

#### 3. Copy environment file

```bash
cp .env.example .env
```

#### 4. Generate application key

```bash
php artisan key:generate
```

#### 5. Configure database in `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coop_store
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### 6. Run migrations

```bash
php artisan migrate
```

#### 7. Seed the database with demo data

```bash
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=ProductSeeder
```

#### 8. Create symbolic link for storage

```bash
php artisan storage:link
```

#### 9. Start the Laravel development server

```bash
php artisan serve
```

The backend API will be available at `http://localhost:8000`

---

### Frontend Setup (React)

#### 1. Navigate to frontend directory

```bash
cd frontend
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Copy environment file

```bash
cp .env.example .env
```

#### 4. Start development server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## ⚙️ Configuration

### Backend Configuration (`.env`)

```env
APP_NAME="Shemachoch"
APP_ENV=local
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxx
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=coop_store
DB_USERNAME=root
DB_PASSWORD=

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook
TELEGRAM_MINI_APP_URL=https://yourdomain.com

FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration (`.env`)

```env
VITE_API_URL=/api
VITE_TELEGRAM_BOT_USERNAME=your_bot_username
```

Use `/api` when the frontend is served with the Vite dev proxy or from the same domain as the API. For a separate API domain, set `VITE_API_URL` to the API origin, for example `https://api.example.com`.

---

## 🗄️ Database Setup

The project includes migrations for all tables:

- `users` - Members, managers, admins
- `products` - Store products
- `orders` - Member orders
- `order_items` - Order details
- `notifications` - User notifications
- `inventory_logs` - Stock change tracking

Run migrations:

```bash
php artisan migrate
```

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

**Frontend:**
```bash
npm run build
npm run preview
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer YOUR_TOKEN
```

### Public Endpoints

#### Register
```
POST /register
Body: {
  "name": "John Doe",
  "phone": "0911111111",
  "kebele_id": "KEBELE001",
  "password": "password123",
  "password_confirmation": "password123"
}
Returns: { user, token }
```

#### Login
```
POST /login
Body: {
  "phone": "0911111111",
  "password": "password123"
}
Returns: { user, token }
```

### Protected Endpoints

#### Products
```
GET    /products              # List all products
GET    /products/{id}         # Get product details
POST   /products              # Create product (manager/admin)
PUT    /products/{id}         # Update product (manager/admin)
DELETE /products/{id}         # Delete product (admin)
```

#### Orders
```
GET    /orders                # List orders (own for member, all for manager/admin)
GET    /orders/{id}           # Get order details
POST   /orders                # Create order (member)
PUT    /orders/{id}/status    # Update order status (manager/admin)
```

#### Inventory
```
PUT    /inventory/{product_id}  # Update inventory (manager/admin)
GET    /inventory/logs          # View inventory logs (admin)
```

#### Notifications
```
GET    /notifications                 # List notifications
PUT    /notifications/{id}/read       # Mark as read
PUT    /notifications/mark-all-read   # Mark all as read
POST   /notifications/broadcast       # Send broadcast (admin)
```

#### Users
```
GET    /users               # List all users (admin)
GET    /users/{id}          # Get user details (admin)
PUT    /users/{id}/verify   # Verify user (admin)
```

#### Reports
```
GET    /reports/inventory   # Inventory report (admin)
GET    /reports/orders      # Orders report (admin)
GET    /reports/members     # Members report (admin)
```

---

## 🔐 Default Credentials

Use these accounts for testing:

### Admin Account
- **Phone:** `0911111111`
- **Password:** `admin@123456`
- **Role:** Admin

### Manager Account
- **Phone:** `0922222222`
- **Password:** `manager@123456`
- **Role:** Manager

### Member Account
Register a new account or use demo data after seeding

---

## 📱 Telegram Bot Setup

### 1. Create Bot with BotFather

1. Open Telegram and search for `@BotFather`
2. Start conversation and type `/newbot`
3. Follow prompts to create your bot
4. Copy the **Bot Token**

### 2. Create Telegram Mini App

1. Message BotFather: `/mybots` → Select your bot → **Bot Settings**
2. Select **Menu button** → **Edit menu button URL**
3. Set URL to: `https://yourdomain.com`
4. Add the bot to your profile: `/setuserpic` (optional)

### 3. Configure Backend

Add to `.env`:
```env
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_BOT_USERNAME=@yourbotusername
TELEGRAM_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook
TELEGRAM_MINI_APP_URL=https://yourdomain.com
```

### 4. Set Webhook (if hosting publicly)

```bash
curl --request POST \
  --url https://api.telegram.org/botYOUR_TOKEN/setWebhook \
  --form url=https://yourdomain.com/api/telegram/webhook
```

### 5. Telegram Mini App Integration

The React app automatically detects Telegram Web App environment:

```javascript
import { useTelegram } from './hooks/useTelegram'

function MyComponent() {
  const { isTelegramApp, webApp } = useTelegram()
  
  if (isTelegramApp) {
    // Running in Telegram Mini App
  }
}
```

---

## 🌐 Deployment

### Deploy Backend (Laravel)

**On Heroku:**
```bash
heroku create your-app-name
heroku addons:create cleardb:ignite
git push heroku main
heroku run php artisan migrate
```

**On DigitalOcean/VPS:**
```bash
# 1. SSH into server
ssh root@your_server_ip

# 2. Install dependencies
apt update && apt install -y php composer mysql-server nginx

# 3. Clone and setup
git clone your-repo-url
cd backend
composer install
php artisan migrate
```

### Deploy Frontend (React)

**On Vercel:**
```bash
npm install -g vercel
vercel
```

**On Netlify:**
```bash
npm run build
# Drag dist/ folder to Netlify dashboard
```

**On own server (Nginx):**
```bash
npm run build
# Copy dist/ to /var/www/html
# Configure Nginx to serve index.html
```

### Environment Variables for Production

Set these in your hosting provider:
```
VITE_API_URL=https://your-api-domain.com
DB_HOST=your_database_host
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

---

## 🐛 Troubleshooting

### Issue: CORS errors
**Solution:** Check `config/cors.php` in Laravel
```php
'allowed_origins' => ['http://localhost:5173', 'https://yourdomain.com'],
```

### Issue: Unauthorized (401) errors
**Solution:** Ensure token is included in authorization header
```javascript
// In api.js interceptor:
config.headers.Authorization = `Bearer ${token}`
```

### Issue: Database connection failed
**Solution:** Verify MySQL is running and credentials are correct
```bash
mysql -u root -p
SHOW DATABASES;
```

### Issue: Product images not showing
**Solution:** Create symbolic link and ensure permissions
```bash
php artisan storage:link
chmod -R 755 storage/
```

### Issue: Telegram Mini App not loading
**Solution:** Ensure URL is HTTPS and set in BotFather menu button

### Issue: Notifications not being sent to Telegram
**Solution:** Verify bot token is correct and webhook is set

---

## 📖 API Response Format

All responses follow this format:

**Success (200):**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error (400/401/403/404):**
```json
{
  "error": "Error message",
  "status": 400
}
```

**Paginated Responses:**
```json
{
  "data": [ ... ],
  "current_page": 1,
  "total": 100,
  "per_page": 20,
  "last_page": 5
}
```

---

## 🔄 Workflow

### Member Workflow
1. Register with phone and kebele_id
2. Wait for admin verification
3. Browse products
4. Add products to cart
5. Checkout (place order)
6. Receive order status updates
7. Pick up order when marked "Ready"

### Manager Workflow
1. Login with manager credentials
2. Add/manage products
3. Update inventory
4. Review pending orders
5. Change order status
6. Track inventory changes

### Admin Workflow
1. Login with admin credentials
2. Verify new members
3. Monitor all activities
4. Generate reports
5. Send system notifications
6. Manage users and permissions

---

## 📊 Database Schema

### Users Table
```sql
id, name, phone (unique), password, kebele_id (unique), 
role (member/manager/admin), is_verified, telegram_id, 
created_at, updated_at
```

### Products Table
```sql
id, name, description, price, quantity, category, 
image_path, is_active, created_at, updated_at
```

### Orders Table
```sql
id, user_id, status (pending/approved/ready/completed/cancelled), 
total_price, notes, created_at, updated_at
```

### OrderItems Table
```sql
id, order_id, product_id, quantity, unit_price
```

### Notifications Table
```sql
id, user_id, title, message, is_read, created_at
```

### InventoryLogs Table
```sql
id, product_id, change_amount, reason, manager_id, created_at
```

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Check Laravel and React documentation

---

## 🎯 Future Enhancements

- [ ] SMS notifications
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Inventory forecasting
- [ ] Mobile app (React Native)
- [ ] QR code for order tracking
- [ ] Multi-language support
- [ ] Accessibility improvements

---

**Built with ❤️ for Bosa Addis Kebele, Jimma City, Ethiopia**

Last Updated: May 8, 2026
