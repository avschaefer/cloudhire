# python/grader.py (Cloudflare Worker entrypoint)
import json
import urllib.request
import os
from typing import Dict, List, Any

def get_api_key() -> str:
    return os.getenv('XAI_API_KEY')  # Your env var name; set in Cloudflare

def get_grading_prompt(exam_data: Dict[str, Any], user_bio: Dict[str, str], questions: List[Dict[str, Any]]) -> str:
    return f"""
You are an expert technical evaluator for engineering positions. Please evaluate this technical exam submission.

CANDIDATE INFORMATION:
- Name: {user_bio.get('firstName', '')} {user_bio.get('lastName', '')}
- Position: {user_bio.get('position', 'Unknown')}
- Experience: {user_bio.get('experience', 'Not specified')}
- Education: {user_bio.get('education', 'Not specified')}

EXAM QUESTIONS AND ANSWERS:
{json.dumps(questions, indent=2)}

CANDIDATE ANSWERS:
{json.dumps(exam_data, indent=2)}

Please provide a comprehensive evaluation in the following JSON format:
{{
  "overallScore": number (0-100),
  "sectionScores": {{
    "multipleChoice": number (0-100),
    "concepts": number (0-100),
    "calculations": number (0-100)
  }},
  "feedback": "Overall assessment and recommendations",
  "strengths": ["List of candidate strengths"],
  "improvements": ["Areas for improvement"],
  "questionScores": [
    {{
      "questionId": "string",
      "score": number (0-100),
      "feedback": "Specific feedback for this question",
      "partialCredit": boolean
    }}
  ],
  "recommendation": "HIRE" | "CONSIDER" | "REJECT",
  "confidence": number (0-100)
}}

Focus on technical accuracy, problem-solving approach, and communication clarity. For calculation questions, award partial credit for correct methodology even if the final answer is wrong.
"""

def call_grok_api(prompt: str, model: str = 'grok-3') -> Dict[str, Any]:
    key = get_api_key()
    if not key:
        raise ValueError("XAI_API_KEY env var not set")
        
    url = 'https://api.x.ai/v1/chat/completions'
    data = json.dumps({
        'model': model,
        'messages': [{'role': 'user', 'content': prompt}],
        'temperature': 0.1,  # Low temperature for consistent grading
        'max_tokens': 4000,
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
        # Try to extract JSON from the response
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        if json_start != -1 and json_end != 0:
            json_content = content[json_start:json_end]
            return json.loads(json_content)
        else:
            return json.loads(content)  # Assume entire content is JSON
    except json.JSONDecodeError:
        return {
            'overallScore': 0, 
            'feedback': 'Error parsing AI response', 
            'sectionScores': {'multipleChoice': 0, 'concepts': 0, 'calculations': 0},
            'strengths': [],
            'improvements': ['Unable to evaluate due to parsing error'],
            'questionScores': [],
            'recommendation': 'REJECT',
            'confidence': 0
        }

def get_fallback_grading(exam_data: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    # Simple modular fallback (rule-based)
    mc_questions = [q for q in questions if q.get('type') == 'multipleChoice']
    concept_questions = [q for q in questions if q.get('type') == 'concepts']
    calc_questions = [q for q in questions if q.get('type') == 'calculations']
    
    mc_score = 0
    concept_score = 0
    calc_score = 0
    
    # Score multiple choice
    for q in mc_questions:
        if exam_data.get('multipleChoice', {}).get(q['ID']):
            mc_score += 70  # Base score for attempting
    mc_score = (mc_score / len(mc_questions)) if mc_questions else 0
    
    # Score concepts based on length and presence
    for q in concept_questions:
        answer = exam_data.get('concepts', {}).get(q['ID'], '')
        if answer.strip():
            if len(answer) > 200:
                concept_score += 85
            elif len(answer) > 100:
                concept_score += 70
            else:
                concept_score += 50
    concept_score = (concept_score / len(concept_questions)) if concept_questions else 0
    
    # Score calculations
    for q in calc_questions:
        numerical = exam_data.get('calculations', {}).get(f"{q['ID']}-answer", '')
        explanation = exam_data.get('calculations', {}).get(f"{q['ID']}-explanation", '')
        q_score = 0
        if numerical.strip():
            q_score += 40
        if explanation.strip():
            if len(explanation) > 200:
                q_score += 60
            else:
                q_score += 30
        calc_score += q_score
    calc_score = (calc_score / len(calc_questions)) if calc_questions else 0
    
    overall_score = int((mc_score + concept_score + calc_score) / 3)
    
    return {
        'overallScore': overall_score,
        'sectionScores': {
            'multipleChoice': int(mc_score),
            'concepts': int(concept_score),
            'calculations': int(calc_score)
        },
        'feedback': f'Fallback evaluation completed. Overall performance: {overall_score}%.',
        'strengths': ['Completed the assessment'],
        'improvements': ['Detailed evaluation unavailable - fallback system used'],
        'questionScores': [{'questionId': q['ID'], 'score': 70, 'feedback': 'Fallback evaluation', 'partialCredit': True} for q in questions],
        'recommendation': 'CONSIDER' if overall_score >= 60 else 'REJECT',
        'confidence': 50
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
            headers={'Content-Type': 'application/json'}, 
            status=200
        )
    except Exception as e:
        return Response(f"Error: {str(e)}", status=500)
