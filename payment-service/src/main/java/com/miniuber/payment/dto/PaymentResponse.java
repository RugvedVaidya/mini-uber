package com.miniuber.payment.dto;

import com.miniuber.payment.entity.PaymentStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PaymentResponse {
    private UUID id;
    private UUID rideId;
    private BigDecimal amount;
    private PaymentStatus status;
    private String method;
    private LocalDateTime paidAt;
}