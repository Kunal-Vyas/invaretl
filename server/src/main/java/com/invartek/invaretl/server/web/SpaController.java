package com.invartek.invaretl.server.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA fallback controller.
 *
 * Vue Router uses createWebHistory (clean URLs like /projects, /settings).
 * When a user refreshes the browser on a deep-linked route, the request hits
 * the Spring Boot server directly. Without this controller the server would
 * return a 404 because it has no route registered for /projects etc.
 *
 * Strategy: explicitly list every known SPA route, plus a broad /** catch-all
 * for unknown paths (e.g. /projects/some-id, or any future route not yet
 * listed here). Static assets under /assets/ are served directly by Spring's
 * ResourceHttpRequestHandler (registered at a higher priority than this
 * controller) and never reach here.
 *
 * Spring Boot 3 uses PathPatternParser by default, which does not allow
 * patterns like /**&#47;{path:[^.]*}. We therefore use simple explicit paths
 * and a plain /** catch-all, relying on Spring's static-resource handler
 * being registered first to intercept /assets/**, /favicon.ico, etc.
 *
 * The /** catch-all also means Vue Router can render a proper "Not Found"
 * page for unknown routes rather than the server returning a 404.
 */
@Controller
public class SpaController {

    /**
     * Forward all known SPA routes, deep-links, and the catch-all to index.html.
     *
     * Spring's static resource handler has higher priority and will serve
     * /assets/**, /favicon.ico, /vite.svg and other asset paths before
     * this mapping is ever consulted.
     *
     * The /** entry at the end acts as a catch-all backstop so that:
     *   - Deep links like /projects/123 are forwarded to index.html, not 404'd.
     *   - Unknown routes are handled gracefully by Vue Router's own 404 view.
     */
    @RequestMapping(
        {
            "/",
            "/projects",
            "/projects/**",
            "/help",
            "/help/**",
            "/profile",
            "/profile/**",
            "/settings",
            "/settings/**",
            // Catch-all: any path not matched by the static-resource handler or
            // the explicit routes above is forwarded to index.html so Vue Router
            // can decide what to render (including its own Not Found view).
            "/**",
        }
    )
    public String spa() {
        return "forward:/index.html";
    }
}
