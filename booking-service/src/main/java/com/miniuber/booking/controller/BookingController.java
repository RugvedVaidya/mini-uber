package com.miniuber.booking.controller;

import com.miniuber.booking.dto.*;
import com.miniuber.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/request")
    public ResponseEntity<RideResponse> requestRide(
            @Valid @RequestBody RideRequest request,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.requestRide(request, auth.getName()));
    }

    @PutMapping("/{rideId}/accept")
    public ResponseEntity<RideResponse> acceptRide(
            @PathVariable UUID rideId,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.acceptRide(rideId, auth.getName()));
    }

    @PutMapping("/{rideId}/start")
    public ResponseEntity<RideResponse> startRide(
            @PathVariable UUID rideId,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.startRide(rideId, auth.getName()));
    }

    @PutMapping("/{rideId}/complete")
    public ResponseEntity<RideResponse> completeRide(
            @PathVariable UUID rideId,
            Authentication auth) {
        return ResponseEntity.ok(bookingService.completeRide(rideId, auth.getName()));
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<RideResponse>> myRides(Authentication auth) {
        return ResponseEntity.ok(bookingService.getRidesByRider(auth.getName()));
    }

    @GetMapping("/{rideId}")
    public ResponseEntity<RideResponse> getRide(@PathVariable UUID rideId) {
        return ResponseEntity.ok(bookingService.getRideById(rideId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<RideResponse>> getPendingRides() {
        return ResponseEntity.ok(bookingService.getPendingRides());
    }
}