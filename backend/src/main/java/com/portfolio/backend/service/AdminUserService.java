package com.portfolio.backend.service;

import com.portfolio.backend.model.AdminUser;
import com.portfolio.backend.repository.AdminUserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AdminUserService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String defaultUsername;
    private final String defaultPassword;

    public AdminUserService(AdminUserRepository adminUserRepository,
                            PasswordEncoder passwordEncoder,
                            @Value("${portfolio.security.fallback.username:admin}") String defaultUsername,
                            @Value("${portfolio.security.fallback.password:admin123}") String defaultPassword) {
        this.adminUserRepository = adminUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.defaultUsername = defaultUsername;
        this.defaultPassword = defaultPassword;
    }

    @PostConstruct
    @Transactional
    public void ensureAdminUserExists() {
        if (adminUserRepository.count() == 0) {
            AdminUser adminUser = new AdminUser(
                    defaultUsername,
                    passwordEncoder.encode(defaultPassword),
                    LocalDateTime.now()
            );
            adminUserRepository.save(adminUser);
        }
    }

    @Transactional(readOnly = true)
    public AdminUser getActiveAdminUser() {
        return adminUserRepository.findTopByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Admin user not initialized"));
    }

    @Transactional
    public void updateCredentials(String username, String rawPassword) {
        AdminUser adminUser = getActiveAdminUser();
        adminUser.setUsername(username);
        adminUser.setPassword(passwordEncoder.encode(rawPassword));
        adminUser.setUpdatedAt(LocalDateTime.now());
        adminUserRepository.save(adminUser);
    }
}
