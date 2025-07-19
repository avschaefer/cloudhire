# python/grader.py (Cloudflare Worker entrypoint)
import json
import urllib.request
import os
from typing import Dict, List, Any

def get_api_key() -> str:
    """Get XAI API key from environment variables"""
    return os.getenv('XAI_API_KEY')

def get_grading_prompt(exam_data: Dict[str, Any], user_bio: Dict[str, str], questions: List[Dict[str, Any]]) -> str:
    """Generate comprehensive grading prompt for Grok AI"""
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
    Focus on technical competency, problem-solving approach, and depth of understanding.
    """

def call_grok_api(prompt: str, model: str = 'grok-3') -> Dict[str, Any]:
    """Make API call to xAI Grok with error handling"""
    key = get_api_key()
    if not key:
        raise ValueError("XAI_API_KEY environment variable not set")
        
    url = 'https://api.x.ai/v1/chat/completions'
    data = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': prompt}],
        'temperature': 0.7,
    }).encode('utf-8')
        
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bearer {key}')
        
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status != 200:
                error_text = response.read().decode('utf-8')
                raise ValueError(f"API error: {response.status} - {error_text}")
            
            result = json.loads(response.read().decode('utf-8'))
            content = result['choices'][0]['message']['content']
        
        # Try to extract JSON from the response
        try:
            json_start = content.find('{')
            json_end = content.rfind('}') + 1
            
            if json_start != -1 and json_end != 0:
                json_content = content[json_start:json_end]
                return json.loads(json_content)
            else:
                return json.loads(content)
        except json.JSONDecodeError:
            return {
                'score': 0,
                'feedback': 'Error parsing AI response',
                'details': {},
                'strengths': [],
                'improvements': ['AI evaluation failed']
            }
            
    except Exception as e:
        print(f"API call error: {e}")
        raise

def get_fallback_grading(exam_data: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Provide rule-based fallback grading when AI fails"""
    answered_count = sum(1 for v in exam_data.values() if v and str(v).strip())
    total_questions = len(questions)
    score = min((answered_count / max(total_questions, 1)) * 100, 100)
    
    return {
        'score': int(score),
        'feedback': f'Fallback evaluation: Answered {answered_count} out of {total_questions} questions. Basic completeness check performed.',
        'details': {q.get('ID', f'q_{i}'): f'Answer provided: {bool(exam_data.get(str(q.get("ID", i))))}' for i, q in enumerate(questions)},
        'strengths': ['Completed assessment'] if answered_count > 0 else [],
        'improvements': ['Complete all questions', 'Provide detailed answers'] if answered_count < total_questions else ['Detailed evaluation pending']
    }

async def fetch(request):
    """Main Worker handler for processing grading requests"""
    # CORS headers for cross-origin requests
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    }
    
    # Handle preflight requests
    if request.method == 'OPTIONS':
        return Response('', headers=cors_headers)
    
    if request.method != 'POST':
        return Response(
            json.dumps({'error': 'Method Not Allowed'}), 
            status=405, 
            headers=cors_headers
        )
        
    try:
        body = await request.json()
        exam_data = body.get('exam_data', {})
        user_bio = body.get('user_bio', {})
        questions = body.get('questions', [])
        
        if not questions:
            return Response(
                json.dumps({'error': 'No questions provided'}),
                status=400,
                headers=cors_headers
            )
                
        prompt = get_grading_prompt(exam_data, user_bio, questions)
        
        try:
            grading_result = call_grok_api(prompt)
        except Exception as e:
            print(f"Grok API failed: {str(e)}")
            grading_result = get_fallback_grading(exam_data, questions)
                
        return Response(
            json.dumps(grading_result), 
            headers=cors_headers, 
            status=200
        )
        
    except Exception as e:
        return Response(
            json.dumps({'error': f'Server error: {str(e)}'}), 
            status=500, 
            headers=cors_headers
        )
