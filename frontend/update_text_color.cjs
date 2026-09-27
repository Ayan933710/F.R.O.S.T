import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Replace hardcoded text-white with text-[var(--text-primary)]
    # but NOT inside buttons or specific cases where it should always be white
    # e.g., gradient buttons: from-blue-500 to-blue-600 text-white -> should stay text-white
    # Let's selectively target the h2, h3, and selection classes in Landing.jsx
    if 'Landing.jsx' in filepath:
        content = content.replace(
            'text-2xl md:text-3xl font-[\'Bebas_Neue\'] tracking-widest text-white',
            'text-2xl md:text-3xl font-[\'Bebas_Neue\'] tracking-widest text-[var(--text-primary)]'
        )
        content = content.replace(
            'text-lg font-[\'Bebas_Neue\'] text-white',
            'text-lg font-[\'Bebas_Neue\'] text-[var(--text-primary)]'
        )
        content = content.replace(
            'text-3xl md:text-4xl font-[\'Bebas_Neue\'] text-center text-white',
            'text-3xl md:text-4xl font-[\'Bebas_Neue\'] text-center text-[var(--text-primary)]'
        )
        content = content.replace(
            'selection:text-white',
            'selection:text-[var(--bg-primary)]'
        )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {os.path.basename(filepath)}")

for root, _, files in os.walk(r'd:\Downloads\HEEM_SANCHAR\frontend\src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("Text color replacements complete.")
