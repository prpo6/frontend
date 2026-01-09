package com.golfapp.auth.dto;

import java.util.UUID;

public class LoginResponse {
    private String token;
    private String username;
    private UUID clanId;
    private String accountType;
    private long expiresIn;
    private String pozicija; // For employee accounts

    public LoginResponse() {
    }

    public LoginResponse(String token, String username, UUID clanId, String accountType, long expiresIn) {
        this.token = token;
        this.username = username;
        this.clanId = clanId;
        this.accountType = accountType;
        this.expiresIn = expiresIn;
    }

    public LoginResponse(String token, String username, UUID clanId, String accountType, long expiresIn, String pozicija) {
        this.token = token;
        this.username = username;
        this.clanId = clanId;
        this.accountType = accountType;
        this.expiresIn = expiresIn;
        this.pozicija = pozicija;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public UUID getClanId() {
        return clanId;
    }

    public void setClanId(UUID clanId) {
        this.clanId = clanId;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public String getPozicija() {
        return pozicija;
    }

    public void setPozicija(String pozicija) {
        this.pozicija = pozicija;
    }
}
