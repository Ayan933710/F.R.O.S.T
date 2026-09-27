filepath = r'd:\Downloads\HEEM_SANCHAR\frontend\src\pages\Inventory.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace amber rgba with cobalt
content = content.replace("rgba(245,158,11,0.15)", "rgba(59,130,246,0.15)")
content = content.replace("rgba(245,158,11,0.2)", "rgba(59,130,246,0.2)")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed Inventory.jsx")
