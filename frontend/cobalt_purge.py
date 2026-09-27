import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # ============================================================
    # 1. REPLACE ALL OLD ACCENT RGBA (sky-blue 56,189,248) WITH
    #    NEW COBALT (59,130,246)
    # ============================================================
    content = content.replace('rgba(56,189,248,', 'rgba(59,130,246,')
    content = content.replace('rgba(56, 189, 248,', 'rgba(59, 130, 246,')

    # ============================================================
    # 2. REPLACE WARM/SEPIA RGBA COLORS
    # ============================================================
    # Old brass gradients from GlobalCargoTracker radar
    content = content.replace('rgba(201, 151, 79, 0.3)', 'rgba(59, 130, 246, 0.3)')
    content = content.replace('rgba(255, 90, 31, 0.08)', 'rgba(59, 130, 246, 0.08)')
    content = content.replace('rgba(201,151,79,', 'rgba(59,130,246,')
    content = content.replace('rgba(255,90,31,', 'rgba(59,130,246,')

    # ============================================================
    # 3. REPLACE HARDCODED HEX WARM COLORS
    # ============================================================
    # Budget chart colors: gold/red -> cobalt/rose
    content = content.replace("'#d4af37'", "'#3B82F6'")   # Charter Flights -> Cobalt
    content = content.replace("'#e83e2f'", "'#F43F5E'")   # Cold Logistics -> Rose

    # Old orange laser scan glow
    content = content.replace('#ff5a1f', '#3B82F6')

    # Warm hex in OfflineInventory bg-[#1e0e0e] (reddish), bg-[#1f170b] (brownish), bg-[#0f1d15] (greenish)
    content = content.replace('bg-[#1e0e0e]', 'bg-[#1c1020]')  # Dark rose tint
    content = content.replace('bg-[#1f170b]', 'bg-[#0c1225]')  # Dark cobalt tint
    content = content.replace('bg-[#0f1d15]', 'bg-[#0a1a14]')  # Dark emerald tint (ok, this is cool)

    # ============================================================
    # 4. REPLACE text-black / text-slate-950 ON BUTTONS WITH
    #    text-white FOR COBALT BUTTONS
    # ============================================================
    # Primary buttons: bg-[var(--accent-primary)] text-slate-950 -> text-white
    content = content.replace(
        'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:bg-white transition-all',
        'bg-[var(--accent-primary)] text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:bg-blue-400 transition-all'
    )

    # Landing hero button
    content = content.replace(
        "bg-[var(--accent-primary)] px-7 py-3 font-bold text-base rounded-sm tracking-wider text-black",
        "bg-[var(--accent-primary)] px-7 py-3 font-bold text-base rounded-sm tracking-wider text-white"
    )
    content = content.replace(
        "bg-[var(--accent-primary)] px-7 py-3 font-bold text-base rounded-sm tracking-wider text-[var(--bg-primary)]",
        "bg-[var(--accent-primary)] px-7 py-3 font-bold text-base rounded-sm tracking-wider text-white"
    )

    # Signup button on navbar
    content = content.replace(
        'bg-[var(--accent-primary)] hover:bg-white hover:text-black',
        'bg-[var(--accent-primary)] hover:bg-blue-400 hover:text-white'
    )
    content = content.replace(
        'bg-[var(--accent-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)]',
        'bg-[var(--accent-primary)] hover:bg-blue-400 hover:text-white'
    )

    # Various text-black on accent buttons
    content = content.replace('text-slate-950', 'text-white')

    # OfflineInventory buttons
    content = content.replace(
        'text-[var(--bg-primary)] text-xs font-bold',
        'text-white text-xs font-bold'
    )

    # Fix hover:text-black -> hover:text-white
    content = content.replace('hover:text-black', 'hover:text-white')

    # ============================================================
    # 5. FIX EXPEDITION PLANNER BUTTON: hover on seal button
    # ============================================================
    content = content.replace(
        "hover:bg-[var(--accent-primary)] hover:text-[var(--text-primary)]",
        "hover:bg-[var(--accent-primary)] hover:text-white"
    )

    # ============================================================
    # 6. MAP COLORS (GlobalCargoTracker) - Already using CSS vars, good.
    #    But update map fill for a richer dark look
    # ============================================================
    content = content.replace('fill="var(--bg-panel-raised)"', 'fill="#1F2937"')
    content = content.replace("fill='var(--bg-panel-raised)'", "fill='#1F2937'")
    content = content.replace('stroke="var(--border)"', 'stroke="#374151"')
    content = content.replace("stroke='var(--border)'", "stroke='#374151'")
    # hover fill
    content = content.replace("fill: 'var(--border)'", "fill: '#374151'")

    # ============================================================
    # 7. LANDING PAGE: color values in whileHover for nav links
    # ============================================================
    content = content.replace("color: 'var(--accent-primary)'", "color: '#3B82F6'")
    content = content.replace("color: '#c9974f'", "color: '#3B82F6'")

    # ============================================================
    # 8. LANDING: whileHover backgroundColor for workflow circles
    # ============================================================
    content = content.replace(
        "backgroundColor: 'var(--accent-primary)', color: '#000'",
        "backgroundColor: 'var(--accent-primary)', color: '#fff'"
    )
    content = content.replace(
        "borderColor: 'var(--accent-primary)'",
        "borderColor: 'var(--accent-primary)'"
    )

    # ============================================================
    # 9. Fix remaining old shadow-[rgba(201,151,79,...)] in OfflineInventory
    # ============================================================
    content = re.sub(
        r"shadow-\[0_0_15px_rgba\(201,151,79,[0-9.]+\)\]",
        "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
        content
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

print("\n✓ Midnight Titanium & Electric Cobalt purge complete.")
