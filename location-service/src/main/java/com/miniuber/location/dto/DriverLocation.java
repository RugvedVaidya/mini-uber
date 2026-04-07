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
}