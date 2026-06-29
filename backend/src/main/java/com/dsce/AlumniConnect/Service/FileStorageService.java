package com.dsce.AlumniConnect.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload.base-dir}")
    private String BASE_UPLOAD_DIR;

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

    public String uploadResume(MultipartFile file) throws IOException {
        validateFile(file, ALLOWED_RESUME_TYPES, "Resume");
        Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", RESUME_DIR,
                "resource_type", "auto"
        );
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        return uploadResult.get("secure_url").toString();
    }

    public String uploadProfilePicture(MultipartFile file) throws IOException {
        validateFile(file, ALLOWED_IMAGE_TYPES, "Profile picture");
        Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", PROFILE_DIR,
                "resource_type", "image"
        );
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        return uploadResult.get("secure_url").toString();
    }

    public String uploadPostImage(MultipartFile file) throws IOException {
        validateFile(file, ALLOWED_IMAGE_TYPES, "Post image");
        Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", "posts",
                "resource_type", "image"
        );
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
        return uploadResult.get("secure_url").toString();
    }

    private void validateFile(MultipartFile file, List<String> allowedTypes, String fileType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(fileType + " cannot be empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(fileType + " size exceeds maximum limit of 5MB");
        }

        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid " + fileType + " format. Allowed types: " + allowedTypes);
        }
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
                // It's a Cloudinary URL
                String publicId = extractPublicId(filePath);
                if (publicId != null) {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                    return true;
                }
            } else {
                // Old local file
                Path path = Paths.get(BASE_UPLOAD_DIR + File.separator + filePath);
                return Files.deleteIfExists(path);
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

    public Path getFilePath(String relativePath) {
        return Paths.get(BASE_UPLOAD_DIR + File.separator + relativePath);
    }
}