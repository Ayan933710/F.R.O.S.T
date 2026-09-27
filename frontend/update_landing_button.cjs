import os

filepath = r'd:\Downloads\HEEM_SANCHAR\frontend\src\pages\Landing.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

content = content.replace(
    'backdrop-blur-xl bg-white/5 border border-white/30 hover:bg-white/10',
    'backdrop-blur-xl bg-[var(--bg-panel-raised)] border border-[var(--border)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] shadow-[var(--shadow-glass)]'
)

if content != original:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated button in Landing.jsx")
else:
    print("No changes made.")
