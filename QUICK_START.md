# 🚀 Quick Start Guide

Get Shemachoch up and running in 5 minutes!

## Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL
- Git

## Step 1: Clone & Navigate
```bash
cd backend
cd frontend
```

## Step 2: Backend Setup (Terminal 1)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=ProductSeeder
php artisan storage:link
php artisan serve
```

Visit: `http://localhost:8000`

## Step 3: Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit: `http://localhost:5173`

## Step 4: Login with Demo Credentials

**Admin:**
- Phone: `0911111111`
- Password: `admin@123456`

**Manager:**
- Phone: `0922222222`
- Password: `manager@123456`

## ✅ You're Ready!

- Admin Dashboard: http://localhost:5173
- API: http://localhost:8000/api
- Database: coop_store

## Next Steps

1. **Create Custom Admin User:**
   - Login as admin
   - Go to Users section
   - Create new user

2. **Add Products:**
   - Manager login
   - Go to Products
   - Click "Add Product"

3. **Test Member Flow:**
   - Register new member account
   - Admin verifies it
   - Member can place orders

## File Structure

```
CBTP-pahse3/
├── backend/          # Laravel 11 API
│   ├── app/Models/   # Database models
│   ├── Http/Controllers/  # API logic
│   └── routes/api.php    # API endpoints
├── frontend/         # React + Vite
│   ├── src/pages/    # Page components
│   ├── src/components/ # Reusable components
│   └── vite.config.js
└── README.md         # Full documentation
```

## Common Commands

### Backend
```bash
php artisan migrate              # Run database migrations
php artisan db:seed            # Run seeders
php artisan tinker             # Interactive shell
php artisan route:list         # List all routes
```

### Frontend
```bash
npm run dev             # Start development
npm run build          # Build for production
npm run preview        # Preview production build
npm install            # Install dependencies
```

## Environment Files

**.env** (backend) - Database and Telegram config
**.env** (frontend) - API URL config

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 in use | `php artisan serve --port=8001` |
| Port 5173 in use | `npm run dev -- --port 5174` |
| Database error | Check MySQL running and `.env` config |
| CORS errors | Already configured in Laravel |
| Module not found | Run `npm install` or `composer install` |

## What's Included

✅ **Complete Backend**
- 7 Models with relationships
- 7 Controllers with full CRUD
- 6 Database migrations
- 2 Seeders with demo data
- Role-based middleware
- Authorization policies

✅ **Complete Frontend**
- 14 Pages with routing
- 9 Reusable components
- Context API for state
- Telegram Mini App integration
- Responsive Tailwind design
- Complete API integration

✅ **Features Implemented**
- User authentication & verification
- Product management
- Order placement & tracking
- Inventory management
- Notifications system
- Admin reports & analytics
- Telegram integration
- Role-based access control

## Documentation

See [README.md](./README.md) for detailed documentation including:
- Full API documentation
- Database schema
- Deployment guide
- Telegram bot setup
- Troubleshooting guide

## Success Checklist

- [ ] Backend running on 8000
- [ ] Frontend running on 5173
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Can see demo products
- [ ] Database populated with seeders
- [ ] No console errors

---

**Happy coding! 🎉**

For full documentation, see [README.md](./README.md)
