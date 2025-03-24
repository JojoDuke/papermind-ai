from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

# Define models
class PDFUploadData(BaseModel):
    fileUrl: str
    fileName: str
    fileId: str

class ChatMessage(BaseModel):
    message: str

class DeleteCollection(BaseModel):
    collection_id: str

@app.post("/process-pdf")
async def process_pdf(data: PDFUploadData):
    try:
        collection_id = f"pdf_{data.fileName.lower().replace(' ', '_').replace('.pdf', '')}"
        
        # Create Wetro collection
        collection_response = requests.post(
            "https://api.wetrocloud.com/v1/collection/create/",
            headers={"Authorization": f"Token {WETRO_API_TOKEN}"},
            data={"collection_id": collection_id}
        )
        
        if not collection_response.json().get("success"):
            raise HTTPException(status_code=500, detail="Failed to create collection")
        
        # Insert PDF into collection
        insert_response = requests.post(
            "https://api.wetrocloud.com/v1/resource/insert/",
            headers={
                "Authorization": f"Token {WETRO_API_TOKEN}",
                "Content-Type": "application/json"
            },
            json={
                "collection_id": collection_id,
                "resource": data.fileUrl,
                "type": "file"
            }
        )
        
        if not insert_response.json().get("success"):
            raise HTTPException(status_code=500, detail="Failed to process PDF in Wetro")
            
        return {
            "success": True,
            "collection_id": collection_id,
            "resource_id": insert_response.json().get("resource_id")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#Test Endpoint, to be deleted
@app.post("/test")
async def test_endpoint(chat_message: ChatMessage):
    try:
        # Prepare Wetro API request
        headers = {
            "Authorization": f"Token {WETRO_API_TOKEN}"
        }
        
        data = {
            "collection_id": COLLECTION_ID,
            "request_query": chat_message.message,  # Use the message from the frontend
            "model": "llama-3.3-70b"
        }
        
        # Make request to Wetro
        response = requests.post(WETRO_API_URL, json=data, headers=headers)
        wetro_response = response.json()  
        
        # Extract the text response - adjust this based on Wetro's actual response structure
        response_text = wetro_response.get('response', 'No response from Wetro')
        if isinstance(response_text, dict):
            response_text = str(response_text)
        
        # Return just the text response
        return {"message": response_text}
        
    except Exception as e:
        print(f"Error calling Wetro API: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete-collection")
async def delete_collection(data: DeleteCollection):
    try:
        # Delete collection from Wetro
        delete_response = requests.delete(
            "https://api.wetrocloud.com/v1/collection/delete/",
            headers={
                "Authorization": f"Token {WETRO_API_TOKEN}"
            },
            json={
                "collection_id": data.collection_id
            }
        )
        
        if not delete_response.ok:
            raise HTTPException(status_code=500, detail="Failed to delete collection")
            
        return {
            "success": True,
            "message": f"Collection {data.collection_id} deleted successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 