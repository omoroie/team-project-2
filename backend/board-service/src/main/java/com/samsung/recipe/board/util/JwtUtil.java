package com.samsung.recipe.board.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key;
    private final int jwtExpirationInMs;

    public JwtUtil(@Value("${jwt.secret:mySecretKeyThatIsLongEnoughForHS256AlgorithmAndIsAtLeast256BitsLong}") String secret,
                   @Value("${jwt.expiration:86400000}") int jwtExpirationInMs) {
        // JWT 키는 최소 256비트(32바이트)여야 합니다
        String finalSecret = secret.length() < 32 ? 
            secret + "0123456789abcdef0123456789abcdef" : secret;
        this.key = Keys.hmacShaKeyFor(finalSecret.getBytes());
        this.jwtExpirationInMs = jwtExpirationInMs;
    }

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return !isTokenExpired(claims);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}