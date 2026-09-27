import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Purge specific warm rgba and hex values
    # rgba(28,23,18...) -> rgba(11,17,32...) or just var(--bg-primary) but inside from-[...] it needs rgba or hex. 
    # Actually, from-[var(--bg-primary)] works in tailwind! 
    # But let's replace the rgba strings:
    content = content.replace('rgba(28,23,18,0.85)', 'rgba(11,17,32,0.85)')
    content = content.replace('rgba(28,23,18,0.4)', 'rgba(11,17,32,0.4)')
    
    # Brass/Flare hover effects
    content = content.replace('rgba(201,151,79,0.25)', 'rgba(56,189,248,0.15)')
    content = content.replace('rgba(201,151,79,0.5)', 'rgba(56,189,248,0.3)')
    content = content.replace('rgba(201,151,79,0.15)', 'rgba(56,189,248,0.1)')
    content = content.replace('rgba(255,90,31,0.35)', 'rgba(56,189,248,0.35)')
    content = content.replace('rgba(255,90,31,0.25)', 'rgba(56,189,248,0.25)')
    content = content.replace('rgba(255,90,31,0.15)', 'rgba(56,189,248,0.15)')
    content = content.replace('rgba(255,90,31,0.5)', 'rgba(56,189,248,0.3)')
    content = content.replace('#c9974f', 'var(--accent-primary)')

    # 2. Main Wrappers/Backgrounds
    # Replace bg-black with bg-[var(--bg-primary)]
    content = re.sub(r'\bbg-black\b', 'bg-[var(--bg-primary)]', content)
    # Replace bg-slate-900 or bg-zinc-900 etc just in case
    content = re.sub(r'\bbg-(stone|zinc|neutral|slate)-900\b', 'bg-[var(--bg-primary)]', content)
    content = re.sub(r'\bbg-(stone|zinc|neutral|slate)-800\b', 'bg-[var(--bg-panel)]', content)

    # 3. Sidebars & Navbar
    # If the file is a layout or sidebar/navbar, we enforce the specific background
    if 'Sidebar' in filepath or 'Navbar' in filepath or 'NavigationBar' in filepath:
        content = content.replace('bg-[var(--bg-primary)]', 'bg-[var(--bg-panel-raised)] border-r border-[var(--border)] backdrop-blur-md')
        # clean up any duplicate classes that might arise
        content = content.replace('border-r border-r', 'border-r')

    # 4. Text and Borders
    # Replace text-white with text-[var(--text-primary)]
    content = re.sub(r'\btext-white\b', 'text-[var(--text-primary)]', content)
    
    # 5. Make sure Cards & Tiers follow the rule
    # Our previous regex replaced backdrop-blur-md with backdrop-blur-xl and added shadow classes.
    # The user says: Change classes strictly to bg-[var(--bg-panel)] border border-[var(--border)] backdrop-blur-xl
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(r'd:\Downloads\HEEM_SANCHAR\frontend\src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
