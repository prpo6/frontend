package com.golfapp.auth.dto;

import java.util.UUID;

public class ValidateTokenResponse {
    private boolean valid;
    private UUID clanId;
    private String username;
    private String accountType;
    private String pozicija; // For employee accounts

    public ValidateTokenResponse() {
    }

    public ValidateTokenResponse(boolean valid, UUID clanId, String username, String accountType) {
        this.valid = valid;
        this.clanId = clanId;
        this.username = username;
        this.accountType = accountType;
    }

    public ValidateTokenResponse(boolean valid, UUID clanId, String username, String accountType, String pozicija) {
        this.valid = valid;
        this.clanId = clanId;
        this.username = username;
        this.accountType = accountType;
        this.pozicija = pozicija;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
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

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getPozicija() {
        return pozicija;
    }

    public void setPozicija(String pozicija) {
        this.pozicija = pozicija;
    }
}
