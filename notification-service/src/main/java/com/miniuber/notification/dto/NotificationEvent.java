package com.miniuber.notification.dto;

import lombok.Data;
import java.util.Map;

@Data
public class NotificationEvent {
    private String topic;
    private Map<String, Object> payload;
}