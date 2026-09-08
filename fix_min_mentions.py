import re
with open('src/components/geo/GeoDashboardView.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(
    r'export function GeoDashboardView\(\{',
    r'const MIN_MENTIONS_FOR_CONFIDENCE = 5;\n\nexport function GeoDashboardView({',
    text
)

with open('src/components/geo/GeoDashboardView.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
