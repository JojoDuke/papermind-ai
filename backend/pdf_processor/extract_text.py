"""
PDF Text Extraction Module

This module provides functionality to extract text from PDF documents.
"""

import os
import sys
from typing import Optional, Tuple

# We'll use PyPDF2 for PDF text extraction
# You'll need to install it: pip install PyPDF2
try:
    import PyPDF2
except ImportError:
    print("PyPDF2 is not installed. Please install it using: pip install PyPDF2")
    sys.exit(1)


def extract_text_from_pdf(pdf_path: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Extract text from a PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Tuple containing:
        - Extracted text (or None if extraction failed)
        - Error message (or None if extraction succeeded)
    """
    if not os.path.exists(pdf_path):
        return None, f"File not found: {pdf_path}"
    
    try:
        text = ""
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            num_pages = len(reader.pages)
            
            print(f"Processing PDF with {num_pages} pages")
            
            # Extract text from each page
            for page_num in range(num_pages):
                page = reader.pages[page_num]
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
                    
            if not text.strip():
                return None, "No text could be extracted from the PDF. It might be scanned or contain only images."
                
            print(f"Successfully extracted {len(text)} characters")
            return text, None
            
    except Exception as e:
        error_msg = f"Error extracting text: {str(e)}"
        print(error_msg)
        return None, error_msg


def save_text_to_file(text: str, output_path: str) -> Tuple[bool, Optional[str]]:
    """
    Save extracted text to a file.
    
    Args:
        text: Text to save
        output_path: Path where to save the text
        
    Returns:
        Tuple containing:
        - Success status (True/False)
        - Error message (or None if saving succeeded)
    """
    try:
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(text)
        print(f"Text saved to {output_path}")
        return True, None
    except Exception as e:
        error_msg = f"Error saving text: {str(e)}"
        print(error_msg)
        return False, error_msg


if __name__ == "__main__":
    # This allows the script to be run directly
    if len(sys.argv) < 2:
        print("Usage: python extract_text.py <pdf_file_path>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    # Extract text
    text, error = extract_text_from_pdf(pdf_path)
    if error:
        print(f"Error: {error}")
        sys.exit(1)
        
    if text:
        # Save to a text file with the same name
        output_path = os.path.splitext(pdf_path)[0] + ".txt"
        success, error = save_text_to_file(text, output_path)
        if not success:
            print(f"Error: {error}")
            sys.exit(1)
