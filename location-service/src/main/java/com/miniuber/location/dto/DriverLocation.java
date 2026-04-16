package com.miniuber.location.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverLocation {
    private String driverId;
    private Double latitude;
    private Double longitude;
    private Long timestamp;
    private Double distanceKm;

    public DriverLocation(String driverId, Double latitude, Double longitude, Long timestamp) {
        this.driverId = driverId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
    }
}