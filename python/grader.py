import json
from typing import Dict, List, Any
import os
from api_client import XAIClient, XAIApiError
from report_generator import ReportGenerator
import requests
from db_operations import get_user_answer, insert_grading_result

def handler(request):
    """
    AI-powered exam grader using xAI Grok with modular architecture
    """
    try:
        # Parse the request
        if hasattr(request, 'json'):
            data = request.json()
        else:
            data = json.loads(request.get_data(as_text=True))
        
        answers = data.get('answers', [])
        questions = data.get('questions', [])
        user_info = data.get('userInfo', {})
        
        # Initialize AI client and report generator
        try:
            ai_client = XAIClient()
            report_generator = ReportGenerator()
        except XAIApiError as e:
            print(f"Warning: AI client initialization failed: {e}")
            ai_client = None
            report_generator = ReportGenerator()
        
        # Grade each answer using AI or fallback
        grading_results = []
        total_score = 0
        max_score = 0
        
        for answer in answers:
            question = next((q for q in questions if q['id'] == answer['questionId']), None)
            if not question:
                continue
            
            # Use AI grading if available, otherwise fallback
            if ai_client:
                try:
                    grading_result = ai_client.grade_exam_response(
                        question, 
                        answer.get('answer', ''), 
                        user_info
                    )
                except XAIApiError as e:
                    print(f"AI grading failed for question {answer['questionId']}: {e}")
                    grading_result = fallback_grading(answer, question)
            else:
                grading_result = fallback_grading(answer, question)
            
            grading_results.append({
                'questionId': answer['questionId'],
                'answer': answer.get('answer', ''),
                'timeSpent': answer.get('timeSpent', 0),
                **grading_result
            })
            
            total_score += grading_result['score']
            max_score += grading_result['maxScore']
        
        # Generate comprehensive report
        exam_metadata = {
            'completedAt': data.get('completedAt', ''),
            'timeSpent': sum(answer.get('timeSpent', 0) for answer in answers),
            'totalQuestions': len(questions)
        }
        
        report = report_generator.generate_exam_report(
            grading_results, 
            user_info, 
            exam_metadata
        )
        
        # Add legacy fields for backward compatibility
        result = {
            'userInfo': user_info,
            'answers': answers,
            'gradingResults': grading_results,
            'totalScore': total_score,
            'maxScore': max_score,
            'overallFeedback': report['analysis']['overallFeedback'],
            'completedAt': exam_metadata['completedAt'],
            'timeSpent': exam_metadata['timeSpent'],
            'report': report  # Include full report
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result)
        }
        
    except Exception as e:
        print(f"Error in exam grading: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }

def fallback_grading(answer: Dict[str, Any], question: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback grading when AI is unavailable"""
    max_score = question.get('points', 0)
    answer_text = answer.get('answer', '')
    
    if question.get('type') == 'multiple-choice':
        correct_answer = question.get('correctAnswer', '')
        score = max_score if answer_text.strip() == correct_answer else 0
        feedback = "Correct!" if score == max_score else f"Incorrect. The correct answer was: {correct_answer}"
    else:
        # For essay questions, score based on length and content
        word_count = len(answer_text.split())
        if word_count >= 100:
            score = int(max_score * 0.9)
            feedback = "Excellent detailed response showing deep understanding."
        elif word_count >= 50:
            score = int(max_score * 0.7)
            feedback = "Good response with adequate detail."
        elif word_count >= 20:
            score = int(max_score * 0.5)
            feedback = "Basic response that could benefit from more detail."
        else:
            score = int(max_score * 0.2)
            feedback = "Very brief response. Consider providing more comprehensive answers."
    
    # Identify strengths and improvements
    strengths = identify_strengths(answer_text, question)
    improvements = identify_improvements(answer_text, question)
    
    return {
        'score': score,
        'maxScore': max_score,
        'feedback': feedback,
        'strengths': strengths,
        'improvements': improvements
    }

def identify_strengths(answer_text: str, question: Dict[str, Any]) -> List[str]:
    """Identify strengths in the answer"""
    strengths = []
    word_count = len(answer_text.split())
    
    if word_count >= 50:
        strengths.append("Provided detailed explanation")
    
    if any(keyword in answer_text.lower() for keyword in ['example', 'experience', 'project']):
        strengths.append("Included relevant examples")
    
    if question.get('category') == 'Technical' and any(tech in answer_text.lower() for tech in ['api', 'database', 'framework', 'library']):
        strengths.append("Demonstrated technical knowledge")
    
    return strengths

def identify_improvements(answer_text: str, question: Dict[str, Any]) -> List[str]:
    """Identify areas for improvement"""
    improvements = []
    word_count = len(answer_text.split())
    
    if word_count < 30:
        improvements.append("Could provide more detailed explanations")
    
    if question.get('category') == 'Technical' and not any(tech in answer_text.lower() for tech in ['api', 'database', 'framework', 'library', 'code']):
        improvements.append("Could include more technical details")
    
    if 'experience' in question.get('question', '').lower() and 'experience' not in answer_text.lower():
        improvements.append("Could share more specific experiences")
    
    return improvements

def parse_response(response: dict) -> tuple[int, str]:
    # Assume this parses the AI response to extract score and feedback
    content = response['choices'][0]['message']['content']
    # Simple parsing, adjust as needed
    score_str, feedback = content.split(':', 1)
    score = int(score_str.strip())
    return score, feedback.strip()

def grade_answer(answer_id: str):
    client = create_supabase_client()  # If needed, but using db_operations
    answer = get_user_answer(answer_id)
    # AI call
    response = requests.post('https://api.x.ai/v1/chat/completions', 
                             headers={'Authorization': f'Bearer {os.environ["XAI_API_KEY"]}'},
                             json={'model': 'grok-beta', 'messages': [{'role': 'user', 'content': f'Grade: {answer["answer_text"]}' }]})
    score, feedback = parse_response(response.json())
    insert_grading_result(answer_id, score, feedback)

# For Cloudflare Workers
def fetch(request):
    return handler(request)
