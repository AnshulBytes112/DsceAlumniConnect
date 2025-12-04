package com.dsce.AlumniConnect.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.http.GenericUrl;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpRequestFactory;
import com.google.api.client.http.HttpResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import org.springframework.stereotype.Service;

@Service
public class GoogleTokenVerifier {

    public GoogleTokenVerifier() {
    }

    public GoogleIdToken.Payload verify(String accessToken) throws Exception {
        HttpRequestFactory requestFactory = new NetHttpTransport().createRequestFactory();
        GenericUrl url = new GenericUrl("https://www.googleapis.com/oauth2/v3/userinfo");
        HttpRequest request = requestFactory.buildGetRequest(url);
        request.setParser(new com.google.api.client.json.gson.GsonFactory().createJsonObjectParser());
        request.getHeaders().setAuthorization("Bearer " + accessToken);

        HttpResponse response = request.execute();

        if (!response.isSuccessStatusCode()) {
            throw new IllegalArgumentException("Invalid Google Access Token");
        }

        // Parse response
        return response.parseAs(GoogleIdToken.Payload.class);
    }
}
