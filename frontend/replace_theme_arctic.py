import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Update css classes for panels, cards, etc.
    # Replace the previous shadow: shadow-[0_12px_40px_0_rgba(0,0,0,0.6)]
    # with the new one: shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]
    content = content.replace('shadow-[0_12px_40px_0_rgba(0,0,0,0.6)]', 'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]')
    
    # Replace previous hover shadow: hover:shadow-[0_12px_40px_0_rgba(0,229,255,0.1)]
    # with new hover shadow: hover:shadow-[0_12px_40px_0_rgba(56,189,248,0.08)]
    content = content.replace('hover:shadow-[0_12px_40px_0_rgba(0,229,255,0.1)]', 'hover:shadow-[0_12px_40px_0_rgba(56,189,248,0.08)]')
    
    # 2. Swap colors
    # The prompt says: "Scan the codebase and remove all references to bg-[var(--brass)], text-[var(--brass)], bg-[var(--flare)], and text-[var(--flare)]. Replace them with var(--accent-primary)."
    # Also I need to replace my previously inserted var(--accent-cyan) and var(--accent-magenta).
    for old_color in ['var(--brass)', 'var(--flare)', 'var(--accent-cyan)', 'var(--accent-magenta)']:
        content = content.replace(f'text-[{old_color}]', 'text-[var(--accent-primary)]')
        content = content.replace(f'bg-[{old_color}]', 'bg-[var(--accent-primary)]')
        content = content.replace(f'border-[{old_color}]', 'border-[var(--accent-primary)]')
        content = content.replace(f'from-[{old_color}]', 'from-[var(--accent-primary)]')
        # also if just var(--brass) etc was used directly
        content = content.replace(old_color, 'var(--accent-primary)')

    # 3. Update buttons
    # Old primary button classes: bg-gradient-to-r from-[var(--accent-primary)] to-[#0099FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]
    # New primary button classes: bg-[var(--accent-primary)] text-slate-950 font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-white transition-all
    
    content = re.sub(
        r'bg-gradient-to-r\s+from-\[var\(--accent-primary\)\]\s+to-\[#[0-9a-fA-F]+\]\s+text-black\s+font-bold\s+shadow-\[0_0_15px_rgba\(0,229,255,0\.4\)\]\s+hover:shadow-\[0_0_25px_rgba\(0,229,255,0\.6\)\]',
        'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-white transition-all',
        content
    )

    # Some old buttons might still be there if they were missed. I should check for any bg-[var(--accent-primary)] text-[var(--bg-primary)] and convert them too.
    content = re.sub(
        r'bg-\[var\(--accent-primary\)\]\s+text-\[var\(--bg-primary\)\](?:\s+hover:opacity-\d+)?', 
        'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] hover:bg-white transition-all', 
        content
    )
    
    # Old secondary button: bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all duration-300 ease-out
    # New secondary button: bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]
    # Since they are very similar, maybe just leave it, or do an exact replace to clean up duplicate transitions if needed.
    
    # Re-apply tracking to headers if missing (I already did this, so it should be fine).
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(r'd:\Downloads\HEEM_SANCHAR\frontend\src'):
    for file in files:
        if file.endswith(('.jsx', '.css')):
            process_file(os.path.join(root, file))
