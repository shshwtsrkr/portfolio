package com.portfolio.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

@Service
public class DatabaseService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    /**
     * Get database connection status
     */
    public Map<String, Object> getConnectionStatus() {
        Map<String, Object> status = new HashMap<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            status.put("connected", true);
            status.put("databaseName", metaData.getDatabaseProductName());
            status.put("databaseVersion", metaData.getDatabaseProductVersion());
            status.put("driverName", metaData.getDriverName());
            status.put("url", metaData.getURL());
        } catch (SQLException e) {
            status.put("connected", false);
            status.put("error", e.getMessage());
        }
        return status;
    }

    /**
     * Get all tables with row counts
     */
    public List<Map<String, Object>> getAllTables() {
        List<Map<String, Object>> tables = new ArrayList<>();

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"});

            while (rs.next()) {
                String tableName = rs.getString("TABLE_NAME");
                Map<String, Object> tableInfo = new HashMap<>();
                tableInfo.put("name", tableName);

                try {
                    Long rowCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM " + tableName, Long.class);
                    tableInfo.put("rowCount", rowCount);
                } catch (Exception e) {
                    tableInfo.put("rowCount", "Error");
                }

                tables.add(tableInfo);
            }
        } catch (SQLException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            tables.add(error);
        }

        return tables;
    }

    /**
     * Get table schema information
     */
    public List<Map<String, Object>> getTableSchema(String tableName) {
        List<Map<String, Object>> columns = new ArrayList<>();

        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet rs = metaData.getColumns(null, null, tableName, "%");

            while (rs.next()) {
                Map<String, Object> columnInfo = new HashMap<>();
                columnInfo.put("name", rs.getString("COLUMN_NAME"));
                columnInfo.put("type", rs.getString("TYPE_NAME"));
                columnInfo.put("size", rs.getInt("COLUMN_SIZE"));
                columnInfo.put("nullable", rs.getString("IS_NULLABLE"));
                columnInfo.put("default", rs.getString("COLUMN_DEF"));
                columns.add(columnInfo);
            }
        } catch (SQLException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            columns.add(error);
        }

        return columns;
    }

    /**
     * Execute a SELECT query and return results
     */
    public Map<String, Object> executeQuery(String query) {
        Map<String, Object> result = new HashMap<>();

        if (query == null || query.trim().isEmpty()) {
            result.put("success", false);
            result.put("error", "Query cannot be empty");
            return result;
        }

        String trimmedQuery = query.trim();
        while (trimmedQuery.endsWith(";")) {
            trimmedQuery = trimmedQuery.substring(0, trimmedQuery.length() - 1).trim();
        }

        if (trimmedQuery.isEmpty()) {
            result.put("success", false);
            result.put("error", "Query cannot be empty");
            return result;
        }

        String loweredQuery = trimmedQuery.toLowerCase(Locale.ROOT);

        if (loweredQuery.contains(";")) {
            result.put("success", false);
            result.put("error", "Multiple statements are not allowed");
            return result;
        }

        // Block high-risk verbs right away (DDL, privileges, etc.)
        List<String> disallowedVerbs = Arrays.asList("drop", "truncate", "alter", "create", "grant", "revoke", "replace", "rename", "use", "attach", "detach");
        for (String verb : disallowedVerbs) {
            if (loweredQuery.startsWith(verb + " ") || loweredQuery.equals(verb)) {
                result.put("success", false);
                result.put("error", "Operation not permitted. Contact VPS admin for elevated access (attempted " + verb.toUpperCase(Locale.ROOT) + ")");
                return result;
            }
        }

        // Block dangerous keywords even if the verb is allowed
        List<String> blockedKeywords = Arrays.asList(
                " information_schema", " mysql.", " performance_schema", " sys.",
                " drop ", " truncate ", " alter ", " create ", " grant ",
                " revoke ", " replace ", " rename ", " use ", " attach ", " detach "
        );
        for (String keyword : blockedKeywords) {
            if (loweredQuery.contains(keyword)) {
                result.put("success", false);
                result.put("error", "Operation not permitted. Contact VPS admin for elevated access (blocked keyword)");
                return result;
            }
        }

        boolean isSelect = loweredQuery.startsWith("select ");
        boolean isInsert = loweredQuery.startsWith("insert ");
        boolean isUpdate = loweredQuery.startsWith("update ");
        boolean isDelete = loweredQuery.startsWith("delete ");

        if (!(isSelect || isInsert || isUpdate || isDelete)) {
            result.put("success", false);
            result.put("error", "Only SELECT, INSERT, UPDATE, and DELETE statements are allowed");
            return result;
        }

        if ((isUpdate || isDelete) && !loweredQuery.contains(" where ")) {
            result.put("success", false);
            result.put("error", (isDelete ? "DELETE" : "UPDATE") + " statements must include a WHERE clause.");
            return result;
        }

        try {
            if (isSelect) {
                List<Map<String, Object>> rows = jdbcTemplate.queryForList(trimmedQuery);
                result.put("success", true);
                result.put("rows", rows);
                result.put("rowCount", rows.size());
                result.put("message", "Returned " + rows.size() + " row(s)");

                if (!rows.isEmpty()) {
                    result.put("columns", new ArrayList<>(rows.get(0).keySet()));
                } else {
                    result.put("columns", new ArrayList<>());
                }
            } else {
                int affected = jdbcTemplate.update(trimmedQuery);
                result.put("success", true);
                result.put("rows", Collections.emptyList());
                result.put("columns", Collections.emptyList());
                result.put("rowCount", affected);
                result.put("message", "Statement executed. Rows affected: " + affected);
                result.put("queryType", isDelete ? "DELETE" : isInsert ? "INSERT" : "UPDATE");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("rows", Collections.emptyList());
            result.put("columns", Collections.emptyList());
        }

        return result;
    }

    /**
     * Get database statistics
     */
    public Map<String, Object> getDatabaseStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Total tables
            List<Map<String, Object>> tables = getAllTables();
            stats.put("totalTables", tables.size());

            // Total rows across all tables
            long totalRows = tables.stream()
                .filter(t -> t.get("rowCount") instanceof Long)
                .mapToLong(t -> (Long) t.get("rowCount"))
                .sum();
            stats.put("totalRows", totalRows);

            // Database size
            String sizeQuery = "SELECT SUM(data_length + index_length) / 1024 / 1024 AS size_mb " +
                             "FROM information_schema.TABLES " +
                             "WHERE table_schema = DATABASE()";
            Double sizeMb = jdbcTemplate.queryForObject(sizeQuery, Double.class);
            stats.put("sizeMb", String.format("%.2f", sizeMb));

        } catch (Exception e) {
            stats.put("error", e.getMessage());
        }

        return stats;
    }

    /**
     * Get table data preview (first 10 rows)
     */
    public List<Map<String, Object>> getTablePreview(String tableName) {
        try {
            String query = "SELECT * FROM " + tableName + " LIMIT 10";
            return jdbcTemplate.queryForList(query);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Collections.singletonList(error);
        }
    }
}
