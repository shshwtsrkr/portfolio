package com.portfolio.backend.controller.admin;

import com.portfolio.backend.dto.AdminCredentialsForm;
import com.portfolio.backend.model.AdminUser;
import com.portfolio.backend.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class AdminSecurityController {

    private final AdminUserService adminUserService;

    public AdminSecurityController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/admin/security")
    public String showSecurityPage(Model model) {
        AdminUser adminUser = adminUserService.getActiveAdminUser();
        AdminCredentialsForm form = new AdminCredentialsForm();
        form.setUsername(adminUser.getUsername());
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(form, "credentialsForm");
        model.addAttribute("credentialsForm", form);
        model.addAttribute("lastUpdated", adminUser.getUpdatedAt());
        model.addAttribute(BindingResult.MODEL_KEY_PREFIX + "credentialsForm", bindingResult);
        return "admin/security";
    }

    @PostMapping("/admin/security")
    public String updateCredentials(@Valid @ModelAttribute("credentialsForm") AdminCredentialsForm form,
                                    BindingResult bindingResult,
                                    Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("lastUpdated", adminUserService.getActiveAdminUser().getUpdatedAt());
            return "admin/security";
        }

        adminUserService.updateCredentials(form.getUsername(), form.getPassword());
        model.addAttribute("success", true);
        model.addAttribute("lastUpdated", adminUserService.getActiveAdminUser().getUpdatedAt());
        form.setPassword("");
        return "admin/security";
    }
}
