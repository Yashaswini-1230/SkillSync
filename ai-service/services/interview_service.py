import os
from typing import Dict, List, Any
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
# from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

try:
    llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.3,
    google_api_key=os.getenv("GOOGLE_API_KEY")
)
except Exception as e:
    print("LLM Error:", e)
    llm = None

class InterviewState(BaseModel):
    messages: List[Any]
    resume_context: str
    target_role: str
    current_question_index: int
    feedback: List[str]

def generate_question(state: InterviewState):
    """Generates the next question based on the resume and previous answers."""
    if state.current_question_index >= 5: # Limit to 5 questions
        return {"messages": state.messages, "current_question_index": state.current_question_index}
        
    system_prompt = f"""
    You are an expert technical interviewer for the role of {state.target_role}.
    Here is the candidate's context: {state.resume_context}.
    Based on the conversation history, generate ONE thoughtful, highly specific interview question.
    Do not ask generic questions. Reference their projects or skills directly.
    """
    
    messages = [SystemMessage(content=system_prompt)] + state.messages
    response = llm.invoke(messages)
    
    return {"messages": [response], "current_question_index": state.current_question_index + 1}

def evaluate_answer(state: InterviewState):
    """Evaluates the candidate's latest answer."""
    latest_answer = state.messages[-1].content
    latest_question = state.messages[-2].content
    
    eval_prompt = f"""
    Evaluate the candidate's answer to the following question.
    Question: {latest_question}
    Answer: {latest_answer}
    
    Provide constructive feedback and a score out of 10.
    Format as: "Score: X/10. Feedback: ..."
    """
    
    eval_response = llm.invoke([HumanMessage(content=eval_prompt)])
    
    return {"feedback": [eval_response.content]}

def build_interview_graph():
    workflow = StateGraph(InterviewState)
    
    workflow.add_node("ask_question", generate_question)
    workflow.add_node("evaluate", evaluate_answer)
    
    # In a real dynamic flow, we might route back to ask_question or to END depending on logic
    workflow.add_edge("evaluate", "ask_question")
    
    # We won't compile the graph here for the sake of simplicity,
    # we'll export individual functions to the router for stateless HTTP compatibility.
    # A true persistent LangGraph would require a checkpointer (e.g. PostgresSaver or MemorySaver)
    return workflow

# For the stateless FastAPI router
def get_next_question(resume_context: str, target_role: str, history: List[dict]):
    """Stateless wrapper to get next question"""
    if not llm: return "LLM not initialized."
    
    messages = []
    for h in history:
        if h['role'] == 'user':
            messages.append(HumanMessage(content=h['content']))
        else:
            messages.append(AIMessage(content=h['content']))
            
    system_prompt = f"""
    You are an expert technical interviewer for the role of {target_role}.
    Here is the candidate's context: {resume_context}.
    Based on the conversation history, generate ONE thoughtful, highly specific interview question.
    Do not ask generic questions. Reference their projects or skills directly.
    """
    
    full_messages = [SystemMessage(content=system_prompt)] + messages
    response = llm.invoke(full_messages)
    return response.content

def evaluate_single_answer(question: str, answer: str, context: str):
    """Stateless wrapper for answer evaluation"""
    if not llm: return {"score": 0, "feedback": "LLM not initialized."}
    
    eval_prompt = f"""
    Evaluate the candidate's answer to the following question.
    Context: {context}
    Question: {question}
    Answer: {answer}
    
    Provide constructive feedback. Extract a score out of 10.
    """
    
    eval_response = llm.invoke([HumanMessage(content=eval_prompt)])
    
    # Simplistic parsing
    score = 7 # default
    if "Score:" in eval_response.content:
        try:
            score_str = eval_response.content.split("Score:")[1].split("/10")[0].strip()
            score = int(score_str)
        except:
            pass
            
    return {
        "score": score,
        "feedback": eval_response.content
    }
