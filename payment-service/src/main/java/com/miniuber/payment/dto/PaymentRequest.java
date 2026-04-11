package com.miniuber.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentRequest {

    @NotNull
    private UUID rideId;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private String method;
}