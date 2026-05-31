<?php

class GyrotonicTrademark
{
    private const VERSION = '2.0.0';

    private const REG_SYM = "\u{00AE}";

    private const ENCODED_SYMS = [
        "\u{00AE}" => '&reg;',
        "\u{2122}" => '&trade;',
    ];

    private const INLINE_STYLES = [
        'gt-times'        => "font-family:'Times New Roman',Times,serif;font-weight:bold;text-transform:uppercase;font-style:normal;",
        'gt-times-normal' => "font-family:'Times New Roman',Times,serif;font-weight:normal;text-transform:uppercase;font-style:normal;",
        'gt-corsiva'      => "font-family:'Times New Roman',Times,serif;font-style:italic;font-weight:normal;text-transform:none;",
    ];

    private const SUP_STYLE = 'font-size:0.6em;vertical-align:super;line-height:0;';

    private const REG_FONTS = [
        'gt-times' => [
            'GYROTONIC EXPANSION SYSTEM',
            'GYROTONIC',
            "\xEC\x9E\x90\xEC\x9D\xB4\xEB\xA1\x9C\xED\x86\xA0\xEB\x8B\x89", // 자이로토닉
            'GYROKINESIS',
            'GYROTONER',
            'ARCHWAY',
            'Archway',
        ],
        'gt-times-normal' => [
            'ULTIMA REVEAL',
            'Ultima Reveal',
        ],
        'gt-corsiva' => [
            ['term' => 'Ultima', 'afterTerm' => ' XS'],
            'Ultima',
            'Cobra',
            'The Art of Exercising and Beyond',
        ],
    ];

    private const REG_TYPES = [
        'GYROTONIC EXPANSION SYSTEM' => self::REG_SYM,
        'GYROTONIC'                  => self::REG_SYM,
        'GYROKINESIS'                => self::REG_SYM,
        'GYROTONER'                  => self::REG_SYM,
        'Cobra'                      => self::REG_SYM,
        "\xEC\x9E\x90\xEC\x9D\xB4\xEB\xA1\x9C\xED\x86\xA0\xEB\x8B\x89" => self::REG_SYM,
        'The Art of Exercising and Beyond' => self::REG_SYM,
        'Ultima Reveal'              => self::REG_SYM,
        'ULTIMA REVEAL'              => self::REG_SYM,
        'Ultima'                     => self::REG_SYM,
        'ARCHWAY'                    => self::REG_SYM,
        'Archway'                    => self::REG_SYM,
    ];

    private static ?array $processingOrder = null;

    public static function apply(string $html): string
    {
        if ($html === '') {
            return '';
        }

        $order = self::getProcessingOrder();

        [$html, $ignorePlaceholders] = self::protectIgnoredSections($html);

        // Normalize encoded ® variants in text segments before matching
        $html = self::normalizeSymbols($html);

        foreach ($order as $termDef) {
            $html = self::replaceTerm($html, $termDef);
        }

        $html = self::removeOrphanedSymbols($html);
        $html = self::cleanupNestedSpans($html);
        $html = self::stripDataAttributes($html);
        $html = self::restoreIgnoredSections($html, $ignorePlaceholders);

        return $html;
    }

    public static function getVersion(): string
    {
        return self::VERSION;
    }

    private static function getProcessingOrder(): array
    {
        if (self::$processingOrder !== null) {
            return self::$processingOrder;
        }

        $order = [];

        // Build extra regFonts entries for encoded symbol variants of Ultima Reveal
        $regFonts = self::REG_FONTS;
        $regFonts['gt-times-normal'][] = 'Ultima&reg; Reveal';
        $regFonts['gt-times-normal'][] = 'Ultima' . self::REG_SYM . ' Reveal';

        // Build extra regTypes entries for encoded symbol variants
        $regTypes = self::REG_TYPES;
        $regTypes['Ultima&reg; Reveal'] = self::REG_SYM;
        $regTypes['Ultima' . self::REG_SYM . ' Reveal'] = self::REG_SYM;

        foreach ($regFonts as $font => $termList) {
            foreach ($termList as $termDef) {
                if (is_string($termDef)) {
                    $termDef = ['term' => $termDef];
                }

                $term = $termDef['term'];
                $afterTerm = $termDef['afterTerm'] ?? '';
                $afterTermSymbol = $termDef['afterTermSymbol'] ?? '';

                $order[] = [
                    'term'            => $term,
                    'afterTerm'       => $afterTerm,
                    'afterTermSymbol' => $afterTermSymbol,
                    'font'            => $font,
                    'symbol'          => $regTypes[$term] ?? '',
                    'matchLength'     => mb_strlen($term . $afterTerm, 'UTF-8'),
                ];
            }
        }

        usort($order, function ($a, $b) {
            return $b['matchLength'] <=> $a['matchLength'];
        });

        self::$processingOrder = $order;
        return $order;
    }

    private static function normalizeSymbols(string $html): string
    {
        // Replace &reg; and &trade; in text segments with their Unicode equivalents
        // so matching logic only needs to handle one form
        $tagParts = preg_split('/(<[^>]*>)/u', $html, -1, PREG_SPLIT_DELIM_CAPTURE);
        if ($tagParts === false) {
            return $html;
        }

        foreach ($tagParts as &$part) {
            if ($part !== '' && $part[0] !== '<') {
                $part = str_replace('&reg;', self::REG_SYM, $part);
                $part = str_replace('&trade;', "\u{2122}", $part);
            }
        }

        return implode('', $tagParts);
    }

