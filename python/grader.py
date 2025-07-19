import json
from typing import Dict, List, Any
import os

def handler(request):
    """
    AI-powered exam grader using xAI Grok
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
        
        # For now, return a basic grading result
        # This will be enhanced with actual AI grading
        grading_results = []
        total_score = 0
        max_score = 0
        
        for answer in answers:
            question = next((q for q in questions if q['id'] == answer['questionId']), None)
            if not question:
                continue
                
            # Basic scoring logic (to be replaced with AI)
            score = grade_answer(answer, question)
            max_score += question['points']
            total_score += score
            
            grading_results.append({
                'questionId': answer['questionId'],
                'score': score,
                'maxScore': question['points'],
                'feedback': generate_feedback(answer, question, score),
                'strengths': identify_strengths(answer, question),
                'improvements': identify_improvements(answer, question)
            })
        
        # Generate overall feedback
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        overall_feedback = generate_overall_feedback(percentage, grading_results)
        
        result = {
            'userInfo': user_info,
            'answers': answers,
            'gradingResults': grading_results,
            'totalScore': total_score,
            'maxScore': max_score,
            'overallFeedback': overall_feedback,
            'completedAt': data.get('completedAt', ''),
            'timeSpent': sum(answer.get('timeSpent', 0) for answer in answers)
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
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }

def grade_answer(answer: Dict[str, Any], question: Dict[str, Any]) -> int:
    """Grade a single answer"""
    if question['type'] == 'multiple-choice':
        correct_answer = question.get('correctAnswer', '')
        return question['points'] if answer['answer'] == correct_answer else 0
    else:
        # For essay questions, score based on length and content
        word_count = len(answer['answer'].split())
        if word_count >= 100:
            return int(question['points'] * 0.9)
        elif word_count >= 50:
            return int(question['points'] * 0.7)
        elif word_count >= 20:
            return int(question['points'] * 0.5)
        else:
            return int(question['points'] * 0.2)

def generate_feedback(answer: Dict[str, Any], question: Dict[str, Any], score: int) -> str:
    """Generate feedback for an answer"""
    if question['type'] == 'multiple-choice':
        if score == question['points']:
            return "Correct! Well done."
        else:
            return f"Incorrect. The correct answer was: {question.get('correctAnswer', 'Not specified')}"
    else:
        word_count = len(answer['answer'].split())
        if word_count >= 100:
            return "Excellent detailed response showing deep understanding."
        elif word_count >= 50:
            return "Good response with adequate detail."
        elif word_count >= 20:
            return "Basic response that could benefit from more detail."
        else:
            return "Very brief response. Consider providing more comprehensive answers."

def identify_strengths(answer: Dict[str, Any], question: Dict[str, Any]) -> List[str]:
    """Identify strengths in the answer"""
    strengths = []
    word_count = len(answer['answer'].split())
    
    if word_count >= 50:
        strengths.append("Provided detailed explanation")
    
    if any(keyword in answer['answer'].lower() for keyword in ['example', 'experience', 'project']):
        strengths.append("Included relevant examples")
    
    if question['category'] == 'Technical' and any(tech in answer['answer'].lower() for tech in ['api', 'database', 'framework', 'library']):
        strengths.append("Demonstrated technical knowledge")
    
    return strengths

def identify_improvements(answer: Dict[str, Any], question: Dict[str, Any]) -> List[str]:
    """Identify areas for improvement"""
    improvements = []
    word_count = len(answer['answer'].split())
    
    if word_count < 30:
        improvements.append("Could provide more detailed explanations")
    
    if question['category'] == 'Technical' and not any(tech in answer['answer'].lower() for tech in ['api', 'database', 'framework', 'library', 'code']):
        improvements.append("Could include more technical details")
    
    if 'experience' in question['question'].lower() and 'experience' not in answer['answer'].lower():
        improvements.append("Could share more specific experiences")
    
    return improvements

def generate_overall_feedback(percentage: float, grading_results: List[Dict[str, Any]]) -> str:
    """Generate overall feedback for the exam"""
    if percentage >= 85:
        return f"Outstanding performance ({percentage:.0f}%)! You demonstrated excellent knowledge and problem-solving skills across all areas."
    elif percentage >= 70:
        return f"Strong performance ({percentage:.0f}%)! You showed good understanding with room for growth in some areas."
    elif percentage >= 55:
        return f"Solid effort ({percentage:.0f}%). Focus on the improvement areas noted to strengthen your technical skills."
    else:
        return f"Thank you for your submission ({percentage:.0f}%). Consider reviewing the feedback to identify key areas for development."

# For Cloudflare Workers
def fetch(request):
    return handler(request)
