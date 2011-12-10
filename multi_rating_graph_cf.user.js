// ==UserScript==
// @name           Multi rating graph for Codeforces
// @namespace      http://yak2.myhome.cx/
// @description    Enable to show rating history graph with other accounts on profile pages at Codeforces
// @license        http://creativecommons.org/publicdomain/zero/1.0/
// @copyright      yak_ex
// @version        0.03
// @include        http://www.codeforces.com/profile/*
// @include        http://codeforces.com/profile/*
// @include        http://www.codeforces.ru/profile/*
// @include        http://codeforces.ru/profile/*
// ==/UserScript==

// v0.01 2011/04/16 Initial version
// v0.02 2011/04/16 Adjust yaxis scale
//                  Warn if data can't be obtained
// v0.03 2011/04/17 Show log-in account always

///////////////////////////////////////////////////////////////////////
//
// The following part is executed in content page scope
//

function extract_data(cont)
{
	var re1 = new RegExp('data\\.push\\(([\\S\\s]*?)\\);', 'm');
	return re1.test(cont) ? RegExp.$1 : undefined;
}

function extract_scale(cont)
{
	var re2 = new RegExp('yaxis: { min: (\\d+), max: (\\d+),');
	return re2.test(cont) ? [RegExp.$1, RegExp.$2] : undefined;
}

function get_account_data(id)
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://' + window.location.host + '/profile/' + id, false);
	xhr.send(null);
	if(xhr.status == 200) {
		return [extract_data(xhr.responseText), extract_scale(xhr.responseText)];
	}
	return undefined;
}

function update_graph(input)
{
	if(input == null) return;
	var handle = window.location.href.match(/[^/]*$/);
	input = handle + ' ' + input;
	var accounts = input.split(' ');
	var check = {};
	data = new Array();
	datas = [];
	var mymin = 900, mymax = 2000;
	var idx = 0;
	for(var i = 0; i < accounts.length; ++i) {
		if(accounts[i] != '' && check[accounts[i]] == undefined) {
			check[accounts[i]] = 1;
			var d = get_account_data(accounts[i]);
			if(d != undefined && d[0] != undefined) {
				data.push(eval(d[0]));
				datas[idx] = { label: accounts[i], data: data[idx] };
				++idx;
				if(d[1] != undefined) {
					if(d[1][0] < mymin) mymin = d[1][0];
					if(d[1][1] > mymax) mymax = d[1][1];
				}
			} else {
				alert("Can't get information for account: " + accounts[i] + ".");
			}
		}
	}
	if(idx == 1) {
		options.legend.position = "ne";
	} else {
		options.legend.position = "se";
	}
	options.yaxis.min = mymin;
	options.yaxis.max = mymax;
	plot = $.plot($("#placeholder"), datas, options);
	$("#placeholder .legend").unbind("click");
	$("#placeholder .legend").bind("click", account_manage);
}

function account_manage()
{
	var handle = window.location.href.match(/[^/]*$/);
	var input = prompt("Input space-separated accounts without this account.", handle !=  login_account ? login_account : '');
	update_graph(input);
}

///////////////////////////////////////////////////////////////////////
//
// The following part is executed in userjs scope.
//

function add_unbind(cont)
{
	var marker = '$("#placeholder").bind("plothover"';
	return cont.replace(marker, '$("#placeholder").unbind("plothover");\n' + marker);
}

function get_login_account()
{
	var e = document.getElementById('header');
	var re3 = new RegExp('<a href="/profile/([^"]*)">[^<]*</a>[^<]*<a href="/logout">');
	return re3.test(e.innerHTML) ? RegExp.$1 : undefined;
}

function disable_default_plot(cont)
{
	return cont.replace('var plot = $.plot($("#placeholder"), datas, options);', '').replace('var ctx = plot.getCanvas().getContext("2d");', '');
}

function add_account_manage(cont)
{
	var marker = 'var prev = -1;';
	var target = '';
	target += 'var extract_data = ' + extract_data + ';\n';
	target += 'var extract_scale = ' + extract_scale + ';\n';
	target += 'var get_account_data = ' + get_account_data + ';\n';
	var login_account = get_login_account();
	if(login_account != undefined) {
		target += 'var login_account = "' + get_login_account() + '";\n';
	} else {
		target += 'var login_account = "";\n';
	}
	target += 'options.legend = {};\n';
	target += 'var account_manage;\n';
	target += 'var update_graph = ' + update_graph + ';\n';
	target += 'account_manage = ' + account_manage + ';\n';
	target += 'update_graph(login_account);\n';
	target += '$("#placeholder .legend").unbind("click");\n';
	target += '$("#placeholder .legend").bind("click", ' + account_manage + ');\n';

	return cont.replace(marker, target + marker);
}

function get_target_script()
{
	var e = document.getElementById('content').getElementsByTagName('script');
	for(var i = 0; i < e.length; ++i) {
		if(e[i].textContent.match(/data\.push/) != null) {
			return e[i];
		}
	}
}

script = document.createElement('script');
script.setAttribute("type", "application/javascript");
script.textContent = disable_default_plot(add_account_manage(add_unbind(get_target_script().textContent)));

document.body.appendChild(script);
document.body.removeChild(script);
