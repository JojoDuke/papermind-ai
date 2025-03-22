from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wetro API configuration
WETRO_API_URL = "https://api.wetrocloud.com/v1/collection/query/"
WETRO_API_TOKEN = os.getenv("WETRO_API_TOKEN")
COLLECTION_ID = os.getenv("WETRO_COLLECTION_ID")

@app.get("/test")
async def test_endpoint():
    try:
        # Prepare Wetro API request
        headers = {
            "Authorization": f"Token {WETRO_API_TOKEN}"
        }
        
        data = {
            "collection_id": COLLECTION_ID,
            "request_query": "Whose her oldest child and their age",  # We'll make this dynamic later
            "model": "llama-3.3-70b"
        }
        
        # Make request to Wetro
        response = requests.post(WETRO_API_URL, data=data, headers=headers)
        wetro_response = response.json()  
        
        # Extract the text response - adjust this based on Wetro's actual response structure
        response_text = wetro_response.get('response', 'No response from Wetro')
        if isinstance(response_text, dict):
            response_text = str(response_text)
        
        # Return just the text response
        return {"message": response_text}
        
    except Exception as e:
        print(f"Error calling Wetro API: {str(e)}")
        return {"message": f"Error: {str(e)}"} 