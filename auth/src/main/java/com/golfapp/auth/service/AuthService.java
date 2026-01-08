package com.golfapp.auth.service;

import com.golfapp.auth.dto.LoginRequest;
import com.golfapp.auth.dto.LoginResponse;
import com.golfapp.auth.dto.RegisterRequest;
import com.golfapp.auth.dto.ValidateTokenResponse;
import com.golfapp.auth.model.AccessToken;
import com.golfapp.auth.model.UserAccount;
import com.golfapp.auth.repository.AccessTokenRepository;
import com.golfapp.auth.repository.UserAccountRepository;
import com.golfapp.auth.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final AccessTokenRepository accessTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserAccountRepository userAccountRepository,
                       AccessTokenRepository accessTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userAccountRepository = userAccountRepository;
        this.accessTokenRepository = accessTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        UserAccount user = userAccountRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!user.getEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), "user");

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(1);
        AccessToken accessToken = new AccessToken(token, user.getId(), expiresAt);
        accessTokenRepository.save(accessToken);

        user.setLastLogin(LocalDateTime.now());
        userAccountRepository.save(user);

        return new LoginResponse(token, user.getUsername(), user.getClanId(), "user", 86400000);
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userAccountRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userAccountRepository.existsByClanId(request.getClanId())) {
            throw new RuntimeException("Clan ID already has an account");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        UserAccount user = new UserAccount(request.getClanId(), request.getUsername(), hashedPassword);
        user = userAccountRepository.save(user);

        LoginRequest loginRequest = new LoginRequest(request.getUsername(), request.getPassword());
        return login(loginRequest);
    }

    public ValidateTokenResponse validateToken(String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRevokedFalse(token)
                .orElse(null);

        if (accessToken == null) {
            return new ValidateTokenResponse(false, null, null, null);
        }

        if (accessToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            return new ValidateTokenResponse(false, null, null, null);
        }

        try {
            String username = jwtUtil.extractUsername(token);
            UUID userId = jwtUtil.extractUserId(token);
            String accountType = jwtUtil.extractAccountType(token);

            UserAccount user = userAccountRepository.findById(userId).orElse(null);
            if (user == null) {
                return new ValidateTokenResponse(false, null, null, null);
            }

            return new ValidateTokenResponse(true, user.getClanId(), username, accountType);
        } catch (Exception e) {
            return new ValidateTokenResponse(false, null, null, null);
        }
    }

    @Transactional
    public void logout(String token) {
        AccessToken accessToken = accessTokenRepository.findByTokenAndRevokedFalse(token)
                .orElseThrow(() -> new RuntimeException("Token not found"));

        accessToken.setRevoked(true);
        accessTokenRepository.save(accessToken);
    }

    @Transactional
    public void revokeAllUserTokens(UUID userId) {
        var tokens = accessTokenRepository.findByUserAccountIdAndRevokedFalse(userId);
        tokens.forEach(token -> token.setRevoked(true));
        accessTokenRepository.saveAll(tokens);
    }
}
