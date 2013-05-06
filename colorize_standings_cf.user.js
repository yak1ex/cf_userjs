// ==UserScript==
// @name           Colorize standings for Codeforces
// @namespace      http://yak2.myhome.cx/
// @description    Colorize standings pages at Codeforces by used programming language
// @license        http://creativecommons.org/publicdomain/zero/1.0/
// @copyright      yak_ex
// @version        1.4
// @include        http://www.codeforces.com/contest/*/standings*
// @include        http://www.codeforces.com/contest/*/room/*
// @include        http://codeforces.com/contest/*/standings*
// @include        http://codeforces.com/contest/*/room/*
// @include        http://www.codeforces.ru/contest/*/standings*
// @include        http://www.codeforces.ru/contest/*/room/*
// @include        http://codeforces.ru/contest/*/standings*
// @include        http://codeforces.ru/contest/*/room/*
// ==/UserScript==

// v0.01 2011/05/05 Initial version
// v0.02 2011/05/05 Enable on standings for specific division and rooms
//                  Add a feature to highlight specific language
// v1.1  2011/12/10 Add Scala and OCaml support
//                  Version jump because Chrome recognizes 0.0x as 1.0
// v1.2  2012/06/05 Record marked languages into cookie to be persistent, at least, between reloads.
//                  Thanks for suggestion by iTwin
// v1.3  2012/06/05 Add Java 6, Java 7 and Perl support
// v1.4  2013/05/07 Split Python to Python 2 and Python 3.
//                  Split C# to Mono C# and MS C#
//                  Add D and Go.

///////////////////////////////////////////////////////////////////////
//
// The following part is executed in content page scope
//

// There is no significant need to execute in content space scope.
// A bit is jQuery has already loaded in content space scope.

