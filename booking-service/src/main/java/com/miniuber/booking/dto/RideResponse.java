package com.miniuber.booking.dto;

import com.miniuber.booking.entity.RideStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class RideResponse {
    private UUID id;
    private UUID riderId;
    private UUID driverId;
    private Double pickupLat;
    private Double pickupLng;
    private Double dropoffLat;
    private Double dropoffLng;
    private String pickupAddress;
    private String dropoffAddress;
    private RideStatus status;
    private BigDecimal fareAmount;
    private LocalDateTime requestedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime completedAt;
}