package com.samsung.recipe.recipe.controller;

import com.samsung.recipe.recipe.service.ImageService;
import com.samsung.recipe.recipe.config.StorageConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/images")
@CrossOrigin(origins = "*")
public class ImageController {

    @Autowired
    private ImageService imageService;
    
    @Autowired
    private StorageConfig storageConfig;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== Image Upload Request ===");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            
            String imageUrl = imageService.uploadImage(file);
            
            System.out.println("Upload successful: " + imageUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", Map.of("imageUrl", imageUrl));
            response.put("message", "이미지 업로드 성공");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Image upload failed: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "이미지 업로드 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testGcpConnection() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "GCP Storage 연결 테스트");
            response.put("bucketName", storageConfig.getGcp().getBucketName());
            response.put("projectId", storageConfig.getGcp().getProjectId());
            response.put("folderName", storageConfig.getGcp().getFolderName());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "GCP Storage 연결 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteImage(@RequestParam("imageUrl") String imageUrl) {
        try {
            imageService.deleteImage(imageUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "이미지 삭제 성공");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "이미지 삭제 실패: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}