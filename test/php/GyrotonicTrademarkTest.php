<?php

require_once __DIR__ . '/../../src/php/GyrotonicTrademark.php';

use SelfInteractive\GyrotonicTrademark\GyrotonicTrademark;

class GyrotonicTrademarkTest
{
    private int $passed = 0;
    private int $failed = 0;

    private const TIMES = "font-family:'Times New Roman',Times,serif;font-weight:bold;text-transform:uppercase;font-style:normal;";
    private const TIMES_NORMAL = "font-family:'Times New Roman',Times,serif;font-weight:normal;text-transform:uppercase;font-style:normal;";
    private const CORSIVA = "font-family:'Times New Roman',Times,serif;font-style:italic;font-weight:normal;text-transform:none;";
    private const SUP = "font-size:0.6em;vertical-align:super;line-height:0;";

    public function run(): void
    {
        echo "GyrotonicTrademark PHP Test Suite\n";
        echo "=================================\n\n";

        $this->testBasicReplacements();
        $this->testSymbolHandling();
        $this->testKorean();
        $this->testCompoundTerms();
        $this->testUltimaFamily();
        $this->testOtherTerms();
        $this->testHtmlContext();
        $this->testEdgeCases();

        echo "\n---------------------------------\n";
        $total = $this->passed + $this->failed;
        echo "Results: {$this->passed} passed, {$this->failed} failed (of {$total})\n";

        exit($this->failed > 0 ? 1 : 0);
    }

    private function testBasicReplacements(): void
    {
        echo "Basic Replacements:\n";

        $this->assertEqual(
            '<span style="' . self::TIMES . '">GYROTONIC<sup style="' . self::SUP . '">®</sup></span>',
            GyrotonicTrademark::apply('GYROTONIC'),
            'Single GYROTONIC term'
        );

        $result = GyrotonicTrademark::apply('GYROTONIC and GYROKINESIS');
        $this->assertContains('<span style="' . self::TIMES . '">GYROTONIC<sup', $result, 'Multiple terms - GYROTONIC wrapped');
        $this->assertContains('<span style="' . self::TIMES . '">GYROKINESIS<sup', $result, 'Multiple terms - GYROKINESIS wrapped');

        $result = GyrotonicTrademark::apply('GYROTONIC EXPANSION SYSTEM');
        $this->assertContains('GYROTONIC EXPANSION SYSTEM<sup', $result, 'Full phrase wrapped as one unit');
        $this->assertNotContains('>GYROTONIC<sup', $result, 'GYROTONIC not split from EXPANSION SYSTEM');

        echo "\n";
    }

    private function testSymbolHandling(): void
    {
        echo "Symbol Handling:\n";

        $result = GyrotonicTrademark::apply("GYROTONIC\u{00AE}");
        $this->assertContains('>GYROTONIC<sup', $result, 'Term with Unicode ® symbol wrapped');
        $this->assertNotContains("GYROTONIC\u{00AE}<", $result, 'Orphan ® removed');

        $result = GyrotonicTrademark::apply('GYROTONIC&reg;');
        $this->assertContains('>GYROTONIC<sup', $result, 'Term with &reg; entity wrapped');

        echo "\n";
    }

    private function testKorean(): void
    {
        echo "Korean Text:\n";

        $result = GyrotonicTrademark::apply('자이로토닉');
        $this->assertContains('>자이로토닉<sup', $result, 'Korean term wrapped');
        $this->assertContains(self::TIMES, $result, 'Korean term gets gt-times style');

        $result = GyrotonicTrademark::apply('자이로토닉 레이크파크 스튜디오');
        $this->assertContains('>자이로토닉<sup', $result, 'Korean term wrapped in context');
        $this->assertContains('레이크파크 스튜디오', $result, 'Surrounding Korean text preserved');

        echo "\n";
    }

    private function testCompoundTerms(): void
    {
        echo "Compound Terms:\n";

        $result = GyrotonicTrademark::apply('Ultima XS');
        $this->assertContains(self::CORSIVA, $result, 'Ultima XS gets gt-corsiva style');
        $this->assertContains('>Ultima<sup', $result, 'Ultima XS - Ultima part present');
        $this->assertContains('XS</span>', $result, 'Ultima XS - XS inside span');

        $result = GyrotonicTrademark::apply("Ultima\u{00AE} XS");
        $this->assertContains(self::CORSIVA, $result, 'Ultima® XS gets gt-corsiva style');
        $this->assertContains('>Ultima<sup', $result, 'Ultima® XS - symbol moved to sup');

        echo "\n";
    }

    private function testUltimaFamily(): void
    {
        echo "Ultima Family:\n";

        $result = GyrotonicTrademark::apply('Ultima Reveal');
        $this->assertContains(self::TIMES_NORMAL, $result, 'Ultima Reveal gets gt-times-normal');

        $result = GyrotonicTrademark::apply('ULTIMA REVEAL');
        $this->assertContains(self::TIMES_NORMAL, $result, 'ULTIMA REVEAL gets gt-times-normal');

        $result = GyrotonicTrademark::apply('Ultima XS and Ultima');
        $this->assertContains(self::CORSIVA, $result, 'Mixed Ultimas - has gt-corsiva');
        $count = substr_count($result, '<span style="' . self::CORSIVA);
        $this->assertEqual('2', (string)$count, 'Mixed Ultimas - two corsiva spans');

        $result = GyrotonicTrademark::apply('Ultima');
        $this->assertContains(self::CORSIVA, $result, 'Bare Ultima gets gt-corsiva');

        echo "\n";
    }

