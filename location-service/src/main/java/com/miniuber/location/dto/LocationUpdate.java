package com.miniuber.location.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LocationUpdate {

    @NotNull
    private String driverId;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;
}