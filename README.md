# Personal Gemini Journal & Brainstorming Hub

A secure, intelligent journaling and SMART goal-setting workspace built with **React**, **Express**, **Vite**, **TypeScript**, **Tailwind CSS**, **Cloud Firestore**, and the **Gemini 3.6 Flash** model via the `@google/genai` SDK.

---

## 🌟 Key Features

- **Introspective Journaling**: Multi-mode cognitive reflection workspace (Reflection, Brainstorming, Structured Inquiry, Cognitive Reframe, Socratic Method).
- **Automated Distillation & Tagging**: AI extracts core takeaways, dominant emotion states, thematic tags, and mood index scores.
- **SMART Goal Transformation & AI Coaching**: Transforms unstructured ambitions into quantifiable milestones with weekly progress coaching check-ins.
- **Semantic Memory Search**: Natural language query interface (`⌘K`) across historical entries to identify long-term patterns and psychological breakthroughs.
- **Data Sovereignty & Export**: Export entire reflection history and goal records to Markdown (`.md`) or raw JSON (`.json`).
- **Resilient Fallback Ladder**: Robust error recovery matrix automatically fails over across `gemini-3.6-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`, and `gemini-3.7-flash`.

---

## 🛡️ Cloud Firestore Security Rules

Deploy the following security rules to Cloud Firestore to enforce strict, owner-bound data isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /goals/{goalId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 🔐 Google Cloud Secret Manager Setup

Store your Gemini API key in Secret Manager and grant Cloud Run access:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant the Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚀 Google Cloud Run Deployment

Deploy the application container directly to Cloud Run:

```bash
# Build and deploy to Cloud Run
gcloud run deploy gemini-journal-hub \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --update-labels=dev-tutorial=cloud-run-ai-challenge
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# 3. Start development server
npm run dev
```
