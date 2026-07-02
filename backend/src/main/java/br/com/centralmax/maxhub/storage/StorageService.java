package br.com.centralmax.maxhub.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {
    String upload(MultipartFile file, String folder) throws IOException;
    void delete(String fileUrl) throws IOException;
}
