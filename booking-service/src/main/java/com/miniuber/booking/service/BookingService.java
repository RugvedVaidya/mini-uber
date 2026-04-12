package com.miniuber.booking.service;

import com.miniuber.booking.dto.*;
import com.miniuber.booking.entity.*;
import com.miniuber.booking.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final RideRepository rideRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public RideResponse requestRide(RideRequest request, String riderEmail) {
        Ride ride = Ride.builder()
                .riderId(UUID.nameUUIDFromBytes(riderEmail.getBytes()))
                .pickupLat(request.getPickupLat())
                .pickupLng(request.getPickupLng())
                .dropoffLat(request.getDropoffLat())
                .dropoffLng(request.getDropoffLng())
                .pickupAddress(request.getPickupAddress())
                .dropoffAddress(request.getDropoffAddress())
                .status(RideStatus.REQUESTED)
                .requestedAt(LocalDateTime.now())
                .build();

        ride = rideRepository.save(ride);

        Map<String, Object> event = new HashMap<>();
        event.put("rideId", ride.getId().toString());
        event.put("riderId", ride.getRiderId().toString());
        event.put("pickupLat", ride.getPickupLat());
        event.put("pickupLng", ride.getPickupLng());
        event.put("status", "REQUESTED");

        kafkaTemplate.send("booking.created", ride.getId().toString(), event);
        log.info("Ride requested: {}", ride.getId());

        return mapToResponse(ride);
    }

    public RideResponse acceptRide(UUID rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.REQUESTED)
            throw new RuntimeException("Ride is not in REQUESTED state");

        ride.setDriverId(UUID.nameUUIDFromBytes(driverEmail.getBytes()));
        ride.setStatus(RideStatus.ACCEPTED);
        ride.setAcceptedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);

        Map<String, Object> event = new HashMap<>();
        event.put("rideId", ride.getId().toString());
        event.put("driverId", ride.getDriverId().toString());
        event.put("status", "ACCEPTED");
        kafkaTemplate.send("booking.updated", ride.getId().toString(), event);

        return mapToResponse(ride);
    }

    public RideResponse startRide(UUID rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.ACCEPTED)
            throw new RuntimeException("Ride is not in ACCEPTED state");

        ride.setStatus(RideStatus.IN_PROGRESS);
        ride.setStartedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);

        return mapToResponse(ride);
    }

    public RideResponse completeRide(UUID rideId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.IN_PROGRESS)
            throw new RuntimeException("Ride is not IN_PROGRESS");

        ride.setStatus(RideStatus.COMPLETED);
        ride.setCompletedAt(LocalDateTime.now());
        ride.setFareAmount(calculateFare(ride));
        ride = rideRepository.save(ride);

        Map<String, Object> event = new HashMap<>();
        event.put("rideId", ride.getId().toString());
        event.put("riderId", ride.getRiderId().toString());
        event.put("fare", ride.getFareAmount());
        event.put("status", "COMPLETED");
        kafkaTemplate.send("booking.completed", ride.getId().toString(), event);

        return mapToResponse(ride);
    }

    public List<RideResponse> getRidesByRider(String riderEmail) {
        UUID riderId = UUID.nameUUIDFromBytes(riderEmail.getBytes());
        return rideRepository.findByRiderIdOrderByRequestedAtDesc(riderId)
                .stream().map(this::mapToResponse).toList();
    }

    public RideResponse getRideById(UUID rideId) {
        return rideRepository.findById(rideId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
    }

    private BigDecimal calculateFare(Ride ride) {
        double distance = Math.sqrt(
            Math.pow(ride.getDropoffLat() - ride.getPickupLat(), 2) +
            Math.pow(ride.getDropoffLng() - ride.getPickupLng(), 2)
        ) * 111;
        return BigDecimal.valueOf(Math.max(50, distance * 12)).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    private RideResponse mapToResponse(Ride ride) {
        RideResponse res = new RideResponse();
        res.setId(ride.getId());
        res.setRiderId(ride.getRiderId());
        res.setDriverId(ride.getDriverId());
        res.setPickupLat(ride.getPickupLat());
        res.setPickupLng(ride.getPickupLng());
        res.setDropoffLat(ride.getDropoffLat());
        res.setDropoffLng(ride.getDropoffLng());
        res.setPickupAddress(ride.getPickupAddress());
        res.setDropoffAddress(ride.getDropoffAddress());
        res.setStatus(ride.getStatus());
        res.setFareAmount(ride.getFareAmount());
        res.setRequestedAt(ride.getRequestedAt());
        res.setAcceptedAt(ride.getAcceptedAt());
        res.setCompletedAt(ride.getCompletedAt());
        return res;
    }

    public List<RideResponse> getPendingRides() {
        return rideRepository.findByStatus(RideStatus.REQUESTED)
                .stream().map(this::mapToResponse).toList();
    }

    public RideResponse cancelRide(UUID rideId, String userEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.REQUESTED && ride.getStatus() != RideStatus.ACCEPTED)
            throw new RuntimeException("Ride cannot be cancelled at this stage");

        ride.setStatus(RideStatus.CANCELLED);
        ride = rideRepository.save(ride);

        Map<String, Object> event = new HashMap<>();
        event.put("rideId", ride.getId().toString());
        event.put("status", "CANCELLED");
        kafkaTemplate.send("booking.updated", ride.getId().toString(), event);
        log.info("Ride cancelled: {}", ride.getId());

        return mapToResponse(ride);
    }
}