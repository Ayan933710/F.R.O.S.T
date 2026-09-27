import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Update css classes for panels, cards, etc.
    content = re.sub(r'backdrop-blur-(md|lg)', 'backdrop-blur-xl', content)
    
    # Replace shadow and add transition & hover if not already present
    # the existing shadow is mostly shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] or shadow-[0_16px_48px_0_rgba(0,0,0,0.6)]
    # we replace them with the new shadow and transition classes.
    # To avoid stacking transitions, we can just be careful.
    def replace_shadow(match):
        return 'shadow-[0_12px_40px_0_rgba(0,0,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[var(--border-hover)] hover:shadow-[0_12px_40px_0_rgba(0,229,255,0.1)]'
    
    content = re.sub(r'shadow-\[0_(8|16)px_(32|48)px_0_rgba\(0,0,0,0\.(5|6)\)\]', replace_shadow, content)

    # Clean up any duplicated transitions or hovers that might happen (though they probably won't if we just run it once)
    
    # 2. Swap --brass and --flare
    content = content.replace('var(--brass)', 'var(--accent-cyan)')
    content = content.replace('var(--flare)', 'var(--accent-magenta)')

    # Primary Buttons often have text like hover:text-white bg-[var(--brass)] etc.
    # Let's search for buttons with var(--accent-cyan) or var(--accent-magenta) and replace them if needed.
    # The prompt says: Primary Buttons: Apply a subtle gradient bg-gradient-to-r from-[var(--accent-cyan)] to-[#0099FF] text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_25px_rgba(0,229,255,0.6)]
    # Secondary Buttons: bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent-magenta)] hover:text-[var(--accent-magenta)]

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(r'd:\Downloads\HEEM_SANCHAR\frontend\src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
