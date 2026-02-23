package com.dsce.AlumniConnect.util;

import org.springframework.stereotype.Component;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.UUID;

@Component
public class ImageUtil {
    
    private static final String UPLOAD_DIR = "uploads/images/";
    private static final String BASE_URL = "http://localhost:8080/uploads/images/";
    
    static {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            System.out.println("Image upload directory created at: " + uploadPath.toAbsolutePath());
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directory", e);
        }
    }
    
    public String saveBase64Image(String base64Data) {
        try {
            System.out.println("=== IMAGE PROCESSING DEBUG ===");
            System.out.println("Input base64 length: " + base64Data.length());
            System.out.println("Input base64 prefix: " + base64Data.substring(0, Math.min(50, base64Data.length())));
            
            // Extract the base64 part (remove data:image/jpeg;base64, prefix)
            String base64Image = base64Data.split(",")[1];
            System.out.println("Extracted base64 length: " + base64Image.length());
            
            // Decode base64 to bytes
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            System.out.println("Decoded image bytes: " + imageBytes.length);
            
            // Generate unique filename
            String fileName = UUID.randomUUID().toString() + ".jpg";
            String filePath = UPLOAD_DIR + fileName;
            
            // Save to file
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(imageBytes);
            }
            
            System.out.println("Image saved to: " + Paths.get(filePath).toAbsolutePath());
            
            // Return the URL
            String imageUrl = BASE_URL + fileName;
            System.out.println("Image URL: " + imageUrl);
            System.out.println("=== END IMAGE PROCESSING DEBUG ===");
            
            return imageUrl;
            
        } catch (Exception e) {
            System.err.println("Failed to save image: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save image", e);
        }
    }
    
    public static boolean isBase64Image(String data) {
        return data != null && data.startsWith("data:image/");
    }
}
