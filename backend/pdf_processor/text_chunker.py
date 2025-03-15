"""
Text Chunking Module

This module provides functionality to split large texts into smaller, 
manageable chunks for processing with AI models.
"""

import re
from typing import List, Dict, Any, Optional


def split_text_into_chunks(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
    separator: str = "\n"
) -> List[str]:
    """
    Split text into overlapping chunks of approximately equal size.
    
    Args:
        text: The text to split into chunks
        chunk_size: Target size of each chunk in characters
        chunk_overlap: Number of characters to overlap between chunks
        separator: Preferred character(s) to split on
        
    Returns:
        List of text chunks
    """
    # Handle empty or very short text
    if not text or len(text) <= chunk_size:
        return [text] if text else []
    
    # Split text by separator
    splits = text.split(separator)
    
    chunks = []
    current_chunk = []
    current_length = 0
    
    for split in splits:
        # Add separator back (except for the first split)
        if current_chunk:
            split_with_sep = separator + split
        else:
            split_with_sep = split
            
        split_length = len(split_with_sep)
        
        # If adding this split would exceed chunk size, finalize current chunk
        if current_length + split_length > chunk_size and current_chunk:
            # Join the current chunk and add it to the list of chunks
            chunks.append("".join(current_chunk))
            
            # Start a new chunk with overlap
            # Find splits that should be included due to overlap
            overlap_length = 0
            overlap_splits = []
            
            # Work backwards through current_chunk to find splits for overlap
            for s in reversed(current_chunk):
                if overlap_length + len(s) <= chunk_overlap:
                    overlap_splits.insert(0, s)
                    overlap_length += len(s)
                else:
                    break
            
            # Reset current chunk with overlap content
            current_chunk = overlap_splits
            current_length = overlap_length
        
        # Add the current split to the current chunk
        current_chunk.append(split_with_sep)
        current_length += split_length
    
    # Add the last chunk if it's not empty
    if current_chunk:
        chunks.append("".join(current_chunk))
    
    return chunks


def create_document_chunks(
    text: str,
    metadata: Optional[Dict[str, Any]] = None,
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> List[Dict[str, Any]]:
    """
    Create document chunks with metadata.
    
    Args:
        text: The document text to chunk
        metadata: Optional metadata to include with each chunk
        chunk_size: Target size of each chunk in characters
        chunk_overlap: Number of characters to overlap between chunks
        
    Returns:
        List of dictionaries containing chunk text and metadata
    """
    chunks = split_text_into_chunks(
        text, 
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )
    
    # Create a list of chunk objects with metadata
    chunk_objects = []
    base_metadata = metadata or {}
    
    for i, chunk_text in enumerate(chunks):
        # Create a copy of the metadata for this chunk
        chunk_metadata = base_metadata.copy()
        
        # Add chunk-specific metadata
        chunk_metadata.update({
            "chunk_index": i,
            "chunk_count": len(chunks),
            "chunk_size": len(chunk_text),
            "is_first_chunk": i == 0,
            "is_last_chunk": i == len(chunks) - 1
        })
        
        # Create the chunk object
        chunk_object = {
            "text": chunk_text,
            "metadata": chunk_metadata
        }
        
        chunk_objects.append(chunk_object)
    
    return chunk_objects


def chunk_by_tokens(
    text: str,
    max_tokens: int = 500,
    overlap_tokens: int = 100,
    token_estimator=None
) -> List[str]:
    """
    Split text into chunks based on token count estimation.
    
    Args:
        text: The text to split into chunks
        max_tokens: Maximum number of tokens per chunk
        overlap_tokens: Number of tokens to overlap between chunks
        token_estimator: Optional function to estimate tokens (defaults to simple estimation)
        
    Returns:
        List of text chunks
    """
    # Default token estimator: rough approximation (1 token ≈ 4 chars)
    if token_estimator is None:
        def token_estimator(text):
            return len(text) // 4
    
    # Handle empty or very short text
    if not text:
        return []
    
    # Estimate total tokens
    total_tokens = token_estimator(text)
    if total_tokens <= max_tokens:
        return [text]
    
    # Split text by sentences or paragraphs for more natural chunks
    # First try to split by paragraphs
    splits = re.split(r'\n\s*\n', text)
    
    # If we have very few splits, try splitting by sentences
    if len(splits) < 3:
        splits = re.split(r'(?<=[.!?])\s+', text)
    
    chunks = []
    current_chunk = []
    current_tokens = 0
    
    for split in splits:
        split_tokens = token_estimator(split)
        
        # If this single split is too large, we need to break it down further
        if split_tokens > max_tokens:
            # Process the current chunk if it's not empty
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_tokens = 0
            
            # Break down the large split into smaller pieces
            words = split.split()
            temp_chunk = []
            temp_tokens = 0
            
            for word in words:
                word_tokens = token_estimator(word + " ")
                if temp_tokens + word_tokens > max_tokens and temp_chunk:
                    chunks.append(" ".join(temp_chunk))
                    
                    # Calculate overlap
                    overlap_start = max(0, len(temp_chunk) - overlap_tokens)
                    temp_chunk = temp_chunk[overlap_start:]
                    temp_tokens = token_estimator(" ".join(temp_chunk) + " ")
                
                temp_chunk.append(word)
                temp_tokens += word_tokens
            
            if temp_chunk:
                current_chunk = temp_chunk
                current_tokens = temp_tokens
        
        # If adding this split would exceed max_tokens, finalize current chunk
        elif current_tokens + split_tokens > max_tokens and current_chunk:
            chunks.append(" ".join(current_chunk))
            
            # Calculate overlap for next chunk
            overlap_start = max(0, len(current_chunk) - overlap_tokens)
            current_chunk = current_chunk[overlap_start:]
            current_tokens = token_estimator(" ".join(current_chunk) + " ")
            
            # Add the current split
            current_chunk.append(split)
            current_tokens += split_tokens
        
        # Otherwise, add the split to the current chunk
        else:
            current_chunk.append(split)
            current_tokens += split_tokens
    
    # Add the last chunk if it's not empty
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks


if __name__ == "__main__":
    # Simple test
    test_text = """
    This is a test document. It contains multiple sentences that will be used to test the text chunking functionality.
    This is the second paragraph. It also contains multiple sentences.
    
    This is the third paragraph. We're adding more text to make this document longer.
    This will help us test the chunking functionality properly.
    
    This is the fourth paragraph. The chunking should work well with paragraphs.
    
    This is the fifth paragraph. We're almost done with our test document.
    
    This is the final paragraph. Let's see how the chunking works.
    """
    
    # Test basic chunking
    chunks = split_text_into_chunks(test_text, chunk_size=200, chunk_overlap=50)
    print(f"Split into {len(chunks)} chunks:")
    for i, chunk in enumerate(chunks):
        print(f"\nChunk {i+1} ({len(chunk)} chars):")
        print(chunk[:100] + "..." if len(chunk) > 100 else chunk)
    
    # Test document chunking with metadata
    doc_chunks = create_document_chunks(
        test_text,
        metadata={"title": "Test Document", "source": "test"},
        chunk_size=200,
        chunk_overlap=50
    )
    print(f"\nCreated {len(doc_chunks)} document chunks with metadata")
    
    # Test token-based chunking
    token_chunks = chunk_by_tokens(test_text, max_tokens=50, overlap_tokens=10)
    print(f"\nSplit into {len(token_chunks)} token-based chunks:")
    for i, chunk in enumerate(token_chunks):
        print(f"\nToken Chunk {i+1} (approx. {len(chunk)//4} tokens):")
        print(chunk[:100] + "..." if len(chunk) > 100 else chunk)
