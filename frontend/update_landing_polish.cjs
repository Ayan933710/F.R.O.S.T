import os

filepath = r'd:\Downloads\HEEM_SANCHAR\frontend\src\pages\Landing.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# Fix the navbar links (remove color transition delay)
content = content.replace(
    '''<motion.a href="#features" onClick={handleScroll('features')} whileHover={{ scale: 1.08, color: '#3B82F6' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="hover:text-[var(--accent-primary)] transition-colors cursor-pointer">FEATURES</motion.a>''',
    '''<motion.a href="#features" onClick={handleScroll('features')} whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hover:text-[var(--accent-primary)] duration-0 cursor-pointer">FEATURES</motion.a>'''
)
content = content.replace(
    '''<motion.a href="#workflow" onClick={handleScroll('workflow')} whileHover={{ scale: 1.08, color: '#3B82F6' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="hover:text-[var(--accent-primary)] transition-colors cursor-pointer">WORKFLOW</motion.a>''',
    '''<motion.a href="#workflow" onClick={handleScroll('workflow')} whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hover:text-[var(--accent-primary)] duration-0 cursor-pointer">WORKFLOW</motion.a>'''
)
content = content.replace(
    '''<motion.a href="#hardware" onClick={handleScroll('hardware')} whileHover={{ scale: 1.08, color: '#3B82F6' }} transition={{ duration: 0.3, ease: 'easeOut' }} className="hover:text-[var(--accent-primary)] transition-colors cursor-pointer">HARDWARE</motion.a>''',
    '''<motion.a href="#hardware" onClick={handleScroll('hardware')} whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="hover:text-[var(--accent-primary)] duration-0 cursor-pointer">HARDWARE</motion.a>'''
)

# Enhance video overlay for more PREMIUM bluishness
# Let's add an extra div for a rich blue ambient tint over the video
overlay_replacement = '''    {/* Video Background */}
    <video
     autoPlay loop muted playsInline
     className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 pointer-events-none"
     src="/antarctica.mp4"
    />

    {/* Premium Blue Tint Overlay */}
    <div className="absolute inset-0 bg-blue-600/10 mix-blend-color z-10 pointer-events-none"></div>

    {/* Gradient Overlay */}'''
content = content.replace(
    '''    {/* Video Background */}
    <video
     autoPlay loop muted playsInline
     className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 pointer-events-none"
     src="/antarctica.mp4"
    />

    {/* Gradient Overlay */}''',
    overlay_replacement
)

if content != original:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Landing.jsx successfully")
else:
    print("No changes made.")
