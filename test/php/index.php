<?php
require_once __DIR__ . '/../../src/php/GyrotonicTrademark.php';

use SelfInteractive\GyrotonicTrademark\GyrotonicTrademark;

$testCases = [
    // Headings
    ['label' => 'H1 GYROTONIC',                     'input' => '<h1>H1 GYROTONIC</h1>'],
    ['label' => 'H2 Gyrotonic (no match)',           'input' => '<h2>H2 Gyrotonic</h2>'],
    ['label' => 'H3 GYROTONIC',                      'input' => '<h3>H3 GYROTONIC</h3>'],
    ['label' => 'H4 GYROTONIC',                      'input' => '<h4>H4 GYROTONIC</h4>'],
    ['label' => 'H5 GYROTONIC',                      'input' => '<h5>H5 GYROTONIC</h5>'],
    ['label' => 'H6 GYROTONIC',                      'input' => '<h6>H6 GYROTONIC</h6>'],

    // Mixed heading with nested elements
    ['label' => 'Mixed heading with strong/b tags',  'input' => '<h3><b>Flowing Together: How Nonviolent Communication (NVC) Can Serve to </b><b>Strengthen our GYROTONIC Community<br></b><strong>Nora Heiber, Gyrotonic Master Trainer</strong></h3>'],

    // Korean
    ['label' => 'Korean 자이로토닉',                   'input' => '<h1>h1 자이로토닉</h1>'],
    ['label' => 'Korean in context',                 'input' => '<h1>h1 자이로토닉 레이크파크 스튜디오</h1>'],

    // Other terms
    ['label' => 'GYROKINESIS',                       'input' => '<h1>H1 GYROKINESIS</h1>'],
    ['label' => 'ARCHWAY',                           'input' => '<h1>H1 ARCHWAY</h1>'],
    ['label' => 'Archway (title case)',               'input' => '<h1>H1 Archway</h1>'],
    ['label' => 'Ultima Reveal',                     'input' => '<h1>H1 Ultima Reveal</h1>'],
    ['label' => 'ULTIMA REVEAL',                     'input' => '<h1>H1 ULTIMA REVEAL</h1>'],

    // Trademark notice paragraph
    ['label' => 'Full trademark notice',             'input' => '<p>GYROTONIC, GYROTONIC & Logo, GYROTONIC EXPANSION SYSTEM, GYROKINESIS, GYROTONER, ARCHWAY and The Art of Exercising and Beyond are registered trademarks of Gyrotonic Sales Corp.</p>'],

    // Symbol variants
    ['label' => 'Ultima bare',                       'input' => '<p>Ultima</p>'],
    ['label' => 'Ultima® (unicode)',                  'input' => "<p>Ultima\u{00AE}</p>"],
    ['label' => 'Ultima&amp;reg;',                   'input' => '<p>Ultima&reg;</p>'],
    ['label' => 'Ultima XS',                         'input' => '<p>Ultima XS</p>'],
    ['label' => 'Ultima® XS (unicode)',              'input' => "<p>Ultima\u{00AE} XS</p>"],
    ['label' => 'Ultima&amp;reg; XS',                'input' => '<p>Ultima&reg; XS</p>'],
    ['label' => 'Ultima&amp;reg; XS Ultima',         'input' => '<p>Ultima&reg; XS Ultima</p>'],
    ['label' => 'Ultima&amp;reg; Reveal',            'input' => '<p>Ultima&reg; Reveal</p>'],

    // Longer paragraph
    ['label' => 'Ultima Reveal product description', 'input' => '<p>Introducing the Ultima Reveal, a seamless fusion of the best features of the Ultima and Extravaganza (European) Pulley Tower models. This unit features a classic Beechwood frame, and high-performance pulley bearings for an extra smooth glide and is the first standard pulley tower unit that comes with a Wingmaster, full set of plate weights, and cross bar.</p>'],

    // Korean with strong tags and ® symbols
    ['label' => 'Korean paragraph with ® symbols',  'input' => '<p><span style="font-weight: 400;"><strong>누가 주문할수 있나요?</strong><br />전문가용으로만 사용하십시오. 전문적인 환경이나 스튜디오에서 고객과 함께 이 기기를 사용하려면 자이로토닉 파운데이션 과정을 이수하고 적절한 교육 및 자격증을 취득해야 합니다. 한국 내 <strong>자이로토닉®</strong>(GYROTONIC®) 장비 공식 판매는 <strong>자이로토닉®</strong> 홍콩에서 담당합니다.<br /></span></p>'],

    // Link - should NOT wrap in href
    ['label' => 'Link (href should not be wrapped)', 'input' => '<a href="http://GYROTONIC.com">Gyro.com</a>'],

    // List items with strong tags
    ['label' => 'Certification list items',          'input' => '<ul>
<li><strong>GYROTONIC® Apprentice</strong></li>
<li><strong>GYROTONIC® Trainer</strong></li>
<li><strong>GYROTONIC® Pre-Trainer</strong></li>
<li><strong>GYROTONIC® Master Trainer</strong></li>
<li><strong>GYROKINESIS® Cobra Apprentice</strong></li>
<li><strong>GYROKINESIS® Cobra Trainer</strong></li>
<li><strong>GYROKINESIS® Cobra Master Trainer</strong></li>
</ul>'],

    // Longer paragraph with multiple terms
    ['label' => 'Multi-term paragraph',              'input' => '<p>The GYROTONIC EXPANSION SYSTEM is a unique, holistic approach to movement. Some of the benefits of a regular <span>GYROTONIC</span> practice include a healthier, Cobra Cobra Cobra more supple spine, increased range of motion, greater joint stability, improved agility and athletic performance and a deep internal strength.</p>'],

    // GYROTONER
    ['label' => 'GYROTONER heading',                 'input' => '<h3>GYROTONER</h3>'],
    ['label' => 'EXPANSION SYSTEM heading',          'input' => '<h3>GYROTONIC EXPANSION SYSTEM</h3>'],

    // Unordered list
    ['label' => 'Plain list items',                  'input' => '<ul><li>GYROTONIC</li><li>GYROKINESIS</li><li>GYROTONER</li><li>EXPANSION SYSTEM</li></ul>'],

    // Paragraph with strong tags
    ['label' => 'GYROKINESIS METHOD paragraph',      'input' => '<p>The <strong>GYROKINESIS METHOD</strong> is a movement method that addresses the entire body, opening energy pathways, stimulating the nervous system, increasing range of motion, and creating functional strength through rhythmic, flowing movement sequences.</p>'],

    // Complex copyright paragraph
    ['label' => 'Full copyright notice',             'input' => '<p>© The GYROTONIC EXPANSION SYSTEM includes the GYROTONIC, and GYROKINESIS movement methods. Some of the benefits of GYROTONIC® and GYROKINESIS® exercises include increased strength and flexibility. GYROTONIC, GYROTONIC & Logo, GYROTONIC EXPANSION SYSTEM, GYROKINESIS, GYROTONER, and The Art of Exercising and Beyond are registered trademarks of Gyrotonic Sales Corp.</p>'],

    // gttm-ignore class
    ['label' => 'gttm-ignore (should NOT be styled)', 'input' => '<p class="gttm-ignore">GYROTONIC should remain unstyled here</p>'],

    // Plain text (no HTML tags)
    ['label' => 'Plain text GYROTONIC',              'input' => 'GYROTONIC'],
    ['label' => 'Plain text no trademarks',          'input' => 'Just some regular text here.'],
    ['label' => 'Cobra',                             'input' => '<p>Cobra</p>'],
    ['label' => 'The Art of Exercising and Beyond',  'input' => '<p>The Art of Exercising and Beyond</p>'],
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>GYROTONIC® Trademark — PHP Visual Test</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
            color: #212529;
        }
        h1 { margin-bottom: 4px; }
        .subtitle { color: #6c757d; margin-top: 0; margin-bottom: 24px; }
        .test-case {
            background: #fff;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            margin-bottom: 16px;
            overflow: hidden;
        }
        .test-label {
            background: #e9ecef;
            padding: 8px 14px;
            font-weight: 600;
            font-size: 13px;
            color: #495057;
            border-bottom: 1px solid #dee2e6;
        }
        .test-row {
            display: flex;
            border-bottom: 1px solid #f1f3f5;
        }
        .test-row:last-child { border-bottom: none; }
        .test-row-label {
            width: 80px;
            min-width: 80px;
            padding: 10px 14px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: #868e96;
            background: #f8f9fa;
            display: flex;
            align-items: center;
        }
        .test-row-content {
            flex: 1;
            padding: 10px 14px;
            overflow-x: auto;
        }
        .test-row-content.source {
            font-family: "SF Mono", "Fira Code", "Consolas", monospace;
            font-size: 12px;
            color: #495057;
            white-space: pre-wrap;
            word-break: break-all;
            background: #f8f9fa;
        }
        .test-row-content.html-source {
            font-family: "SF Mono", "Fira Code", "Consolas", monospace;
            font-size: 11px;
            color: #868e96;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .test-row-content.rendered {
            font-family: "Courier New", Courier, monospace;
        }
        .toggle-source {
            background: none;
            border: none;
            color: #868e96;
            cursor: pointer;
            font-size: 11px;
            padding: 2px 8px;
            margin-left: 8px;
        }
        .toggle-source:hover { color: #495057; }
        .hidden { display: none; }
        .custom-test { margin-top: 32px; }
        .custom-test textarea {
            width: 100%;
            min-height: 100px;
            font-family: "SF Mono", "Fira Code", "Consolas", monospace;
            font-size: 13px;
            padding: 12px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            resize: vertical;
        }
        .custom-test button {
            margin-top: 8px;
            padding: 8px 20px;
            background: #495057;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }
        .custom-test button:hover { background: #343a40; }
        #custom-result {
            margin-top: 12px;
        }
    </style>
</head>
<body>
    <h1>GYROTONIC<sup>&reg;</sup> Trademark — PHP Visual Test</h1>
    <p class="subtitle">v<?= GyrotonicTrademark::getVersion() ?> &middot; Server-side processing with inline styles for email HTML</p>

    <?php foreach ($testCases as $i => $case): ?>
        <?php $output = GyrotonicTrademark::apply($case['input']); ?>
        <div class="test-case">
            <div class="test-label">
                <?= htmlspecialchars($case['label']) ?>
                <button class="toggle-source" onclick="toggleSource(<?= $i ?>)">show source</button>
            </div>
            <div class="test-row">
                <div class="test-row-label">Input</div>
                <div class="test-row-content source"><?= htmlspecialchars($case['input']) ?></div>
            </div>
            <div class="test-row">
                <div class="test-row-label">Rendered</div>
                <div class="test-row-content rendered"><?= $output ?></div>
            </div>
            <div class="test-row hidden" id="source-<?= $i ?>">
                <div class="test-row-label">HTML</div>
                <div class="test-row-content html-source"><?= htmlspecialchars($output) ?></div>
            </div>
        </div>
    <?php endforeach; ?>

    <div class="custom-test">
        <h2>Try Your Own HTML</h2>
        <form method="post">
            <textarea name="custom_html" placeholder="Paste HTML here to test..."><?= isset($_POST['custom_html']) ? htmlspecialchars($_POST['custom_html']) : '' ?></textarea>
            <button type="submit">Process</button>
        </form>

        <?php if (isset($_POST['custom_html']) && $_POST['custom_html'] !== ''): ?>
            <?php $customOutput = GyrotonicTrademark::apply($_POST['custom_html']); ?>
            <div id="custom-result">
                <div class="test-case">
                    <div class="test-label">Custom Input Result</div>
                    <div class="test-row">
                        <div class="test-row-label">Rendered</div>
                        <div class="test-row-content rendered"><?= $customOutput ?></div>
                    </div>
                    <div class="test-row">
                        <div class="test-row-label">HTML</div>
                        <div class="test-row-content html-source"><?= htmlspecialchars($customOutput) ?></div>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <script>
        function toggleSource(i) {
            var el = document.getElementById('source-' + i);
            var btn = el.closest('.test-case').querySelector('.toggle-source');
            if (el.classList.contains('hidden')) {
                el.classList.remove('hidden');
                btn.textContent = 'hide source';
            } else {
                el.classList.add('hidden');
                btn.textContent = 'show source';
            }
        }
    </script>
</body>
</html>
