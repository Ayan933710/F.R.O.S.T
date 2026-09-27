import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Replace hardcoded shadows with dynamic glass shadow
    content = content.replace(
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]',
        'shadow-[var(--shadow-glass)]'
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {os.path.basename(filepath)}")

# Walk all JSX files
for root, _, files in os.walk(r'd:\Downloads\HEEM_SANCHAR\frontend\src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Shadow class replacements complete.")
