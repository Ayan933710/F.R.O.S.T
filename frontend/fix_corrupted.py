import re

filepath = r'd:\Downloads\HEEM_SANCHAR\frontend\src\pages\CommanderDashboard\OfflineInventory.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all corrupted bg-[var(--bg-primary)]mber-XXX patterns
# These were originally bg-amber-XXX that got half-replaced
# bg-[var(--bg-primary)]mber-950/40 -> bg-[var(--accent-primary)]/10
# bg-[var(--bg-primary)]mber-950/60 -> bg-[var(--accent-primary)]/15
# bg-[var(--bg-primary)]mber-950/50 -> bg-[var(--accent-primary)]/10
# bg-[var(--bg-primary)]mber-950/20 -> bg-[var(--accent-primary)]/5
# bg-[var(--bg-primary)]mber-500/20 -> bg-[var(--accent-primary)]/20
# bg-[var(--bg-primary)]mber-900/50 -> bg-[var(--accent-primary)]/15

content = re.sub(
    r'bg-\[var\(--bg-primary\)\]mber-\d+/\d+',
    lambda m: 'bg-[var(--accent-primary)]/10',
    content
)

# Also fix text-[var(--bg-primary)] on buttons to text-white
content = content.replace('text-[var(--bg-primary)]', 'text-white')

# Fix remaining rgba(245,158,11,...) (amber) to cobalt
content = re.sub(r'rgba\(245,158,11,[0-9.]+\)', 'rgba(59,130,246,0.2)', content)

# Fix selection:text-black in Landing.jsx
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Fixed OfflineInventory.jsx")

# Fix Landing.jsx selection:text-black
landing = r'd:\Downloads\HEEM_SANCHAR\frontend\src\pages\Landing.jsx'
with open(landing, 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('selection:text-black', 'selection:text-white')
with open(landing, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Fixed Landing.jsx")
