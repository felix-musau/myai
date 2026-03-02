# Chatbot Improvement TODO

## Phase 1: ML Service Updates
- [ ] Update ml_service/main.py to return confidence scores (internal only)
- [ ] Update backend/routes/predict.js to pass confidence to chatbot

## Phase 2: Chatbot Rewrite
- [ ] Rewrite backend/routes/chatbot.js with new conversation flow:
  - [ ] Greeting stage with personal info collection (name, gender, age, conditions)
  - [ ] Symptoms collection stage
  - [ ] Conditional clarifying questions (skip if confidence >= 90%)
  - [ ] Diagnosis with precautions from CSV
  - [ ] Handle thanks/goodbye gracefully
  - [ ] Use preferred name throughout
  - [ ] End with refresh option or goodbye
  - [ ] Allow health tips/facts requests
  - [ ] Allow casual conversational chat
