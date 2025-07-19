import json
import os
from typing import Dict, List, Any

def lambda_handler(event, context):
    """
    Cloudflare Worker handler for AI-powered exam grading using xAI Grok
    """
    try:
        # Parse the request body
        if isinstance(event, str):
            body = json.loads(event)
        else:
            body = event
        
        exam_data = body.get('exam_data', {})
        user_bio = body.get('user_bio', {})
        questions = body.get('questions', [])
        api_key = body.get('apiKey') or os.environ.get('XAI_API_KEY')
        
        if not api_key:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
                'body': json.dumps({
                    'error': 'XAI API key not provided'
                })
            }
        
        # Grade the exam using xAI Grok
        grading_result = grade_with_grok(exam_data, user_bio, questions, api_key)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': json.dumps(grading_result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'error': f'Grading failed: {str(e)}'
            })
        }

def grade_with_grok(exam_data: Dict, user_bio: Dict, questions: List[Dict], api_key: str) -> Dict[str, Any]:
    """
    Grade exam using xAI Grok API
    """
    try:
        import requests
        
        # Prepare the prompt for Grok
        prompt = create_grading_prompt(exam_data, user_bio, questions)
        
        # Call xAI Grok API
        response = requests.post(
            'https://api.x.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
            },
            json={
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert technical interviewer and grader. Provide detailed, constructive feedback on technical assessments.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'model': 'grok-3',
                'stream': False
            }
        )
        
        if response.status_code == 200:
            grok_response = response.json()
            feedback = grok_response['choices'][0]['message']['content']
            
            # Parse the feedback and create structured result
            return parse_grok_feedback(feedback, exam_data, questions)
        else:
            # Fallback to basic grading if API fails
            return fallback_grading(exam_data, questions)
            
    except Exception as e:
        print(f"Grok API error: {e}")
        return fallback_grading(exam_data, questions)

def create_grading_prompt(exam_data: Dict, user_bio: Dict, questions: List[Dict]) -> str:
    """
    Create a detailed prompt for Grok to grade the exam
    """
    prompt = f"""
    Please grade this technical assessment for {user_bio.get('firstName', 'Candidate')} {user_bio.get('lastName', '')} 
    applying for the position of {user_bio.get('position', 'Software Developer')}.
    
    Candidate Background:
    - Experience: {user_bio.get('experience', 'Not specified')} years
    - Education: {user_bio.get('education', 'Not specified')}
    
    Questions and Answers:
    """
    
    for question in questions:
        q_id = question.get('ID')
        q_text = question.get('question', '')
        q_type = question.get('type', '')
        q_category = question.get('category', '')
        q_points = question.get('points', 10)
        
        # Get the answer based on question type
        if 'multiple' in q_type.lower():
            answer = exam_data.get('multipleChoice', {}).get(str(q_id), 'No answer')
            correct_answer = question.get('answer', '')
        elif 'open' in q_type.lower():
            answer = exam_data.get('concepts', {}).get(str(q_id), 'No answer')
            correct_answer = 'Open-ended question'
        else:
            answer = exam_data.get('calculations', {}).get(str(q_id), 'No answer')
            correct_answer = 'Calculation question'
        
        prompt += f"""
        
        Question {q_id} ({q_type} - {q_category}, {q_points} points):
        {q_text}
        
        Candidate's Answer: {answer}
        {f"Correct Answer: {correct_answer}" if correct_answer != 'Open-ended question' and correct_answer != 'Calculation question' else ""}
        """
    
    prompt += """
    
    Please provide:
    1. A score out of 100
    2. Detailed feedback on each answer
    3. Overall strengths and areas for improvement
    4. Specific recommendations for the candidate
    
    Format your response as JSON with the following structure:
    {
        "score": <number>,
        "feedback": "<overall feedback>",
        "details": {
            "<question_id>": {
                "score": <points earned>,
                "max_score": <total points>,
                "feedback": "<specific feedback>"
            }
        },
        "strengths": ["<strength1>", "<strength2>"],
        "improvements": ["<improvement1>", "<improvement2>"]
    }
    """
    
    return prompt

def parse_grok_feedback(feedback: str, exam_data: Dict, questions: List[Dict]) -> Dict[str, Any]:
    """
    Parse Grok's feedback into structured format
    """
    try:
        # Try to extract JSON from the feedback
        import re
        json_match = re.search(r'\{.*\}', feedback, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            return result
        else:
            # If no JSON found, create basic structure
            return {
                "score": 75,
                "feedback": feedback,
                "details": {},
                "strengths": ["Completed the assessment"],
                "improvements": ["Continue learning and practicing"]
            }
    except:
        return fallback_grading(exam_data, questions)

def fallback_grading(exam_data: Dict, questions: List[Dict]) -> Dict[str, Any]:
    """
    Fallback grading when AI is unavailable
    """
    total_questions = len(questions)
    answered_questions = 0
    total_score = 0
    
    for question in questions:
        q_id = str(question.get('ID'))
        q_type = question.get('type', '').lower()
        
        if 'multiple' in q_type:
            answer = exam_data.get('multipleChoice', {}).get(q_id)
        elif 'open' in q_type:
            answer = exam_data.get('concepts', {}).get(q_id)
        else:
            answer = exam_data.get('calculations', {}).get(q_id)
        
        if answer and answer.strip():
            answered_questions += 1
            total_score += 10  # Basic points for answering
    
    score = min(100, (total_score / (total_questions * 10)) * 100) if total_questions > 0 else 0
    
    return {
        "score": round(score),
        "feedback": f"Basic evaluation completed. Answered {answered_questions} out of {total_questions} questions. Detailed AI grading is temporarily unavailable.",
        "details": {},
        "strengths": ["Completed the assessment"] if answered_questions > 0 else [],
        "improvements": ["Provide more detailed answers", "Complete all questions"] if answered_questions < total_questions else []
    }

# Handle CORS preflight requests
def handle_options():
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        'body': ''
    }
