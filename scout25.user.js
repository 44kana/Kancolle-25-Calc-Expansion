// ==UserScript==
// @name        艦これ2-5 索敵値計算機＋αの隠し味
// @version     0.0
// @description 2-5 索敵値計算機＋αの装備を保存します。
// @include     http://tsoft-web.com/sub/kancolle/2-5/e/*
// @author      44kana
// @namespace   https://github.com/44kana/
// @license     MIT; https://github.com/44kana/Kancolle-25-Calc-Expansion/blob/master/LICENSE
// @copyright   2014, 44kana
// ==/UserScript==

// 警告抑制
/* jshint browser:true */
/* jshint jquery:true */
var addItem;
var val;


(function(d, fn){
	'use strict';
	var s = d.createElement('script');
	if(typeof fn === 'function'){
		fn = '(' + fn + ')();';
	}
	s.textContent = '' + fn;
	d.body.appendChild(s);
	d.body.removeChild(s);
})(document, function(){$(function($){
	'use strict';
	function hashalert(h,s,i){s='';for(i in h){s+=i+' : '+h[i]+'\n';}alert(s);}
	var Storage = (function(l, m){
		return {
			set : function(k,s){
				l.setItem(m+k,s);
			},
			get : function(k){
				return l.getItem(m+k);
			}
		};
	})(localStorage, "scout25-");
	function _setDeck(data){
		var fleet = data.n===undefined?Binder.binder()[$(this).index()]:data,
			i=0, l=0, $o = $('<optoin>'), o;
		fleet = JSON.parse(JSON.stringify(fleet));
		val = { survey: 0, rader: 0, others: 0 };
		$('#items div').each(function(){
			$(this).remove();
		});
		$('#multiple').val(fleet.n);
		$('#plus').val(fleet.plus);
		$('#sum').val(fleet.sum);
		for(i=0,l=fleet.items.length;i<l;i++){
			o = fleet.items[i];
			$o
			.val(items.getVal(o))
			.attr("title", "索敵："+items.getVal(o))
			.attr('data-type',items.getType(o))
			.html(items.getName(o));
			addItem($o, '#items');
		}
		return false;
	}
	var Binder = (function(w, d, $){
		var _key = 'binder',
			_binder = [],
			$combtn,
			$template,
		_setBinder = function(){
			var $li,
				$ul,
				$span = $('<span/>'),
				i=0;

			$combtn = $span.clone().addClass('combtn link').css({zIndex:'5'})
			.hover(
				function(){
				this.style.backgroundColor = 'rgba(153, 238, 255, 0.5)';
			},
				function(){
				this.style.backgroundColor = '';
			});

			$template = $('<li class="binder">')
			.hover(function(){
				this.childNodes[1].style.display='block';
			}, function(){
				this.childNodes[1].style.display='none';
			})
			.on('click', _setDeck)
			.css({position:'relative',width:'100%'})
			.append($span.clone().addClass('name'))
			.append($span.clone().addClass('com')
					.css({display:'none',
						 position:'absolute',
						 right:'0px',
						 bottom:'0px',
						 backgroundColor:'#FFF'})
					.hover(function(){
						this.style.boxShadow = '0 0 10px rgba(0, 204, 255, .4) inset';
					}, function(){
						this.style.boxShadow = '';
					})
					.append($combtn.clone(true)
						   .text('編')
						   .on('click', Binder.edit))
					.append($combtn.clone(true)
						   .text('Ur')
						   .on('click', Binder.createUrl))
					.append($combtn.clone(true)
						   .text('↑')
						   .on('click', {type:-1}, Binder.moverecipe))
					.append($combtn.clone(true)
						   .text('↓')
						   .on('click', {type:2}, Binder.moverecipe))
					.append($combtn.clone(true)
						   .text('書')
						   .on('click', Binder.saverecipe))
					.append($combtn.clone(true)
						   .text('消')
						   .on('click', Binder.deleterecipe))
					);

			$('<li id="binder-last" class="binder last">')
			.append($('<h3>').addClass('binder link op')
						   .text('セーブ ')
					.append($combtn.clone(true)
						   .text('追加'))
						   .on('click',Binder.add)
					.append($combtn.clone(true)
						   .text('保存')
						   .on('click',Binder.save)))
			.appendTo($('#list'));
			$ul = $('<ul id="binder">')
			.css({listStyleType:"none",padding:'0'});
			for(i=0;i<_binder.length;i++){
				$li = $template.clone(true,true);
				$li.children('.name').text(_binder[i].name);
				$ul.append($li);
			}
			$('#binder-last')
			.append($ul);
			$ul.append($('<li>'));
		},
		_decordURL = function(){
			var url = location.search.substring(1);
			if(url === ''){
				return;
			}
			var data      = url.split('&'),
				tmpBinder = {},
				i, l;

			for(i=0,l=data.length;i<l;i++){
				tmpBinder[data[i].split('=')[0]] =
					JSON.parse(decodeURIComponent(data[i].split('=')[1]));
			}
			_setDeck(tmpBinder);
			return;
		},
		_makeSaveData = function(){
			var sav = {
				n      : $('#multiple').val() || 2,
				plus   : $('#plus').val()     || '',
				sum    : $('#sum').val()      || 0,
				result : $('#result').val()   || 0
			};
			sav.name = '新しい索敵 : ' + sav.result;
			sav.items = [];
			$('#items div').each(function(){
				sav.items[sav.items.length] = items.getId($(this).text());
			});
			return sav;
		};
		return {
			init : function(){
				_decordURL();
				_binder = (_binder=Storage.get(_key))?JSON.parse(_binder):[];
				_setBinder();
			},
			binder : function(){
				return _binder;
			},
			// 新規追加
			add : function(){
				var sav = _makeSaveData();
				if(JSON.stringify(_binder).indexOf(JSON.stringify(sav)) === -1){
					_binder[_binder.length] = sav;
					$template.clone(true,true)
					.children('.name')
					.text(sav.name)
					.end()
					.appendTo('#binder');
				}
				return false;
			},
			// ローカルストレージに格納
			save : function(){
				Storage.set(_key, JSON.stringify(_binder));
				alert('localStorageに\n\n  '+Storage.get(_key)+'\n\nを保存しました');
				return false;
			},
			// 項目表示名変更
			edit : function(){
				var $li   = $(this).parent().parent(),
					n     = $li.index(),
					input = prompt('表示名 :', _binder[n].name);

				switch(input){
					case null:			  // キャンセル
					case '':			  // 入力なし
					case _binder[n].name: // 変更なし
						break;
					default:
						_binder[n].name  = input;
						$li[0].childNodes[0].innerText = input;
						break;
				}
				return false;
			},
			createUrl : function(){
				var $li = $(this).parent().parent(),
					n   = $li.index(),
					str = [],
					t   = $.extend(true, {}, _binder[n]),
					url = 'http://tsoft-web.com/sub/kancolle/2-5/e/?',
					i;

				// 表示名は提示しなくても……いいよね？
				delete t.name;

				for(i in t){
					str[str.length] = i + '=' + JSON.stringify(t[i]);
				}
				str = url + str.join('&');
				prompt('コピーしてお使いください。', str);
				return false;
			},
			// 項目移動
			moverecipe : function(e){
				var $li = $(this).parent().parent(),
					l   = _binder.length+1,
					n   = $li.index(),
					s   = e.data.type,
					t   = _binder[n],
					dmy = 'dmy';

				// ここもうちょいきれいにしたいね
				_binder.splice((n+s+l)%l, 0, dmy);
				_binder.filter(function(v, i, arr){
					if(v === t){
						t = JSON.parse(JSON.stringify(t));
						arr.splice(i, 1);
					}
				});
				_binder.some(function(v, i, arr){
					if(v === dmy){
						arr[i] = t;
					}
				});

				$li.insertBefore($($li.parent()[0].childNodes[(n+s+l)%l]));
				return false;
			},
			// 項目上書き
			saverecipe : function(){
				var $li = $(this).parent().parent(),
					sav = _makeSaveData();
				_binder[$li.index()] = sav;
				$li.children('.name').text(sav.name);
				return false;
			},
			// 項目削除
			deleterecipe : function(){
				var $li = $(this).parent().parent();
				_binder.splice($li.index(), 1);
				$li.remove();
				return false;
			}
		};
	})(window, document, $);
	var items = (function(){
		var _item = [
			{ id : 16, value: 1, type: "attack", name : "九七式艦攻" },
			{ id : 17, value: 1, type: "attack", name : "天山" },
			{ id : 18, value: 1, type: "attack", name : "流星" },
			{ id : 25, value: 5, type: "survey", name : "零式水上偵察機" },
			{ id : 26, value: 6, type: "survey", name : "瑞雲" },
			{ id : 27, value: 3, type: "rader", name : "13号対空電探" },
			{ id : 28, value: 5, type: "rader", name : "22号対水上電探" },
			{ id : 29, value: 7, type: "rader", name : "33号対水上電探" },
			{ id : 30, value: 4, type: "rader", name : "21号対空電探" },
			{ id : 31, value:10, type: "rader", name : "32号対水上電探" },
			{ id : 32, value: 5, type: "rader", name : "14号対空電探" },
			{ id : 52, value: 2, type: "attack", name : "流星改" },
			{ id : 54, value: 9, type: "survey", name : "彩雲" },
			{ id : 57, value: 1, type: "bombers", name : "彗星一二型甲" },
			{ id : 59, value: 6, type: "survey", name : "零式水上観測機" },
			{ id : 61, value: 7, type: "survey", name : "二式艦上偵察機" },
			{ id : 62, value: 6, type: "survey", name : "試製晴嵐" },
			{ id : 79, value: 6, type: "survey", name : "瑞雲(六三四空)" },
			{ id : 80, value: 6, type: "survey", name : "瑞雲12型" },
			{ id : 81, value: 7, type: "survey", name : "瑞雲12型(六三四空)" },
			{ id : 82, value: 2, type: "attack", name : "九七式艦攻(九三一空)" },
			{ id : 83, value: 2, type: "attack", name : "天山(九三一空)" },
			{ id : 88, value: 5, type: "rader", name : "22号対水上電探改四" },
			{ id : 89, value: 6, type: "rader", name : "21号対空電探改" },
			{ id : 93, value: 4, type: "attack", name : "九七式艦攻(友永隊)" },
			{ id : 94, value: 5, type: "attack", name : "天山一二型(友永隊)" },
			{ id : 96, value: 1, type: "fighter", name : "零式艦戦21型(熟練)" },
			{ id : 97, value: 2, type: "bombers", name : "九九式艦爆(熟練)" },
			{ id : 98, value: 2, type: "attack", name : "九七式艦攻(熟練)" },
			{ id : 99, value: 3, type: "bombers", name : "九九式艦爆(江草隊)" },
			{ id :100, value: 4, type: "bombers", name : "彗星(江草隊)" },
			{ id :102, value: 3, type: "survey", name : "九八式水上偵察機(夜偵)" },
			{ id :106, value: 4, type: "rader", name : "13号対空電探改" },
			{ id :111, value: 1, type: "bombers", name : "彗星(六〇一空)" },
			{ id :112, value: 2, type: "attack", name : "天山(六〇一空)" }
		];
		return {
			getName : function(_id){
				var i,l = _item.length;
				for(i=0;i<l;i++){
					if(_item[i].id === _id){
						return _item[i].name;
					} 
				}
			},
			getId : function(_name){
				var i,l = _item.length;
				for(i=0;i<l;i++){
					if(_item[i].name === _name){
						return _item[i].id;
					}
				}
			},
			getType : function(_id){
				var i,l = _item.length;
				for(i=0;i<l;i++){
					if(_item[i].id === _id){
						return _item[i].type;
					}
				}
			},
			getVal : function(_id){
				var i,l = _item.length;
				for(i=0;i<l;i++){
					if(_item[i].id === _id){
						return _item[i].value;
					}
				}
			}
		};
	})();
	Binder.init();
});});
