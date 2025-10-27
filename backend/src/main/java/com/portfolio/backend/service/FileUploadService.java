package com.portfolio.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${file.upload.dir:uploads}")
    private String uploadDir;

    @Value("${file.upload.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final int MAX_WIDTH = 1200;
    private static final int MAX_HEIGHT = 1200;
    private static final float JPEG_QUALITY = 0.85f;

    /**
     * Upload an image file to the specified category
     * @param file The file to upload
     * @param category The category (profile, blogs, projects, publications)
     * @return The relative URL path to the uploaded file
     */
    public String uploadImage(MultipartFile file, String category) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Cannot upload empty file");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("Only image files are allowed");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        // Convert to JPG for better compression, unless it's PNG with transparency
        boolean isPng = extension.toLowerCase().endsWith(".png");
        String targetExtension = isPng ? ".png" : ".jpg";
        String filename = UUID.randomUUID().toString() + targetExtension;

        // Create category directory if it doesn't exist
        Path categoryPath = Paths.get(uploadDir, "images", category);
        Files.createDirectories(categoryPath);

        // Compress and save file
        Path filePath = categoryPath.resolve(filename);
        byte[] compressedImage = compressImage(file.getBytes(), isPng);
        Files.write(filePath, compressedImage);

        // Return absolute URL with base URL
        return baseUrl + "/uploads/images/" + category + "/" + filename;
    }

    /**
     * Compress and resize image to reduce file size
     */
    private byte[] compressImage(byte[] imageData, boolean isPng) throws IOException {
        BufferedImage original = ImageIO.read(new ByteArrayInputStream(imageData));
        if (original == null) {
            throw new IOException("Unable to read image data");
        }

        // Resize if image is too large
        BufferedImage resized = resizeImage(original, MAX_WIDTH, MAX_HEIGHT);

        // Compress based on format
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        if (isPng) {
            // For PNG, use default compression
            ImageIO.write(resized, "png", outputStream);
        } else {
            // For JPEG, use quality compression
            Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
            if (!writers.hasNext()) {
                throw new IOException("No JPG writer found");
            }

            ImageWriter writer = writers.next();
            ImageWriteParam param = writer.getDefaultWriteParam();

            if (param.canWriteCompressed()) {
                param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
                param.setCompressionQuality(JPEG_QUALITY);
            }

            try (ImageOutputStream ios = ImageIO.createImageOutputStream(outputStream)) {
                writer.setOutput(ios);
                writer.write(null, new IIOImage(resized, null, null), param);
                writer.dispose();
            }
        }

        return outputStream.toByteArray();
    }

    /**
     * Resize image while maintaining aspect ratio
     */
    private BufferedImage resizeImage(BufferedImage original, int maxWidth, int maxHeight) {
        int originalWidth = original.getWidth();
        int originalHeight = original.getHeight();

        // Calculate new dimensions
        int newWidth = originalWidth;
        int newHeight = originalHeight;

        if (originalWidth > maxWidth || originalHeight > maxHeight) {
            double widthRatio = (double) maxWidth / originalWidth;
            double heightRatio = (double) maxHeight / originalHeight;
            double ratio = Math.min(widthRatio, heightRatio);

            newWidth = (int) (originalWidth * ratio);
            newHeight = (int) (originalHeight * ratio);
        }

        // Return original if no resize needed
        if (newWidth == originalWidth && newHeight == originalHeight) {
            return original;
        }

        // Create resized image
        BufferedImage resized = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.drawImage(original, 0, 0, newWidth, newHeight, null);
        g2d.dispose();

        return resized;
    }

    /**
     * Delete an uploaded file
     * @param fileUrl The URL path of the file to delete
     */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }

        try {
            Path filePath = getAbsolutePathFromUrl(fileUrl);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but don't throw exception
            System.err.println("Failed to delete file: " + fileUrl + " - " + e.getMessage());
        }
    }

    /**
     * Upload a file (non-image) to the specified category
     * @param file The file to upload
     * @param category The category (resume, documents, etc.)
     * @return The relative URL path to the uploaded file
     */
    public String uploadFile(MultipartFile file, String category) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Cannot upload empty file");
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String filename = UUID.randomUUID().toString() + extension;

        // Create category directory if it doesn't exist
        Path categoryPath = Paths.get(uploadDir, "files", category);
        Files.createDirectories(categoryPath);

        // Save file without compression
        Path filePath = categoryPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return absolute URL with base URL
        return baseUrl + "/uploads/files/" + category + "/" + filename;
    }

    /**
     * Get the absolute path to the upload directory
     */
    public String getUploadDirPath() {
        return new File(uploadDir).getAbsolutePath();
    }

    public Path getAbsolutePathFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new IllegalArgumentException("File URL cannot be empty");
        }

        String normalized = fileUrl.trim();

        if (baseUrl != null && !baseUrl.isBlank() && normalized.startsWith(baseUrl)) {
            normalized = normalized.substring(baseUrl.length());
        }

        normalized = normalized.replaceFirst("^/+", "");

        if (normalized.startsWith("uploads/")) {
            normalized = normalized.substring("uploads/".length());
        }

        return Paths.get(uploadDir).resolve(normalized);
    }
}
