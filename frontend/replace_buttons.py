import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix buttons
    # A button that has `bg-[var(--accent-cyan)]` or `bg-[var(--accent-magenta)]` and `text-[var(--bg-primary)]` or similar is probably a primary button.
    # Primary button classes:
    # bg-gradient-to-r from-[var(--accent-cyan)] to-[#0099FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]
    # Secondary button classes:
    # bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-magenta)] hover:text-[var(--accent-magenta)]

    def replace_button(match):
        button_content = match.group(0)
        
        # If it's already a transparent or border button, it might be secondary. If it has a solid background like bg-[var(--accent-cyan)] or ok, it might be primary.
        if 'bg-[var(--accent-cyan)]' in button_content and 'text-' in button_content:
            # Let's replace the bg-[var(--accent-cyan)] and its text color with the gradient
            button_content = re.sub(r'bg-\[var\(--accent-cyan\)\].*?text-\[.*?\]', 'bg-gradient-to-r from-[var(--accent-cyan)] to-[#0099FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]', button_content)
        elif 'bg-[var(--accent-magenta)]' in button_content and 'text-' in button_content:
             button_content = re.sub(r'bg-\[var\(--accent-magenta\)\].*?text-\[.*?\]', 'bg-gradient-to-r from-[var(--accent-cyan)] to-[#0099FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]', button_content)
        
        # We can also add tracking-widest to all headers h1-h6
        return button_content

    # Actually, replacing button classes dynamically in python is hard. I'll just do a global replace for common button backgrounds.
    
    # 1. Primary Button Replacements:
    # We replaced var(--brass) with var(--accent-cyan) earlier. So some buttons have: `bg-[var(--accent-cyan)] text-[var(--bg-primary)]`
    content = re.sub(
        r'bg-\[var\(--accent-cyan\)\]\s+text-\[var\(--bg-primary\)\](?:\s+hover:opacity-\d+)?', 
        'bg-gradient-to-r from-[var(--accent-cyan)] to-[#0099FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]', 
        content
    )

    # Some might just be text-white or text-black
    content = re.sub(
        r'bg-\[var\(--accent-cyan\)\]\s+text-black(?:\s+hover:bg-\[.*?\])?', 
        'bg-gradient-to-r from-[var(--accent-cyan)] to-[#0099FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]', 
        content
    )
    
    # 2. Secondary Button Replacements:
    # A secondary button often has `bg-[var(--bg-panel)] ... border border-[var(--border)] text-[var(--text-secondary)] hover:text-white`
    content = re.sub(
        r'bg-\[var\(--bg-panel(?:-raised)?\)\]\s+backdrop-blur-.*?border\s+border-\[var\(--border\)\]\s+text-\[var\(--text-secondary\)\](?:.+?hover:text-white.*?)?',
        'bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-magenta)] hover:text-[var(--accent-magenta)] transition-all duration-300 ease-out',
        content
    )

    # 3. Add tracking-wide to section headers (h1, h2, h3, h4, h5, h6)
    # Most headers have tracking-wide or tracking-widest already, but let's ensure it's there.
    # For simplicity, we can do nothing if they already look okay, the user says "Apply tracking-wide or tracking-widest to all section headers".
    # We can use regex to find `<h[1-6] className=".*?">` and add tracking-wide if not present.
    def add_tracking(match):
        header_tag = match.group(0)
        if 'tracking-' not in header_tag:
            return header_tag.replace('className="', 'className="tracking-wide ')
        return header_tag
    
    content = re.sub(r'<h[1-6]\s+className="[^"]+"', add_tracking, content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(r'd:\Downloads\HEEM_SANCHAR\frontend\src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
