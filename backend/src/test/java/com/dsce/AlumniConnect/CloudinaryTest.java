package com.dsce.AlumniConnect;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.util.Map;

@SpringBootTest
class CloudinaryTest {

    @Autowired
    private Cloudinary cloudinary;

    @Test
    void testCloudinaryConnectionAndSignedUrl() {
        try {
            System.out.println("Cloudinary configuration: " + cloudinary.config.cloudName);
            
            // 1. Attempt upload as raw
            System.out.println("Attempting test upload as raw...");
            Map uploadResult = cloudinary.uploader().upload(
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    ObjectUtils.asMap("folder", "resumes", "resource_type", "raw")
            );
            System.out.println("Upload success! Result: " + uploadResult);
            
            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            System.out.println("Uploaded secure_url: " + secureUrl);
            System.out.println("Uploaded public_id: " + publicId);
            
            // Try downloading the plain secure_url first
            System.out.println("Downloading plain secure_url: " + secureUrl);
            HttpURLConnection connPlain = (HttpURLConnection) new URI(secureUrl).toURL().openConnection();
            connPlain.setRequestMethod("GET");
            connPlain.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            System.out.println("Plain secure_url response: " + connPlain.getResponseCode());
            if (connPlain.getResponseCode() != 200) {
                System.out.println("Plain secure_url X-Cld-Error: " + connPlain.getHeaderField("X-Cld-Error"));
            }
            
            // 2. Generate signed URL for raw
            String signedUrl = cloudinary.url().secure(true).signed(true).resourceType("raw").generate(publicId);
            System.out.println("Generated signed URL for raw: " + signedUrl);
            
            // 3. Try downloading the signed URL
            HttpURLConnection conn = (HttpURLConnection) new URI(signedUrl).toURL().openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            
            int status = conn.getResponseCode();
            System.out.println("HTTP Response Code from signed URL (raw): " + status);
            if (status == 200) {
                System.out.println("DOWNLOAD SUCCESSFUL!");
            } else {
                System.out.println("DOWNLOAD FAILED with status: " + status);
                System.out.println("X-Cld-Error header: " + conn.getHeaderField("X-Cld-Error"));
            }
            
            // 4. Try downloading with a wrong signature
            String wrongSignedUrl = signedUrl.replace("s--", "s--invalid--");
            System.out.println("Downloading with wrong signature: " + wrongSignedUrl);
            HttpURLConnection connWrong = (HttpURLConnection) new URI(wrongSignedUrl).toURL().openConnection();
            connWrong.setRequestMethod("GET");
            connWrong.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            System.out.println("Wrong signature response: " + connWrong.getResponseCode());
            System.out.println("Wrong signature X-Cld-Error: " + connWrong.getHeaderField("X-Cld-Error"));
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