    private function testOtherTerms(): void
    {
        echo "Other Terms:\n";

        $result = GyrotonicTrademark::apply('The Art of Exercising and Beyond');
        $this->assertContains(self::CORSIVA, $result, 'Art of Exercising gets gt-corsiva');
        $this->assertContains('®</sup>', $result, 'Art of Exercising gets ® symbol');

        $result = GyrotonicTrademark::apply('Cobra');
        $this->assertContains(self::CORSIVA, $result, 'Cobra gets gt-corsiva');

        $result = GyrotonicTrademark::apply('ARCHWAY');
        $this->assertContains(self::TIMES, $result, 'ARCHWAY gets gt-times');

        $result = GyrotonicTrademark::apply('Archway');
        $this->assertContains(self::TIMES, $result, 'Archway gets gt-times');

        $result = GyrotonicTrademark::apply('GYROTONER');
        $this->assertContains(self::TIMES, $result, 'GYROTONER gets gt-times');

        echo "\n";
    }

    private function testHtmlContext(): void
    {
        echo "HTML Context:\n";

        $result = GyrotonicTrademark::apply('<a href="http://GYROTONIC.com">Visit site</a>');
        $this->assertNotContains('href="http://<span', $result, 'Term in href NOT wrapped');

        $result = GyrotonicTrademark::apply('<a href="#">GYROTONIC</a>');
        $this->assertContains('>GYROTONIC<sup', $result, 'Term in link text IS wrapped');

        $result = GyrotonicTrademark::apply('<p class="gttm-ignore">GYROTONIC</p>');
        $this->assertNotContains('<span style=', $result, 'gttm-ignore section NOT wrapped');
        $this->assertContains('GYROTONIC', $result, 'gttm-ignore content preserved');

        $result = GyrotonicTrademark::apply('<p>Some text about GYROTONIC equipment</p>');
        $this->assertContains('<span style="' . self::TIMES, $result, 'Term inside <p> wrapped');

        echo "\n";
    }

    private function testEdgeCases(): void
    {
        echo "Edge Cases:\n";

        $this->assertEqual('', GyrotonicTrademark::apply(''), 'Empty string returns empty');

        $this->assertEqual(
            'Just some regular text here.',
            GyrotonicTrademark::apply('Just some regular text here.'),
            'No trademark terms returns unchanged'
        );

        $result = GyrotonicTrademark::apply('GYROTONIC');
        $this->assertNotContains('data-gttm', $result, 'data-gttm attribute stripped from output');

        $result = GyrotonicTrademark::apply('GYROTONIC, GYROTONIC EXPANSION SYSTEM, GYROKINESIS, GYROTONER, ARCHWAY and The Art of Exercising and Beyond are registered trademarks.');
        $this->assertContains('GYROTONIC EXPANSION SYSTEM<sup', $result, 'Complex - EXPANSION SYSTEM as unit');
        $this->assertContains('>GYROTONIC<sup', $result, 'Complex - standalone GYROTONIC');
        $this->assertContains('>GYROKINESIS<sup', $result, 'Complex - GYROKINESIS');
        $this->assertContains('>GYROTONER<sup', $result, 'Complex - GYROTONER');
        $this->assertContains('>ARCHWAY<sup', $result, 'Complex - ARCHWAY');
        $this->assertContains('>The Art of Exercising and Beyond<sup', $result, 'Complex - Art of Exercising');

        echo "\n";
    }

    private function assertEqual(string $expected, string $actual, string $testName): void
    {
        if ($expected === $actual) {
            $this->passed++;
            echo "  \033[32mPASS\033[0m: {$testName}\n";
        } else {
            $this->failed++;
            echo "  \033[31mFAIL\033[0m: {$testName}\n";
            echo "    Expected: {$expected}\n";
            echo "    Actual:   {$actual}\n";
        }
    }

    private function assertContains(string $needle, string $haystack, string $testName): void
    {
        if (strpos($haystack, $needle) !== false) {
            $this->passed++;
            echo "  \033[32mPASS\033[0m: {$testName}\n";
        } else {
            $this->failed++;
            echo "  \033[31mFAIL\033[0m: {$testName}\n";
            echo "    Expected to contain: {$needle}\n";
            echo "    Actual: {$haystack}\n";
        }
    }

    private function assertNotContains(string $needle, string $haystack, string $testName): void
    {
        if (strpos($haystack, $needle) === false) {
            $this->passed++;
            echo "  \033[32mPASS\033[0m: {$testName}\n";
        } else {
            $this->failed++;
            echo "  \033[31mFAIL\033[0m: {$testName}\n";
            echo "    Expected NOT to contain: {$needle}\n";
            echo "    Actual: {$haystack}\n";
        }
    }
}

$test = new GyrotonicTrademarkTest();
$test->run();
