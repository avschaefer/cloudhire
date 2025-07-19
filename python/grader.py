# python/grader.py (Cloudflare Worker entrypoint)
import json
import urllib.request
import os
from typing import Dict, List, Any

def get_api_key() -> str:
    return os.getenv('XAI_API_KEY')  # Matches your env var name

def get_grading_prompt(exam_data: Dict[str, Any], user_bio: Dict[str, str], questions: List[Dict[str, Any]]) -> str:
    return f"""
    Evaluate this technical hiring exam for position: {user_bio.get('position', 'Unknown')}.
    
    Candidate: {user_bio.get('firstName', '')} {user_bio.get('lastName', '')}
    Experience: {user_bio.get('experience', 'Not specified')}
    Education: {user_bio.get('education', 'Not specified')}
    
    Questions: {json.dumps(questions)}
    Answers: {json.dumps(exam_data)}
    
    Provide a JSON response with:
    - score: integer (0-100)
    - feedback: string (detailed overall assessment)
    - details: object (per-question scores and comments)
    - strengths: array of candidate strengths
    - improvements: array of areas for improvement
    
    Be objective, technical, and insightful for hiring decisions.
    """

def call_grok_api(prompt: str, model: str = 'grok-3') -> Dict[str, Any]:
    key = get_api_key()
    if not key:
        raise ValueError("XAI_API_KEY env var not set")
        
    url = 'https://api.x.ai/v1/chat/completions'
    data = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': prompt}],
        'temperature': 0.7,
    }).encode('utf-8')
        
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bearer {key}')
        
    with urllib.request.urlopen(req) as response:
        if response.status != 200:
            raise ValueError(f"API error: {response.status} - {response.read().decode('utf-8')}")
        result = json.loads(response.read().decode('utf-8'))
        content = result['choices'][0]['message']['content']
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {'score': 0, 'feedback': 'Error parsing response', 'details': {}}

def get_fallback_grading(exam_data: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Simple modular fallback (rule-based)
    score = min(len(exam_data) * 10, 100)
    return {
        'score': score,
        'feedback': 'Fallback evaluation: Basic completeness check.',
        'details': {q['ID']: 'Not evaluated' for q in questions}
    }

async def fetch(request):
    # Worker handler: Expects POST with JSON {exam_data, user_bio, questions}
    if request.method != 'POST':
        return Response('Method Not Allowed', status=405)
        
    try:
        body = await request.json()
        exam_data = body.get('exam_data', {})
        user_bio = body.get('user_bio', {})
        questions = body.get('questions', [])
                
        prompt = get_grading_prompt(exam_data, user_bio, questions)
        try:
            grading_result = call_grok_api(prompt)
        except Exception as e:
            print(f"Grok API failed: {str(e)}")
            grading_result = get_fallback_grading(exam_data, questions)
                
        return Response(
            json.dumps(grading_result), 
            headers={
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }, 
            status=200
        )
    except Exception as e:
        return Response(f"Error: {str(e)}", status=500)
