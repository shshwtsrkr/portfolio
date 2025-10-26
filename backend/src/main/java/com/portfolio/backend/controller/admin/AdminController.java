package com.portfolio.backend.controller.admin;

import com.portfolio.backend.service.DatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@Controller
public class AdminController {

    @Autowired
    private DatabaseService databaseService;

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/admin/dashboard")
    public String dashboard() {
        return "admin/dashboard";
    }

    @GetMapping("/admin/database")
    public String database(Model model) {
        // Get connection status
        Map<String, Object> connectionStatus = databaseService.getConnectionStatus();
        model.addAttribute("connectionStatus", connectionStatus);

        // Get database stats
        Map<String, Object> stats = databaseService.getDatabaseStats();
        model.addAttribute("stats", stats);

        // Get all tables
        List<Map<String, Object>> tables = databaseService.getAllTables();
        model.addAttribute("tables", tables);

        return "admin/database";
    }

    @GetMapping("/admin/database/table")
    public String viewTable(@RequestParam String tableName, Model model) {
        // Get table schema
        List<Map<String, Object>> schema = databaseService.getTableSchema(tableName);
        model.addAttribute("schema", schema);
        model.addAttribute("tableName", tableName);

        // Get table preview
        List<Map<String, Object>> preview = databaseService.getTablePreview(tableName);
        model.addAttribute("preview", preview);

        // Get connection status for header
        Map<String, Object> connectionStatus = databaseService.getConnectionStatus();
        model.addAttribute("connectionStatus", connectionStatus);

        return "admin/database-table";
    }

    @PostMapping("/admin/database/query")
    public String executeQuery(@RequestParam String query, Model model) {
        // Execute query
        Map<String, Object> result = databaseService.executeQuery(query);
        model.addAttribute("queryResult", result);
        model.addAttribute("query", query);

        // Get connection status
        Map<String, Object> connectionStatus = databaseService.getConnectionStatus();
        model.addAttribute("connectionStatus", connectionStatus);

        // Get database stats
        Map<String, Object> stats = databaseService.getDatabaseStats();
        model.addAttribute("stats", stats);

        // Get all tables
        List<Map<String, Object>> tables = databaseService.getAllTables();
        model.addAttribute("tables", tables);

        return "admin/database";
    }
}
