-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100)        NOT NULL,
    email         VARCHAR(150)        NOT NULL UNIQUE,
    phone         VARCHAR(15)         NOT NULL UNIQUE,
    password_hash TEXT                NOT NULL,
    role          VARCHAR(10)         NOT NULL CHECK (role IN ('RIDER', 'DRIVER', 'ADMIN')),
    created_at    TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- DRIVERS
CREATE TABLE drivers (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type   VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('BIKE', 'AUTO', 'CAB')),
    status         VARCHAR(15) NOT NULL DEFAULT 'OFFLINE'
                               CHECK (status IN ('ONLINE', 'OFFLINE', 'ON_TRIP')),
    rating         NUMERIC(3,2)        DEFAULT 5.00,
    is_available   BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP           NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_drivers_user_id ON drivers(user_id);

-- RIDES (FK constraints removed for microservices architecture)
CREATE TABLE rides (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id        UUID           NOT NULL,
    driver_id       UUID,
    pickup_lat      DECIMAL(9,6)   NOT NULL,
    pickup_lng      DECIMAL(9,6)   NOT NULL,
    dropoff_lat     DECIMAL(9,6)   NOT NULL,
    dropoff_lng     DECIMAL(9,6)   NOT NULL,
    pickup_address  TEXT,
    dropoff_address TEXT,
    status          VARCHAR(20)    NOT NULL DEFAULT 'REQUESTED'
                                   CHECK (status IN (
                                       'REQUESTED', 'ACCEPTED',
                                       'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
                                   )),
    fare_amount     NUMERIC(10,2),
    distance_km     NUMERIC(6,2),
    requested_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    accepted_at     TIMESTAMP,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP
);

CREATE INDEX idx_rides_rider_id   ON rides(rider_id);
CREATE INDEX idx_rides_driver_id  ON rides(driver_id);
CREATE INDEX idx_rides_status     ON rides(status);

-- PAYMENTS
CREATE TABLE payments (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id    UUID           NOT NULL,
    amount     NUMERIC(10,2)  NOT NULL,
    method     VARCHAR(20)    NOT NULL DEFAULT 'CASH'
                              CHECK (method IN ('CASH', 'UPI', 'CARD', 'WALLET', 'RAZORPAY')),
    status     VARCHAR(15)    NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
    paid_at    TIMESTAMP
);

CREATE UNIQUE INDEX idx_payments_ride_id ON payments(ride_id);

-- LOCATIONS
CREATE TABLE locations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id   UUID           NOT NULL,
    latitude    DECIMAL(9,6)   NOT NULL,
    longitude   DECIMAL(9,6)   NOT NULL,
    recorded_at TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_driver_id    ON locations(driver_id);
CREATE INDEX idx_locations_recorded_at  ON locations(recorded_at DESC);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID         NOT NULL,
    type      VARCHAR(30)  NOT NULL,
    message   TEXT         NOT NULL,
    is_read   BOOLEAN      NOT NULL DEFAULT FALSE,
    sent_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);