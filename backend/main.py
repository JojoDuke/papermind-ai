from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
import uuid  # Add import for UUID
import hmac
import hashlib
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client with service role key
supabase_url = os.getenv("SUPABASE_URL")
service_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not service_key:
    raise ValueError("Missing Supabase configuration. Please check your .env file.")

print(f"Initializing Supabase client with URL: {supabase_url}")
supabase: Client = create_client(supabase_url, service_key)

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
    collection_id: str

class DeleteCollection(BaseModel):
    collection_id: str

class QueryCollection(BaseModel):
    collection_id: str
    query: str
    model: str = "llama-3.3-70b"  # Default model

class SubscriptionWebhook(BaseModel):
    event: str
    data: dict

@app.post("/process-pdf")
async def process_pdf(data: PDFUploadData):
    try:
        # Generate a UUID for the collection
        collection_id = str(uuid.uuid4())
        
        # Create Wetro collection
        collection_response = requests.post(
            "https://api.wetrocloud.com/v1/collection/create/",
            headers={"Authorization": f"Token {WETRO_API_TOKEN}"},
            data={"collection_id": collection_id}
        )
        
        if not collection_response.json().get("success"):
            raise HTTPException(status_code=500, detail="Failed to create collection")
        
        # Insert PDF into collection
        print(f"Uploading file with URL: {data.fileUrl}")
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

@app.post("/query-collection")
async def query_collection(chat_message: ChatMessage):
    try:
        print(f"Received query request - Message: {chat_message.message}, Collection ID: {chat_message.collection_id}")
        
        # Prepare Wetro API request
        headers = {
            "Authorization": f"Token {WETRO_API_TOKEN}"
        }
        
        data = {
            "collection_id": chat_message.collection_id,
            "request_query": chat_message.message,
            "model": "llama-3.3-70b"
        }
        
        print(f"Sending request to Wetro with data: {data}")
        
        # Make request to Wetro
        response = requests.post(WETRO_API_URL, json=data, headers=headers)
        wetro_response = response.json()
        
        print(f"Wetro response: {wetro_response}")
        
        # Extract the text response - adjust this based on Wetro's actual response structure
        response_text = wetro_response.get('response', 'No response from Wetro')
        if isinstance(response_text, dict):
            response_text = str(response_text)
        
        # Return just the text response
        return {"message": response_text}
        
    except Exception as e:
        print(f"Error calling Wetro API: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook/dodo-payments")
async def handle_webhook(request: Request, webhook: SubscriptionWebhook):
    print(f"Received webhook event: {webhook.event}")
    print(f"Webhook data: {webhook.data}")
    
    # Verify webhook signature
    signature = request.headers.get("X-Dodo-Signature")
    webhook_secret = os.getenv("DODO_WEBHOOK_SECRET")
    
    if not signature or not webhook_secret:
        print("Missing signature or webhook secret")
        raise HTTPException(status_code=400, detail="Missing signature or webhook secret")
    
    # Get raw body for signature verification
    body = await request.body()
    print(f"Raw webhook body: {body.decode()}")
    
    # Verify signature
    expected_signature = hmac.new(
        webhook_secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        print(f"Invalid signature. Expected: {expected_signature}, Received: {signature}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    try:
        # Handle different webhook events
        if webhook.event == "payment.successful":
            print("Processing successful payment event")
            # Extract user ID from metadata
            user_id = webhook.data.get("metadata", {}).get("user_id")
            if not user_id:
                print("Missing user_id in metadata")
                raise HTTPException(status_code=400, detail="Missing user_id in metadata")
            
            print(f"Updating premium status for user: {user_id}")
            # Update user credits and premium status in Supabase
            response = supabase.table("users").update({
                "credits_remaining": 100,  # Reset to 100 credits
                "is_premium": True,        # Set premium status
                "subscription_id": webhook.data.get("subscription_id")  # Store subscription ID
            }).eq("id", user_id).execute()
            
            if response.error:
                print(f"Error updating user: {response.error}")
                raise HTTPException(status_code=500, detail=str(response.error))
            
            print("Successfully updated user to premium status")
            return {"status": "success", "message": "User upgraded to premium"}
            
        elif webhook.event == "subscription.cancelled":
            print("Processing subscription cancellation event")
            # Handle subscription cancellation
            subscription_id = webhook.data.get("subscription_id")
            if not subscription_id:
                print("Missing subscription_id")
                raise HTTPException(status_code=400, detail="Missing subscription_id")
            
            # Update user premium status in Supabase
            response = supabase.table("users").update({
                "is_premium": False
            }).eq("subscription_id", subscription_id).execute()
            
            if response.error:
                print(f"Error cancelling subscription: {response.error}")
                raise HTTPException(status_code=500, detail=str(response.error))
            
            print("Successfully cancelled subscription")
            return {"status": "success", "message": "Subscription cancelled"}
            
        print(f"Unhandled webhook event: {webhook.event}")
        return {"status": "success", "message": f"Webhook received: {webhook.event}"}
        
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 