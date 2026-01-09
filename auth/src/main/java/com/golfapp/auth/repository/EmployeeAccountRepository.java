package com.golfapp.auth.repository;

import com.golfapp.auth.model.EmployeeAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeAccountRepository extends JpaRepository<EmployeeAccount, UUID> {
    Optional<EmployeeAccount> findByUsername(String username);
    Optional<EmployeeAccount> findByZaposleniId(UUID zaposleniId);
    boolean existsByUsername(String username);
    boolean existsByZaposleniId(UUID zaposleniId);
}
