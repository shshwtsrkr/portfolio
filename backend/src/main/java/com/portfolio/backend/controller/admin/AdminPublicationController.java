package com.portfolio.backend.controller.admin;

import com.portfolio.backend.model.Publication;
import com.portfolio.backend.service.PublicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin/publications")
public class AdminPublicationController {

    @Autowired
    private PublicationService publicationService;

    @GetMapping
    public String listPublications(Model model) {
        model.addAttribute("publications", publicationService.getAllPublications());
        return "admin/publications/list";
    }

    @GetMapping("/new")
    public String newPublication(Model model) {
        model.addAttribute("publication", new Publication());
        return "admin/publications/form";
    }

    @GetMapping("/edit/{id}")
    public String editPublication(@PathVariable Long id, Model model) {
        publicationService.getPublicationById(id).ifPresent(publication -> model.addAttribute("publication", publication));
        return "admin/publications/form";
    }

    @PostMapping("/save")
    public String savePublication(@ModelAttribute Publication publication) {
        if (publication.getId() != null) {
            publicationService.updatePublication(publication.getId(), publication);
        } else {
            publicationService.createPublication(publication);
        }
        return "redirect:/admin/publications";
    }

    @GetMapping("/delete/{id}")
    public String deletePublication(@PathVariable Long id) {
        publicationService.deletePublication(id);
        return "redirect:/admin/publications";
    }

    @PostMapping("/reorder")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> reorderPublications(@RequestBody List<Map<String, Object>> items) {
        Map<String, Object> response = new HashMap<>();
        try {
            for (Map<String, Object> item : items) {
                Long id = Long.valueOf(item.get("id").toString());
                Integer displayOrder = (Integer) item.get("displayOrder");

                publicationService.getPublicationById(id).ifPresent(publication -> {
                    publication.setDisplayOrder(displayOrder);
                    publicationService.updatePublication(id, publication);
                });
            }
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
