"""
Test OpenAI Embeddings

This script demonstrates how to generate embeddings for document chunks using OpenAI's API.
"""

import os
import json
import argparse
from typing import List, Dict, Any
import logging

from embeddings.openai_embeddings import OpenAIEmbeddings
from utils.file_utils import ensure_directory_exists, list_files_with_extension

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Directories
CHUNKS_DIR = os.path.join(os.path.dirname(__file__), "document_chunks")
EMBEDDINGS_DIR = os.path.join(os.path.dirname(__file__), "embeddings_data")


def process_chunks_file(chunks_file_path: str, embeddings_client: OpenAIEmbeddings) -> str:
    """
    Process a chunks file and generate embeddings.
    
    Args:
        chunks_file_path: Path to the chunks JSON file
        embeddings_client: OpenAI embeddings client
        
    Returns:
        Path to the output file with embeddings
    """
    logger.info(f"Processing chunks file: {chunks_file_path}")
    
    # Create output directory
    ensure_directory_exists(EMBEDDINGS_DIR)
    
    # Determine output path
    filename = os.path.basename(chunks_file_path)
    name_parts = os.path.splitext(filename)
    output_path = os.path.join(EMBEDDINGS_DIR, f"{name_parts[0]}_with_embeddings{name_parts[1]}")
    
    # Process the file
    try:
        output_path = embeddings_client.process_chunks_file(chunks_file_path, output_path)
        logger.info(f"Successfully processed chunks and saved embeddings to: {output_path}")
        return output_path
    except Exception as e:
        logger.error(f"Error processing chunks file: {str(e)}")
        return None


def process_all_chunks_files(embeddings_client: OpenAIEmbeddings) -> List[str]:
    """
    Process all chunks files in the chunks directory.
    
    Args:
        embeddings_client: OpenAI embeddings client
        
    Returns:
        List of output file paths
    """
    if not os.path.exists(CHUNKS_DIR):
        logger.error(f"Chunks directory not found: {CHUNKS_DIR}")
        return []
    
    # Get all JSON files in the chunks directory
    chunks_files = list_files_with_extension(CHUNKS_DIR, ".json")
    
    if not chunks_files:
        logger.error(f"No chunks files found in {CHUNKS_DIR}")
        return []
    
    logger.info(f"Found {len(chunks_files)} chunks files")
    
    # Process each file
    output_files = []
    for chunks_file in chunks_files:
        output_path = process_chunks_file(chunks_file, embeddings_client)
        if output_path:
            output_files.append(output_path)
    
    logger.info(f"Successfully processed {len(output_files)} out of {len(chunks_files)} files")
    return output_files


def display_embeddings_info(embeddings_file_path: str) -> None:
    """
    Display information about embeddings in a file.
    
    Args:
        embeddings_file_path: Path to the embeddings JSON file
    """
    try:
        with open(embeddings_file_path, 'r', encoding='utf-8') as file:
            chunks_with_embeddings = json.load(file)
        
        logger.info(f"Embeddings file: {os.path.basename(embeddings_file_path)}")
        logger.info(f"Number of chunks: {len(chunks_with_embeddings)}")
        
        if chunks_with_embeddings:
            # Check the first chunk
            first_chunk = chunks_with_embeddings[0]
            if "embedding" in first_chunk:
                embedding_length = len(first_chunk["embedding"])
                logger.info(f"Embedding dimensions: {embedding_length}")
                logger.info(f"First few embedding values: {first_chunk['embedding'][:5]}")
            else:
                logger.warning("No embedding found in the first chunk")
        
    except Exception as e:
        logger.error(f"Error reading embeddings file: {str(e)}")


def main():
    """Main function to process chunks and generate embeddings."""
    parser = argparse.ArgumentParser(description="Generate embeddings for document chunks")
    parser.add_argument("--file", help="Process a specific chunks file")
    parser.add_argument("--all", action="store_true", help="Process all chunks files")
    parser.add_argument("--info", help="Display information about an embeddings file")
    args = parser.parse_args()
    
    # Check if OpenAI API key is available
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        try:
            from dotenv import load_dotenv
            load_dotenv()
            api_key = os.environ.get("OPENAI_API_KEY")
        except ImportError:
            logger.warning("python-dotenv not installed. Cannot load .env file.")
    
    if not api_key:
        logger.error("OPENAI_API_KEY not found in environment variables or .env file.")
        logger.error("Please set it before running this script.")
        return
    
    # Create embeddings client
    embeddings_client = OpenAIEmbeddings(api_key=api_key)
    
    if args.info:
        # Display information about an embeddings file
        display_embeddings_info(args.info)
    elif args.file:
        # Process a specific file
        if os.path.exists(args.file):
            process_chunks_file(args.file, embeddings_client)
        else:
            logger.error(f"File not found: {args.file}")
    elif args.all:
        # Process all chunks files
        process_all_chunks_files(embeddings_client)
    else:
        # Default: process all chunks files if they exist
        if os.path.exists(CHUNKS_DIR) and list_files_with_extension(CHUNKS_DIR, ".json"):
            process_all_chunks_files(embeddings_client)
        else:
            logger.error("No chunks files found. Please run test_text_chunking.py first.")
            logger.error("Usage: python test_embeddings.py --file <chunks_file> | --all | --info <embeddings_file>")


if __name__ == "__main__":
    main()
