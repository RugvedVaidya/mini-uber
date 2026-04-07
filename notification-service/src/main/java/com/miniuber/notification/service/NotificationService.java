package com.miniuber.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@Slf4j
public class NotificationService {

    @KafkaListener(topics = "booking.created", groupId = "notification-group")
    public void handleBookingCreated(Map<String, Object> event) {
        String rideId  = (String) event.get("rideId");
        String riderId = (String) event.get("riderId");

        log.info("=== NOTIFICATION: New Ride Requested ===");
        log.info("Ride ID  : {}", rideId);
        log.info("Rider ID : {}", riderId);
        log.info("Status   : {}", event.get("status"));
        log.info("Pickup   : lat={}, lng={}", event.get("pickupLat"), event.get("pickupLng"));
        log.info("Sending push notification to nearby drivers...");
        log.info("========================================");

        sendPushNotification(riderId,
                "Your ride has been requested!",
                "Looking for a driver near you.");
    }

    @KafkaListener(topics = "booking.updated", groupId = "notification-group")
    public void handleBookingUpdated(Map<String, Object> event) {
        String rideId   = (String) event.get("rideId");
        String driverId = (String) event.get("driverId");
        String status   = (String) event.get("status");

        log.info("=== NOTIFICATION: Ride Status Updated ===");
        log.info("Ride ID   : {}", rideId);
        log.info("Driver ID : {}", driverId);
        log.info("New Status: {}", status);

        if ("ACCEPTED".equals(status)) {
            log.info("Notifying rider: Driver is on the way!");
        }
        log.info("=========================================");
    }

    @KafkaListener(topics = "booking.completed", groupId = "notification-group")
    public void handleBookingCompleted(Map<String, Object> event) {
        String rideId  = (String) event.get("rideId");
        String riderId = (String) event.get("riderId");
        Object fare    = event.get("fare");

        log.info("=== NOTIFICATION: Ride Completed ===");
        log.info("Ride ID  : {}", rideId);
        log.info("Rider ID : {}", riderId);
        log.info("Fare     : ₹{}", fare);
        log.info("Sending receipt to rider...");
        log.info("====================================");

        sendPushNotification(riderId,
                "Ride Completed!",
                "Your fare was ₹" + fare + ". Thank you for riding with MiniUber!");
    }

    @KafkaListener(topics = "payment.done", groupId = "notification-group")
    public void handlePaymentDone(Map<String, Object> event) {
        String paymentId = (String) event.get("paymentId");
        String rideId    = (String) event.get("rideId");
        Object amount    = event.get("amount");
        String status    = (String) event.get("status");
        String method    = (String) event.get("method");

        log.info("=== NOTIFICATION: Payment {} ===", status);
        log.info("Payment ID : {}", paymentId);
        log.info("Ride ID    : {}", rideId);
        log.info("Amount     : ₹{}", amount);
        log.info("Method     : {}", method);

        if ("SUCCESS".equals(status)) {
            log.info("Payment successful! Sending confirmation SMS...");
            sendPushNotification(rideId,
                    "Payment Successful!",
                    "₹" + amount + " paid via " + method);
        } else {
            log.info("Payment FAILED! Sending retry notification...");
            sendPushNotification(rideId,
                    "Payment Failed",
                    "Please retry your payment of ₹" + amount);
        }
        log.info("================================");
    }

    private void sendPushNotification(String userId, String title, String body) {
        log.info("[PUSH] To: {} | Title: {} | Body: {}", userId, title, body);
    }
}