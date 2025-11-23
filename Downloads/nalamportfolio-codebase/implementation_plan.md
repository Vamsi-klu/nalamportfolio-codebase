# Implementation Plan - Connect Chatbot to Backend

# Goal
Enable the AI chatbot to fetch real responses from the Python backend (`/api/chat`) instead of using hardcoded local responses.

## User Review Required
> [!IMPORTANT]
> This change requires the Python backend (`server.py`) to be running and the `GEMINI_API_KEY` to be set in the `.env` file.

## Proposed Changes

### Frontend
#### [MODIFY] [chatbot.js](file:///Users/ramachandranalam/Desktop/all_mix/nalamportfolio-codebase/Downloads/nalamportfolio-codebase/chatbot.js)
- Remove `knowledgeBase` object.
- Remove `findBestResponse` function.
- Update `sendMessage` to:
    1. Show user message.
    2. Show a "Typing..." indicator.
    3. `fetch('/api/chat', { method: 'POST', body: JSON.stringify({ question: msg }) })`.
    4. Handle response:
        - If success: Remove typing indicator, show AI response.
        - If error: Show error message.

## Verification Plan
### Manual Verification
1. Start the server: `python3 server.py`
2. Open `http://localhost:5000`
3. Open Chatbot and ask "Who is Ramachandra?"
4. Verify the request goes to `/api/chat` (Network tab) and response is displayed.
