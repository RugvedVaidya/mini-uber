package com.miniuber.location.controller;

import com.miniuber.location.dto.DriverLocation;
import com.miniuber.location.dto.LocationUpdate;
import com.miniuber.location.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @MessageMapping("/location.update")
    public void updateLocationViaWebSocket(@Payload LocationUpdate update) {
        locationService.updateLocation(update);
    }

    @RestController
    @RequestMapping("/api/location")
    @RequiredArgsConstructor
    public static class LocationRestController {

        private final LocationService locationService;

        @PostMapping("/update")
        public ResponseEntity<String> updateLocation(
                @Valid @RequestBody LocationUpdate update,
                Authentication auth) {
            locationService.updateLocation(update);
            return ResponseEntity.ok("Location updated successfully");
        }

        @GetMapping("/driver/{driverId}")
        public ResponseEntity<DriverLocation> getDriverLocation(
                @PathVariable String driverId) {
            return ResponseEntity.ok(locationService.getDriverLocation(driverId));
        }

        @GetMapping("/nearby")
        public ResponseEntity<List<DriverLocation>> getNearbyDrivers(
                @RequestParam double lat,
                @RequestParam double lng,
                @RequestParam(defaultValue = "5.0") double radius) {
            return ResponseEntity.ok(locationService.getNearbyDrivers(lat, lng, radius));
        }

        @PostMapping("/driver/{driverId}/available")
        public ResponseEntity<Map<String, String>> setAvailable(
                @PathVariable String driverId,
                @RequestParam boolean available) {
            locationService.setDriverAvailable(driverId, available);
            return ResponseEntity.ok(Map.of(
                "driverId", driverId,
                "available", String.valueOf(available)
            ));
        }
    }
}