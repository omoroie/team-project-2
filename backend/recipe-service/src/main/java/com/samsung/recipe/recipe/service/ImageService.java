package com.samsung.recipe.recipe.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.samsung.recipe.recipe.config.StorageConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final StorageConfig storageConfig;
    private final Storage gcpStorage;

    public String uploadImage(MultipartFile file) throws IOException {
        log.info("Starting image upload process");
        
        // 파일 유효성 검사
        if (file.isEmpty()) {
            log.error("Uploaded file is empty");
            throw new IllegalArgumentException("업로드할 파일이 비어있습니다.");
        }

        // 이미지 파일인지 확인
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.error("Invalid content type: {}", contentType);
            throw new IllegalArgumentException("이미지 파일만 업로드 가능합니다.");
        }

        // 파일 크기 확인 (10MB 제한)
        if (file.getSize() > 10 * 1024 * 1024) {
            log.error("File size too large: {} bytes", file.getSize());
            throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
        }

        // 고유한 파일명 생성
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String filename = storageConfig.getGcp().getFolderName() + "/" + timestamp + "_" + uniqueId + extension;

        log.info("Generated filename: {}", filename);
        log.info("Bucket name: {}", storageConfig.getGcp().getBucketName());
        log.info("Project ID: {}", storageConfig.getGcp().getProjectId());

        try {
            // GCP Cloud Storage에 업로드
            BlobId blobId = BlobId.of(storageConfig.getGcp().getBucketName(), filename);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(contentType)
                    .build();

            log.info("Attempting to upload to GCP Storage...");
            Blob blob = gcpStorage.create(blobInfo, file.getBytes());

            // 공개 URL 반환
            String publicUrl = "https://storage.googleapis.com/" + storageConfig.getGcp().getBucketName() + "/" + filename;
            log.info("Image uploaded to GCP Storage: {}", publicUrl);
            
            return publicUrl;

        } catch (Exception e) {
            log.error("Failed to upload image to GCP Storage: {}", e.getMessage());
            log.error("Exception details:", e);
            
            // GCP 인증 관련 오류인지 확인
            if (e.getMessage().contains("authentication") || e.getMessage().contains("credentials")) {
                throw new IOException("GCP 인증 실패. 서비스 계정 키를 확인해주세요: " + e.getMessage());
            } else if (e.getMessage().contains("bucket") || e.getMessage().contains("not found")) {
                throw new IOException("GCP Storage 버킷을 찾을 수 없습니다. 버킷명을 확인해주세요: " + e.getMessage());
            } else {
                throw new IOException("GCP Storage 업로드 실패: " + e.getMessage());
            }
        }
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }
        deleteFromGcpStorage(imageUrl);
    }

    private void deleteFromGcpStorage(String imageUrl) {
        try {
            // URL에서 파일명 추출
            String prefix = "https://storage.googleapis.com/" + storageConfig.getGcp().getBucketName() + "/";
            if (imageUrl.startsWith(prefix)) {
                String filename = imageUrl.substring(prefix.length());
                BlobId blobId = BlobId.of(storageConfig.getGcp().getBucketName(), filename);
                boolean deleted = gcpStorage.delete(blobId);
                if (deleted) {
                    log.info("Image deleted from GCP Storage: {}", filename);
                } else {
                    log.warn("Image not found in GCP Storage: {}", filename);
                }
            }
        } catch (Exception e) {
            log.error("Failed to delete image from GCP Storage: {}", e.getMessage());
        }
    }
}