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
    }
}