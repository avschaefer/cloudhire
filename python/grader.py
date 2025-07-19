# python/grader.py (Cloudflare Worker entrypoint)
import json
import urllib.request
import os
from typing import Dict, List, Any

def get_api_key() -> str:
    """Get XAI API key from environment variables"""
    return os.getenv('XAI_API_KEY') or os.getenv('XAICLOUDHIRE')

def get_grading_prompt(exam_data: Dict[str, Any], user_bio: Dict[str, str], questions: List[Dict[str, Any]]) -> str:
    """Generate comprehensive grading prompt for Grok AI"""
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
    """Make API call to xAI Grok with error handling"""
    key = get_api_key()
    if not key:
        raise ValueError("XAI_API_KEY environment variable not set")
        
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
        
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status != 200:
                error_text = response.read().decode('utf-8')
                raise ValueError(f"API error: {response.status} - {error_text}")
            
            result = json.loads(response.read().decode('utf-8'))
            
        content = result['choices'][0]['message']['content']
        
        # Try to extract JSON from the response
        json_start = content.find('{')
        json_end = content.rfind('}') + 1
        
        if json_start != -1 and json_end != 0:
            json_content = content[json_start:json_end]
            return json.loads(json_content)
        else:
            return json.loads(content)  # Assume entire content is JSON
            
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        return create_error_response("Error parsing AI response")
    except Exception as e:
        print(f"API call error: {e}")
        raise

def create_error_response(message: str) -> Dict[str, Any]:
    """Create standardized error response"""
    return {
        'overallScore': 0, 
        'feedback': f'Error in AI evaluation: {message}', 
        'sectionScores': {'multipleChoice': 0, 'concepts': 0, 'calculations': 0},
        'strengths': [],
        'improvements': ['Unable to evaluate due to system error'],
        'questionScores': [],
        'recommendation': 'REJECT',
        'confidence': 0
    }

def get_fallback_grading(exam_data: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Provide rule-based fallback grading when AI fails"""
    mc_questions = [q for q in questions if q.get('type') == 'multipleChoice']
    concept_questions = [q for q in questions if q.get('type') == 'concepts']
    calc_questions = [q for q in questions if q.get('type') == 'calculations']
    
    mc_score = 0
    concept_score = 0
    calc_score = 0
    
    # Score multiple choice questions
    for q in mc_questions:
        answer = exam_data.get('multipleChoice', {}).get(q.get('ID', ''))
        if answer and answer.strip():
            # Give partial credit for attempting, full credit for correct answers
            if q.get('answer') and answer == q['answer']:
                mc_score += 100
            else:
                mc_score += 50  # Partial credit for attempting
    
    mc_score = (mc_score / len(mc_questions)) if mc_questions else 0
    
    # Score concept questions based on response quality
    for q in concept_questions:
        answer = exam_data.get('concepts', {}).get(q.get('ID', ''), '')
        if answer.strip():
            length = len(answer.strip())
            if length > 300:
                concept_score += 90
            elif length > 200:
                concept_score += 80
            elif length > 100:
                concept_score += 70
            elif length > 50:
                concept_score += 60
            else:
                concept_score += 40
    
    concept_score = (concept_score / len(concept_questions)) if concept_questions else 0
    
    # Score calculation questions
    for q in calc_questions:
        q_id = q.get('ID', '')
        numerical = exam_data.get('calculations', {}).get(f"{q_id}-answer", '')
        explanation = exam_data.get('calculations', {}).get(f"{q_id}-explanation", '')
        
        q_score = 0
        if numerical.strip():
            q_score += 40  # Points for numerical answer
        if explanation.strip():
            exp_length = len(explanation.strip())
            if exp_length > 300:
                q_score += 60
            elif exp_length > 150:
                q_score += 45
            elif exp_length > 50:
                q_score += 30
            else:
                q_score += 15
        
        calc_score += q_score
    
    calc_score = (calc_score / len(calc_questions)) if calc_questions else 0
    
    # Calculate overall score
    total_questions = len(questions)
    if total_questions == 0:
        overall_score = 0
    else:
        overall_score = int((
            mc_score * len(mc_questions) + 
            concept_score * len(concept_questions) + 
            calc_score * len(calc_questions)
        ) / total_questions)
    
    # Determine recommendation
    if overall_score >= 80:
        recommendation = 'HIRE'
    elif overall_score >= 60:
        recommendation = 'CONSIDER'
    else:
        recommendation = 'REJECT'
    
    return {
        'overallScore': overall_score,
        'sectionScores': {
            'multipleChoice': int(mc_score),
            'concepts': int(concept_score),
            'calculations': int(calc_score)
        },
        'feedback': f'Fallback evaluation completed. Overall performance: {overall_score}%. This evaluation used rule-based scoring due to AI system unavailability.',
        'strengths': [
            s for s in [
                'Completed multiple choice questions' if mc_score >= 70 else None,
                'Provided detailed concept explanations' if concept_score >= 70 else None,
                'Showed calculation methodology' if calc_score >= 70 else None,
            ] if s
        ] or ['Completed the assessment'],
        'improvements': [
            i for i in [
                'Review fundamental concepts' if mc_score < 70 else None,
                'Improve explanation clarity and depth' if concept_score < 70 else None,
                'Practice calculation methodology and documentation' if calc_score < 70 else None,
            ] if i
        ] or ['Continue developing technical skills'],
        'questionScores': [
            {
                'questionId': q.get('ID', ''),
                'score': 70,
                'feedback': 'Evaluated using fallback system',
                'partialCredit': True
            } for q in questions
        ],
        'recommendation': recommendation,
        'confidence': 50  # Lower confidence for fallback system
    }

async def fetch(request):
    """Main Worker handler for processing grading requests"""
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        return Response(None, {
            'status': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        })
    
    if request.method != 'POST':
        return Response('Method Not Allowed', {'status': 405})
        
    try:
        body = await request.json()
        exam_data = body.get('exam_data', {})
        user_bio = body.get('user_bio', {})
        questions = body.get('questions', [])
        
        if not questions:
            return Response(
                json.dumps({'error': 'No questions provided'}),
                {'status': 400, 'headers': {'Content-Type': 'application/json'}}
            )
                
        prompt = get_grading_prompt(exam_data, user_bio, questions)
        
        try:
            print("Attempting Grok API call...")
            grading_result = call_grok_api(prompt)
            print("Grok API call successful")
        except Exception as e:
            print(f"Grok API failed: {str(e)}")
            print("Using fallback grading system")
            grading_result = get_fallback_grading(exam_data, questions)
                
        return Response(
            json.dumps(grading_result), 
            {
                'status': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            }
        )
        
    except Exception as e:
        print(f"Worker error: {str(e)}")
        return Response(
            json.dumps({'error': f'Internal server error: {str(e)}'}),
            {'status': 500, 'headers': {'Content-Type': 'application/json'}}
        )
