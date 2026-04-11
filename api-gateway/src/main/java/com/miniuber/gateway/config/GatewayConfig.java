package com.miniuber.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

@Configuration
public class GatewayConfig {

    @Value("${gateway.auth-url:http://localhost:8081}")
    private String authUrl;

    @Value("${gateway.booking-url:http://localhost:8082}")
    private String bookingUrl;

    @Value("${gateway.location-url:http://localhost:8083}")
    private String locationUrl;

    @Value("${gateway.payment-url:http://localhost:8084}")
    private String paymentUrl;

    @Value("${gateway.notification-url:http://localhost:8085}")
    private String notificationUrl;

    @Bean
    public RouterFunction<ServerResponse> authRoutes() {
        return GatewayRouterFunctions.route("auth-service")
                .route(RequestPredicates.path("/api/auth/**"),
                        HandlerFunctions.http(authUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> bookingRoutes() {
        return GatewayRouterFunctions.route("booking-service")
                .route(RequestPredicates.path("/api/rides/**"),
                        HandlerFunctions.http(bookingUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> locationRoutes() {
        return GatewayRouterFunctions.route("location-service")
                .route(RequestPredicates.path("/api/location/**"),
                        HandlerFunctions.http(locationUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> paymentRoutes() {
        return GatewayRouterFunctions.route("payment-service")
                .route(RequestPredicates.path("/api/payments/**"),
                        HandlerFunctions.http(paymentUrl))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> notificationRoutes() {
        return GatewayRouterFunctions.route("notification-service")
                .route(RequestPredicates.path("/api/notifications/**"),
                        HandlerFunctions.http(notificationUrl))
                .build();
    }
}