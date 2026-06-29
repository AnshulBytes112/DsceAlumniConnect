import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

public class TestUrlSigned {
    public static void main(String[] args) throws Exception {
        Cloudinary cloudinary = new Cloudinary("cloudinary://346773447964137:-OcpEyQwtOFo-jCfKK71rDQuDvE@dtcykwuc1");
        String publicId = "resumes/clwm7aj5qhewwatuhyzx";
        
        // Let's generate both forms and test them
        String[] urlsToTest = new String[] {
            cloudinary.url().secure(true).signed(true).resourceType("image").generate(publicId),
            cloudinary.url().secure(true).signed(true).resourceType("image").format("pdf").generate(publicId),
            cloudinary.url().secure(true).signed(true).resourceType("image").generate(publicId + ".pdf")
        };
        
        for (String signedUrl : urlsToTest) {
            System.out.println("Testing URL: " + signedUrl);
            
            // Note: if format wasn't used, we append .pdf manually if we want to fetch the pdf
            String fetchUrl = signedUrl;
            if (!fetchUrl.endsWith(".pdf")) {
                 fetchUrl += ".pdf";
            }
            System.out.println("Fetching: " + fetchUrl);
            
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URL(fetchUrl).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            try {
                System.out.println("Response Code: " + conn.getResponseCode());
                if (conn.getResponseCode() == 200) {
                    System.out.println("SUCCESS!");
                    break;
                }
            } catch(Exception e) {
                e.printStackTrace();
            }
            System.out.println("-------------------");
        }
    }
}
