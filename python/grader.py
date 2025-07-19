import json
import os
from typing import Dict, List, Any

def handler(request):
    """
    Cloudflare Worker handler for AI-powered exam grading
    """
    try:
        # Parse request
        if request.method != 'POST':
            return Response(
                json.dumps({'error': 'Method not allowed'}),
                status=405,
                headers={'Content-Type': 'application/json'}
            )
        
        data = request.json()
        questions = data.get('questions', [])
        answers = data.get('answers', [])
        api_key = data.get('apiKey') or os.getenv('XAI_API_KEY')
        
        if not api_key:
            return fallback_grading(questions, answers)
        
        # Use xAI Grok for grading
        grading_result = grade_with_grok(questions, answers, api_key)
        
        return Response(
            json.dumps(grading_result),
            headers={
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        )
        
    except Exception as e:
        print(f"Error in grading handler: {e}")
        return fallback_grading(questions, answers)

def grade_with_grok(questions: List[Dict], answers: List[Dict], api_key: str) -> Dict[str, Any]:
    """
    Grade exam using xAI Grok
    """
    try:
        import requests
        
        # Prepare prompt for Grok
        prompt = create_grading_prompt(questions, answers)
        
        response = requests.post(
            'https://api.x.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'grok-3',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert technical interviewer and grader. Provide detailed, constructive feedback on technical exam responses.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.3
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            feedback = result['choices'][0]['message']['content']
            
            # Parse Grok response and structure it
            return parse_grok_response(feedback, questions, answers)
        else:
            print(f"Grok API error: {response.status_code}")
            return fallback_grading(questions, answers)
            
    except Exception as e:
        print(f"Error calling Grok API: {e}")
        return fallback_grading(questions, answers)

def create_grading_prompt(questions: List[Dict], answers: List[Dict]) -> str:
    """
    Create a structured prompt for Grok grading
    """
    prompt = "Please grade this technical exam and provide detailed feedback:\n\n"
    
    for i, (question, answer) in enumerate(zip(questions, answers), 1):
        prompt += f"Question {i}: {question.get('question', '')}\n"
        prompt += f"Type: {question.get('type', '')}\n"
        prompt += f"Category: {question.get('category', '')}\n"
        prompt += f"Answer: {answer.get('answer', 'No answer provided')}\n\n"
    
    prompt += """
Please provide:
1. A score out of 100 for the overall exam
2. Detailed feedback for each question
3. Overall strengths and areas for improvement
4. Specific technical insights

Format your response as JSON with this structure:
{
  "score": 85,
  "feedback": "Overall assessment...",
  "details": {
    "question_1": {"score": 8, "feedback": "..."},
    "question_2": {"score": 7, "feedback": "..."}
  },
  "strengths": ["Strong understanding of...", "Good problem-solving..."],
  "improvements": ["Could improve on...", "Consider studying..."]
}
"""
    
    return prompt

def parse_grok_response(feedback: str, questions: List[Dict], answers: List[Dict]) -> Dict[str, Any]:
    """
    Parse Grok's response into structured format
    """
    try:
        # Try to extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', feedback, re.DOTALL)
        
        if json_match:
            parsed = json.loads(json_match.group())
            return parsed
        else:
            # Fallback if JSON parsing fails
            return {
                "score": 75,
                "feedback": feedback,
                "details": {},
                "strengths": ["Completed the assessment"],
                "improvements": ["Provide more detailed responses"]
            }
            
    except Exception as e:
        print(f"Error parsing Grok response: {e}")
        return fallback_grading(questions, answers)

def fallback_grading(questions: List[Dict], answers: List[Dict]) -> Dict[str, Any]:
    """
    Fallback grading when AI is unavailable
    """
    total_questions = len(questions)
    answered_questions = sum(1 for answer in answers if answer.get('answer', '').strip())
    
    score = min(int((answered_questions / total_questions) * 100), 100) if total_questions > 0 else 0
    
    return {
        "score": score,
        "feedback": f"Basic evaluation: {answered_questions}/{total_questions} questions answered. AI grading temporarily unavailable.",
        "details": {
            f"question_{i+1}": {
                "answered": bool(answer.get('answer', '').strip()),
                "response": answer.get('answer', 'No answer provided')
            }
            for i, answer in enumerate(answers)
        },
        "strengths": ["Completed the assessment"] if answered_questions > 0 else [],
        "improvements": ["Complete all questions", "Provide more detailed answers"] if answered_questions < total_questions else []
    }

class Response:
    def __init__(self, body, status=200, headers=None):
        self.body = body
        self.status = status
        self.headers = headers or {}
