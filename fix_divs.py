import sys

def check_balance(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    html = ""
    for idx, line in enumerate(lines):
        # Very simple tag count
        html += line
        
        # We can just count <div and </div
    
    return html

