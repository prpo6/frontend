package com.golfapp.auth.dto;

import java.util.UUID;

public class RegisterRequest {
    private UUID clanId;
    private String username;
    private String password;

    public RegisterRequest() {
    }

    public RegisterRequest(UUID clanId, String username, String password) {
        this.clanId = clanId;
        this.username = username;
        this.password = password;
    }

    public UUID getClanId() {
        return clanId;
    }

    public void setClanId(UUID clanId) {
        this.clanId = clanId;
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
