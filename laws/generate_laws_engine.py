# -*- coding: utf-8 -*-
import os, sys, xml.etree.ElementTree as ET

EXISTING = {
    'administrative-organization.xml', 'administrative-procedure.xml', 'civil-procedure.xml',
    'civil.xml', 'commercial.xml', 'constitution.xml', 'court.xml', 'criminal-procedure.xml',
    'criminal.xml', 'defense-ministry-organization-order.xml', 'election.xml', 'emergency.xml',
    'fundamental-rights-act.xml', 'local-autonomy.xml', 'local-public-service.xml', 'martial-law.xml',
    'national-defense.xml', 'national-diet-act.xml', 'national-public-service.xml', 'nationality-act.xml',
    'president.xml', 'attorney-at-law.xml', 'public-prosecutors-office.xml',
    'national-security-council-act.xml', 'police-law.xml', 'prison-administration-act.xml',
    'civil-execution-act.xml'
}

def create_100_article_law(filename, title, scope_desc, authority, term1, term2, specific_5_chapters):
    if filename in EXISTING or os.path.exists(filename):
        return False
        
    t1_k, t1_v = term1
    t2_k, t2_v = term2
    
    chapters = []
    
    # Ch 1: General Provisions (10 articles)
    ch1 = ('総則', [
        ('目的', [f'この法律は、{scope_desc}に関する基本原則、権利義務及び手続規範を定めることにより、公正な社会秩序の維持及び国民の福祉の増進を図り、もって国家の調和ある発展に寄与することを目的とする。']),
        ('基本理念', [f'{title[:-1]}に係る制度の運用及び施策の実施は、国民の正当な権利利益を最大限に尊重しつつ、公共の福祉、法治主義及び国家の安全との調和を図ることを旨としなければならない。', '関係当事者は、信義誠実の原則に従い、誠実にその義務を履行しなければならない。']),
        ('定義', [f'この法律において「{t1_k}」とは、{t1_v}をいう。', f'この法律において「{t2_k}」とは、{t2_v}をいう。']),
        ('国の責務', [f'国は、大統領の指導統括の下、{scope_desc}に関する施策を総合的かつ計画的に策定し、これを迅速に実施する責務を負う。', '国は、施策の推進に必要な法制上、財政上及び税制上の措置を講じなければならない。']),
        ('地方自治体の協力', ['地方自治体は、国の施策と協調し、その地域の実情に応じた必要な措置を講ずるよう努めるものとする。']),
        ('事業者の責務', ['関係事業者は、法令を遵守し、利用者の利益の保護、安全の確保及び公正な競争秩序の維持に努めなければならない。']),
        ('国民の理解と協力', ['国民は、この法律の趣旨を正しく理解し、国及び地方自治体が実施する施策に協力するよう努めるものとする。']),
        ('国際的協調の推進', ['国は、国際機関及び諸外国と密接に連携し、国際的基準に合致した法制度の整備及び国際協力の推進に努める。']),
        ('情報の公開と説明責任', [f'{authority}は、この法律の運用に関し、原則として情報を公開し、国民に対する説明責任を徹底しなければならない。']),
        ('適用除外及び特別法優先', ['国の安全保障上重大な支障がある場合又は他の法律に特別の定めがある場合は、その定めるところによる。'])
    ])
    chapters.append(ch1)
    
    # Ch 2: Competent Authority & Planning (10 articles)
    ch2 = ('管轄機関及び基本計画', [
        ('主務大臣の権限', [f'この法律に規定する事務は、{authority}が管理統理する。', f'{authority}は、重大事態が発生したときは直ちに大統領に報告し、必要な指示を仰がなければならない。']),
        ('基本方針の策定', [f'{authority}は、{scope_desc}に関する基本方針の案を作成し、大統領の承認を経て決定しなければならない。', '基本方針を決定したときは、遅滞なく官報により告示しなければならない。']),
        ('基本方針の改定手続', [f'{authority}は、社会経済情勢の著しい変動に応じ、適時に基本方針の見直しを行い、必要な改定を行わなければならない。']),
        ('関係審議会の設置', [f'{authority}の諮問機関として、専門的知見を調査審議させるため、政令の定めるところにより関係審議会を置く。']),
        ('審議会の委員構成及び任期', ['審議会の委員は、学識経験者、実務関係者及び公募市民の中から公平に任命し、任期は二年とする。']),
        ('関係省庁連絡協議会', [f'{authority}及び関係省庁の長は、密接な連絡調整を図るため、常設の省庁横断的連絡協議会を組織する。']),
        ('地方出先機関の指揮監督', [f'{authority}は、全国の地方出先機関に対し、統一的な法解釈及び適正な職務執行のための訓令を発する。']),
        ('資料提出等の要求', [f'{authority}は、関係省庁、地方自治体又は関係機関に対し、必要な資料の提出その他協力を求めることができる。']),
        ('年次報告書の提出', [f'{authority}は、毎年、施策の実施状況に関する白書を作成し、大統領を経て議会に提出しなければならない。']),
        ('調査研究及び技術開発の推進', ['国は、関係分野の先端的な知見を蓄積するため、国立研究機関の整備及び民間研究開発に対する助成を推進する。'])
    ])
    chapters.append(ch2)
    
    # Ch 3 to 7: Specific Chapters (5 chapters * 10 articles = 50 articles)
    for ch_title, articles_data in specific_5_chapters:
        chapters.append((ch_title, articles_data))
        
    # Ch 8: Supervision & Administrative Actions (10 articles)
    ch8 = ('監督、立入検査及び行政処分', [
        ('報告の徴収', [f'{authority}は、この法律の施行に必要な限度において、関係者に対し業務若しくは経理の報告を求めることができる。']),
        ('立入検査の権限', [f'{authority}の指定する職員は、関係者の事務所その他の場所に立ち入り、帳簿書類その他の物件を検査することができる。', '立入検査をする職員は、その身分を示す証明書を携帯し、提示しなければならない。']),
        ('立入検査の制限', ['立入検査の権限は、犯罪捜査のために認められたものと解釈してはならない。']),
        ('帳簿書類等の保存義務', ['関係事業者は、法令の定めるところにより、正確な帳簿及び電磁的記録を作成し、五年間保存しなければならない。']),
        ('業務改善勧告', [f'{authority}は、適正な運営が確保されていないと認めるときは、期間を定めて必要な改善を勧告することができる。']),
        ('業務改善命令', [f'{authority}は、法令違反が明白であるときは、直ちに期限を付して業務方法の改善その他必要な措置を命ずることができる。']),
        ('業務停止命令', [f'{authority}は、改善命令に従わない者に対し、六月以内の期間を定めて業務の全部又は一部の停止を命ずることができる。']),
        ('許可又は登録の取消し', [f'{authority}は、不正の手段により許可等を受けた者に対し、その許可等を取り消すことができる。']),
        ('行政処分の公表', [f'{authority}は、是正命令又は業務停止処分を行ったときは、違反事実及び事業者名を公表することができる。']),
        ('事前の聴聞手続', ['不利益処分を行おうとするときは、行政手続法の定めるところにより、必ず事前の聴聞を行わなければならない。'])
    ])
    chapters.append(ch8)
    
    # Ch 9: Redress & Dispute Resolution (10 articles)
    ch9 = ('審査請求及び紛争処理手続', [
        ('審査請求の申立て', ['この法律に基づく処分又はその不作為に不服がある者は、行政不服審査法に基づき審査請求をすることができる。']),
        ('不服申立期間の教示', ['処分を行う書面には、不服申立てができる旨及びその期間を明記しなければならない。']),
        ('行政不服審査会への諮問', [f'{authority}は、審査請求を受けたときは、別段の定めがある場合を除き、行政不服審査会に諮問しなければならない。']),
        ('処分の執行停止', ['重大な損害を避けるため緊急の必要があるときは、審査庁は職権又は申立てにより処分の執行停止を決定する。']),
        ('裁判所への取消訴訟', ['裁決に不服がある者は、行政事件訴訟法に基づき管轄裁判所に取消訴訟を提起することができる。']),
        ('民事調停委員会の設置', ['民事上の紛争を迅速に解決するため、裁判所に専門家による民事調停委員会を置くことができる。']),
        ('調停の申立て手続', ['当事者は、合意により調停委員会に対し和解のあっせんを申し立てることができる。']),
        ('調停の効力と執行力', ['調停が成立し調書に記載されたときは、裁判上の和解と同一の効力を有する。']),
        ('苦情処理窓口の常設', [f'{authority}は、国民からの相談及び苦情に迅速に応じる総合相談窓口を常設しなければならない。']),
        ('公益通報者の保護', ['この法律の違反行為を通報した者に対し、解雇その他のいかなる不利益処分も科してはならない。'])
    ])
    chapters.append(ch9)
    
    # Ch 10: Penalties (10 articles)
    ch10 = ('罰則', [
        ('最重刑規定', ['偽りその他不正の手段により許可等を受け、又は業務停止命令に故意に違反した者は、五年以下の拘禁刑若しくは五百万円以下の罰金に処し、又はこれを併科する。']),
        ('重大命令違反の罪', ['この法律に基づく重要命令に違反した者は、三年以下の拘禁刑若しくは三百万円以下の罰金に処する。']),
        ('無許可営業の罪', ['所要の許可若しくは登録を受けないで事業を営んだ者は、二年以下の拘禁刑若しくは二百万円以下の罰金に処する。']),
        ('虚偽報告及び検査忌避の罪', ['報告を怠り、虚偽の報告をし、又は立入検査を拒み、妨げ、忌避した者は、一年以下の拘禁刑若しくは百万円以下の罰金に処する。']),
        ('秘密漏洩の罪', ['職務上知り得た他人の業務上の秘密又は個人のプライバシーを正当な理由なく漏らした者は、一年以下の拘禁刑若しくは五十万円以下の罰金に処する。']),
        ('帳簿記載不備の罪', ['帳簿を備え付けず、又はこれに虚偽の記載をした者は、五十万円以下の罰金に処する。']),
        ('法人の両罰規定', ['法人の代表者又は法人若しくは人の代理人、使用人その他の従業者が、その業務に関して違反行為をしたときは、行為者を罰するほか、その法人又は人に対しても各条の罰金刑を科する。']),
        ('秩序罰たる過料の基準', ['正当な理由なく届出を怠り、又は登記手続を遅延した者は、三十万円以下の過料に処する。']),
        ('審尋不出頭に対する過料', ['裁判所又は審査会の呼出しに応じず、正当な理由なく出頭しなかった者は、十万円以下の過料に処する。']),
        ('過料の裁判管轄', ['この法律に定める過料は、地方裁判所の決定をもってこれを科する。'])
    ])
    chapters.append(ch10)
    
    # Render XML
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<Law>', f'  <Title>{title}</Title>']
    art_count = 1
    for ch_idx, (ch_title, articles) in enumerate(chapters, 1):
        lines.append(f'  <Chapter Num="{ch_idx}">')
        lines.append(f'    <ChapterTitle>{ch_title}</ChapterTitle>')
        for art_title, paragraphs in articles:
            lines.append(f'    <Article Num="{art_count}">')
            lines.append(f'      <ArticleTitle>{art_title}</ArticleTitle>')
            lines.append(f'      <Sentence>{paragraphs[0]}</Sentence>')
            for p_idx, p_text in enumerate(paragraphs[1:], 2):
                lines.append(f'      <Paragraph Num="{p_idx}">')
                lines.append(f'        <Sentence>{p_text}</Sentence>')
                lines.append(f'      </Paragraph>')
            lines.append('    </Article>')
            art_count += 1
        lines.append('  </Chapter>')
    lines.append('</Law>')
    xml_str = '\n'.join(lines) + '\n'
    ET.fromstring(xml_str)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(xml_str)
    return True

print("Engine create_100_article_law ready")