function colorize()
{
	var spec = [
	// Delphi 7
		[ 'Delphi',    'l-delphi',  'background-color: #ffff99 !important; border: dashed #ff6633;' ],
	// Free Pascal 2
		[ 'FPC',       'l-fpc',     'background-color: #ffff99 !important;' ],

	// GNU C++0x 4
		[ 'GNU C++0x', 'l-gcpp0x',  'background-color: #ccffff !important; border: double #6666ff;' ],
	// GNU C++ 4.6
		[ 'GNU C++',   'l-gcpp',    'background-color: #ccffff !important;' ],
	// GNU C 4
		[ 'GNU C',     'l-gcc',     'background-color: #ccffff !important; border: dotted #6666ff;' ],
	// Microsoft Visual C++ 2005+
		[ 'MS C++',    'l-mscpp',   'background-color: #ccffff !important; border: dashed #6666ff;' ],

	// Java 7
		[ 'Java 7',    'l-java7',   'background-color: #ffccff !important; border: dashed #ff33ff;' ],
	// Java 6
		[ 'Java 6',    'l-java6',   'background-color: #ffccff !important;' ],

	// C# Mono 2.6+
		[ 'Mono C#',   'l-mncsharp','background-color: #ffcc99 !important;' ],
	// MS C# .Net 4
		[ 'MS C#',     'l-mscsharp','background-color: #ffcc99 !important; border: dashed #ff33ff;' ],

	// D
		[ 'D',         'l-d',       'background-color: #00ff99 !important;' ],
	// Go
		[ 'Go',        'l-go',      'background-color: #33cccc !important;' ],

	// Perl 5.12+
		[ 'Perl',      'l-perl',    'background-color: #ccff99 !important; border: dashed #6666ff;' ],
	// PHP 5.2+
		[ 'PHP',       'l-php',     'background-color: #ccff99 !important; border: solid #cc00ff;' ],
	// Python 2.6+
		[ 'Python 2',  'l-python2', 'background-color: #ccff99 !important; border: solid #00cc00;' ],
	// Python 3
		[ 'Python 3',  'l-python3', 'background-color: #ccff99 !important; border: dashed #00cc00;' ],
	// Ruby 1.7+
		[ 'Ruby',      'l-ruby',    'background-color: #ccff99 !important; border: solid #6666ff;' ],

	// Haskell GHC 6.12
		[ 'Haskell',   'l-haskell', 'background-color: #ccccff !important; border: solid #cc00ff;' ],
	// OCaml 3.11
		[ 'Ocaml',     'l-ocaml',   'background-color: #ccccff !important; border: solid #00cc00;' ],
	// Scala 2.9
		[ 'Scala',     'l-scala',   'background-color: #ccccff !important; border: solid #6666ff;' ],

	];

	$('table.standings').css('border-collapse', 'separate');

	var style = '<style>.color-legend { border: solid #e1e1e1 1px; }\n';
	var legend = '<table style="margin-left: auto; margin-right: auto; border-collapse: separate;"><tr>';

	for(var i = 0; i < spec.length; ++i) {
		style += 'td.' + spec[i][1] + ' { ' + spec[i][2] + ' }\n';
		legend += '<td style="padding: 0.5em;" class="color-legend ' + spec[i][1] + '">' + spec[i][0] + '</td>';
	}

	style += 'td.highlight-by-lang { background-repeat: no-repeat; background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAv1QTFRFAIAAAAAAgIAAAACAgACAAICAgICAwMDA/wAAAP8A//8AAAD//wD/AP//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzAABmAACZAADMAAD/ADMAADMzADNmADOZADPMADP/AGYAAGYzAGZmAGaZAGbMAGb/AJkAAJkzAJlmAJmZAJnMAJn/AMwAAMwzAMxmAMyZAMzMAMz/AP8AAP8zAP9mAP+ZAP/MAP//MwAAMwAzMwBmMwCZMwDMMwD/MzMAMzMzMzNmMzOZMzPMMzP/M2YAM2YzM2ZmM2aZM2bMM2b/M5kAM5kzM5lmM5mZM5nMM5n/M8wAM8wzM8xmM8yZM8zMM8z/M/8AM/8zM/9mM/+ZM//MM///ZgAAZgAzZgBmZgCZZgDMZgD/ZjMAZjMzZjNmZjOZZjPMZjP/ZmYAZmYzZmZmZmaZZmbMZmb/ZpkAZpkzZplmZpmZZpnMZpn/ZswAZswzZsxmZsyZZszMZsz/Zv8AZv8zZv9mZv+ZZv/MZv//mQAAmQAzmQBmmQCZmQDMmQD/mTMAmTMzmTNmmTOZmTPMmTP/mWYAmWYzmWZmmWaZmWbMmWb/mZkAmZkzmZlmmZmZmZnMmZn/mcwAmcwzmcxmmcyZmczMmcz/mf8Amf8zmf9mmf+Zmf/Mmf//zAAAzAAzzABmzACZzADMzAD/zDMAzDMzzDNmzDOZzDPMzDP/zGYAzGYzzGZmzGaZzGbMzGb/zJkAzJkzzJlmzJmZzJnMzJn/zMwAzMwzzMxmzMyZzMzMzMz/zP8AzP8zzP9mzP+ZzP/MzP///wAA/wAz/wBm/wCZ/wDM/wD//zMA/zMz/zNm/zOZ/zPM/zP//2YA/2Yz/2Zm/2aZ/2bM/2b//5kA/5kz/5lm/5mZ/5nM/5n//8wA/8wz/8xm/8yZ/8zM/8z///8A//8z//9m//+Z///M////eyQG1gAAAAF0Uk5TAEDm2GYAAAA/SURBVBjTXcjBEQAwBAVRqSZVqjS9mCCIb2/7SEYkB+IBvBH0Aew7+Dd4/yG+ID+hPoAXAbR36G8Ar4BPMv4CC5KBJwNtIOoAAAAASUVORK5CYII="); }\n</style>';
	legend += '</tr></table>';

	$('head').append(style);
	$('div.contest-name').parent().after(legend);

	if(navigator.userAgent.indexOf('Opera') != -1) { // Yes, I know this is ugly solution...
		style = '<style>\n';
		for(var i = 0; i < spec.length; ++i) {
			var tw = $('td.'+ spec[i][1]).css('border-top-width');
			var lw = $('td.'+ spec[i][1]).css('border-left-width');
			var pos = tw + ' ' + lw;
			style += 'td.' + spec[i][1] + ' { background-position: ' + pos + '; }\n';
		}
		style += '</style>';
		$('head').append(style);
	}

	for(var i = 0; i < spec.length; ++i) {
		var key = 'colorize_standings_cf_' + spec[i][1];
		$('td[title$="'+ spec[i][0] + '"]').addClass(spec[i][1]);
		if(Codeforces.getCookie(key) == 1) {
			$('td.'+ spec[i][1]).addClass('highlight-by-lang');
		}
		$('td.'+ spec[i][1]).click((function(k, c) { return function() {
			if(Codeforces.getCookie(k) == 1) {
				document.cookie = k + '=0; expires=Mon, 4-Jun-2012 00:00:00 GMT; path=/';
			} else {
				document.cookie = k + '=1; path=/';
			}
			$(c).toggleClass('highlight-by-lang'); }; })(key, 'td.'+ spec[i][1])
		);
	}
}


///////////////////////////////////////////////////////////////////////
//
// The following part is executed in userjs scope.
//

script = document.createElement('script');
script.setAttribute("type", "application/javascript");
script.textContent = '$(document).ready(' + colorize + ');';

document.body.appendChild(script);
document.body.removeChild(script);
