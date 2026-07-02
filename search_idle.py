import re

with open('GameView.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    if 'idle' in line:
        print(f"{i}: {line.strip()}")
