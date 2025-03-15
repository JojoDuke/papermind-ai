"""
OpenAI Embeddings Module

This module provides functionality to generate embeddings using OpenAI's API.
"""

import os
import time
import json
from typing import List, Dict, Any, Optional, Union
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    from openai import OpenAI
except ImportError:
    logger.error("OpenAI package not installed. Please install it using: pip install openai")
    raise

# Check for API key
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    try:
        # Try to load from .env file
        from dotenv import load_dotenv
        load_dotenv()
        OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
    except ImportError:
        logger.warning("python-dotenv not installed. Cannot load .env file.")

if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not found in environment variables or .env file.")
    logger.warning("You will need to provide an API key when initializing the embeddings client.")


class OpenAIEmbeddings:
    """Class for generating embeddings using OpenAI's API."""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "text-embedding-ada-002"):
        """
        Initialize the OpenAI embeddings client.
        
        Args:
            api_key: OpenAI API key (if not provided, will use environment variable)
            model: OpenAI embedding model to use
        """
        self.api_key = api_key or OPENAI_API_KEY
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Please provide it or set OPENAI_API_KEY environment variable.")
        
        self.model = model
        self.client = OpenAI(api_key=self.api_key)
        logger.info(f"Initialized OpenAI embeddings client with model: {model}")
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to generate embedding for
            
        Returns:
            List of embedding values
        """
        if not text.strip():
            logger.warning("Empty text provided for embedding generation")
            return []
        
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise
    
    def generate_embeddings(self, texts: List[str], 
                           batch_size: int = 20, 
                           retry_limit: int = 3,
                           retry_delay: float = 1.0) -> List[List[float]]:
        """
        Generate embeddings for multiple texts with batching and retry logic.
        
        Args:
            texts: List of texts to generate embeddings for
            batch_size: Number of texts to process in each API call
            retry_limit: Maximum number of retries for failed API calls
            retry_delay: Delay between retries in seconds
            
        Returns:
            List of embeddings (each embedding is a list of floats)
        """
        if not texts:
            logger.warning("Empty list provided for embedding generation")
            return []
        
        all_embeddings = []
        
        # Process in batches
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1} ({len(batch)} texts)")
            
            # Retry logic
            for attempt in range(retry_limit):
                try:
                    response = self.client.embeddings.create(
                        model=self.model,
                        input=batch
                    )
                    
                    # Sort embeddings by index to ensure correct order
                    sorted_embeddings = sorted(response.data, key=lambda x: x.index)
                    batch_embeddings = [item.embedding for item in sorted_embeddings]
                    all_embeddings.extend(batch_embeddings)
                    
                    # Successful batch, break retry loop
                    break
                    
                except Exception as e:
                    logger.warning(f"Attempt {attempt+1}/{retry_limit} failed: {str(e)}")
                    
                    if attempt < retry_limit - 1:
                        # Wait before retrying (with exponential backoff)
                        wait_time = retry_delay * (2 ** attempt)
                        logger.info(f"Waiting {wait_time:.2f}s before retrying...")
                        time.sleep(wait_time)
                    else:
                        # Last attempt failed
                        logger.error(f"Failed to generate embeddings after {retry_limit} attempts")
                        raise
        
        return all_embeddings
    
    def embed_document_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate embeddings for document chunks.
        
        Args:
            chunks: List of document chunks (each with 'text' and 'metadata' keys)
            
        Returns:
            List of document chunks with embeddings added
        """
        # Extract texts from chunks
        texts = [chunk["text"] for chunk in chunks]
        
        # Generate embeddings
        embeddings = self.generate_embeddings(texts)
        
        # Add embeddings to chunks
        for i, embedding in enumerate(embeddings):
            chunks[i]["embedding"] = embedding
        
        return chunks
    
    def process_chunks_file(self, input_path: str, output_path: Optional[str] = None) -> str:
        """
        Process a chunks file and add embeddings.
        
        Args:
            input_path: Path to the input chunks JSON file
            output_path: Path to save the output chunks with embeddings (if None, will modify the input path)
            
        Returns:
            Path to the output file
        """
        # Determine output path
        if output_path is None:
            file_dir = os.path.dirname(input_path)
            file_name = os.path.basename(input_path)
            name_parts = os.path.splitext(file_name)
            output_path = os.path.join(file_dir, f"{name_parts[0]}_with_embeddings{name_parts[1]}")
        
        # Load chunks
        try:
            with open(input_path, 'r', encoding='utf-8') as file:
                chunks = json.load(file)
        except Exception as e:
            logger.error(f"Error loading chunks file: {str(e)}")
            raise
        
        logger.info(f"Loaded {len(chunks)} chunks from {input_path}")
        
        # Generate embeddings
        chunks_with_embeddings = self.embed_document_chunks(chunks)
        
        # Save chunks with embeddings
        try:
            with open(output_path, 'w', encoding='utf-8') as file:
                json.dump(chunks_with_embeddings, file, indent=2)
            logger.info(f"Saved {len(chunks_with_embeddings)} chunks with embeddings to {output_path}")
        except Exception as e:
            logger.error(f"Error saving chunks with embeddings: {str(e)}")
            raise
        
        return output_path


if __name__ == "__main__":
    # Simple test
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check if API key is available
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY not found in environment variables or .env file.")
        print("Please set it before running this script.")
        exit(1)
    
    # Create embeddings client
    embeddings_client = OpenAIEmbeddings(api_key=api_key)
    
    # Test with a simple text
    test_text = "This is a test document for embedding generation."
    embedding = embeddings_client.generate_embedding(test_text)
    
    print(f"Generated embedding with {len(embedding)} dimensions")
    print(f"First 5 values: {embedding[:5]}")
    
    # Test with multiple texts
    test_texts = [
        "This is the first test document.",
        "This is the second test document.",
        "This is the third test document."
    ]
    
    embeddings = embeddings_client.generate_embeddings(test_texts)
    
    print(f"Generated {len(embeddings)} embeddings")
    for i, emb in enumerate(embeddings):
        print(f"Embedding {i+1}: {len(emb)} dimensions")
