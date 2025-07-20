# python/api_client.py - Modular xAI API client
import json
import os
from typing import Dict, Any, Optional
import requests

class XAIApiError(Exception):
    """Custom exception for xAI API errors"""
    pass

class XAIClient:
    """Client for interacting with xAI Grok API"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('XAI_API_KEY')
        if not self.api_key:
            raise XAIApiError("XAI_API_KEY environment variable is required")
        
        self.base_url = "https://api.x.ai/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def call_grok_api(self, prompt: str, model: str = "grok-beta") -> str:
        """
        Call xAI Grok API with a prompt
        
        Args:
            prompt: The prompt to send to Grok
            model: The model to use (default: grok-beta)
            
        Returns:
            The response text from Grok
            
        Raises:
            XAIApiError: If the API call fails
        """
        try:
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 4000,
                "temperature": 0.1  # Low temperature for consistent grading
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                raise XAIApiError(f"API request failed with status {response.status_code}: {response.text}")
            
            data = response.json()
            
            if 'choices' not in data or not data['choices']:
                raise XAIApiError("No response choices in API response")
            
            return data['choices'][0]['message']['content']
            
        except requests.exceptions.RequestException as e:
            raise XAIApiError(f"Network error calling xAI API: {str(e)}")
        except json.JSONDecodeError as e:
            raise XAIApiError(f"Invalid JSON response from xAI API: {str(e)}")
        except Exception as e:
            raise XAIApiError(f"Unexpected error calling xAI API: {str(e)}")
    
    def grade_exam_response(self, question: Dict[str, Any], answer: str, user_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Grade a single exam response using xAI
        
        Args:
            question: Question data including type, points, correct answer, etc.
            answer: Student's answer
            user_info: User information for context
            
        Returns:
            Grading result with score, feedback, strengths, and improvements
        """
        prompt = self._build_grading_prompt(question, answer, user_info)
        
        try:
            response = self.call_grok_api(prompt)
            return self._parse_grading_response(response, question)
        except XAIApiError:
            # Fallback to basic grading if API fails
            return self._fallback_grading(question, answer)
    
    def _build_grading_prompt(self, question: Dict[str, Any], answer: str, user_info: Dict[str, Any]) -> str:
        """Build a grading prompt for xAI"""
        
        base_prompt = f"""
You are an expert technical evaluator grading an exam response. Please evaluate the following:

CANDIDATE INFORMATION:
- Name: {user_info.get('firstName', 'Unknown')} {user_info.get('lastName', 'Unknown')}
- Position: {user_info.get('position', 'Unknown')}
- Experience Level: {user_info.get('experience', 'Unknown')}
- Education: {user_info.get('education', 'Unknown')}

QUESTION:
Type: {question.get('type', 'Unknown')}
Question: {question.get('question', 'No question provided')}
Points: {question.get('points', 0)}
Category: {question.get('category', 'General')}

STUDENT ANSWER:
{answer}

GRADING INSTRUCTIONS:
"""
        
        if question.get('type') == 'multiple-choice':
            base_prompt += f"""
- This is a multiple-choice question
- Correct answer: {question.get('correctAnswer', 'Not specified')}
- Award {question.get('points', 0)} points for correct answer, 0 for incorrect
- Provide brief feedback explaining why the answer is correct or incorrect
"""
        else:
            base_prompt += f"""
- This is a {question.get('type', 'essay')} question worth {question.get('points', 0)} points
- Grade based on:
  * Understanding of concepts (40%)
  * Clarity of explanation (30%)
  * Technical accuracy (20%)
  * Completeness (10%)
- Provide detailed feedback with specific strengths and areas for improvement
- Consider the candidate's experience level in your evaluation
"""
        
        base_prompt += """

Please respond with a JSON object in this exact format:
{
  "score": <number>,
  "maxScore": <number>,
  "feedback": "<detailed feedback>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"]
}

Be thorough and fair in your evaluation."""
        
        return base_prompt
    
    def _parse_grading_response(self, response: str, question: Dict[str, Any]) -> Dict[str, Any]:
        """Parse the grading response from xAI"""
        try:
            # Clean up the response
            response = response.strip()
            if response.startswith('```json'):
                response = response[7:]
            if response.endswith('```'):
                response = response[:-3]
            
            result = json.loads(response)
            
            # Validate required fields
            required_fields = ['score', 'feedback']
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field: {field}")
            
            # Ensure score is within bounds
            result['score'] = max(0, min(result['score'], question.get('points', 0)))
            result['maxScore'] = question.get('points', 0)
            
            # Ensure arrays exist
            result['strengths'] = result.get('strengths', [])
            result['improvements'] = result.get('improvements', [])
            
            return result
            
        except (json.JSONDecodeError, ValueError) as e:
            # If parsing fails, use fallback grading
            print(f"Failed to parse xAI response: {e}")
            return self._fallback_grading(question, response)
    
    def _fallback_grading(self, question: Dict[str, Any], answer: str) -> Dict[str, Any]:
        """Fallback grading when xAI is unavailable"""
        max_score = question.get('points', 0)
        
        if question.get('type') == 'multiple-choice':
            correct_answer = question.get('correctAnswer', '')
            score = max_score if answer.strip() == correct_answer else 0
            feedback = "Correct!" if score == max_score else f"Incorrect. The correct answer was: {correct_answer}"
        else:
            # Basic scoring based on answer length and content
            word_count = len(answer.split())
            if word_count >= 100:
                score = int(max_score * 0.9)
            elif word_count >= 50:
                score = int(max_score * 0.7)
            elif word_count >= 20:
                score = int(max_score * 0.5)
            else:
                score = int(max_score * 0.2)
            
            feedback = "Basic grading applied due to API unavailability."
        
        return {
            "score": score,
            "maxScore": max_score,
            "feedback": feedback,
            "strengths": ["Response provided"],
            "improvements": ["AI grading unavailable - manual review recommended"]
        } 