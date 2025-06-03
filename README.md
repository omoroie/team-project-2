# Samsung Recipe Platform

A Samsung.com-inspired recipe sharing and ingredient purchasing platform built with TypeScript React frontend and Spring Boot microservices backend.

## Architecture Overview

### Frontend
- **TypeScript React** with Samsung-style UI design
- **Bilingual Support** (Korean/English)
- **Global State Management** with Context API
- **Material Design** with shadcn/ui components

### Backend Microservices
- **User Service** (Port 8081) - Authentication and user management
- **Recipe Service** (Port 8082) - Recipe sharing and management
- **Ingredient Service** (Port 8083) - Ingredient marketplace
- **Board Service** (Port 8084) - Corporate board with translation

### Infrastructure
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **Docker** - Containerization
- **Kubernetes** - Orchestration

## Features

### Core Features
- ✅ User registration and authentication with JWT
- ✅ Recipe sharing with auto-generated images
- ✅ Ingredient marketplace with inventory management
- ✅ Corporate-only board access
- ✅ Korean/English bilingual interface
- ✅ Redis caching for performance

### Advanced Features
- 🔄 Google Translate API integration
- 🔄 Unsplash image integration
- 🔄 AWS S3 + CloudFront CDN
- 🔄 Real-time notifications

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/samsung_recipe
PGUSER=postgres
PGPASSWORD=password
PGHOST=localhost
PGPORT=5432
PGDATABASE=samsung_recipe

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# External APIs (Optional)
UNSPLASH_ACCESS_KEY=your_unsplash_key
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key

# JWT
JWT_SECRET=samsung-recipe-platform-secret-key-2024-very-secure
```

### Development Setup

1. **Start Infrastructure**
```bash
docker-compose up postgres redis -d
```

2. **Start Backend Services**
```bash
# User Service
cd backend/user-service
./mvnw spring-boot:run

# Recipe Service
cd backend/recipe-service
./mvnw spring-boot:run

# Ingredient Service
cd backend/ingredient-service
./mvnw spring-boot:run

# Board Service
cd backend/board-service
./mvnw spring-boot:run
```

3. **Start Frontend**
```bash
npm run dev
```

### Production Deployment

#### Docker Compose
```bash
docker-compose up -d
```

#### Kubernetes
```bash
kubectl apply -f k8s/
```

## API Documentation

### User Service (8081)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User authentication
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/corporate` - Get corporate users

### Recipe Service (8082)
- `POST /api/recipes` - Create recipe
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/{id}` - Get recipe by ID
- `GET /api/recipes/search?keyword=` - Search recipes
- `GET /api/recipes/author/{authorId}` - Get recipes by author

### Ingredient Service (8083)
- `POST /api/ingredients` - Create ingredient
- `GET /api/ingredients` - Get all ingredients
- `GET /api/ingredients/{id}` - Get ingredient by ID
- `GET /api/ingredients/category/{category}` - Get by category

### Board Service (8084)
- `POST /api/board` - Create board post (Corporate only)
- `GET /api/board` - Get all board posts (Corporate only)
- `GET /api/board/{id}` - Get board post by ID
- `POST /api/board/{id}/translate` - Translate post content

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- shadcn/ui for components
- React Query for state management
- Wouter for routing

### Backend
- Spring Boot 3.2
- Spring Data JPA
- Spring Security
- Redis for caching
- PostgreSQL database
- JWT authentication
- Lombok for code generation
- ModelMapper for DTOs

### DevOps
- Docker & Docker Compose
- Kubernetes deployments
- PostgreSQL with persistent volumes
- Redis caching cluster
- Environment-based configuration

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_corporate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Recipes Table
```sql
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cooking_time INTEGER,
    servings INTEGER,
    difficulty VARCHAR(50),
    image_url VARCHAR(500),
    author_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Ingredients Table
```sql
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    category VARCHAR(100),
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Features

### Redis Caching Strategy
- User data cached for 24 hours
- Recipe data cached for 12 hours
- Ingredient data cached for 6 hours
- Board posts cached for 2 hours

### Database Optimization
- Indexed foreign keys
- Connection pooling
- Query optimization with JPA
- Lazy loading for relationships

## Security Features

### Authentication
- JWT-based authentication
- Password hashing with BCrypt
- Session management
- CORS configuration

### Authorization
- Role-based access control
- Corporate user verification
- API endpoint protection
- Request validation

## Monitoring & Health Checks

### Application Health
- Spring Actuator endpoints
- Database connectivity checks
- Redis connectivity checks
- Service dependency monitoring

### Logging
- Structured logging with SLF4J
- Request/response logging
- Error tracking and reporting
- Performance metrics

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

Built with ❤️ for Samsung Recipe Platform