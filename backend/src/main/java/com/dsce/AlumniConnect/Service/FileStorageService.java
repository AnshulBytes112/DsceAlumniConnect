package com.dsce.AlumniConnect.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
public class FileStorageService {

    @Autowired
    private Cloudinary cloudinary;

    private final String RESUME_DIR = "resumes";
    private final String PROFILE_DIR = "profiles";

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final List<String> ALLOWED_RESUME_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public CompletableFuture<String> uploadResume(MultipartFile file) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateFile(file, ALLOWED_RESUME_TYPES, "Resume");
                Map<String, Object> uploadParams = ObjectUtils.asMap(
                        "folder", RESUME_DIR,
                        "resource_type", "auto"
                );
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
                String url = uploadResult.get("secure_url").toString();
                log.info("Resume uploaded successfully: {}", url);
                return url;
            } catch (IOException e) {
                log.error("Failed to upload resume", e);
                throw new RuntimeException("Resume upload failed: " + e.getMessage(), e);
            }
        });
    }

    public CompletableFuture<String> uploadProfilePicture(MultipartFile file) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateFile(file, ALLOWED_IMAGE_TYPES, "Profile picture");
                Map<String, Object> uploadParams = ObjectUtils.asMap(
                        "folder", PROFILE_DIR,
                        "resource_type", "image"
                );
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
                String url = uploadResult.get("secure_url").toString();
                log.info("Profile picture uploaded successfully: {}", url);
                return url;
            } catch (IOException e) {
                log.error("Failed to upload profile picture", e);
                throw new RuntimeException("Profile picture upload failed: " + e.getMessage(), e);
            }
        });
    }

    public CompletableFuture<String> uploadPostImage(MultipartFile file) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateFile(file, ALLOWED_IMAGE_TYPES, "Post image");
                Map<String, Object> uploadParams = ObjectUtils.asMap(
                        "folder", "posts",
                        "resource_type", "image"
                );
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
                String url = uploadResult.get("secure_url").toString();
                log.info("Post image uploaded successfully: {}", url);
                return url;
            } catch (IOException e) {
                log.error("Failed to upload post image", e);
                throw new RuntimeException("Post image upload failed: " + e.getMessage(), e);
            }
        });
    }

    public CompletableFuture<String> uploadBase64Image(String base64Data) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateBase64Image(base64Data);
                Map<String, Object> uploadParams = ObjectUtils.asMap(
                        "folder", "posts",
                        "resource_type", "image"
                );
                Map<?, ?> uploadResult = cloudinary.uploader().upload(base64Data, uploadParams);
                String url = uploadResult.get("secure_url").toString();
                log.info("Base64 image uploaded successfully: {}", url);
                return url;
            } catch (Exception e) {
                log.error("Failed to upload base64 image", e);
                throw new RuntimeException("Base64 image upload failed: " + e.getMessage(), e);
            }
        });
    }

    private void validateBase64Image(String base64Data) {
        if (base64Data == null || base64Data.isBlank()) {
            throw new IllegalArgumentException("Base64 image data cannot be empty");
        }
        if (!base64Data.startsWith("data:image/")) {
            throw new IllegalArgumentException("Only base64-encoded image data URIs are supported");
        }
        if (!base64Data.contains(";base64,")) {
            throw new IllegalArgumentException("Base64 image data must use the data URI format with base64 encoding");
        }
        String base64Payload = base64Data.substring(base64Data.indexOf(";base64,") + ";base64,".length());
        try {
            Base64.getDecoder().decode(base64Payload);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Base64 image data is not valid base64", e);
        }
    }

    private void validateFile(MultipartFile file, List<String> allowedTypes, String fileType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(fileType + " cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(fileType + " size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        byte[] headerBytes = getHeaderBytes(file);

        if (!isValidByMagicNumber(headerBytes, allowedTypes, contentType)) {
            throw new IllegalArgumentException("Invalid " + fileType + " format. Allowed types: " + allowedTypes);
        }
    }

    private byte[] getHeaderBytes(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            if (bytes.length > 16) {
                return Arrays.copyOf(bytes, 16);
            }
            return bytes;
        } catch (IOException e) {
            throw new RuntimeException("Unable to read file header", e);
        }
    }

    private boolean isValidByMagicNumber(byte[] headerBytes, List<String> allowedTypes, String contentType) {
        String lowerContentType = contentType != null ? contentType.toLowerCase() : "";

        if (lowerContentType.contains("pdf") || startsWith(headerBytes, "%PDF")) {
            return allowedTypes.contains("application/pdf");
        }
        if (lowerContentType.contains("wordprocessingml.document") || startsWith(headerBytes, "PK")) {
            return allowedTypes.contains("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                    || allowedTypes.contains("application/msword");
        }
        if (lowerContentType.contains("msword") || startsWith(headerBytes, new byte[] {(byte) 0x0D, (byte) 0x0A, (byte) 0x1A, (byte) 0x00})) {
            return allowedTypes.contains("application/msword");
        }
        if (lowerContentType.contains("jpeg") || startsWith(headerBytes, new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})) {
            return allowedTypes.contains("image/jpeg") || allowedTypes.contains("image/jpg");
        }
        if (lowerContentType.contains("png") || startsWith(headerBytes, new byte[] {(byte) 0x89, 'P', 'N', 'G'})) {
            return allowedTypes.contains("image/png");
        }
        if (lowerContentType.contains("gif") || startsWith(headerBytes, "GIF8")) {
            return allowedTypes.contains("image/gif");
        }
        if (lowerContentType.contains("webp") || startsWith(headerBytes, "RIFF") && contains(headerBytes, "WEBP")) {
            return allowedTypes.contains("image/webp");
        }
        return false;
    }

    private boolean startsWith(byte[] bytes, String prefix) {
        byte[] prefixBytes = prefix.getBytes(StandardCharsets.ISO_8859_1);
        if (bytes.length < prefixBytes.length) {
            return false;
        }
        for (int i = 0; i < prefixBytes.length; i++) {
            if (bytes[i] != prefixBytes[i]) {
                return false;
            }
        }
        return true;
    }

    private boolean startsWith(byte[] bytes, byte[] prefixBytes) {
        if (bytes.length < prefixBytes.length) {
            return false;
        }
        for (int i = 0; i < prefixBytes.length; i++) {
            if (bytes[i] != prefixBytes[i]) {
                return false;
            }
        }
        return true;
    }

    private boolean contains(byte[] bytes, String text) {
        byte[] needle = text.getBytes(StandardCharsets.ISO_8859_1);
        for (int i = 0; i + needle.length <= bytes.length; i++) {
            boolean found = true;
            for (int j = 0; j < needle.length; j++) {
                if (bytes[i + j] != needle[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        return false;
    }

    /**
     * Delete file from Cloudinary (or local if it's an old file)
     */
    public boolean deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }

        try {
            if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
                String publicId = extractPublicId(filePath);
                if (publicId != null) {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                    return true;
                }
            } else {
                log.warn("Legacy local file deletion requested but local uploads are no longer supported: {}", filePath);
            }
        } catch (Exception e) {
            log.error("Failed to delete file: {}", filePath, e);
        }
        return false;
    }

    public String getSignedUrl(String fileUrl) {
        if (!fileUrl.contains("cloudinary.com")) return fileUrl;
        String publicId = extractPublicId(fileUrl);
        if (publicId == null) return fileUrl;
        
        try {
            // Generate a signed URL securely (HTTPS). If it's a PDF, specify the format.
            if (fileUrl.toLowerCase().endsWith(".pdf")) {
                return cloudinary.url().secure(true).signed(true).resourceType("image").format("pdf").generate(publicId);
            }
            return cloudinary.url().secure(true).signed(true).resourceType("image").generate(publicId);
        } catch (Exception e) {
            log.error("Failed to generate signed URL", e);
            return fileUrl;
        }
    }

    private String extractPublicId(String fileUrl) {
        if (!fileUrl.contains("cloudinary.com")) return null;
        try {
            int uploadIndex = fileUrl.indexOf("/upload/");
            if (uploadIndex == -1) return null;
            
            // Skip the version tag if present (e.g. /v1234567890/)
            String afterUpload = fileUrl.substring(uploadIndex + 8);
            if (afterUpload.matches("^v\\d+/.*")) {
                afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
            }
            
            // Remove extension
            int lastDot = afterUpload.lastIndexOf('.');
            if (lastDot != -1) {
                afterUpload = afterUpload.substring(0, lastDot);
            }
            return afterUpload;
        } catch (Exception e) {
            return null;
        }
    }

}