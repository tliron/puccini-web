$(function () {
	$('body').layout({
		north__resizable: false,
		east__size: '50%',
		south__size: '20%',
		livePaneResizing: true,
		onresize: function () {
			source.resize();
			stdout.resize();
			stderr.resize();
			return true
		}
	});

	$('.toolbar button').button();
	$('.toolbar input').checkboxradio();

	const examplesWidget = $('#examples').selectmenu()
	.on('selectmenuselect', function (e, ui) {
		loadFromUrl(ui.item.value);
		$('#examples').val('').selectmenu('refresh');
	});
	for (var i in examples) {
		var example = examples[i];
		examplesWidget.append(`<option value="${example}">${example}</option>`);
	}

	$("#url-dialog").dialog({
		autoOpen: false,
		modal: true,
		width: 'auto',
		buttons: {
			'Parse and Compile': function () {
				// Try: https://raw.githubusercontent.com/apache/incubator-ariatosca/master/examples/hello-world/hello-world.yaml
				$(this).dialog('close');
				const url = $('#url-field').val()
				loadFromUrl(url);
				const args = [url];
				addPucciniFlags(args);
				reset();
				Puccini.compileUrl.apply(null, args);
			}
		}
	});

	$('#compile').click(function (e) {
		const args = [source.getValue()];
		addPucciniFlags(args);
		reset();
		Puccini.compileYaml.apply(null, args);
	});

	$('#visualize').click(function (e) {
		const args = [source.getValue()];
		const href = /^.*\//.exec(window.location.href.split('?')[0]);
		args.push(`--exec=${href}js/vis.js`);
		reset(true);
		Puccini.compileYaml.apply(null, args);
	});

	$('#url').click(function (e) {
		$("#url-dialog").dialog('open');
	});

	$('#version').click(function (e) {
		reset();
		Puccini.version();
	});

	source = ace.edit('source', {
		mode: 'ace/mode/yaml',
		theme: 'ace/theme/sqlserver',
		fontFamily: 'Source Code Pro',
		fontSize: '12pt',
		showPrintMargin: false,
		highlightActiveLine: false
	});

	stdout = ace.edit('stdout', {
		readOnly: true,
		mode: 'ace/mode/yaml',
		theme: 'ace/theme/sqlserver',
		fontFamily: 'Source Code Pro',
		fontSize: '12pt',
		showPrintMargin: false,
		highlightActiveLine: false
	});

	stderr = ace.edit('stderr', {
		readOnly: true,
		theme: 'ace/theme/sqlserver',
		fontFamily: 'Source Code Pro',
		fontSize: '12pt',
		showPrintMargin: false,
		highlightActiveLine: false
	});

	if ('WebAssembly' in window) {
		Puccini.init(printStdout, printStderr, function () {
			$('button').button('enable');

			const load = getUrlParam('load');
			if (load !== undefined)
				loadFromUrl(load);
		}, onExit);
	} else {
		printStderr('This browser doesn\'t support WebAssembly!\n');
	}

	return true;
});

const Range = ace.require('ace/range').Range;

var source;
var stdout;
var stderr;
var visualizing;
const markers = [];

function reset(visualize) {
	visualizing = visualize || false;
	$('#network').css('visibility', 'hidden');
	$('#stdout').css('visibility', 'visible');
	const session = source.getSession(); 
	session.setAnnotations([]);
	while (marker = markers.pop())
		session.removeMarker(marker);
	stdout.setValue('', -1);
	stdout.resize();
	stderr.setValue('', -1);
	stderr.resize();
}

function printStdout(text) {
	stdout.navigateFileEnd();
	stdout.insert(text);
	stdout.resize();
	stdout.scrollToRow(stdout.getCursorPosition().row);
}

function printStderr(text) {
	console.log(text);
	stderr.navigateFileEnd();
	stderr.insert(text);
	stderr.resize();
}

function onExit(code) {
	if (code === 0) { 
		stderr.setValue('Success!\n', -1);
		if (visualizing) {
			visualizing = false;
			visualize();
		}
		return;
	}

	visualizing = false;

	const session = source.getSession(); 
	const annotations = [];
	const messages = [];
	var scrollToRow = Infinity;

	const problems = JSON.parse(stderr.getValue()).Problems;
	for (var i in problems) {
		const problem = problems[i];
		const message = problem.message;

		function add(row, column, marker) {
			var m = message;
			if (row !== undefined) {
				if (column !== -1)
					m = `@${row},${column}: ${m}`;
				else {
					m = `@${row}: ${m}`;
					column = 1;
				}
			} else {
				row = 1;
				column = 1;
			}
			if (problem.section)
				m = `${problem.section} ${m}` 
			messages.push(m);

			row--;
			column--;

			if (row < scrollToRow)
				scrollToRow = row;

			annotations.push({
				row: row,
				column: column,
				text: message,
				type: 'error'
			});

			if (marker)
				markers.push(session.addMarker(new Range(row, column, row, Infinity), 'error', 'text'));
		}

		if (problem.row !== -1)
			add(problem.row, problem.column, true);
		else
			add();
	}

	session.setAnnotations(annotations);
	if (scrollToRow !== Infinity)
		source.scrollToRow(scrollToRow);
	stderr.setValue('Problems:\n' + messages.join('\n'), -1);
}

function addPucciniFlags(args) {
	if ($('#coerce').is(':checked')) {
		args.push('--coerce');
	}
	if (!$('#resolve').is(':checked')) {
		args.push('--resolve=false');
	}
}

function loadFromUrl(url) {
	if (!url)
		return;
	$.ajax({
		url: url,
		cache: false,
		success: function (data) {
			reset();
			source.setValue(data, -1);
			source.resize();
		}
	});
}

function visualize() {
	const value = JSON.parse(stdout.getValue());
	const nodes = new vis.DataSet(value.nodes);
	const edges = new vis.DataSet(value.edges);
	new vis.Network(
		document.getElementById('network'),
		{
			nodes: nodes,
			edges: edges
		},
		{
			layout: {
				randomSeed: 1,
				improvedLayout: true
			}
		}
	);
	$('#stdout').css('visibility', 'hidden');
	$('#network').css('visibility', 'visible');
}

// See: https://stackoverflow.com/a/21903119
function getUrlParam(param) {
	const url = window.location.search.substring(1);
	const urlParams = url.split('&');
	for (var i in urlParams) {
		const urlParamName = urlParams[i].split('=');
		if (urlParamName[0] === param)
			return urlParamName[1] === undefined ? true : decodeURIComponent(urlParamName[1]);
	}
	return undefined;
}
