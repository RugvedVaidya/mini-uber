# 🚗 Mini Uber — Microservices Backend

A scalable ride-booking backend inspired by Uber/Swiggy, built with Java Spring Boot microservices.

## Services

| Service | Port | Description |
|---|---|---|
| Auth Service | 8081 | JWT register/login |
| Booking Service | 8082 | Ride lifecycle + Kafka producer |
| Location Service | 8083 | Redis + WebSocket real-time tracking |
| Payment Service | 8084 | Payment state machine + Kafka producer |
| Notification Service | 8085 | Kafka consumer, push notifications |
| React Frontend | 5173 | Rider + Driver dashboards |

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.5, Spring Security, Spring Data JPA
- **Messaging:** Apache Kafka
- **Cache:** Redis
- **Database:** PostgreSQL 16
- **Real-time:** WebSocket (STOMP)
- **Auth:** JWT (jjwt 0.12.3)
- **Frontend:** React 18, Vite, Tailwind CSS, Axios
- **Infrastructure:** Docker, Docker Compose

## Running Locally

### Prerequisites
- Java 17+
- Node.js 18+
- Docker Desktop

### Start Infrastructure
```bash
docker-compose up -d
```

### Start All Services
Open 5 terminals and run in each service folder:
```bash
mvnw.cmd spring-boot:run -Dspring-boot.run.jvmArguments="-Duser.timezone=UTC"
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

### Auth (8081)
- `POST /api/auth/register`
- `POST /api/auth/login`

### Booking (8082)
- `POST /api/rides/request`
- `PUT /api/rides/{id}/accept`
- `PUT /api/rides/{id}/start`
- `PUT /api/rides/{id}/complete`
- `GET /api/rides/my-rides`
- `GET /api/rides/pending`

### Location (8083)
- `POST /api/location/update`
- `GET /api/location/driver/{driverId}`

### Payment (8084)
- `POST /api/payments/initiate`
- `POST /api/payments/{id}/process`
- `GET /api/payments/ride/{rideId}`

## Key Features

- JWT authentication across all services
- Full ride lifecycle: REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED
- Real-time location tracking via Redis + WebSocket
- Kafka event-driven notifications
- Payment state machine with 10% failure simulation
- Role-based access (RIDER / DRIVER)
- React UI with separate Rider and Driver dashboards