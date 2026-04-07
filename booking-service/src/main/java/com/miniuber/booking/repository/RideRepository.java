package com.miniuber.booking.repository;

import com.miniuber.booking.entity.Ride;
import com.miniuber.booking.entity.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface RideRepository extends JpaRepository<Ride, UUID> {
    List<Ride> findByRiderIdOrderByRequestedAtDesc(UUID riderId);
    List<Ride> findByDriverIdAndStatus(UUID driverId, RideStatus status);
    List<Ride> findByStatus(RideStatus status);
}