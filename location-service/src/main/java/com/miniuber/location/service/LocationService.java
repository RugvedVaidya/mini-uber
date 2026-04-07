package com.miniuber.location.service;

import com.miniuber.location.dto.DriverLocation;
import com.miniuber.location.dto.LocationUpdate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final RedisTemplate<String, String> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String DRIVER_LOCATION_KEY = "driver:location:";
    private static final int LOCATION_TTL_SECONDS = 30;

    public void updateLocation(LocationUpdate update) {
        String key = DRIVER_LOCATION_KEY + update.getDriverId();

        redisTemplate.opsForHash().put(key, "latitude",  String.valueOf(update.getLatitude()));
        redisTemplate.opsForHash().put(key, "longitude", String.valueOf(update.getLongitude()));
        redisTemplate.opsForHash().put(key, "timestamp", String.valueOf(System.currentTimeMillis()));
        redisTemplate.expire(key, LOCATION_TTL_SECONDS, TimeUnit.SECONDS);

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

        if (lat == null || lng == null) {
            throw new RuntimeException("Driver location not found or expired");
        }

        return new DriverLocation(
                driverId,
                Double.parseDouble(lat),
                Double.parseDouble(lng),
                ts != null ? Long.parseLong(ts) : null
        );
    }
}