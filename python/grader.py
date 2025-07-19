import json
import os
from typing import Dict, List, Any

def lambda_handler(event, context):
    """
    AWS Lambda handler for grading technical exams using Grok AI
    """
    try:
        # Parse the request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        questions = body.get('questions', [])
        answers = body.get('answers', {})
        api_key = body.get('apiKey') or os.environ.get('XAI_API_KEY')
        
        if not api_key:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': json.dumps({
                    'error': 'XAI API key is required'
                })
            }
        
        # Grade the exam using Grok
        result = grade_exam_with_grok(questions, answers, api_key)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'Internal server error: {str(e)}'
            })
        }

def grade_exam_with_grok(questions: List[Dict], answers: Dict, api_key: str) -> Dict[str, Any]:
    """
    Grade exam using Grok AI API
    """
    try:
        import requests
        
        # Prepare the prompt for Grok
        prompt = create_grading_prompt(questions, answers)
        
        # Call Grok API
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
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
            'model': 'grok-beta',
            'temperature': 0.3,
            'max_tokens': 2000
        }
        
        response = requests.post(
            'https://api.x.ai/v1/chat/completions',
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            grok_response = response.json()
            content = grok_response['choices'][0]['message']['content']
            
            # Parse the response and structure it
            return parse_grok_response(content, questions, answers)
        else:
            # Fallback to basic grading if Grok fails
            return create_fallback_grading(questions, answers)
            
    except Exception as e:
        print(f"Error calling Grok API: {e}")
        return create_fallback_grading(questions, answers)

def create_grading_prompt(questions: List[Dict], answers: Dict) -> str:
    """
    Create a detailed prompt for Grok to grade the exam
    """
    prompt = "Please grade this technical exam and provide detailed feedback. Return your response in JSON format with the following structure:\n\n"
    prompt += "{\n"
    prompt += '  "totalScore": <number>,\n'
    prompt += '  "maxScore": <number>,\n'
    prompt += '  "percentage": <number>,\n'
    prompt += '  "results": [\n'
    prompt += '    {\n'
    prompt += '      "questionId": <number>,\n'
    prompt += '      "score": <number>,\n'
    prompt += '      "maxScore": <number>,\n'
    prompt += '      "feedback": "<detailed feedback>",\n'
    prompt += '      "category": "<category>"\n'
    prompt += '    }\n'
    prompt += '  ],\n'
    prompt += '  "overallFeedback": "<overall assessment>"\n'
    prompt += "}\n\n"
    
    prompt += "Questions and Answers:\n\n"
    
    for i, question in enumerate(questions, 1):
        prompt += f"Question {i} (ID: {question.get('ID', i)}):\n"
        prompt += f"Type: {question.get('type', 'Unknown')}\n"
        prompt += f"Category: {question.get('category', 'General')}\n"
        prompt += f"Difficulty: {question.get('difficulty', 'Medium')}\n"
        prompt += f"Points: {question.get('points', 10)}\n"
        prompt += f"Question: {question.get('question', '')}\n"
        
        # Find the answer for this question
        question_id = question.get('ID', i)
        answer = None
        
        # Check all answer sections
        for section in ['multipleChoice', 'concepts', 'calculations']:
            if section in answers and str(question_id) in answers[section]:
                answer = answers[section][str(question_id)]
                break
        
        prompt += f"Answer: {answer or 'No answer provided'}\n\n"
    
    return prompt

def parse_grok_response(content: str, questions: List[Dict], answers: Dict) -> Dict[str, Any]:
    """
    Parse Grok's response and structure it properly
    """
    try:
        # Try to extract JSON from the response
        import re
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            return result
        else:
            # If no JSON found, create structured response from text
            return create_fallback_grading(questions, answers)
    except:
        return create_fallback_grading(questions, answers)

def create_fallback_grading(questions: List[Dict], answers: Dict) -> Dict[str, Any]:
    """
    Create a basic fallback grading when AI grading fails
    """
    results = []
    total_score = 0
    max_score = 0
    
    for question in questions:
        question_id = question.get('ID', 0)
        points = question.get('points', 10)
        max_score += points
        
        # Check if question was answered
        answer = None
        for section in ['multipleChoice', 'concepts', 'calculations']:
            if section in answers and str(question_id) in answers[section]:
                answer = answers[section][str(question_id)]
                break
        
        # Basic scoring
        if answer and answer.strip():
            score = int(points * 0.7)  # Give 70% for attempting
            feedback = "Answer provided - detailed AI grading unavailable"
        else:
            score = 0
            feedback = "No answer provided"
        
        total_score += score
        
        results.append({
            'questionId': question_id,
            'score': score,
            'maxScore': points,
            'feedback': feedback,
            'category': question.get('category', 'General')
        })
    
    percentage = int((total_score / max_score) * 100) if max_score > 0 else 0
    
    return {
        'totalScore': total_score,
        'maxScore': max_score,
        'percentage': percentage,
        'results': results,
        'overallFeedback': f'Exam completed with {percentage}% score. Basic grading applied - AI grading temporarily unavailable.'
    }

# Handle CORS preflight requests
def handle_options():
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        'body': ''
    }
