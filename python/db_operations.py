from db_client import create_supabase_client

def insert_user_answer(user_id: str, question_id: str, answer_text: str):
    client = create_supabase_client()
    data = {'user_id': user_id, 'question_id': question_id, 'answer_text': answer_text}
    response = client.table('UserAnswer').insert(data).execute()
    if hasattr(response, 'error') and response.error:
        raise Exception(f'Insert failed: {response.error}')
    return response.data[0]['id']  # Return new answer ID for grading 

def get_user_answer(answer_id: str):
    client = create_supabase_client()
    response = client.table('UserAnswer').select('*').eq('id', answer_id).single().execute()
    if hasattr(response, 'error') and response.error:
        raise Exception(f'Query failed: {response.error}')
    return response.data

def insert_grading_result(answer_id: str, score: int, feedback: str):
    client = create_supabase_client()
    data = {'answer_id': answer_id, 'score': score, 'feedback': feedback}
    response = client.table('GradingResult').insert(data).execute()
    if hasattr(response, 'error') and response.error:
        raise Exception(f'Insert failed: {response.error}')
    return response.data

def insert_report(user_id: str, content: str):
    client = create_supabase_client()
    data = {'user_id': user_id, 'content': content}
    response = client.table('Report').insert(data).execute()
    if hasattr(response, 'error') and response.error:
        raise Exception(f'Insert failed: {response.error}')
    return response.data[0]['id']
