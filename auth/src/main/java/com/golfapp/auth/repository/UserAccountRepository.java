package com.golfapp.auth.repository;

import com.golfapp.auth.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByClanId(UUID clanId);
    boolean existsByUsername(String username);
    boolean existsByClanId(UUID clanId);
}
