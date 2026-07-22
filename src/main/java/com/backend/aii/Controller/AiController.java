package com.backend.aii.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.backend.aii.Service.GeminiService;

@RestController
@CrossOrigin("*")
public class AiController {

    @Autowired
    GeminiService geminiService;

    @GetMapping("/api/gemini")
    public String ask() {
        return geminiService.askGemini("How Are You?");
    }

}
