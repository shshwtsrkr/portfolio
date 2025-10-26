package com.portfolio.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AsciiArtService {

    private static final char ASCII_CHAR = '█';
    private static final int DEFAULT_WIDTH = 70;   // Increased for more detail
    private static final int DEFAULT_HEIGHT = 60;  // Increased for more detail
    private static final int CHAR_WIDTH = 5;       // Character width
    private static final int CHAR_HEIGHT = 9;      // Character height (taller for proper ratio)

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateAsciiJson(Path imagePath) throws IOException {
        return generateAsciiJson(imagePath, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    public String generateAsciiJson(Path imagePath, int maxWidth, int maxHeight) throws IOException {
        BufferedImage original = ImageIO.read(imagePath.toFile());
        if (original == null) {
            throw new IOException("Unable to read image for ASCII conversion");
        }

        Dimension targetSize = calculateTargetSize(original.getWidth(), original.getHeight(), maxWidth, maxHeight);
        BufferedImage scaled = new BufferedImage(targetSize.width, targetSize.height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = scaled.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(original, 0, 0, targetSize.width, targetSize.height, null);
        g2d.dispose();

        List<List<Map<String, String>>> rows = new ArrayList<>();
        for (int y = 0; y < targetSize.height; y++) {
            List<Map<String, String>> row = new ArrayList<>();
            for (int x = 0; x < targetSize.width; x++) {
                int argb = scaled.getRGB(x, y);
                int alpha = (argb >> 24) & 0xFF;
                Map<String, String> cell = new HashMap<>();
                if (alpha < 80) {
                    cell.put("char", " ");
                    cell.put("color", "transparent");
                } else {
                    int r = (argb >> 16) & 0xFF;
                    int g = (argb >> 8) & 0xFF;
                    int b = argb & 0xFF;
                    cell.put("char", Character.toString(ASCII_CHAR));
                    cell.put("color", String.format("rgb(%d, %d, %d)", r, g, b));
                }
                row.add(cell);
            }
            rows.add(row);
        }

        try {
            return objectMapper.writeValueAsString(rows);
        } catch (JsonProcessingException e) {
            throw new IOException("Failed to serialize ASCII art", e);
        }
    }

    private Dimension calculateTargetSize(int originalWidth, int originalHeight, int maxWidth, int maxHeight) {
        double aspect = (double) originalWidth / (double) originalHeight;
        int width = Math.min(maxWidth, originalWidth);
        int height = (int) Math.round(width / aspect * 0.55);

        if (height > maxHeight) {
            height = Math.min(maxHeight, height);
            width = (int) Math.round(height * aspect / 0.55);
        }

        width = Math.max(16, width);
        height = Math.max(16, height);

        return new Dimension(width, height);
    }

    /**
     * Generate ASCII art as an actual image file instead of JSON
     * @param imagePath Path to the source image
     * @param category Category for organizing files (e.g., "profile")
     * @return Relative URL path to the generated ASCII image
     */
    public String generateAsciiImage(Path imagePath, String category) throws IOException {
        return generateAsciiImage(imagePath, category, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    public String generateAsciiImage(Path imagePath, String category, int maxWidth, int maxHeight) throws IOException {
        // Read and scale the original image
        BufferedImage original = ImageIO.read(imagePath.toFile());
        if (original == null) {
            throw new IOException("Unable to read image for ASCII conversion");
        }

        Dimension targetSize = calculateTargetSize(original.getWidth(), original.getHeight(), maxWidth, maxHeight);
        BufferedImage scaled = new BufferedImage(targetSize.width, targetSize.height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = scaled.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(original, 0, 0, targetSize.width, targetSize.height, null);
        g2d.dispose();

        // Create output image with transparent background
        int imageWidth = targetSize.width * CHAR_WIDTH;
        int imageHeight = targetSize.height * CHAR_HEIGHT;
        BufferedImage asciiImage = new BufferedImage(imageWidth, imageHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D graphics = asciiImage.createGraphics();

        // Set rendering hints for better quality
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // Set font - using monospace for consistent character spacing
        Font font = new Font("Monospaced", Font.BOLD, 8);
        graphics.setFont(font);

        // Get font metrics for better positioning
        FontMetrics metrics = graphics.getFontMetrics(font);

        // Render ASCII characters
        for (int y = 0; y < targetSize.height; y++) {
            for (int x = 0; x < targetSize.width; x++) {
                int argb = scaled.getRGB(x, y);
                int alpha = (argb >> 24) & 0xFF;

                if (alpha >= 80) {
                    int r = (argb >> 16) & 0xFF;
                    int g = (argb >> 8) & 0xFF;
                    int b = argb & 0xFF;

                    Color color = new Color(r, g, b, alpha);
                    graphics.setColor(color);

                    // Draw the ASCII character with proper positioning
                    int charX = x * CHAR_WIDTH;
                    int charY = y * CHAR_HEIGHT + metrics.getAscent();
                    graphics.drawString(String.valueOf(ASCII_CHAR), charX, charY);
                }
            }
        }

        graphics.dispose();

        // Save the ASCII image
        String filename = UUID.randomUUID().toString() + "-ascii.png";
        Path categoryPath = Paths.get(uploadDir, "images", category);
        Files.createDirectories(categoryPath);
        Path outputPath = categoryPath.resolve(filename);
        ImageIO.write(asciiImage, "png", outputPath.toFile());

        // Return relative URL path
        return "/uploads/images/" + category + "/" + filename;
    }
}
