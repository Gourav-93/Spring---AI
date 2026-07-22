package com.backend.aii.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService(
            @Value("${gemini.api.key}") String apiKey) {

        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    public String askGemini(String prompt) {

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-2.5-flash",
                        prompt,
                        null
                );

        return response.text();
    }
}