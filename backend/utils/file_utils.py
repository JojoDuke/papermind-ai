"""
File Utility Functions

This module provides utility functions for file operations.
"""

import os
import shutil
from typing import List, Optional


def ensure_directory_exists(directory_path: str) -> None:
    """
    Ensure a directory exists, creating it if necessary.
    
    Args:
        directory_path: Path to the directory
    """
    if not os.path.exists(directory_path):
        os.makedirs(directory_path)
        print(f"Created directory: {directory_path}")


def list_files_with_extension(directory_path: str, extension: str) -> List[str]:
    """
    List all files with a specific extension in a directory.
    
    Args:
        directory_path: Path to the directory
        extension: File extension to filter by (e.g., '.pdf')
        
    Returns:
        List of file paths
    """
    if not os.path.exists(directory_path):
        print(f"Directory not found: {directory_path}")
        return []
    
    # Ensure extension starts with a dot
    if not extension.startswith('.'):
        extension = '.' + extension
        
    files = []
    for filename in os.listdir(directory_path):
        if filename.lower().endswith(extension.lower()):
            files.append(os.path.join(directory_path, filename))
    
    return files


def get_output_filename(input_path: str, output_dir: Optional[str] = None, 
                       new_extension: Optional[str] = None) -> str:
    """
    Generate an output filename based on an input path.
    
    Args:
        input_path: Original file path
        output_dir: Directory for the output file (if None, use same directory)
        new_extension: New file extension (if None, keep original)
        
    Returns:
        Output file path
    """
    # Get the base filename without extension
    base_name = os.path.basename(input_path)
    file_name_without_ext = os.path.splitext(base_name)[0]
    
    # Determine extension
    if new_extension:
        if not new_extension.startswith('.'):
            new_extension = '.' + new_extension
        extension = new_extension
    else:
        extension = os.path.splitext(input_path)[1]
    
    # Determine output directory
    if output_dir:
        ensure_directory_exists(output_dir)
        return os.path.join(output_dir, file_name_without_ext + extension)
    else:
        return os.path.join(os.path.dirname(input_path), file_name_without_ext + extension)
