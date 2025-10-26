package com.portfolio.backend.repository;

import com.portfolio.backend.model.NavbarConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavbarConfigRepository extends JpaRepository<NavbarConfig, Long> {
    List<NavbarConfig> findAllByOrderByDisplayOrderAsc();
    List<NavbarConfig> findAllByIsVisibleTrueOrderByDisplayOrderAsc();
}
