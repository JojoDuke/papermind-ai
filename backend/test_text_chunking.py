"""
Test Text Chunking

This script demonstrates how to use the text chunking module with extracted PDF text.
"""

import os
import json
from pdf_processor.extract_text import extract_text_from_pdf
from pdf_processor.text_chunker import create_document_chunks
from utils.file_utils import ensure_directory_exists, list_files_with_extension


# Directories
EXTRACTED_TEXT_DIR = os.path.join(os.path.dirname(__file__), "extracted_text")
CHUNKS_DIR = os.path.join(os.path.dirname(__file__), "document_chunks")
SAMPLE_DOCS_DIR = os.path.join(os.path.dirname(__file__), "sample_docs")


def process_text_file(text_file_path, chunk_size=1000, chunk_overlap=200):
    """Process a text file and create chunks."""
    print(f"\nProcessing: {text_file_path}")
    
    # Read the text file
    try:
        with open(text_file_path, 'r', encoding='utf-8') as file:
            text = file.read()
    except Exception as e:
        print(f"Error reading file: {str(e)}")
        return False
    
    # Extract metadata from filename
    filename = os.path.basename(text_file_path)
    doc_id = os.path.splitext(filename)[0]
    
    # Create metadata
    metadata = {
        "document_id": doc_id,
        "source": "extracted_text",
        "filename": filename
    }
    
    # Create chunks
    chunks = create_document_chunks(
        text,
        metadata=metadata,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    
    print(f"Created {len(chunks)} chunks from {len(text)} characters")
    
    # Create output directory
    ensure_directory_exists(CHUNKS_DIR)
    
    # Save chunks to JSON file
    output_path = os.path.join(CHUNKS_DIR, f"{doc_id}_chunks.json")
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            json.dump(chunks, file, indent=2)
        print(f"Saved chunks to {output_path}")
        return True
    except Exception as e:
        print(f"Error saving chunks: {str(e)}")
        return False


def process_pdf_directly(pdf_path, chunk_size=1000, chunk_overlap=200):
    """Extract text from PDF and create chunks in one step."""
    print(f"\nProcessing PDF directly: {pdf_path}")
    
    # Extract text from PDF
    text, error = extract_text_from_pdf(pdf_path)
    if error:
        print(f"Error: {error}")
        return False
    
    if not text:
        print("No text extracted from PDF")
        return False
    
    # Extract metadata from filename
    filename = os.path.basename(pdf_path)
    doc_id = os.path.splitext(filename)[0]
    
    # Create metadata
    metadata = {
        "document_id": doc_id,
        "source": "pdf",
        "filename": filename
    }
    
    # Create chunks
    chunks = create_document_chunks(
        text,
        metadata=metadata,
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    
    print(f"Created {len(chunks)} chunks from {len(text)} characters")
    
    # Create output directory
    ensure_directory_exists(CHUNKS_DIR)
    
    # Save chunks to JSON file
    output_path = os.path.join(CHUNKS_DIR, f"{doc_id}_chunks.json")
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            json.dump(chunks, file, indent=2)
        print(f"Saved chunks to {output_path}")
        return True
    except Exception as e:
        print(f"Error saving chunks: {str(e)}")
        return False


def process_extracted_text_files():
    """Process all text files in the extracted_text directory."""
    if not os.path.exists(EXTRACTED_TEXT_DIR):
        print(f"Extracted text directory not found: {EXTRACTED_TEXT_DIR}")
        return
    
    # Get all text files
    text_files = list_files_with_extension(EXTRACTED_TEXT_DIR, ".txt")
    
    if not text_files:
        print(f"No text files found in {EXTRACTED_TEXT_DIR}")
        return
    
    print(f"Found {len(text_files)} text files")
    
    # Process each text file
    success_count = 0
    for text_file in text_files:
        if process_text_file(text_file):
            success_count += 1
    
    print(f"\nSummary: Successfully processed {success_count} out of {len(text_files)} files")


def process_sample_pdfs():
    """Process all PDFs in the sample_docs directory directly."""
    if not os.path.exists(SAMPLE_DOCS_DIR):
        print(f"Sample docs directory not found: {SAMPLE_DOCS_DIR}")
        return
    
    # Get all PDF files
    pdf_files = list_files_with_extension(SAMPLE_DOCS_DIR, ".pdf")
    
    if not pdf_files:
        print(f"No PDF files found in {SAMPLE_DOCS_DIR}")
        return
    
    print(f"Found {len(pdf_files)} PDF files")
    
    # Process each PDF file
    success_count = 0
    for pdf_file in pdf_files:
        if process_pdf_directly(pdf_file):
            success_count += 1
    
    print(f"\nSummary: Successfully processed {success_count} out of {len(pdf_files)} files")


def display_chunk_sample(chunks_file_path, num_samples=2):
    """Display sample chunks from a chunks file."""
    try:
        with open(chunks_file_path, 'r', encoding='utf-8') as file:
            chunks = json.load(file)
        
        print(f"\nSample chunks from {os.path.basename(chunks_file_path)}:")
        
        # Display info about all chunks
        print(f"Total chunks: {len(chunks)}")
        
        # Display sample chunks
        for i, chunk in enumerate(chunks[:num_samples]):
            print(f"\nChunk {i+1}/{len(chunks)} (size: {len(chunk['text'])} chars):")
            # Display first 150 characters of the chunk
            preview = chunk['text'][:150].replace('\n', ' ')
            print(f"Text preview: {preview}...")
            print(f"Metadata: {chunk['metadata']}")
        
        return True
    except Exception as e:
        print(f"Error reading chunks file: {str(e)}")
        return False


if __name__ == "__main__":
    import sys
    
    # Check if specific mode is requested
    if len(sys.argv) > 1:
        mode = sys.argv[1].lower()
        
        if mode == "extracted":
            # Process only extracted text files
            process_extracted_text_files()
        elif mode == "pdf":
            # Process PDFs directly
            process_sample_pdfs()
        elif mode == "display" and len(sys.argv) > 2:
            # Display chunks from a specific file
            display_chunk_sample(sys.argv[2])
        else:
            print("Invalid mode. Use 'extracted', 'pdf', or 'display <chunks_file>'")
    else:
        # Default: process extracted text files if they exist
        if os.path.exists(EXTRACTED_TEXT_DIR) and list_files_with_extension(EXTRACTED_TEXT_DIR, ".txt"):
            process_extracted_text_files()
        else:
            # Otherwise process PDFs directly
            process_sample_pdfs()
        
        # Display samples from the first chunks file found
        chunk_files = list_files_with_extension(CHUNKS_DIR, ".json") if os.path.exists(CHUNKS_DIR) else []
        if chunk_files:
            display_chunk_sample(chunk_files[0])
