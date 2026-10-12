import os
import re
import json
import xml.etree.ElementTree as ET

# Paths
BASE_DIR = '/Users/noppo/Downloads/laws/e-laws/laws'
REPORT_PATH = '/Users/noppo/Downloads/laws/e-laws/laws/quality_check_report.txt'

# Generic chapter titles that should not appear unless truly needed
GENERIC_TITLES = {
    '目的', '基本理念', '定義', '国の責務', '国家の責務',
    '地方自治体の責務', '地方公共団体の責務', '国家の責務'
}

# Regular expression for duplicated wording like "をいうをいう"
DUPLICATE_PHRASE_RE = re.compile(r'をいうをいう')

# Helper to collect text from an XML element (including children)
def get_full_text(elem):
    texts = []
    if elem.text:
        texts.append(elem.text)
    for child in elem:
        texts.append(get_full_text(child))
        if child.tail:
            texts.append(child.tail)
    return ''.join(texts)

issues = {
    'generic_chapters': [],  # list of dicts {file, chapter_num, chapter_title}
    'duplicate_phrases': [],   # list of dicts {file, chapter_num, article_num, sentence}
    # Simple contradictory definition detection (heuristic)
    'potential_contradictions': []  # list of dicts {term, file1, sentence1, file2, sentence2}
}

# Map term -> list of (file, sentence) where term appears with a verb pattern
term_occurrences = {}

for root, _, files in os.walk(BASE_DIR):
    for fname in files:
        if not fname.lower().endswith('.xml'):
            continue
        fpath = os.path.join(root, fname)
        try:
            tree = ET.parse(fpath)
            root_elem = tree.getroot()
        except ET.ParseError:
            continue  # skip malformed files
        # Iterate chapters
        for chapter in root_elem.findall('.//Chapter'):
            chap_num = chapter.get('Num')
            chap_title_elem = chapter.find('ChapterTitle')
            chap_title = chap_title_elem.text.strip() if chap_title_elem is not None else ''
            if chap_title in GENERIC_TITLES:
                issues['generic_chapters'].append({
                    'file': fpath,
                    'chapter_num': chap_num,
                    'chapter_title': chap_title
                })
            # Scan articles within chapter
            for article in chapter.findall('.//Article'):
                art_num = article.get('Num')
                # Check each sentence element for duplicate phrase
                for sentence in article.findall('.//Sentence'):
                    sent_text = get_full_text(sentence)
                    if DUPLICATE_PHRASE_RE.search(sent_text):
                        issues['duplicate_phrases'].append({
                            'file': fpath,
                            'chapter_num': chap_num,
                            'article_num': art_num,
                            'sentence': sent_text.strip()
                        })
                    # Simple term extraction: look for patterns "○○は…すべき" or "○○は…しない"
                    term_match = re.search(r'([\u4e00-\u9fff]+)は(.+?)(すべき|しない)', sent_text)
                    if term_match:
                        term = term_match.group(1)
                        term_occurrences.setdefault(term, []).append({
                            'file': fpath,
                            'sentence': sent_text.strip()
                        })

            # stray except removed
    continue

# Detect potential contradictions: same term appears with both "すべき" and "しない"
for term, occs in term_occurrences.items():
    has_must = any('すべき' in o['sentence'] for o in occs)
    has_not = any('しない' in o['sentence'] for o in occs)
    if has_must and has_not:
        must_occ = next(o for o in occs if 'すべき' in o['sentence'])
        not_occ = next(o for o in occs if 'しない' in o['sentence'])
        issues['potential_contradictions'].append({
            'term': term,
            'file1': must_occ['file'],
            'sentence1': must_occ['sentence'],
            'file2': not_occ['file'],
            'sentence2': not_occ['sentence']
        })

# Write report as JSON for easy reading
with open(REPORT_PATH, 'w', encoding='utf-8') as out:
    json.dump(issues, out, ensure_ascii=False, indent=2)

print('Quality check completed. Report written to', REPORT_PATH)
