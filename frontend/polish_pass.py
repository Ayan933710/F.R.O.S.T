import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # ============================================================
    # 1. PREMIUM BUTTON UPGRADE (Linear-style gradient)
    # ============================================================
    # Old flat primary button pattern:
    #   bg-[var(--accent-primary)] text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)]
    #   hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:bg-blue-400 transition-all
    # New gradient button:
    #   bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold
    #   shadow-[0_0_20px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
    #   hover:shadow-[0_0_30px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]
    #   hover:from-blue-400 hover:to-blue-500 transition-all duration-300 border border-blue-400/30

    content = content.replace(
        'bg-[var(--accent-primary)] text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:bg-blue-400 transition-all',
        'bg-gradient-to-b from-blue-500 to-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] hover:from-blue-400 hover:to-blue-500 transition-all duration-300 border border-blue-400/30'
    )

    # Also catch simpler variants
    content = content.replace(
        'bg-[var(--accent-primary)] hover:bg-blue-400 hover:text-white',
        'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-300'
    )

    # ============================================================
    # 2. TYPOGRAPHY: text-[var(--text-secondary)] -> text-slate-400
    #    for better neutral contrast (avoid blue-tinting body text)
    # ============================================================
    # Don't mass-replace because text-secondary is also used for
    # genuinely muted labels. Instead, target paragraph-style elements.
    # We'll use a targeted approach: paragraphs with leading-relaxed.
    content = re.sub(
        r'className="text-sm text-\[var\(--text-secondary\)\] leading-relaxed"',
        'className="text-sm text-slate-400 leading-relaxed"',
        content
    )
    content = re.sub(
        r"className='text-sm text-\[var\(--text-secondary\)\] leading-relaxed'",
        "className='text-sm text-slate-400 leading-relaxed'",
        content
    )

    # Workflow step paragraphs
    content = re.sub(
        r'className="text-sm text-\[var\(--text-secondary\)\] leading-relaxed mb-\d+"',
        lambda m: m.group(0).replace('text-[var(--text-secondary)]', 'text-slate-400'),
        content
    )

    # ============================================================
    # 3. TYPOGRAPHY: Ensure text-[var(--frost)] headings are text-white
    # ============================================================
    content = content.replace("text-[var(--frost)]", "text-white")

    # ============================================================
    # 4. UPPERCASE LABELS: ensure tracking-wide on uppercase labels
    # ============================================================
    # Already mostly done, but let's catch any uppercase text-xs
    # that might be missing tracking
    # (We won't do a mass regex here as it could break things,
    #  but the user specifically mentioned FEATURES/WORKFLOW labels)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Polished: {os.path.basename(filepath)}")

for root, _, files in os.walk(r'd:\Downloads\HEEM_SANCHAR\frontend\src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("\nPolish pass complete.")
