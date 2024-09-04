# Weather Information Server Project

## Project Overview
This project is a server application that provides weather information for specified dates and cities. It includes user authentication, rate limiting, and caching mechanisms. The server interacts with a weather API to fetch data and uses various services like PostgreSQL, Redis, and RabbitMQ for data storage, caching, and message queuing.

## Tech Stack
- Node.js v22 & npm (latest stable version)
- TypeScript
- Nest.js (Express)
- PostgreSQL
- Redis
- RabbitMQ
- JWT for authentication
- Jest for testing

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
   - Fill in the necessary environment variables in `.env`

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

## Environment Variables

Ensure your `.env` file contains the following variables (replace with your own values):

```
NODE_ENV=development
PORT=3000

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=your_db_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password

REDIS_HOST=localhost
REDIS_PORT=6379

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=your_rabbitmq_user
RABBITMQ_PASSWORD=your_rabbitmq_password
RABBITMQ_MANAGEMENT_PORT=15672

JWT_SECRET=your_jwt_secret
JWT_EXPIRATION_TIME=3600

RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=5
USER_REQUEST_LIMIT=22
REQUEST_COUNT_EXPIRATION=86400

CACHE_TTL=5

EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

WEATHER_API_KEY=your_weather_api_key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5/forecast
```

Note: For security, use different values for sensitive information in your production environment.
