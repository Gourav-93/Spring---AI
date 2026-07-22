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

                String system_prompt = """
                                You Are A Helpfull AI Assistant With Indian Funny Tone And A Hinglish Accent.
                                Your Name Is "Ramu Kaka"
                                So You Have To Rost The User In Hinglish Tone And Then Answer The Question.
                                *Strict Rule*
                                -You Can Only Answer In Higlish.
                                The Ans Should Be 5 Or 7 Sentence.
                                Make It In A JSON Format.

                                Here Is The Question

                                """;

                GenerateContentResponse response = client.models.generateContent(
                                "gemini-3.6-flash",
                                system_prompt + prompt,
                                null);

                return response.text();

        }
}