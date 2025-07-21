# python/report_generator.py - Modular report generation utilities
import json
from typing import Dict, List, Any
from datetime import datetime
from db_operations import insert_report

class ReportGenerator:
    """Generates comprehensive exam reports"""
    
    def __init__(self):
        pass
    
    def generate_exam_report(self, grading_results: List[Dict[str, Any]], user_info: Dict[str, Any], exam_metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive exam report
        
        Args:
            grading_results: List of individual question grading results
            user_info: User information
            exam_metadata: Exam metadata (time spent, completion date, etc.)
            
        Returns:
            Complete exam report with summary and detailed analysis
        """
        # Calculate summary statistics
        total_score = sum(result.get('score', 0) for result in grading_results)
        max_score = sum(result.get('maxScore', 0) for result in grading_results)
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        
        # Generate overall feedback
        overall_feedback = self._generate_overall_feedback(percentage, grading_results, user_info)
        
        # Analyze strengths and improvements
        strengths, improvements = self._analyze_patterns(grading_results)
        
        # Determine recommended level
        recommended_level = self._determine_level(percentage, user_info)
        
        # Generate hiring recommendation
        hiring_recommendation = self._generate_hiring_recommendation(percentage, strengths, improvements)
        
        report = {
            'userInfo': user_info,
            'examMetadata': exam_metadata,
            'gradingResults': grading_results,
            'summary': {
                'totalScore': total_score,
                'maxScore': max_score,
                'percentage': round(percentage, 1),
                'timeSpent': exam_metadata.get('timeSpent', 0),
                'completedAt': exam_metadata.get('completedAt', datetime.now().isoformat()),
                'questionsAnswered': len(grading_results)
            },
            'analysis': {
                'overallFeedback': overall_feedback,
                'keyStrengths': strengths,
                'areasForImprovement': improvements,
                'recommendedLevel': recommended_level,
                'hiringRecommendation': hiring_recommendation,
                'technicalCapability': self._assess_technical_capability(grading_results),
                'problemSolvingSkills': self._assess_problem_solving(grading_results),
                'communicationSkills': self._assess_communication(grading_results)
            },
            'generatedAt': datetime.now().isoformat()
        }
        # Insert to DB
        report_content = json.dumps(report)
        report_id = insert_report(user_info['userId'], report_content)
        report['id'] = report_id
        return report
    
    def _generate_overall_feedback(self, percentage: float, grading_results: List[Dict[str, Any]], user_info: Dict[str, Any]) -> str:
        """Generate overall feedback based on performance"""
        experience_level = user_info.get('experience', 'Unknown').lower()
        
        if percentage >= 90:
            base_feedback = f"Exceptional performance ({percentage:.0f}%)! "
            if 'senior' in experience_level or 'expert' in experience_level:
                feedback = base_feedback + "You demonstrated expert-level knowledge and problem-solving skills that align perfectly with senior-level expectations."
            else:
                feedback = base_feedback + "You showed outstanding potential that exceeds typical expectations for your experience level."
        elif percentage >= 80:
            base_feedback = f"Strong performance ({percentage:.0f}%)! "
            if 'junior' in experience_level or 'entry' in experience_level:
                feedback = base_feedback + "You demonstrated solid foundational knowledge with excellent growth potential."
            else:
                feedback = base_feedback + "You showed good technical competency with room for refinement in advanced areas."
        elif percentage >= 70:
            base_feedback = f"Good performance ({percentage:.0f}%)! "
            feedback = base_feedback + "You demonstrated adequate understanding with clear areas for development."
        elif percentage >= 60:
            base_feedback = f"Satisfactory performance ({percentage:.0f}%)! "
            feedback = base_feedback + "You showed basic competency but would benefit from additional training and experience."
        else:
            base_feedback = f"Performance needs improvement ({percentage:.0f}%)! "
            feedback = base_feedback + "Consider focusing on the fundamental concepts and gaining more hands-on experience."
        
        return feedback
    
    def _analyze_patterns(self, grading_results: List[Dict[str, Any]]) -> tuple[List[str], List[str]]:
        """Analyze patterns in grading results to identify strengths and improvements"""
        all_strengths = []
        all_improvements = []
        
        for result in grading_results:
            all_strengths.extend(result.get('strengths', []))
            all_improvements.extend(result.get('improvements', []))
        
        # Count and prioritize
        strength_counts = {}
        improvement_counts = {}
        
        for strength in all_strengths:
            strength_counts[strength] = strength_counts.get(strength, 0) + 1
        
        for improvement in all_improvements:
            improvement_counts[improvement] = improvement_counts.get(improvement, 0) + 1
        
        # Get top 3 most common
        top_strengths = sorted(strength_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_improvements = sorted(improvement_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return [s[0] for s in top_strengths], [i[0] for i in top_improvements]
    
    def _determine_level(self, percentage: float, user_info: Dict[str, Any]) -> str:
        """Determine recommended experience level based on performance"""
        experience = user_info.get('experience', '').lower()
        
        if percentage >= 90:
            if 'entry' in experience or 'junior' in experience:
                return 'Mid-Level'
            elif 'mid' in experience:
                return 'Senior'
            else:
                return 'Expert'
        elif percentage >= 80:
            if 'entry' in experience:
                return 'Junior'
            elif 'junior' in experience:
                return 'Mid-Level'
            else:
                return 'Senior'
        elif percentage >= 70:
            if 'entry' in experience:
                return 'Entry'
            else:
                return 'Junior'
        else:
            return 'Entry'
    
    def _generate_hiring_recommendation(self, percentage: float, strengths: List[str], improvements: List[str]) -> str:
        """Generate hiring recommendation based on performance"""
        if percentage >= 85:
            return 'Strong Hire'
        elif percentage >= 75:
            return 'Hire'
        elif percentage >= 65:
            return 'Maybe'
        else:
            return 'No Hire'
    
    def _assess_technical_capability(self, grading_results: List[Dict[str, Any]]) -> str:
        """Assess overall technical capability"""
        technical_scores = []
        
        for result in grading_results:
            if 'technical' in result.get('feedback', '').lower() or 'concept' in result.get('feedback', '').lower():
                score = result.get('score', 0) / result.get('maxScore', 1)
                technical_scores.append(score)
        
        if not technical_scores:
            return "Unable to assess technical capability from available data"
        
        avg_score = sum(technical_scores) / len(technical_scores)
        
        if avg_score >= 0.9:
            return "Exceptional technical knowledge and understanding"
        elif avg_score >= 0.8:
            return "Strong technical foundation with good conceptual grasp"
        elif avg_score >= 0.7:
            return "Solid technical understanding with room for growth"
        elif avg_score >= 0.6:
            return "Basic technical knowledge requiring further development"
        else:
            return "Limited technical capability requiring significant improvement"
    
    def _assess_problem_solving(self, grading_results: List[Dict[str, Any]]) -> str:
        """Assess problem-solving skills"""
        problem_solving_indicators = []
        
        for result in grading_results:
            feedback = result.get('feedback', '').lower()
            if any(term in feedback for term in ['approach', 'methodology', 'solution', 'problem-solving', 'logic']):
                problem_solving_indicators.append(result.get('score', 0) / result.get('maxScore', 1))
        
        if not problem_solving_indicators:
            return "Unable to assess problem-solving skills from available data"
        
        avg_score = sum(problem_solving_indicators) / len(problem_solving_indicators)
        
        if avg_score >= 0.9:
            return "Excellent problem-solving methodology and logical thinking"
        elif avg_score >= 0.8:
            return "Strong analytical approach with good problem-solving skills"
        elif avg_score >= 0.7:
            return "Adequate problem-solving skills with room for improvement"
        elif avg_score >= 0.6:
            return "Basic problem-solving approach requiring development"
        else:
            return "Limited problem-solving skills needing significant improvement"
    
    def _assess_communication(self, grading_results: List[Dict[str, Any]]) -> str:
        """Assess communication skills"""
        communication_indicators = []
        
        for result in grading_results:
            feedback = result.get('feedback', '').lower()
            if any(term in feedback for term in ['clear', 'explanation', 'communication', 'articulate', 'well-written']):
                communication_indicators.append(result.get('score', 0) / result.get('maxScore', 1))
        
        if not communication_indicators:
            return "Unable to assess communication skills from available data"
        
        avg_score = sum(communication_indicators) / len(communication_indicators)
        
        if avg_score >= 0.9:
            return "Exceptional communication with clear, articulate explanations"
        elif avg_score >= 0.8:
            return "Strong communication skills with clear expression of ideas"
        elif avg_score >= 0.7:
            return "Good communication with generally clear explanations"
        elif avg_score >= 0.6:
            return "Basic communication skills requiring improvement"
        else:
            return "Limited communication skills needing significant development"
    
    def generate_html_report(self, report_data: Dict[str, Any]) -> str:
        """Generate HTML version of the report for email"""
        # This would generate a formatted HTML report
        # For now, return a simple HTML structure
        return f"""
        <html>
        <head>
            <title>Technical Exam Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background: #f0f0f0; padding: 20px; border-radius: 5px; }}
                .summary {{ margin: 20px 0; }}
                .analysis {{ margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Technical Exam Report</h1>
                <p><strong>Candidate:</strong> {report_data['userInfo'].get('firstName', '')} {report_data['userInfo'].get('lastName', '')}</p>
                <p><strong>Position:</strong> {report_data['userInfo'].get('position', '')}</p>
            </div>
            
            <div class="summary">
                <h2>Summary</h2>
                <p><strong>Score:</strong> {report_data['summary']['totalScore']}/{report_data['summary']['maxScore']} ({report_data['summary']['percentage']}%)</p>
                <p><strong>Time Spent:</strong> {report_data['summary']['timeSpent']} minutes</p>
            </div>
            
            <div class="analysis">
                <h2>Analysis</h2>
                <p><strong>Overall Feedback:</strong> {report_data['analysis']['overallFeedback']}</p>
                <p><strong>Recommended Level:</strong> {report_data['analysis']['recommendedLevel']}</p>
                <p><strong>Hiring Recommendation:</strong> {report_data['analysis']['hiringRecommendation']}</p>
            </div>
        </body>
        </html>
        """
