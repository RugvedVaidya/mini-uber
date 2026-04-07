package com.miniuber.auth.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
    private String email;
    private String name;
}