    private static function replaceTerm(string $html, array $termDef): string
    {
        $replacement = self::buildReplacementSpan($termDef);
        $qTerm = preg_quote($termDef['term'], '/');
        $qAfterTerm = preg_quote($termDef['afterTerm'], '/');

        if ($termDef['symbol'] !== '') {
            $qSym = preg_quote($termDef['symbol'], '/');
            $qEncSym = preg_quote(self::ENCODED_SYMS[$termDef['symbol']] ?? '', '/');
            $symPattern = '/' . $qTerm . '(?:' . $qSym . '|' . $qEncSym . ')' . $qAfterTerm . '/u';
            $html = self::replaceInTextSegments($html, $symPattern, $replacement);
        }

        $barePattern = '/' . $qTerm . $qAfterTerm . '/u';
        $html = self::replaceInTextSegments($html, $barePattern, $replacement);

        return $html;
    }

    private static function replaceInTextSegments(string $html, string $pattern, string $replacement): string
    {
        $gttmParts = preg_split('/(<span[^>]*data-gttm="1"[^>]*>.*?<\/span>)/su', $html, -1, PREG_SPLIT_DELIM_CAPTURE);

        if ($gttmParts === false) {
            return $html;
        }

        foreach ($gttmParts as &$gttmPart) {
            if (strpos($gttmPart, 'data-gttm="1"') !== false) {
                continue;
            }

            $tagParts = preg_split('/(<[^>]*>)/u', $gttmPart, -1, PREG_SPLIT_DELIM_CAPTURE);
            if ($tagParts === false) {
                continue;
            }

            foreach ($tagParts as &$tagPart) {
                if ($tagPart !== '' && $tagPart[0] !== '<') {
                    $tagPart = preg_replace($pattern, $replacement, $tagPart);
                }
            }

            $gttmPart = implode('', $tagParts);
        }

        return implode('', $gttmParts);
    }

    private static function buildReplacementSpan(array $termDef): string
    {
        $sup = self::SUP_STYLE;

        $span = '<span style="' . self::INLINE_STYLES[$termDef['font']] . '" data-gttm="1">';
        $span .= $termDef['term'];
        $span .= '<sup style="' . $sup . '">' . $termDef['symbol'] . '</sup>';
        $span .= $termDef['afterTerm'];

        if ($termDef['afterTermSymbol'] !== '') {
            $span .= '<sup style="' . $sup . '">' . $termDef['afterTermSymbol'] . '</sup>';
        }

        $span .= '</span>';

        return $span;
    }

    private static function removeOrphanedSymbols(string $html): string
    {
        $symbols = array_merge(
            array_keys(self::ENCODED_SYMS),
            array_values(self::ENCODED_SYMS)
        );

        foreach ($symbols as $sym) {
            $qSym = preg_quote($sym, '/');
            $html = preg_replace('/' . $qSym . '(?!<\/sup>)/u', '', $html);
        }

        return $html;
    }

    private static function cleanupNestedSpans(string $html): string
    {
        $html = preg_replace_callback(
            '/(<span[^>]*data-gttm="1"[^>]*>)(.*?)(<\/span>)/su',
            function ($matches) {
                $inner = $matches[2];
                if (preg_match('/<span[^>]*data-gttm="1"/', $inner)) {
                    $inner = preg_replace_callback(
                        '/(<span[^>]*data-gttm="1"[^>]*>)(.*?)(<\/span>)/su',
                        function ($innerMatches) {
                            $content = preg_replace('/<sup[^>]*>.*?<\/sup>/u', '', $innerMatches[2]);
                            return $innerMatches[1] . $content . $innerMatches[3];
                        },
                        $inner
                    );
                }
                return $matches[1] . $inner . $matches[3];
            },
            $html
        );

        $html = preg_replace_callback(
            '/(<span[^>]*data-gttm="1"[^>]*>)(.*?)(<\/span>)/su',
            function ($matches) {
                $inner = $matches[2];
                $inner = preg_replace(
                    '/<span[^>]*data-gttm="1"[^>]*>(.*?)<\/span>/su',
                    '$1',
                    $inner
                );
                return $matches[1] . $inner . $matches[3];
            },
            $html
        );

        return $html;
    }

    private static function protectIgnoredSections(string $html): array
    {
        $placeholders = [];
        $counter = 0;

        $html = preg_replace_callback(
            '/<(\w+)([^>]*class="[^"]*gttm-ignore[^"]*"[^>]*)>(.*?)<\/\1>/su',
            function ($matches) use (&$placeholders, &$counter) {
                $placeholder = '<!--GTTM_IGNORE_' . $counter . '-->';
                $placeholders[$placeholder] = $matches[0];
                $counter++;
                return $placeholder;
            },
            $html
        );

        return [$html, $placeholders];
    }

    private static function restoreIgnoredSections(string $html, array $placeholders): string
    {
        foreach ($placeholders as $placeholder => $original) {
            $html = str_replace($placeholder, $original, $html);
        }
        return $html;
    }

    private static function stripDataAttributes(string $html): string
    {
        return preg_replace('/\s*data-gttm="1"/', '', $html);
    }
}
