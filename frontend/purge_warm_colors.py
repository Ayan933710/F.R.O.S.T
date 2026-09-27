import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Destroy all warm colors and replace with icy equivalents
    
    # 1. Backgrounds
    content = re.sub(r'bg-stone-900|bg-[#0c0a09]|bg-zinc-900|bg-neutral-900', 'bg-[var(--bg-primary)]', content)
    content = re.sub(r'bg-stone-800|bg-[#1c1917]|bg-zinc-800|bg-neutral-800', 'bg-[var(--bg-panel)]', content)
    content = re.sub(r'bg-stone-700|bg-[#292524]|bg-zinc-700|bg-neutral-700', 'bg-[var(--bg-panel-raised)]', content)
    
    content = re.sub(r'bg-amber-\d+', 'bg-[var(--accent-primary)]', content)
    content = re.sub(r'bg-orange-\d+', 'bg-[var(--accent-primary)]', content)
    content = re.sub(r'bg-yellow-\d+', 'bg-[var(--accent-primary)]', content)

    # 2. Text colors
    content = re.sub(r'text-amber-\d+', 'text-[var(--accent-primary)]', content)
    content = re.sub(r'text-orange-\d+', 'text-[var(--accent-primary)]', content)
    content = re.sub(r'text-yellow-\d+', 'text-[var(--accent-primary)]', content)
    content = re.sub(r'text-stone-\d+', 'text-[var(--text-secondary)]', content)
    content = re.sub(r'text-zinc-\d+', 'text-[var(--text-secondary)]', content)

    # 3. Border colors
    content = re.sub(r'border-amber-\d+', 'border-[var(--accent-primary)]', content)
    content = re.sub(r'border-orange-\d+', 'border-[var(--accent-primary)]', content)
    content = re.sub(r'border-yellow-\d+', 'border-[var(--accent-primary)]', content)
    content = re.sub(r'border-stone-\d+', 'border-[var(--border)]', content)
    content = re.sub(r'border-zinc-\d+', 'border-[var(--border)]', content)

    # Hex codes that are warm (brown/sepia)
    # The user mentioned bg-[#...] that represent brown/sepia tones.
    # Let's replace anything that looks like a warm hex bg.
    # It's safer to just replace standard known ones if any, but since they want a global purge, let's catch generic tailwind classes.

    # 4. Map Components to the New Variables:
    # Sidebars & Navbar: Change classes strictly to bg-[var(--bg-panel-raised)] border-r border-[var(--border)] backdrop-blur-md.
    if 'Sidebar' in filepath or 'Navbar' in filepath or 'NavigationBar' in filepath:
        content = content.replace('bg-stone-900', 'bg-[var(--bg-panel-raised)]')
        content = content.replace('bg-stone-800', 'bg-[var(--bg-panel-raised)]')
        content = content.replace('bg-[#1c1917]', 'bg-[var(--bg-panel-raised)]')
        content = content.replace('bg-[#0c0a09]', 'bg-[var(--bg-panel-raised)]')
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(r'd:\Downloads\HEEM_SANCHAR\frontend\src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
