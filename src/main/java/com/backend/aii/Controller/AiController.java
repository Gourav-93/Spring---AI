package com.backend.aii.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.backend.aii.Model.QuestionModel;
import com.backend.aii.Service.GeminiService;

@RestController
@CrossOrigin("*")
public class AiController {

    @Autowired
    GeminiService geminiService;

    @PostMapping("/api/gemini")
    public String ask(@RequestBody QuestionModel user_question) {
        return geminiService.askGemini(user_question.getQuestion());
    }

}
