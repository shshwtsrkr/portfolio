package com.portfolio.backend.service;

import com.portfolio.backend.model.Blog;
import com.portfolio.backend.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BlogService {
    @Autowired
    private BlogRepository blogRepository;

    public List<Blog> getAllBlogs() {
        return blogRepository.findAllByOrderByDisplayOrderAsc();
    }

    public Optional<Blog> getBlogById(Long id) {
        return blogRepository.findById(id);
    }

    public Blog createBlog(Blog blog) {
        return blogRepository.save(blog);
    }

    public Blog updateBlog(Long id, Blog blogDetails) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        blog.setTitle(blogDetails.getTitle());
        blog.setDescription(blogDetails.getDescription());
        blog.setContent(blogDetails.getContent());
        blog.setDate(blogDetails.getDate());
        blog.setThumbnailUrl(blogDetails.getThumbnailUrl());
        blog.setExternalUrl(blogDetails.getExternalUrl());
        blog.setTag(blogDetails.getTag());
        blog.setTagColor(blogDetails.getTagColor());
        blog.setReadDuration(blogDetails.getReadDuration());
        blog.setDisplayOrder(blogDetails.getDisplayOrder());
        blog.setIsPublished(blogDetails.getIsPublished());

        return blogRepository.save(blog);
    }

    public void deleteBlog(Long id) {
        blogRepository.deleteById(id);
    }
}
