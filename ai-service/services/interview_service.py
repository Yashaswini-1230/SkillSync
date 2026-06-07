import os
import json
import re

from typing import List

from dotenv import load_dotenv

from langchain_core.messages import (
    HumanMessage,
    AIMessage,
    SystemMessage
)

from langchain_google_genai import (
    ChatGoogleGenerativeAI
)

load_dotenv()

# =========================
# GEMINI INITIALIZATION
# =========================

try:

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.7,
        google_api_key=os.getenv(
            "GOOGLE_API_KEY"
        )
    )

except Exception as e:

    print(
        "LLM Initialization Error:",
        e
    )

    llm = None

# =========================
# CLEAN JSON
# =========================

def clean_json_response(text):

    text = text.strip()

    text = re.sub(
        r"```json",
        "",
        text
    )

    text = re.sub(
        r"```",
        "",
        text
    )

    return text.strip()

# =========================
# EXTRACT TOPICS
# =========================

def extract_topics(text):

    keywords = [

        "react",
        "node",
        "express",
        "mongodb",
        "jwt",
        "socket.io",
        "redis",
        "docker",
        "kubernetes",
        "api",
        "authentication",
        "authorization",
        "backend",
        "frontend",
        "database",
        "sql",
        "nosql",
        "machine learning",
        "ai",
        "python",
        "java",
        "system design",
        "microservices",
        "cloud",
        "aws",
        "firebase",
        "typescript"

    ]

    found = []

    lower_text = text.lower()

    for keyword in keywords:

        if keyword in lower_text:

            found.append(keyword)

    return list(set(found))

# =========================
# BUILD INTERVIEW MEMORY
# =========================

def build_memory(history):

    memory = {

        "projects": [],

        "technologies": [],

        "topics_discussed": [],

        "questions_asked": [],

        "answers": [],

        "followup_depth": {}

    }

    for item in history:

        role = item.get(
            "role"
        )

        content = item.get(
            "content",
            ""
        )

        if role == "user":

            memory[
                "answers"
            ].append(content)

            topics = extract_topics(
                content
            )

            memory[
                "technologies"
            ].extend(topics)

            memory[
                "topics_discussed"
            ].extend(topics)

        else:

            memory[
                "questions_asked"
            ].append(content)

    memory[
        "technologies"
    ] = list(
        set(
            memory[
                "technologies"
            ]
        )
    )

    memory[
        "topics_discussed"
    ] = list(
        set(
            memory[
                "topics_discussed"
            ]
        )
    )

    return memory

# =========================
# INTERVIEW COMPLETION
# =========================

def should_end_interview(memory):

    question_count = len(
        memory[
            "questions_asked"
        ]
    )

    topic_count = len(
        memory[
            "topics_discussed"
        ]
    )

    if (
        question_count >= 10
        and topic_count >= 4
    ):

        return True

    return False

# =========================
# GENERATE NEXT QUESTION
# =========================

def get_next_question(

    resume_context: str,

    target_role: str,

    history: List[dict]

):

    if not llm:

        return (
            "Tell me about yourself."
        )

    # =========================
    # BUILD MEMORY
    # =========================

    memory = build_memory(
        history
    )

    # =========================
    # INTERVIEW COMPLETION
    # =========================

    if should_end_interview(
        memory
    ):

        return "__INTERVIEW_COMPLETE__"

    messages = []

    for item in history:

        role = item.get(
            "role"
        )

        content = item.get(
            "content",
            ""
        )

        if role == "user":

            messages.append(
                HumanMessage(
                    content=content
                )
            )

        else:

            messages.append(
                AIMessage(
                    content=content
                )
            )

    # =========================
    # INTERVIEW ORCHESTRATOR
    # =========================

    system_prompt = f"""
You are an elite AI interviewer conducting a REALISTIC conversational mock interview.

You behave like:
- Google interviewer
- Amazon interviewer
- Yoodli
- FinalRound AI
- Pramp

TARGET ROLE:
{target_role}

CANDIDATE RESUME:
{resume_context}

INTERVIEW MEMORY:
{json.dumps(memory, indent=2)}

VERY IMPORTANT RULES:

1. NEVER ask generic random questions.
2. NEVER repeat old questions.
3. Follow up deeply on technologies/projects mentioned by the candidate.
4. Behave conversationally like a real interviewer.
5. Ask only ONE question.
6. If the candidate mentions:
   - JWT → ask security/auth follow-up
   - MongoDB → ask schema/performance/design
   - React → ask state management/rendering
   - Socket.IO → ask real-time architecture
   - Team project → ask role/contribution
7. Continue deep dive before changing topic.
8. Ask realistic recruiter-style questions.
9. Questions should feel adaptive and intelligent.
10. Interview should naturally flow between:
    - introduction
    - projects
    - technical
    - architecture
    - behavioral
    - HR
11. Avoid robotic transitions like:
    "Let's move to another topic"
12. Keep the conversation natural.

IMPORTANT:
Generate ONLY the next interview question.
"""

    full_messages = [

        SystemMessage(
            content=system_prompt
        )

    ] + messages

    try:

        response = llm.invoke(
            full_messages
        )

        question = (
            response.content.strip()
        )

        # =========================
        # DUPLICATE PREVENTION
        # =========================

        previous_questions = [

            q.lower().strip()

            for q in memory[
                "questions_asked"
            ]

        ]

        if (
            question.lower().strip()
            in previous_questions
        ):

            fallback_questions = [

                "Can you explain the architecture of one of your recent projects?",

                "How did you handle authentication and authorization in your application?",

                "What was your biggest technical challenge during development?",

                "How did your team collaborate during the project?",

                "What would you improve if you rebuilt this project today?"

            ]

            for q in fallback_questions:

                if (
                    q.lower().strip()
                    not in previous_questions
                ):

                    return q

        return question

    except Exception as e:

        print(
            "Question Generation Error:",
            str(e)
        )

        fallback_questions = [

            "Can you briefly introduce yourself and explain your recent projects?",

            "What technologies did you use in your recent project and why?",

            "Can you explain a challenging bug or issue you solved recently?",

            "How does JWT authentication work in your application?",

            "What was your specific contribution in your team project?"

        ]

        for q in fallback_questions:

            if (
                q.lower().strip()
                not in [

                    x.lower().strip()

                    for x in memory[
                        "questions_asked"
                    ]

                ]
            ):

                return q

        return (
            "Can you explain one technical decision you made recently?"
        )

