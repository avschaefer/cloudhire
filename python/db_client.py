import os
from supabase import create_client, Client

def create_supabase_client() -> Client:
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_ANON_KEY')
    if not url or not key:
        raise ValueError('Missing Supabase credentials')
    return create_client(url, key)
