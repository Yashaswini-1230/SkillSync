# SkillSync – Technologies and Algorithms

## Technologies Used

### Frontend
| Technology | Purpose |
|------------|--------|
| **React** | UI library and component-based frontend |
| **React Router** | Client-side routing (dashboard, upload, analyze, jobs, interview, etc.) |
| **Axios** | HTTP client for API calls (auth, resumes, analysis, jobs, interview) |
| **Tailwind CSS** | Utility-first styling and responsive layout |
| **React Icons** | Icons (FiMessageSquare, FiBriefcase, FiSearch, etc.) |
| **React Hot Toast** | Toast notifications for success/error feedback |
| **react-scripts** | Build, dev server, and test tooling (Create React App) |
| **PostCSS / Autoprefixer** | CSS processing for Tailwind |

### Backend
| Technology | Purpose |
|------------|--------|
| **Node.js** | Runtime for the backend server |
| **Express** | Web framework and REST API (auth, resumes, analysis, profile, interview, jobs) |
| **MongoDB** | Database for users, resumes, and analysis records |
| **Mongoose** | ODM for MongoDB (User, Resume, Analysis models) |
| **JWT (jsonwebtoken)** | Authentication tokens for protected routes |
| **bcryptjs** | Password hashing for signup/login |
| **Multer** | File upload handling (PDF/DOCX/TXT for resumes) |
| **dotenv** | Environment variables (PORT, MONGODB_URI, JWT_SECRET, API keys) |
| **cors** | Cross-origin requests for frontend–backend communication |
| **express-validator** | Request body validation (e.g. email, password, role) |
| **Axios** | Outgoing HTTP (JSearch RapidAPI, optional OpenAI-compatible API for ATS feedback) |

### File and document processing
| Technology | Purpose |
|------------|--------|
| **pdf-parse** | Extract text from PDF resumes |
| **mammoth** | Extract text from DOCX resumes |
| **PDFKit** | Generate PDF analysis reports for download |

### NLP and ML
| Technology | Purpose |
|------------|--------|
| **natural** | TF-IDF vectors and tokenization for keyword-based similarity |
| **compromise** | Lightweight NLP (nouns, etc.) for skill/phrase extraction in the main analysis engine |
| **@xenova/transformers** | Sentence embeddings in the browser/Node via Transformers.js; model: **all-mpnet-base-v2** (mean pooling, normalized) for semantic resume–JD similarity |

### External APIs
| Service | Purpose |
|---------|--------|
| **JSearch (RapidAPI)** | Live job listings by role, location, employment type; apply links from employer sites |
| **OpenAI-compatible API** (optional) | ATS feedback text (missing skills, suggestions, etc.); not used for scoring |

---

## Algorithms Used

### Resume–job description analysis (main flow and ATS module)

1. **Text preprocessing**
   - Lowercasing, optional synonym normalization (e.g. js → javascript) via a skills dictionary
   - Removal of special characters (keeping letters, numbers, spaces, and symbols like `+`, `#`, `.`, `-` for skills such as C++, Node.js, CI/CD)
   - Cleaning of PDF artifacts (e.g. hyphenated line breaks, bullet characters, nbsp)
   - Normalization of spaces

2. **Semantic similarity**
   - **Model:** all-mpnet-base-v2 (sentence-transformers style), loaded via @xenova/transformers
   - **Method:** Encode resume text and job description into fixed-size vectors (mean pooling, normalized); compute **cosine similarity** between the two vectors
   - **Output:** `semantic_score` (0–100) from the cosine value
   - **Caching:** Job-description embeddings can be cached (e.g. by hash) to avoid recomputation when the same JD is used repeatedly

3. **Skill matching (deterministic, no heavy NER)**
   - **Predefined skill dictionary:** JSON file with technical skills, soft skills, and synonym mappings
   - **Extraction:** Normalize text, then match skills using **regex/word-boundary** patterns over the dictionary (set-based)
   - **Metrics:**
     - `matched_skills` = skills present in both resume and JD
     - `missing_skills` = skills in JD but not in resume
     - `skill_match_percentage` = (matched_skills / total_jd_skills) × 100
   - Optional: Jaccard-style or set-intersection metrics for overlap

