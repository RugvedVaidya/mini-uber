package com.miniuber.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RideRequest {

    @NotNull
    private Double pickupLat;

    @NotNull
    private Double pickupLng;

    @NotNull
    private Double dropoffLat;

    @NotNull
    private Double dropoffLng;

    private String pickupAddress;
    private String dropoffAddress;
}