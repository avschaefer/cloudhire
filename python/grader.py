import json
import os
from typing import Dict, Any, List

async def on_fetch(request, env):
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return Response(None, {
            "status": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            }
        })
    
    if request.method != "POST":
        return Response("Method not allowed", {"status": 405})
    
    try:
        data = await request.json()
        exam_data = data.get("examData", {})
        user_bio = data.get("userBio", {})
        questions = data.get("questions", [])
        
        # Use XAI API key from environment
        api_key = env.get("XAI_API_KEY")
        if not api_key:
            return fallback_grading(exam_data, questions)
        
        # Grade using Grok
        grading_result = await grade_with_grok(exam_data, questions, api_key)
        
        return Response(json.dumps(grading_result), {
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            }
        })
        
    except Exception as e:
        print(f"Grading error: {e}")
        return fallback_grading(exam_data, questions)

async def grade_with_grok(exam_data: Dict, questions: List, api_key: str):
    """Grade exam using Grok AI"""
    try:
        import aiohttp
        
        prompt = f"""
        Grade this technical exam based on the questions and answers provided.
        
        Questions: {json.dumps(questions, indent=2)}
        Answers: {json.dumps(exam_data, indent=2)}
        
        Provide a detailed grading with:
        1. Overall score (0-100)
        2. Detailed feedback
        3. Breakdown by section
        
        Return as JSON with this structure:
        {{
            "score": 85,
            "feedback": "Overall performance was good...",
            "breakdown": {{
                "multipleChoice": {{"correct": 7, "total": 10}},
                "concepts": {{"score": 80, "feedback": "Good understanding..."}},
                "calculations": {{"score": 90, "feedback": "Excellent work..."}}
            }}
        }}
        """
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://api.x.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "grok-3",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3
                }
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    content = result["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    raise Exception(f"Grok API error: {response.status}")
                    
    except Exception as e:
        print(f"Grok grading failed: {e}")
        return fallback_grading(exam_data, questions)

def fallback_grading(exam_data: Dict, questions: List) -> Dict[str, Any]:
    """Fallback grading when AI is unavailable"""
    total_score = 0
    max_score = 0
    mc_correct = 0
    mc_total = 0
    
    for question in questions:
        points = question.get("points", 10)
        max_score += points
        
        if "multiple" in question.get("type", "").lower():
            mc_total += 1
            user_answer = exam_data.get("multipleChoice", {}).get(str(question["ID"]))
            correct_answer = question.get("answer")
            
            if user_answer and correct_answer and user_answer.strip().lower() == correct_answer.strip().lower():
                mc_correct += 1
                total_score += points
        else:
            # Open-ended questions get partial credit
            answer = (exam_data.get("concepts", {}).get(str(question["ID"])) or 
                     exam_data.get("calculations", {}).get(str(question["ID"])))
            
            if answer and len(answer.strip()) > 10:
                total_score += int(points * 0.7)  # 70% for attempting
    
    final_score = round((total_score / max_score) * 100) if max_score > 0 else 0
    
    return {
        "score": final_score,
        "feedback": f"Exam completed with {final_score}% score. Multiple choice: {mc_correct}/{mc_total} correct.",
        "breakdown": {
            "multipleChoice": {"correct": mc_correct, "total": mc_total},
            "concepts": {"score": 70, "feedback": "Partial credit given"},
            "calculations": {"score": 70, "feedback": "Partial credit given"}
        }
    }