4. **Experience matching**
   - **Years extraction:** Regex such as `(\d+)\+?\s*(years|yrs)` on resume and JD
   - **Logic:** Take required years from JD (e.g. max of matched numbers), candidate years from resume
   - **Score:** `experience_score` = min(candidate_years / required_years, 1) × 100; if JD has no years requirement, default 100

5. **Section detection**
   - **Method:** Regex over raw resume text for common headings (e.g. Skills, Experience, Work History, Education, Projects)
   - **Scoring:** Each of the four sections (Skills, Experience, Projects, Education) present = 25 points; **section_score** in 0–100

6. **Final ATS score (weighted, deterministic)**
   - Formula:  
     `ATS_score = 0.40 × semantic_score + 0.30 × skill_match_percentage + 0.20 × experience_score + 0.10 × section_score`
   - Result rounded to an integer 0–100; no LLM used for scoring

7. **AI feedback (optional)**
   - Inputs to LLM: numeric scores and lists (e.g. semantic_score, skill_match_percentage, missing_skills, experience_gap, section_score)
   - LLM only generates explanatory text (missing skills, improvement suggestions, wording, section recommendations); it does **not** compute or change scores

### Main analysis engine (legacy / dashboard analysis)

- **TF-IDF:** Build term-frequency–inverse-document-frequency vectors for resume and JD (using the `natural` library)
- **Cosine similarity:** Between TF-IDF vectors for keyword overlap
- **Embeddings:** Same all-mpnet-base-v2 embeddings and cosine similarity for resume vs JD and for skill-level matching
- **Missing sections:** Regex-based heading detection plus checks on parsed sections (summary, experience, education, skills, projects)
- **Grammar checks:** Simple rule-based (e.g. sentence capitalization, very short fragments)
- **Bullet analysis:** Detection of weak vs strong action verbs and quantification (numbers, %) for improvement suggestions

### Jobs module

- **Live jobs:** JSearch RapidAPI returns job list and employer **apply links**; backend forwards `applyLink` (e.g. `job_apply_link` or first `job_apply_links` entry) to the frontend
- **Fallback (no API key or API failure):** Deterministic sample jobs with an **apply link** set to a job-search URL (e.g. LinkedIn Jobs with role and location) so the “Apply” button still opens a useful page in a new tab

### Interview questions

- **Role-based generation:** Questions chosen from predefined pools (technical, behavioral, scenario) keyed by role (e.g. frontend, backend, data, devops, QA, product)
- **Randomization:** Crypto-safe or random sampling and shuffling so each request gets a different mix of 5–10 questions; no answers generated, questions only

---

## Summary table

| Area | Technologies | Algorithms |
|------|--------------|------------|
| **Frontend** | React, React Router, Axios, Tailwind, React Icons, React Hot Toast | — |
| **Backend** | Node, Express, MongoDB, Mongoose, JWT, bcrypt, Multer, express-validator | — |
| **Resume parsing** | pdf-parse, mammoth | Text extraction, basic structured parsing |
| **Semantic similarity** | @xenova/transformers (all-mpnet-base-v2) | Sentence embeddings, cosine similarity, optional caching |
| **Keyword / scoring** | natural (TF-IDF), compromise | TF-IDF, cosine similarity, regex section detection |
| **Skills** | Predefined JSON dictionary | Set-based matching, regex, synonym normalization |
| **Experience** | — | Regex years extraction, ratio-based score |
| **ATS score** | — | Weighted combination (semantic + skill + experience + section) |
| **Jobs** | Axios, JSearch RapidAPI | Apply-link passthrough; fallback apply link to job search |
| **Interview** | — | Role-based pools, random sampling, no answer generation |
