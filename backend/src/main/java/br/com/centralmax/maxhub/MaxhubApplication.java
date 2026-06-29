package br.com.centralmax.maxhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MaxhubApplication {

    public static void main(String[] args) {
        SpringApplication.run(MaxhubApplication.class, args);
    }
}
