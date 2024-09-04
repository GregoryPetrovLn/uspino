# Weather Information Server Project

## Overview
Develop a server to provide weather information for a specified date and city.

## Requirements

### Authentication
- All endpoints must be accessible only to authenticated users
- Create an authentication endpoint:
  - Accepts login/password
  - Returns an accessToken if valid, otherwise an error

### Weather Data Endpoint
- Accepts city and date
- Returns weather data if valid, otherwise an error
- Implement caching for weather data (TTL: 5 seconds)
- Limit requests to 5 per second per user
- Increment user request counter by 1 for each request
- Return error if user exceeds their request limit

### User Limit Endpoint
- Returns the user's request limit and current request count

### Error Handling
- If a user exceeds their request limit:
  - Return an error
  - Send a message to RabbitMQ queue (userId, userLimit)

### Email Notification
- Create a consumer to process messages from RabbitMQ queue
- Send email notifications using Gmail
- Mark message as processed only if email is sent successfully, otherwise resend

### Data Management
- Use seed scripts to add test data for users and weather information

### Infrastructure
- Use Docker to set up PostgreSQL, Redis, and RabbitMQ

### Testing
- Write e2e tests for all endpoints

### Scripts
- Create package.json scripts for:
  - Starting the server
  - Running tests
  - Setting up infrastructure

### Configuration
- Store server port, secrets, connection URLs, etc. in a .env file

## Test Data
- Users: 3-5
- Cities: 3-5
- Weather records: 5-10 (for different cities and dates)
- Cache TTL: 5 seconds
- Weather endpoint rate limit: 5 requests/second
- User request limit: 100

## Tech Stack
- Node.js v22 & npm (latest stable version)
- TypeScript
- Nest.js (Express)
- PostgreSQL
- Redis
- RabbitMQ
- JWT
- REST API
- JSON
- Jest
- Gmail (for sending emails)

## How to Run the Project

### Prerequisites
- Node.js v22
- npm (latest stable version)
- Docker and Docker Compose

### Setup and Running the Application

1. Clone the repository:
   ```
   git clone https://github.com/GregoryPetrovLn/uspino.git
   cd weather-server-project
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the necessary environment variables in `.env` (see Environment Variables section below)

3. Start the infrastructure services using Docker:
   ```
   docker-compose up -d
   ```

4. Install dependencies:
   ```
   npm install
   ```

5. Run database migrations and seed data:
   ```
   npm run seed
   ```

6. Start the server in development mode:
   ```
   npm run dev
   ```

### Running Tests
- Run all tests:
  ```
  npm test
  ```
- Run e2e tests:
  ```
  npm run test:e2e
  ```

### Stopping the Application
1. Stop the server (Ctrl+C in the terminal)

2. Stop and remove infrastructure containers:
   ```
   docker-compose down
   ```

## Scripts Reference
- `npm run build`: Build the application
- `npm run format`: Format the code using Prettier
- `npm start`: Start the server
- `npm run dev`: Start the server in development mode with watch
- `npm run start:debug`: Start the server in debug mode
- `npm run start:prod`: Start the server in production mode
- `npm run lint`: Lint and fix TypeScript files
- `npm test`: Run Jest tests
- `npm run test:watch`: Run Jest tests in watch mode
- `npm run test:cov`: Run Jest tests with coverage
- `npm run test:debug`: Debug Jest tests
- `npm run test:e2e`: Run end-to-end tests
- `npm run seed`: Run the database seeding script

## Docker Compose Configuration

The `docker-compose.yml` file sets up the following services:

- PostgreSQL (version 14)
- Redis (version 6)
- RabbitMQ (version 3 with management plugin)

Ensure your `.env` file contains the necessary environment variables for these services.

## Environment Variables

Ensure your `.env` file contains the following variables (replace values with your own):

```
# Server
NODE_ENV=development
PORT=3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=your_db_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=your_rabbitmq_user
RABBITMQ_PASSWORD=your_rabbitmq_password
RABBITMQ_MANAGEMENT_PORT=15672

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION_TIME=3600

# API limits
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=5
USER_REQUEST_LIMIT=22
REQUEST_COUNT_EXPIRATION=86400

# Cache
CACHE_TTL=5

# Email
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Weather API
WEATHER_API_KEY=your_weather_api_key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5/forecast
```

Note: For security reasons, it's crucial to use different values for sensitive information like passwords and API keys in your actual production environment.

## Additional Notes
- Ensure proper error handling and logging throughout the application
- Follow Nest.js best practices and design patterns
- Implement proper input validation for all endpoints
- Consider implementing a logging system for easier debugging and monitoring
- Document the API endpoints for easier integration and testing
