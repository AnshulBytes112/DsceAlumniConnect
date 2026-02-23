package com.dsce.AlumniConnect.filter;

import com.dsce.AlumniConnect.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtils jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // 1. If missing or not starting with Bearer → skip token processing
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        // 2. JWT must contain exactly 2 dots → otherwise skip
        if (jwt == null || !jwt.contains(".")) {
            chain.doFilter(request, response);
            return;
        }

        // 3. Extract username safely
        String username = null;
        try {
            username = jwtUtil.extractUsername(jwt);
            System.out.println("[JWT DEBUG] Successfully extracted username: " + username);
        } catch (Exception e) {
            // invalid token → skip authentication
            System.out.println("[JWT DEBUG] Failed to extract username: " + e.getMessage());
            e.printStackTrace();
            chain.doFilter(request, response);
            return;
        }

        // 4. If username is valid and no existing authentication
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            System.out.println(
                    "[JWT DEBUG] Loaded user for: " + username + ", authorities: " + userDetails.getAuthorities());

            if (jwtUtil.validateToken(jwt)) {
                System.out.println("[JWT DEBUG] ✓ Token VALID for: " + username);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                System.out.println("[JWT DEBUG] ✗ Token INVALID for: " + username);
            }
        } else {
            System.out.println("[JWT DEBUG] Skip auth - user: " + username + ", hasAuth: "
                    + (SecurityContextHolder.getContext().getAuthentication() != null));
        }

        chain.doFilter(request, response);
    }
}
