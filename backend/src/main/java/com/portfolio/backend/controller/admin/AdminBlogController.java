package com.portfolio.backend.controller.admin;

import com.portfolio.backend.model.Blog;
import com.portfolio.backend.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin/blogs")
public class AdminBlogController {

    @Autowired
    private BlogService blogService;

    @GetMapping
    public String listBlogs(Model model) {
        model.addAttribute("blogs", blogService.getAllBlogs());
        return "admin/blogs/list";
    }

    @GetMapping("/new")
    public String newBlog(Model model) {
        model.addAttribute("blog", new Blog());
        return "admin/blogs/form";
    }

    @GetMapping("/edit/{id}")
    public String editBlog(@PathVariable Long id, Model model) {
        blogService.getBlogById(id).ifPresent(blog -> model.addAttribute("blog", blog));
        return "admin/blogs/form";
    }

    @PostMapping("/save")
    public String saveBlog(@ModelAttribute Blog blog) {
        if (blog.getId() != null) {
            blogService.updateBlog(blog.getId(), blog);
        } else {
            blogService.createBlog(blog);
        }
        return "redirect:/admin/blogs";
    }

    @GetMapping("/delete/{id}")
    public String deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return "redirect:/admin/blogs";
    }

    @PostMapping("/reorder")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> reorderBlogs(@RequestBody List<Map<String, Object>> items) {
        Map<String, Object> response = new HashMap<>();
        try {
            for (Map<String, Object> item : items) {
                Long id = Long.valueOf(item.get("id").toString());
                Integer displayOrder = (Integer) item.get("displayOrder");

                blogService.getBlogById(id).ifPresent(blog -> {
                    blog.setDisplayOrder(displayOrder);
                    blogService.updateBlog(id, blog);
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
