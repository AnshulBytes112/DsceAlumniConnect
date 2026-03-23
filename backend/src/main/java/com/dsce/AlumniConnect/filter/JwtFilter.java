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

        String path = request.getRequestURI();

        // 🔥 STEP 1: BYPASS PUBLIC ENDPOINTS
        if (path.startsWith("/api/resumes/parse") ||
            path.startsWith("/api/auth") ||
            path.startsWith("/auth") ||
            path.startsWith("/api/public")) {

            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        // STEP 2: No token → continue (Spring Security will decide)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        // STEP 3: Basic validation
        if (jwt == null || !jwt.contains(".")) {
            chain.doFilter(request, response);
            return;
        }

        String username = null;

        try {
            username = jwtUtil.extractUsername(jwt);
            System.out.println("[JWT DEBUG] Username: " + username);
        } catch (Exception e) {
            System.out.println("[JWT DEBUG] Invalid token: " + e.getMessage());
            chain.doFilter(request, response);
            return;
        }

        // STEP 4: Authenticate if valid
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt)) {

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(auth);

                System.out.println("[JWT DEBUG] ✅ Authenticated: " + username);

            } else {
                System.out.println("[JWT DEBUG] ❌ Invalid token for: " + username);
            }
        }

        chain.doFilter(request, response);
    }
}