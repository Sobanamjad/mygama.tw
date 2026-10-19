# MyGama Backend

Node.js + Express + PostgreSQL backend for MyGama CMS.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mygama_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5174
```

3. Create database:
```bash
createdb mygama_db
```

4. Run migration:
```bash
npm run migrate
```

5. Start development server:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST `/api/auth/login` - Login (username, password)

### Menus
- GET `/api/menus` - Get all menus
- PUT `/api/menus/:name` - Update menu (auth required)
- POST `/api/menus/item` - Add menu item (auth required)
- DELETE `/api/menus/item/:id` - Delete menu item (auth required)

### Content
- GET `/api/content` - Get all content sections
- PUT `/api/content/:section_id` - Update content (auth required)

### RSS
- GET `/api/rss` - Get all RSS feeds
- POST `/api/rss` - Add RSS feed (auth required)
- PUT `/api/rss/:id` - Update RSS feed (auth required)
- DELETE `/api/rss/:id` - Delete RSS feed (auth required)
- PATCH `/api/rss/:id/toggle` - Toggle RSS feed (auth required)

### Pages
- GET `/api/pages` - Get all pages
- GET `/api/pages/:slug` - Get page by slug
- POST `/api/pages` - Create page (auth required)
- PUT `/api/pages/:id` - Update page (auth required)
- DELETE `/api/pages/:id` - Delete page (auth required)
- PATCH `/api/pages/:id/toggle` - Toggle publish (auth required)

### Media
- GET `/api/media` - Get all media
- POST `/api/media` - Upload media (auth required)
- DELETE `/api/media/:id` - Delete media (auth required)

## Default Credentials

- Username: `admin`
- Password: `admin123`
