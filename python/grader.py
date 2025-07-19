import json
import os
from typing import Dict, List, Any

def get_api_key() -> str:
    """Get XAI API key from environment variables"""
    return os.getenv('XAI_API_KEY', '')

def grade_question(question: Dict[str, Any], answer: str, api_key: str) -> Dict[str, Any]:
    """Grade a single question using XAI Grok API"""
    try:
        import requests
        
        if not api_key:
            return {
                'score': 0,
                'maxScore': question.get('Points', 10),
                'feedback': 'API key not configured'
            }
        
        # Prepare the prompt for Grok
        prompt = f"""
        Grade this technical exam question:
        
        Question: {question['Question']}
        Category: {question.get('Category', 'General')}
        Difficulty: {question.get('Difficulty', 'Medium')}
        Max Points: {question.get('Points', 10)}
        
        Student Answer: {answer}
        
        Please provide:
        1. A score out of {question.get('Points', 10)} points
        2. Constructive feedback explaining the score
        3. What the student did well and areas for improvement
        
        Respond in JSON format:
        {{
            "score": <number>,
            "feedback": "<detailed feedback>"
        }}
        """
        
        response = requests.post(
            'https://api.x.ai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'grok-3',
                'messages': [
                    {'role': 'system', 'content': 'You are an expert technical interviewer and grader. Provide fair, constructive feedback.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.3
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Try to parse JSON response
            try:
                grading_result = json.loads(content)
                return {
                    'score': min(grading_result.get('score', 0), question.get('Points', 10)),
                    'maxScore': question.get('Points', 10),
                    'feedback': grading_result.get('feedback', 'No feedback provided')
                }
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    'score': question.get('Points', 10) * 0.5,  # Give 50% as fallback
                    'maxScore': question.get('Points', 10),
                    'feedback': f'AI grading response: {content[:200]}...'
                }
        else:
            return {
                'score': 0,
                'maxScore': question.get('Points', 10),
                'feedback': f'API error: {response.status_code}'
            }
            
    except Exception as e:
        return {
            'score': 0,
            'maxScore': question.get('Points', 10),
            'feedback': f'Grading error: {str(e)}'
        }

def lambda_handler(event, context):
    """Main handler for the Python Worker"""
    try:
        # Parse the request
        if isinstance(event, str):
            body = json.loads(event)
        else:
            body = event.get('body', {})
            if isinstance(body, str):
                body = json.loads(body)
        
        questions = body.get('questions', [])
        answers = body.get('answers', [])
        api_key = body.get('apiKey', get_api_key())
        
        if not questions or not answers:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                },
                'body': json.dumps({'error': 'Missing questions or answers'})
            }
        
        # Create a mapping of question IDs to questions
        question_map = {q['ID']: q for q in questions}
        
        # Grade each answer
        results = []
        for answer in answers:
            question_id = answer['questionId']
            question = question_map.get(question_id)
            
            if not question:
                results.append({
                    'questionId': question_id,
                    'score': 0,
                    'maxScore': 10,
                    'feedback': 'Question not found',
                    'category': 'Unknown'
                })
                continue
            
            grading_result = grade_question(question, answer['answer'], api_key)
            results.append({
                'questionId': question_id,
                'score': grading_result['score'],
                'maxScore': grading_result['maxScore'],
                'feedback': grading_result['feedback'],
                'category': question.get('Category', 'General')
            })
        
        # Calculate overall results
        total_score = sum(r['score'] for r in results)
        max_score = sum(r['maxScore'] for r in results)
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        
        # Generate overall feedback
        if percentage >= 90:
            overall_feedback = "Excellent performance! You demonstrated strong technical knowledge and problem-solving skills."
        elif percentage >= 80:
            overall_feedback = "Good performance overall. You showed solid understanding with room for minor improvements."
        elif percentage >= 70:
            overall_feedback = "Satisfactory performance. You have a good foundation but could benefit from additional practice in some areas."
        elif percentage >= 60:
            overall_feedback = "Performance needs improvement. Consider reviewing the fundamental concepts and practicing more."
        else:
            overall_feedback = "Significant improvement needed. We recommend additional study and practice before retaking the assessment."
        
        exam_result = {
            'totalScore': total_score,
            'maxScore': max_score,
            'percentage': percentage,
            'results': results,
            'overallFeedback': overall_feedback
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps(exam_result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }

# Handle OPTIONS requests for CORS
def options_handler(event, context):
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        'body': ''
    }
