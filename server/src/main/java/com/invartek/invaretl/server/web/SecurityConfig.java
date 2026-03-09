package com.invartek.invaretl.server.web;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for the InvarETL application.
 *
 * At the skeleton-UI stage there is no authentication. This config:
 *   - Permits all requests to static assets served by Spring's resource handler
 *     (/assets/**, /index.html, /favicon.ico, /vite.svg …)
 *   - Permits the Actuator health endpoint (used by Docker health-check)
 *   - Permits all SPA routes (/, /projects, /help, /profile, /settings)
 *     so the SpaController can forward them to index.html
 *   - Disables CSRF (stateless REST API — no server-rendered forms)
 *   - Disables HTTP Basic / form login (no auth UI at this stage)
 *   - Disables the X-Frame-Options DENY header so the H2 console works in dev
 *
 * IMPORTANT — backstop rule:
 *   Any request not matched by an explicit rule below is DENIED. This ensures
 *   that new endpoints added in the future are secure by default rather than
 *   accidentally public. To expose a new endpoint, add an explicit
 *   requestMatchers(...).permitAll() rule above the backstop, or replace
 *   .anyRequest().denyAll() with .anyRequest().authenticated() once auth lands.
 *
 * When authentication is introduced in a later milestone, this class should
 * be extended rather than replaced: add the authenticated routes inside the
 * same SecurityFilterChain bean, preserving the public-asset and SPA
 * forwarding rules.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {
        http
            // ── CSRF ────────────────────────────────────────────────────────
            // Disabled: the app is a stateless SPA backed by a REST API.
            // Re-enable when session-based auth is introduced.
            .csrf(AbstractHttpConfigurer::disable)
            // ── Frame options ────────────────────────────────────────────────
            // Allow same-origin frames so the H2 console (/h2-console) renders
            // correctly in development. Has no effect in prod (H2 disabled).
            .headers(headers ->
                headers.frameOptions(
                    HeadersConfigurer.FrameOptionsConfig::sameOrigin
                )
            )
            // ── Authorisation rules ──────────────────────────────────────────
            .authorizeHttpRequests(auth ->
                auth
                    // Actuator health endpoint — required by Docker HEALTHCHECK
                    .requestMatchers("/actuator/health", "/actuator/info")
                    .permitAll()
                    // H2 console (dev profile only; disabled in prod via application.yml)
                    .requestMatchers("/h2-console/**")
                    .permitAll()
                    // SPA entry point and root
                    .requestMatchers("/", "/index.html")
                    .permitAll()
                    // Vite-generated static asset bundle (JS, CSS, source maps)
                    // Vite outputs all chunks under /assets/
                    .requestMatchers("/assets/**")
                    .permitAll()
                    // Favicon and any other root-level static files
                    .requestMatchers(
                        "/favicon.ico",
                        "/vite.svg",
                        "/*.ico",
                        "/*.png",
                        "/*.jpg",
                        "/*.svg",
                        "/*.webp",
                        "/*.woff2",
                        "/*.woff",
                        "/*.ttf"
                    )
                    .permitAll()
                    // SPA routes — the SpaController forwards these to index.html.
                    // The /** catch-all below ensures any deep-link not explicitly
                    // listed here (e.g. /projects/some-id) is still forwarded to
                    // index.html by SpaController rather than returning a 404.
                    .requestMatchers(
                        "/projects",
                        "/projects/**",
                        "/help",
                        "/help/**",
                        "/profile",
                        "/profile/**",
                        "/settings",
                        "/settings/**"
                    )
                    .permitAll()
                    // API routes — open for now; lock down when auth is added.
                    // TODO: replace with .authenticated() once auth is implemented.
                    .requestMatchers("/api/**")
                    .permitAll()
                    // SPA catch-all — any unmatched path is forwarded to index.html
                    // so Vue Router can handle unknown client-side routes gracefully.
                    // This must come before the backstop denyAll rule.
                    .requestMatchers("/**")
                    .permitAll()
                    // ── Backstop ──────────────────────────────────────────────────
                    // DENY everything not explicitly permitted above.
                    // This is intentionally strict: new endpoints must be whitelisted
                    // here rather than being public by accident.
                    // Replace with .anyRequest().authenticated() when auth lands.
                    .anyRequest()
                    .denyAll()
            )
            // ── Disable login UI ─────────────────────────────────────────────
            // No form login or HTTP Basic at this stage.
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable);

        return http.build();
    }
}
