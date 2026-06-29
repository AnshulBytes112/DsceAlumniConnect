import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.util.Map;

public class TestUpload {
    public static void main(String[] args) {
        try {
            Cloudinary cloudinary = new Cloudinary("cloudinary://573892427256125:giXvq0iVNI5YS-E5fdIqIvMsYWQ@dtcykwuc1");
            Map uploadResult = cloudinary.uploader().upload("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", 
                ObjectUtils.asMap("folder", "resumes", "resource_type", "auto"));
            System.out.println("UPLOAD SUCCESS!");
            System.out.println("Result: " + uploadResult);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
