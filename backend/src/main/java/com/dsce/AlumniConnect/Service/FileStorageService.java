package com.dsce.AlumniConnect.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload.base-dir}")
    private String BASE_UPLOAD_DIR;



    private final String RESUME_DIR = "resumes/";
    private final String PROFILE_DIR = "profiles/";

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
        return uploadFile(file, RESUME_DIR);
    }


    public String uploadProfilePicture(MultipartFile file) throws IOException {
        validateFile(file, ALLOWED_IMAGE_TYPES, "Profile picture");
        return uploadFile(file, PROFILE_DIR);
    }

    private String uploadFile(MultipartFile file, String subDirectory) throws IOException {
        // Create directory if not exists
        String uploadPath = BASE_UPLOAD_DIR + File.separator + subDirectory;
        File dir = new File(uploadPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }


        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String fileName = UUID.randomUUID() + extension;

        // Save file
        Path path = Paths.get(uploadPath + fileName);
        Files.write(path, file.getBytes());

        // Return relative path (for storing in database)
        return subDirectory + fileName;
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
     * Delete file
     */
    public boolean deleteFile(String filePath) {
        try {
            if (filePath == null || filePath.isEmpty()) {
                return false;
            }
            Path path = Paths.get(BASE_UPLOAD_DIR + File.separator + filePath);
            return Files.deleteIfExists(path);
        } catch (IOException e) {
            return false;
        }
    }

    public Path getFilePath(String relativePath) {
        return Paths.get(BASE_UPLOAD_DIR + File.separator + relativePath);
    }
}