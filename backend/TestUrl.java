public class TestUrl {
    public static void main(String[] args) throws Exception {
        java.net.HttpURLConnection conn = (java.net.HttpURLConnection) new java.net.URL("https://res.cloudinary.com/dtcykwuc1/image/upload/v1781373344/resumes/o6vnctmqbyilzdhb0jrt.pdf").openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("User-Agent", "Mozilla/5.0");
        try {
            System.out.println("Response Code: " + conn.getResponseCode());
            System.out.println("Message: " + conn.getResponseMessage());
            java.io.InputStream in = conn.getErrorStream();
            if (in != null) {
                System.out.println("Error body: " + new String(in.readAllBytes()));
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
