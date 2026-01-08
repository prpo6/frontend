package com.golfapp.auth.repository;

import com.golfapp.auth.model.AccessToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccessTokenRepository extends JpaRepository<AccessToken, UUID> {
    Optional<AccessToken> findByTokenAndRevokedFalse(String token);
    List<AccessToken> findByUserAccountIdAndRevokedFalse(UUID userAccountId);
    List<AccessToken> findByEmployeeAccountIdAndRevokedFalse(UUID employeeAccountId);
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
