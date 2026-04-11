package com.miniuber.payment.service;

import com.miniuber.payment.dto.*;
import com.miniuber.payment.entity.*;
import com.miniuber.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public PaymentResponse initiatePayment(PaymentRequest request) {
        Payment payment = Payment.builder()
                .rideId(request.getRideId())
                .amount(request.getAmount())
                .method(request.getMethod())
                .status(PaymentStatus.PENDING)
                .build();

        payment = paymentRepository.save(payment);
        log.info("Payment initiated: {}", payment.getId());
        return mapToResponse(payment);
    }

    public PaymentResponse processPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.PENDING)
            throw new RuntimeException("Payment is not in PENDING state");

        payment.setStatus(PaymentStatus.PROCESSING);
        payment = paymentRepository.save(payment);
        log.info("Payment processing: {}", payment.getId());

        boolean success = simulatePaymentGateway();

        if (success) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }

        payment = paymentRepository.save(payment);

        Map<String, Object> event = new HashMap<>();
        event.put("paymentId", payment.getId().toString());
        event.put("rideId", payment.getRideId().toString());
        event.put("amount", payment.getAmount());
        event.put("status", payment.getStatus().toString());
        event.put("method", payment.getMethod());

        kafkaTemplate.send("payment.done", payment.getId().toString(), event);
        log.info("Payment completed with status: {}", payment.getStatus());

        return mapToResponse(payment);
    }

    public PaymentResponse getPaymentByRide(UUID rideId) {
        Payment payment = paymentRepository.findByRideId(rideId)
                .orElseThrow(() -> new RuntimeException("Payment not found for ride"));
        return mapToResponse(payment);
    }

    public PaymentResponse getPaymentById(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return mapToResponse(payment);
    }

    private boolean simulatePaymentGateway() {
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return Math.random() > 0.1;
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse res = new PaymentResponse();
        res.setId(payment.getId());
        res.setRideId(payment.getRideId());
        res.setAmount(payment.getAmount());
        res.setStatus(payment.getStatus());
        res.setMethod(payment.getMethod());
        res.setPaidAt(payment.getPaidAt());
        return res;
    }
}