"""
Test PDF Text Extraction

This script demonstrates how to use the PDF text extraction module.
"""

import os
import sys
from pdf_processor.extract_text import extract_text_from_pdf, save_text_to_file
from utils.file_utils import list_files_with_extension, ensure_directory_exists

# Directory for extracted text
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "extracted_text")


def process_pdf(pdf_path):
    """Process a single PDF file."""
    print(f"\nProcessing: {pdf_path}")
    
    # Extract text from PDF
    text, error = extract_text_from_pdf(pdf_path)
    if error:
        print(f"Error: {error}")
        return False
    
    # Create output directory if it doesn't exist
    ensure_directory_exists(OUTPUT_DIR)
    
    # Generate output path
    base_name = os.path.basename(pdf_path)
    file_name_without_ext = os.path.splitext(base_name)[0]
    output_path = os.path.join(OUTPUT_DIR, file_name_without_ext + ".txt")
    
    # Save extracted text
    success, error = save_text_to_file(text, output_path)
    if not success:
        print(f"Error: {error}")
        return False
    
    print(f"Successfully processed {pdf_path}")
    print(f"Text saved to {output_path}")
    return True


def process_directory(directory_path):
    """Process all PDFs in a directory."""
    # Get all PDF files in the directory
    pdf_files = list_files_with_extension(directory_path, ".pdf")
    
    if not pdf_files:
        print(f"No PDF files found in {directory_path}")
        return
    
    print(f"Found {len(pdf_files)} PDF files")
    
    # Process each PDF
    success_count = 0
    for pdf_file in pdf_files:
        if process_pdf(pdf_file):
            success_count += 1
    
    print(f"\nSummary: Successfully processed {success_count} out of {len(pdf_files)} files")


if __name__ == "__main__":
    # Check if a specific PDF file or directory was provided
    if len(sys.argv) > 1:
        path = sys.argv[1]
        
        if os.path.isfile(path) and path.lower().endswith('.pdf'):
            # Process a single PDF file
            process_pdf(path)
        elif os.path.isdir(path):
            # Process all PDFs in the directory
            process_directory(path)
        else:
            print(f"Error: {path} is not a PDF file or directory")
    else:
        # Default to sample_docs directory
        sample_dir = os.path.join(os.path.dirname(__file__), "sample_docs")
        if os.path.exists(sample_dir):
            print(f"Processing PDFs in sample directory: {sample_dir}")
            process_directory(sample_dir)
        else:
            print("No path specified and sample_docs directory not found.")
            print("Usage: python test_pdf_extraction.py [pdf_file_or_directory]")
