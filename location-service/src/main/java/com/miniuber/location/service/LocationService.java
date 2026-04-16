package com.miniuber.location.service;

import com.miniuber.location.dto.DriverLocation;
import com.miniuber.location.dto.LocationUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String DRIVER_LOCATION_KEY = "driver:location:";
    private static final String DRIVER_GEO_KEY = "drivers:geo";
    private static final String DRIVER_AVAILABLE_KEY = "drivers:available";
    private static final int LOCATION_TTL_SECONDS = 60;

    public void updateLocation(LocationUpdate update) {
        String key = DRIVER_LOCATION_KEY + update.getDriverId();

        redisTemplate.opsForHash().put(key, "latitude", String.valueOf(update.getLatitude()));
        redisTemplate.opsForHash().put(key, "longitude", String.valueOf(update.getLongitude()));
        redisTemplate.opsForHash().put(key, "timestamp", String.valueOf(System.currentTimeMillis()));
        redisTemplate.opsForHash().put(key, "driverId", update.getDriverId());
        redisTemplate.expire(key, LOCATION_TTL_SECONDS, TimeUnit.SECONDS);

        redisTemplate.opsForGeo().add(
            DRIVER_GEO_KEY,
            new Point(update.getLongitude(), update.getLatitude()),
            update.getDriverId()
        );

        redisTemplate.opsForSet().add(DRIVER_AVAILABLE_KEY, update.getDriverId());

        DriverLocation location = new DriverLocation(
            update.getDriverId(),
            update.getLatitude(),
            update.getLongitude(),
            System.currentTimeMillis()
        );

        messagingTemplate.convertAndSend(
            "/topic/driver/" + update.getDriverId(),
            location
        );

        log.info("Location updated for driver {}: {}, {}",
            update.getDriverId(), update.getLatitude(), update.getLongitude());
    }

    public DriverLocation getDriverLocation(String driverId) {
        String key = DRIVER_LOCATION_KEY + driverId;

        String lat = (String) redisTemplate.opsForHash().get(key, "latitude");
        String lng = (String) redisTemplate.opsForHash().get(key, "longitude");
        String ts  = (String) redisTemplate.opsForHash().get(key, "timestamp");

        if (lat == null || lng == null)
            throw new RuntimeException("Driver location not found or expired");

        return new DriverLocation(
            driverId,
            Double.parseDouble(lat),
            Double.parseDouble(lng),
            ts != null ? Long.parseLong(ts) : null
        );
    }

    public List<DriverLocation> getNearbyDrivers(double latitude, double longitude, double radiusKm) {
        List<DriverLocation> nearby = new ArrayList<>();

        try {
            Circle circle = new Circle(
                new Point(longitude, latitude),
                new Distance(radiusKm, Metrics.KILOMETERS)
            );

            RedisGeoCommands.GeoRadiusCommandArgs args = RedisGeoCommands.GeoRadiusCommandArgs
                .newGeoRadiusArgs()
                .includeDistance()
                .includeCoordinates()
                .sortAscending()
                .limit(10);

            GeoResults<RedisGeoCommands.GeoLocation<String>> results =
                redisTemplate.opsForGeo().radius(DRIVER_GEO_KEY, circle, args);

            if (results != null) {
                for (GeoResult<RedisGeoCommands.GeoLocation<String>> result : results) {
                    String driverId = result.getContent().getName();
                    Point point = result.getContent().getPoint();
                    double distance = result.getDistance().getValue();

                    String key = DRIVER_LOCATION_KEY + driverId;
                    String ts = (String) redisTemplate.opsForHash().get(key, "timestamp");

                    DriverLocation loc = new DriverLocation(
                        driverId,
                        point.getY(),
                        point.getX(),
                        ts != null ? Long.parseLong(ts) : null
                    );
                    loc.setDistanceKm(distance);
                    nearby.add(loc);
                }
            }
        } catch (Exception e) {
            log.error("Error fetching nearby drivers: {}", e.getMessage());
        }

        return nearby;
    }

    public void setDriverAvailable(String driverId, boolean available) {
        if (available) {
            redisTemplate.opsForSet().add(DRIVER_AVAILABLE_KEY, driverId);
        } else {
            redisTemplate.opsForSet().remove(DRIVER_AVAILABLE_KEY, driverId);
        }
    }
}