package com.golfapp.auth.dto;

import java.util.UUID;

public class RegisterEmployeeRequest {
    private UUID zaposleniId;
    private String username;
    private String password;

    public RegisterEmployeeRequest() {
    }

    public RegisterEmployeeRequest(UUID zaposleniId, String username, String password) {
        this.zaposleniId = zaposleniId;
        this.username = username;
        this.password = password;
    }

    public UUID getZaposleniId() {
        return zaposleniId;
    }

    public void setZaposleniId(UUID zaposleniId) {
        this.zaposleniId = zaposleniId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
