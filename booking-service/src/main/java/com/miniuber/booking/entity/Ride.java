package com.miniuber.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rider_id", nullable = false)
    private UUID riderId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "pickup_lat", nullable = false)
    private Double pickupLat;

    @Column(name = "pickup_lng", nullable = false)
    private Double pickupLng;

    @Column(name = "dropoff_lat", nullable = false)
    private Double dropoffLat;

    @Column(name = "dropoff_lng", nullable = false)
    private Double dropoffLng;

    @Column(name = "pickup_address")
    private String pickupAddress;

    @Column(name = "dropoff_address")
    private String dropoffAddress;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RideStatus status;

    @Column(name = "fare_amount")
    private BigDecimal fareAmount;

    @Column(name = "distance_km")
    private BigDecimal distanceKm;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        requestedAt = LocalDateTime.now();
        status = RideStatus.REQUESTED;
    }
}