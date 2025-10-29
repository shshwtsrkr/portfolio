package com.portfolio.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class GitHubOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final String DEFAULT_SUCCESS_URL = "/admin/dashboard";

    private final Set<String> allowedUsers;

    public GitHubOAuth2SuccessHandler(
            @Value("${portfolio.security.github.allowed-users:}") String allowedUsers) {
        this.allowedUsers = Arrays.stream(allowedUsers.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
        setDefaultTargetUrl(DEFAULT_SUCCESS_URL);
        setAlwaysUseDefaultTargetUrl(true);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        if (authentication instanceof OAuth2AuthenticationToken oAuth2Token) {
            String login = (String) oAuth2Token.getPrincipal().getAttributes().get("login");

            if (!allowedUsers.isEmpty() && !allowedUsers.contains(login)) {
                getRedirectStrategy().sendRedirect(request, response, "/login?unauthorizedUser");
                return;
            }
        }

        super.onAuthenticationSuccess(request, response, authentication);
    }
}
