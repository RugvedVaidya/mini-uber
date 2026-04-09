package com.miniuber.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final EmailService emailService;

    @KafkaListener(topics = "booking.created", groupId = "notification-group")
    public void handleBookingCreated(Map<String, Object> event) {
        String rideId  = (String) event.get("rideId");
        String riderId = (String) event.get("riderId");

        log.info("=== NOTIFICATION: New Ride Requested ===");
        log.info("Ride ID  : {}", rideId);
        log.info("Rider ID : {}", riderId);
        log.info("Sending push notification to nearby drivers...");
        log.info("========================================");

        emailService.sendEmail(
            "miniuber.notifications@gmail.com",
            "New Ride Requested - MiniUber",
            "A new ride has been requested!\n" +
            "Ride ID: " + rideId + "\n" +
            "Pickup: " + event.get("pickupLat") + ", " + event.get("pickupLng")
        );
    }

    @KafkaListener(topics = "booking.updated", groupId = "notification-group")
    public void handleBookingUpdated(Map<String, Object> event) {
        String rideId   = (String) event.get("rideId");
        String status   = (String) event.get("status");

        log.info("=== NOTIFICATION: Ride Status Updated ===");
        log.info("Ride ID   : {}", rideId);
        log.info("New Status: {}", status);

        if ("ACCEPTED".equals(status)) {
            log.info("Notifying rider: Driver is on the way!");
            emailService.sendEmail(
                "miniuber.notifications@gmail.com",
                "Driver Accepted Your Ride - MiniUber",
                "Great news! A driver has accepted your ride.\n" +
                "Ride ID: " + rideId + "\n" +
                "Your driver is on the way!"
            );
        }
        log.info("=========================================");
    }

    @KafkaListener(topics = "booking.completed", groupId = "notification-group")
    public void handleBookingCompleted(Map<String, Object> event) {
        String rideId  = (String) event.get("rideId");
        Object fare    = event.get("fare");

        log.info("=== NOTIFICATION: Ride Completed ===");
        log.info("Ride ID: {}", rideId);
        log.info("Fare   : ₹{}", fare);
        log.info("====================================");

        emailService.sendEmail(
            "miniuber.notifications@gmail.com",
            "Ride Completed - MiniUber",
            "Your ride has been completed!\n" +
            "Ride ID: " + rideId + "\n" +
            "Total Fare: ₹" + fare + "\n\n" +
            "Thank you for riding with MiniUber!"
        );
    }

    @KafkaListener(topics = "payment.done", groupId = "notification-group")
    public void handlePaymentDone(Map<String, Object> event) {
        String paymentId = (String) event.get("paymentId");
        Object amount    = event.get("amount");
        String status    = (String) event.get("status");
        String method    = (String) event.get("method");

        log.info("=== NOTIFICATION: Payment {} ===", status);
        log.info("Payment ID : {}", paymentId);
        log.info("Amount     : ₹{}", amount);
        log.info("Method     : {}", method);

        if ("SUCCESS".equals(status)) {
            emailService.sendEmail(
                "miniuber.notifications@gmail.com",
                "Payment Successful - MiniUber",
                "Payment confirmed!\n" +
                "Amount: ₹" + amount + "\n" +
                "Method: " + method + "\n" +
                "Payment ID: " + paymentId + "\n\n" +
                "Thank you for using MiniUber!"
            );
        } else {
            emailService.sendEmail(
                "miniuber.notifications@gmail.com",
                "Payment Failed - MiniUber",
                "Your payment of ₹" + amount + " failed.\n" +
                "Please try again."
            );
        }
        log.info("================================");
    }
}