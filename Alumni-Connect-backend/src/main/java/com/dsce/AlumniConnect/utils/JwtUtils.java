package com.dsce.AlumniConnect.utils;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
//this means that this class is a spring bean and can be autowired in other classes
//this class will contain methods to generate and validate JWT tokens
//it will use the io.jsonwebtoken library to do so
//we will use a secret key to sign the tokens
//the secret key should be at least 256 bits long
//we will also set an expiration time for the tokens
//we will create a method to generate a token for a given username
//we will create a method to validate a token and extract the username from it
//we will create a method to check if a token is expired
//we will create a method to get the expiration date of a token
//we will create a method to get the claims from a token
//we will create a method to get the subject from a token
//we will create a method to get the issued at date from a token
//we will create a method to get the audience from a token
//we will create a method to get the issuer from a token
//we will create a method to get the id from a token
//we will create a method to get the not before date from a token
//we will create a method to get the signature from a token
//we will create a method to get the header from a token
//we will create a method to get the body from a token
//we will create a method to get the token type from a token
//we will create a method to get the token version from a token
//we will create a method to get the token algorithm from a token
//we will create a method to get the token key id from a token
//we will create a method to get the token content type from a token
//we will create a method to get the token critical from a token
//we will create a method to get the token custom claims from a token
//we will create a method to get the token all claims from a token
//we will create a method to get the token all headers from a token
//we will create a method to get the token all body from a token
public class JwtUtils {


    @Value("${jwt.secret}")
    private String SECRET_KEY;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String extractUsername(String token) {
        Claims claims = extractAllClaims(token);
        return claims.getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .header().empty().add("typ","JWT")
                .and()
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 5 minutes expiration time
                .signWith(getSigningKey())
                .compact();
    }

    public Boolean validateToken(String token) {
        return !isTokenExpired(token);
    }

}