# =========================
# EVALUATE ANSWER
# =========================

def evaluate_single_answer(

    question: str,

    answer: str,

    context: str

):

    if not llm:

        return {
            "score": 0,
            "feedback":
                "LLM not initialized."
        }

    evaluation_prompt = f"""
You are an expert senior technical interviewer.

Evaluate the candidate answer realistically.

QUESTION:
{question}

ANSWER:
{answer}

CANDIDATE CONTEXT:
{context}

EVALUATION CRITERIA:

1. Technical depth
2. Communication clarity
3. Confidence
4. Problem solving
5. Structured explanation
6. Professionalism
7. Relevance

IMPORTANT:
- Weak answers should score LOW.
- Short answers should score VERY LOW.
- Strong technical answers should score HIGH.
- Feedback should feel recruiter-like.
- Be realistic and strict.

Return ONLY VALID JSON.

FORMAT:
{{
  "communication_score": 0-10,
  "confidence_score": 0-10,
  "technical_depth_score": 0-10,
  "clarity_score": 0-10,
  "problem_solving_score": 0-10,
  "overall_score": 0-10,
  "feedback": "Detailed recruiter-style feedback",
  "strengths": [
    "strength1",
    "strength2"
  ],
  "improvements": [
    "improvement1",
    "improvement2"
  ]
}}
"""

    try:

        response = llm.invoke([

            HumanMessage(
                content=evaluation_prompt
            )

        ])

        raw_text = response.content

        cleaned = clean_json_response(
            raw_text
        )

        result = json.loads(
            cleaned
        )

        return {

            "score":
                result.get(
                    "overall_score",
                    5
                ),

            "communication_score":
                result.get(
                    "communication_score",
                    5
                ),

            "confidence_score":
                result.get(
                    "confidence_score",
                    5
                ),

            "technical_depth_score":
                result.get(
                    "technical_depth_score",
                    5
                ),

            "clarity_score":
                result.get(
                    "clarity_score",
                    5
                ),

            "problem_solving_score":
                result.get(
                    "problem_solving_score",
                    5
                ),

            "feedback":
                result.get(
                    "feedback",
                    "Good attempt."
                ),

            "strengths":
                result.get(
                    "strengths",
                    []
                ),

            "improvements":
                result.get(
                    "improvements",
                    []
                )

        }

    except Exception as e:

        print(
            "Evaluation Error:",
            str(e)
        )

        answer_length = len(
            answer.split()
        )

        technical_keywords = [

            "react",
            "node",
            "mongodb",
            "jwt",
            "api",
            "authentication",
            "database",
            "socket",
            "backend",
            "frontend"

        ]

        technical_matches = sum(

            keyword in answer.lower()

            for keyword in technical_keywords

        )

        score = min(
            10,
            max(
                2,
                (answer_length // 8)
                + technical_matches
            )
        )

        if answer_length < 4:
            score = 2

        return {

            "score":
                score,

            "communication_score":
                score,

            "confidence_score":
                max(
                    2,
                    score - 1
                ),

            "technical_depth_score":
                score,

            "clarity_score":
                score,

            "problem_solving_score":
                score,

            "feedback":
                "Your answer showed some understanding, but adding more implementation details, architecture decisions, and measurable impact would improve your interview performance.",

            "strengths": [
                "Relevant answer"
            ],

            "improvements": [
                "Add more technical depth",
                "Use more structured explanations"
            ]
        }