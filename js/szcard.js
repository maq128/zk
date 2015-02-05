
var pys = {
	a: 'āáǎà',
	o: 'ōóǒò',
	e: 'ēéěè',
	i: 'īíǐì',
	u: 'ūúǔù',
	v: 'ǖǘǚǜü',
	g: 'ɡ'
};

function setCookie( name, value )
{
	var exp = new Date();
	exp.setTime( exp.getTime() + 30*24*60*60*1000 );
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

function getCookie( name )
{
	var arr = document.cookie.match( new RegExp( "(^| )" + name + "=([^;]*)(;|$)" ) );
	if ( arr != null ) return parseInt( unescape( arr[2] ) );
	return null;
}

function makeCard( py, hz )
{
	return $('<td class="card"></td>')
		.append( '<table><tr><td class="py">' + py + '</td></tr><tr><td class="hz">' + hz + '</td></tr></table>' );
}

function showBook( bookTo )
{
    courses = books[bookTo];
}

function showList( sz, combin, skipTo )
{
	// 每张 A4 纸能打印的字卡数量
	var num = 12;
	switch ( sz ) {
	case 2: num = 8; break;
	case 3: num = 6; break;
	}

	var new_courses = { };
	if ( combin == 1 ) {
		for ( var course in courses ) {
			if ( skipTo && course != skipTo ) continue;
			skipTo = null;

			var chars = courses[ course ];
			var arr = chars.split( ' ' );
			if ( arr.length <= num ) {
				new_courses[ course ] = chars;
			} else {
				var part = 1;
				while ( arr.length > 0 ) {
					chars = arr.splice( 0, num ).join( ' ' );
					new_courses[ course + '/' + (part++) ] = chars;
				}
			}
		}
	} else {
		var name_buf = [];
		var char_buf = [];

		for ( var course in courses ) {
			if ( skipTo && course != skipTo ) continue;
			skipTo = null;

			var chars = courses[ course ];
			name_buf.push( course );
			char_buf = char_buf.concat( chars.split( ' ' ) );
			var seq = 0;
			while ( char_buf.length >= num ) {
				var name = name_buf.join('/');
				for ( var i = 0; i < seq; i ++ ) {
					name += '.';
				}
				new_courses[ name ] = char_buf.splice( 0, num ).join( ' ' );
				name_buf = char_buf.length > 0 ? [ course ] : [];
				seq ++;
			}
		}

		if ( char_buf.length > 0 ) {
			new_courses[ name_buf.join('/') ] = char_buf.join( ' ' );
		}
	}

	var divList = $( '#list' ).empty();
	for ( var course in new_courses ) {
		var chars0 = new_courses[ course ];
        var chars = "";
        var list = chars0.split( ' ' );
        for ( var i = 0; i < list.length; i ++ ) {
            var one = list[i];
            if (one.length < 2) {
console.log ("debug", "check py: " + one);
                if (hanpymap[one.charAt(0)]) {
                    hlist = hanpymap[one.charAt(0)].split( ' ' );
                    one += hlist[0];
                    console.log ("debug", "got new py: " + one);
                }
            }
            chars += one + " ";
        }
		$('<p><a target="_blank" href="?' + encodeURIComponent( chars ) + '">【' + course + '】' + chars + '</a></p>')
			.appendTo( divList );
	}
}

function resetList (sz, combin)
{
	var skipTo = null;
    // 设置“跳过”选项，并监听修改操作
    var selSkipTo = $( '#skip-to' );
    selSkipTo.empty();
    for ( var course in courses ) {
        $('<option value="' + course + '">' + course + '</option>')
            .appendTo( selSkipTo );
        if ( ! skipTo ) {
            skipTo = course;
            selSkipTo.val( skipTo );
        }
    }
    selSkipTo.change( function( evt ) {
        skipTo = selSkipTo.val();
        showList( sz, combin, skipTo );
    });

    showList( sz, combin, skipTo );
}


var hanpymap = {};

function set_hanpymap (txtfilename) {
    console.log ("debug", "begin set_hanpymap ...");
    var count = 0;

    var config = {
        //worker: true,
        //download: false,
        delimiter: "	",
        step: function(results, parserHandle) {
            var val;
            //stepped++;
            //rows += results.data.length;
            // parserHandle.pause();
            //console.log("Row:", results.data[0]);
            if (results.data[0][1]) {
                if ((results.data[0][0].charAt(0) != '#') && (results.data[0][1] == "kMandarin")) {
                    val = String.fromCharCode(parseInt (results.data[0][0].slice(2,6), 16));
                    hanpymap[val] = results.data[0][2].toLowerCase();
                    //console.log("debug", "map: " + val + "=" + hanpymap[val]);
                    count ++;
                }
            }
        },
        complete: function(results) {
            console.log("Finished:", "count=" + count);
            reLoadBook();
        },
        error: function errorFn(error, file) {
            console.log("ERROR:", error, file);
        },
    };
    var files = $('#mapfiles')[0].files;
    if (files.length < 1) {
        console.log ("debug", "file '" + files + "'.length <= 0");
        config["download"] = true;
    } else {
        //config["download"] = false;
    }
    if (config["download"]) {
        console.log ("debug", "parse '" + txtfilename + "' ...");
        $.get(txtfilename, function(data) {
        var results = Papa.parse(data, config);
        }, 'text');
    } else {
        console.log ("debug", "parse '" + files + "' ...");

        $('#mapfiles').parse({
            config: config,
            before: function(file, inputElem)
            {
                console.log("Parsing file:", file);
            },
            complete: function()
            {
                console.log("Done with all files.");
            }
        });
        console.log ("debug", "endof '" + files + "'");
    }
}

function reLoadBook () {
    var sz = getCookie( 'sz' );
    if ( sz != 2 && sz != 3 ) sz = 1;
    var combin = getCookie( 'combin' );
    if ( combin != 2 ) combin = 1;
    resetList (sz, combin);
}

function onLoad()
{
	// 根据 cookie 的记录设置选项
	var sz = getCookie( 'sz' );
	if ( sz != 2 && sz != 3 ) sz = 1;
	var combin = getCookie( 'combin' );
	if ( combin != 2 ) combin = 1;
	var bg = getCookie( 'bg' );
	if ( bg != 2 ) bg = 1;
	var bookTo = null;

//$('#mapfiles').value="Unihan_Readings-small.txt";
$('#mapfiles').change(function(e){ set_hanpymap(""); });

console.log ("debug", "start set_hanpymap ...");
//set_hanpymap('file://Unihan_Readings-small.txt');
set_hanpymap('sine.csv');
console.log ("debug", "end set_hanpymap.");

	var qs = window.location.search.substr( 1 );
	if ( qs.length == 0 ) {
		// 设置字卡尺寸选项按钮，并监听修改操作
		$( '#sz-' + sz ).get(0).checked = true;
		$( 'input[name=sz]' ).click( function( evt ) {
			sz = parseInt( evt.currentTarget.value );
			setCookie( 'sz', sz );
			//showList( sz, combin, skipTo );
			reLoadBook();
		});

		// 设置组合模式选项按钮，并监听修改操作
		$( '#combin-' + combin ).get(0).checked = true;
		$( 'input[name=combin]' ).click( function( evt ) {
			combin = parseInt( evt.currentTarget.value );
			setCookie( 'combin', combin );
			//showList( sz, combin, skipTo );
			reLoadBook();
		});

		// 设置卡片格式选项按钮，并监听修改操作
		$( '#bg-' + bg ).get(0).checked = true;
		$( 'input[name=bg]' ).click( function( evt ) {
			bg = parseInt( evt.currentTarget.value );
			setCookie( 'bg', bg );
		});

		// 设置课本
		var selBook = $( '#booksel' );
		for ( var book in books ) {
			$('<option value="' + book + '">' + book + '</option>')
				.appendTo( selBook );
			if ( ! bookTo ) {
				bookTo = book;
				selBook.val( bookTo );
				showBook( bookTo );
			}
		}
		selBook.change( function( evt ) {
			bookTo = selBook.val();
			showBook( bookTo );
			resetList (sz, combin);
		});
		resetList (sz, combin);

		// 显示首页的列表
		showList( sz, combin, skipTo );
		return;
	}

	// 清空页面，生成每个字卡
	$( document.body ).empty();
	qs = decodeURIComponent( qs );
	var list = qs.split( ' ' );
	var table = $('<table class="page"></table>').appendTo( document.body );
	var tr = null;
	var num = 3; // 每行能显示的卡片个数
	if ( sz == 2 ) num = 4;
	for ( var i = 0; i < list.length; i ++ ) {
		var one = list[i];
		var py = one.substr( 1 ).replace( /([aoeiuvg])(\d)|(g)/g , function( m, a, t, g ) {
			if ( g ) return pys[g];
			return pys[a].charAt( t - 1 );
		});;
		var hz = one.substr( 0, 1 );

		if ( i % num == 0 ) {
			tr = $('<tr></tr>').appendTo( table );
		}
		tr.append( makeCard( py, hz ) );
	}

	// 设置字卡尺寸
	switch ( sz ) {
	case 2:
		$('.card .py')
			.height( 40 )
			.css( 'line-height', '40px' )
			.css( 'font-size', '36px' );
		$('.card .hz')
			.width( 210 )
			.height( 210 )
			.css( 'line-height', '190px' )
			.css( 'font-size', '190px' );
		break;
	case 3:
		$('.card .py')
			.height( 40 )
			.css( 'line-height', '40px' )
			.css( 'font-size', '36px' );
		$('.card .hz')
			.width( 270 )
			.height( 270 )
			.css( 'line-height', '240px' )
			.css( 'font-size', '240px' );
		break;
	}

	$('.card .hz')
		.css( 'background-image', bg == 1 ? 'url(img/bg_2.gif)' : 'url(img/bg_4.gif)' );
}
