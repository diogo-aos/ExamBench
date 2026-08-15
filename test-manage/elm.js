(function(scope){
'use strict';

function F(arity, fun, wrapper) {
  wrapper.a = arity;
  wrapper.f = fun;
  return wrapper;
}

function F2(fun) {
  return F(2, fun, function(a) { return function(b) { return fun(a,b); }; })
}
function F3(fun) {
  return F(3, fun, function(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  });
}
function F4(fun) {
  return F(4, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  });
}
function F5(fun) {
  return F(5, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  });
}
function F6(fun) {
  return F(6, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  });
}
function F7(fun) {
  return F(7, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  });
}
function F8(fun) {
  return F(8, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  });
}
function F9(fun) {
  return F(9, fun, function(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  });
}

function A2(fun, a, b) {
  return fun.a === 2 ? fun.f(a, b) : fun(a)(b);
}
function A3(fun, a, b, c) {
  return fun.a === 3 ? fun.f(a, b, c) : fun(a)(b)(c);
}
function A4(fun, a, b, c, d) {
  return fun.a === 4 ? fun.f(a, b, c, d) : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e) {
  return fun.a === 5 ? fun.f(a, b, c, d, e) : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f) {
  return fun.a === 6 ? fun.f(a, b, c, d, e, f) : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g) {
  return fun.a === 7 ? fun.f(a, b, c, d, e, f, g) : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h) {
  return fun.a === 8 ? fun.f(a, b, c, d, e, f, g, h) : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i) {
  return fun.a === 9 ? fun.f(a, b, c, d, e, f, g, h, i) : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}




// EQUALITY

function _Utils_eq(x, y)
{
	for (
		var pair, stack = [], isEqual = _Utils_eqHelp(x, y, 0, stack);
		isEqual && (pair = stack.pop());
		isEqual = _Utils_eqHelp(pair.a, pair.b, 0, stack)
		)
	{}

	return isEqual;
}

function _Utils_eqHelp(x, y, depth, stack)
{
	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object' || x === null || y === null)
	{
		typeof x === 'function' && _Debug_crash(5);
		return false;
	}

	if (depth > 100)
	{
		stack.push(_Utils_Tuple2(x,y));
		return true;
	}

	/**_UNUSED/
	if (x.$ === 'Set_elm_builtin')
	{
		x = $elm$core$Set$toList(x);
		y = $elm$core$Set$toList(y);
	}
	if (x.$ === 'RBNode_elm_builtin' || x.$ === 'RBEmpty_elm_builtin')
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	/**/
	if (x.$ < 0)
	{
		x = $elm$core$Dict$toList(x);
		y = $elm$core$Dict$toList(y);
	}
	//*/

	for (var key in x)
	{
		if (!_Utils_eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

var _Utils_equal = F2(_Utils_eq);
var _Utils_notEqual = F2(function(a, b) { return !_Utils_eq(a,b); });



// COMPARISONS

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

function _Utils_cmp(x, y, ord)
{
	if (typeof x !== 'object')
	{
		return x === y ? /*EQ*/ 0 : x < y ? /*LT*/ -1 : /*GT*/ 1;
	}

	/**_UNUSED/
	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? 0 : a < b ? -1 : 1;
	}
	//*/

	/**/
	if (typeof x.$ === 'undefined')
	//*/
	/**_UNUSED/
	if (x.$[0] === '#')
	//*/
	{
		return (ord = _Utils_cmp(x.a, y.a))
			? ord
			: (ord = _Utils_cmp(x.b, y.b))
				? ord
				: _Utils_cmp(x.c, y.c);
	}

	// traverse conses until end of a list or a mismatch
	for (; x.b && y.b && !(ord = _Utils_cmp(x.a, y.a)); x = x.b, y = y.b) {} // WHILE_CONSES
	return ord || (x.b ? /*GT*/ 1 : y.b ? /*LT*/ -1 : /*EQ*/ 0);
}

var _Utils_lt = F2(function(a, b) { return _Utils_cmp(a, b) < 0; });
var _Utils_le = F2(function(a, b) { return _Utils_cmp(a, b) < 1; });
var _Utils_gt = F2(function(a, b) { return _Utils_cmp(a, b) > 0; });
var _Utils_ge = F2(function(a, b) { return _Utils_cmp(a, b) >= 0; });

var _Utils_compare = F2(function(x, y)
{
	var n = _Utils_cmp(x, y);
	return n < 0 ? $elm$core$Basics$LT : n ? $elm$core$Basics$GT : $elm$core$Basics$EQ;
});


// COMMON VALUES

var _Utils_Tuple0 = 0;
var _Utils_Tuple0_UNUSED = { $: '#0' };

function _Utils_Tuple2(a, b) { return { a: a, b: b }; }
function _Utils_Tuple2_UNUSED(a, b) { return { $: '#2', a: a, b: b }; }

function _Utils_Tuple3(a, b, c) { return { a: a, b: b, c: c }; }
function _Utils_Tuple3_UNUSED(a, b, c) { return { $: '#3', a: a, b: b, c: c }; }

function _Utils_chr(c) { return c; }
function _Utils_chr_UNUSED(c) { return new String(c); }


// RECORDS

function _Utils_update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


// APPEND

var _Utils_append = F2(_Utils_ap);

function _Utils_ap(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (!xs.b)
	{
		return ys;
	}
	var root = _List_Cons(xs.a, ys);
	xs = xs.b
	for (var curr = root; xs.b; xs = xs.b) // WHILE_CONS
	{
		curr = curr.b = _List_Cons(xs.a, ys);
	}
	return root;
}



var _List_Nil = { $: 0 };
var _List_Nil_UNUSED = { $: '[]' };

function _List_Cons(hd, tl) { return { $: 1, a: hd, b: tl }; }
function _List_Cons_UNUSED(hd, tl) { return { $: '::', a: hd, b: tl }; }


var _List_cons = F2(_List_Cons);

function _List_fromArray(arr)
{
	var out = _List_Nil;
	for (var i = arr.length; i--; )
	{
		out = _List_Cons(arr[i], out);
	}
	return out;
}

function _List_toArray(xs)
{
	for (var out = []; xs.b; xs = xs.b) // WHILE_CONS
	{
		out.push(xs.a);
	}
	return out;
}

var _List_map2 = F3(function(f, xs, ys)
{
	for (var arr = []; xs.b && ys.b; xs = xs.b, ys = ys.b) // WHILE_CONSES
	{
		arr.push(A2(f, xs.a, ys.a));
	}
	return _List_fromArray(arr);
});

var _List_map3 = F4(function(f, xs, ys, zs)
{
	for (var arr = []; xs.b && ys.b && zs.b; xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A3(f, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map4 = F5(function(f, ws, xs, ys, zs)
{
	for (var arr = []; ws.b && xs.b && ys.b && zs.b; ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A4(f, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_map5 = F6(function(f, vs, ws, xs, ys, zs)
{
	for (var arr = []; vs.b && ws.b && xs.b && ys.b && zs.b; vs = vs.b, ws = ws.b, xs = xs.b, ys = ys.b, zs = zs.b) // WHILE_CONSES
	{
		arr.push(A5(f, vs.a, ws.a, xs.a, ys.a, zs.a));
	}
	return _List_fromArray(arr);
});

var _List_sortBy = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		return _Utils_cmp(f(a), f(b));
	}));
});

var _List_sortWith = F2(function(f, xs)
{
	return _List_fromArray(_List_toArray(xs).sort(function(a, b) {
		var ord = A2(f, a, b);
		return ord === $elm$core$Basics$EQ ? 0 : ord === $elm$core$Basics$LT ? -1 : 1;
	}));
});



var _JsArray_empty = [];

function _JsArray_singleton(value)
{
    return [value];
}

function _JsArray_length(array)
{
    return array.length;
}

var _JsArray_initialize = F3(function(size, offset, func)
{
    var result = new Array(size);

    for (var i = 0; i < size; i++)
    {
        result[i] = func(offset + i);
    }

    return result;
});

var _JsArray_initializeFromList = F2(function (max, ls)
{
    var result = new Array(max);

    for (var i = 0; i < max && ls.b; i++)
    {
        result[i] = ls.a;
        ls = ls.b;
    }

    result.length = i;
    return _Utils_Tuple2(result, ls);
});

var _JsArray_unsafeGet = F2(function(index, array)
{
    return array[index];
});

var _JsArray_unsafeSet = F3(function(index, value, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[index] = value;
    return result;
});

var _JsArray_push = F2(function(value, array)
{
    var length = array.length;
    var result = new Array(length + 1);

    for (var i = 0; i < length; i++)
    {
        result[i] = array[i];
    }

    result[length] = value;
    return result;
});

var _JsArray_foldl = F3(function(func, acc, array)
{
    var length = array.length;

    for (var i = 0; i < length; i++)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_foldr = F3(function(func, acc, array)
{
    for (var i = array.length - 1; i >= 0; i--)
    {
        acc = A2(func, array[i], acc);
    }

    return acc;
});

var _JsArray_map = F2(function(func, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = func(array[i]);
    }

    return result;
});

var _JsArray_indexedMap = F3(function(func, offset, array)
{
    var length = array.length;
    var result = new Array(length);

    for (var i = 0; i < length; i++)
    {
        result[i] = A2(func, offset + i, array[i]);
    }

    return result;
});

var _JsArray_slice = F3(function(from, to, array)
{
    return array.slice(from, to);
});

var _JsArray_appendN = F3(function(n, dest, source)
{
    var destLen = dest.length;
    var itemsToCopy = n - destLen;

    if (itemsToCopy > source.length)
    {
        itemsToCopy = source.length;
    }

    var size = destLen + itemsToCopy;
    var result = new Array(size);

    for (var i = 0; i < destLen; i++)
    {
        result[i] = dest[i];
    }

    for (var i = 0; i < itemsToCopy; i++)
    {
        result[i + destLen] = source[i];
    }

    return result;
});



// LOG

var _Debug_log = F2(function(tag, value)
{
	return value;
});

var _Debug_log_UNUSED = F2(function(tag, value)
{
	console.log(tag + ': ' + _Debug_toString(value));
	return value;
});


// TODOS

function _Debug_todo(moduleName, region)
{
	return function(message) {
		_Debug_crash(8, moduleName, region, message);
	};
}

function _Debug_todoCase(moduleName, region, value)
{
	return function(message) {
		_Debug_crash(9, moduleName, region, value, message);
	};
}


// TO STRING

function _Debug_toString(value)
{
	return '<internals>';
}

function _Debug_toString_UNUSED(value)
{
	return _Debug_toAnsiString(false, value);
}

function _Debug_toAnsiString(ansi, value)
{
	if (typeof value === 'function')
	{
		return _Debug_internalColor(ansi, '<function>');
	}

	if (typeof value === 'boolean')
	{
		return _Debug_ctorColor(ansi, value ? 'True' : 'False');
	}

	if (typeof value === 'number')
	{
		return _Debug_numberColor(ansi, value + '');
	}

	if (value instanceof String)
	{
		return _Debug_charColor(ansi, "'" + _Debug_addSlashes(value, true) + "'");
	}

	if (typeof value === 'string')
	{
		return _Debug_stringColor(ansi, '"' + _Debug_addSlashes(value, false) + '"');
	}

	if (typeof value === 'object' && '$' in value)
	{
		var tag = value.$;

		if (typeof tag === 'number')
		{
			return _Debug_internalColor(ansi, '<internals>');
		}

		if (tag[0] === '#')
		{
			var output = [];
			for (var k in value)
			{
				if (k === '$') continue;
				output.push(_Debug_toAnsiString(ansi, value[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (tag === 'Set_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Set')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Set$toList(value));
		}

		if (tag === 'RBNode_elm_builtin' || tag === 'RBEmpty_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Dict')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Dict$toList(value));
		}

		if (tag === 'Array_elm_builtin')
		{
			return _Debug_ctorColor(ansi, 'Array')
				+ _Debug_fadeColor(ansi, '.fromList') + ' '
				+ _Debug_toAnsiString(ansi, $elm$core$Array$toList(value));
		}

		if (tag === '::' || tag === '[]')
		{
			var output = '[';

			value.b && (output += _Debug_toAnsiString(ansi, value.a), value = value.b)

			for (; value.b; value = value.b) // WHILE_CONS
			{
				output += ',' + _Debug_toAnsiString(ansi, value.a);
			}
			return output + ']';
		}

		var output = '';
		for (var i in value)
		{
			if (i === '$') continue;
			var str = _Debug_toAnsiString(ansi, value[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '[' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return _Debug_ctorColor(ansi, tag) + output;
	}

	if (typeof DataView === 'function' && value instanceof DataView)
	{
		return _Debug_stringColor(ansi, '<' + value.byteLength + ' bytes>');
	}

	if (typeof File !== 'undefined' && value instanceof File)
	{
		return _Debug_internalColor(ansi, '<' + value.name + '>');
	}

	if (typeof value === 'object')
	{
		var output = [];
		for (var key in value)
		{
			var field = key[0] === '_' ? key.slice(1) : key;
			output.push(_Debug_fadeColor(ansi, field) + ' = ' + _Debug_toAnsiString(ansi, value[key]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return _Debug_internalColor(ansi, '<internals>');
}

function _Debug_addSlashes(str, isChar)
{
	var s = str
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\t/g, '\\t')
		.replace(/\r/g, '\\r')
		.replace(/\v/g, '\\v')
		.replace(/\0/g, '\\0');

	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}

function _Debug_ctorColor(ansi, string)
{
	return ansi ? '\x1b[96m' + string + '\x1b[0m' : string;
}

function _Debug_numberColor(ansi, string)
{
	return ansi ? '\x1b[95m' + string + '\x1b[0m' : string;
}

function _Debug_stringColor(ansi, string)
{
	return ansi ? '\x1b[93m' + string + '\x1b[0m' : string;
}

function _Debug_charColor(ansi, string)
{
	return ansi ? '\x1b[92m' + string + '\x1b[0m' : string;
}

function _Debug_fadeColor(ansi, string)
{
	return ansi ? '\x1b[37m' + string + '\x1b[0m' : string;
}

function _Debug_internalColor(ansi, string)
{
	return ansi ? '\x1b[36m' + string + '\x1b[0m' : string;
}

function _Debug_toHexDigit(n)
{
	return String.fromCharCode(n < 10 ? 48 + n : 55 + n);
}


// CRASH


function _Debug_crash(identifier)
{
	throw new Error('https://github.com/elm/core/blob/1.0.0/hints/' + identifier + '.md');
}


function _Debug_crash_UNUSED(identifier, fact1, fact2, fact3, fact4)
{
	switch(identifier)
	{
		case 0:
			throw new Error('What node should I take over? In JavaScript I need something like:\n\n    Elm.Main.init({\n        node: document.getElementById("elm-node")\n    })\n\nYou need to do this with any Browser.sandbox or Browser.element program.');

		case 1:
			throw new Error('Browser.application programs cannot handle URLs like this:\n\n    ' + document.location.href + '\n\nWhat is the root? The root of your file system? Try looking at this program with `elm reactor` or some other server.');

		case 2:
			var jsonErrorString = fact1;
			throw new Error('Problem with the flags given to your Elm program on initialization.\n\n' + jsonErrorString);

		case 3:
			var portName = fact1;
			throw new Error('There can only be one port named `' + portName + '`, but your program has multiple.');

		case 4:
			var portName = fact1;
			var problem = fact2;
			throw new Error('Trying to send an unexpected type of value through port `' + portName + '`:\n' + problem);

		case 5:
			throw new Error('Trying to use `(==)` on functions.\nThere is no way to know if functions are "the same" in the Elm sense.\nRead more about this at https://package.elm-lang.org/packages/elm/core/latest/Basics#== which describes why it is this way and what the better version will look like.');

		case 6:
			var moduleName = fact1;
			throw new Error('Your page is loading multiple Elm scripts with a module named ' + moduleName + '. Maybe a duplicate script is getting loaded accidentally? If not, rename one of them so I know which is which!');

		case 8:
			var moduleName = fact1;
			var region = fact2;
			var message = fact3;
			throw new Error('TODO in module `' + moduleName + '` ' + _Debug_regionToString(region) + '\n\n' + message);

		case 9:
			var moduleName = fact1;
			var region = fact2;
			var value = fact3;
			var message = fact4;
			throw new Error(
				'TODO in module `' + moduleName + '` from the `case` expression '
				+ _Debug_regionToString(region) + '\n\nIt received the following value:\n\n    '
				+ _Debug_toString(value).replace('\n', '\n    ')
				+ '\n\nBut the branch that handles it says:\n\n    ' + message.replace('\n', '\n    ')
			);

		case 10:
			throw new Error('Bug in https://github.com/elm/virtual-dom/issues');

		case 11:
			throw new Error('Cannot perform mod 0. Division by zero error.');
	}
}

function _Debug_regionToString(region)
{
	if (region.aq.ad === region.aw.ad)
	{
		return 'on line ' + region.aq.ad;
	}
	return 'on lines ' + region.aq.ad + ' through ' + region.aw.ad;
}



// MATH

var _Basics_add = F2(function(a, b) { return a + b; });
var _Basics_sub = F2(function(a, b) { return a - b; });
var _Basics_mul = F2(function(a, b) { return a * b; });
var _Basics_fdiv = F2(function(a, b) { return a / b; });
var _Basics_idiv = F2(function(a, b) { return (a / b) | 0; });
var _Basics_pow = F2(Math.pow);

var _Basics_remainderBy = F2(function(b, a) { return a % b; });

// https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/divmodnote-letter.pdf
var _Basics_modBy = F2(function(modulus, x)
{
	var answer = x % modulus;
	return modulus === 0
		? _Debug_crash(11)
		:
	((answer > 0 && modulus < 0) || (answer < 0 && modulus > 0))
		? answer + modulus
		: answer;
});


// TRIGONOMETRY

var _Basics_pi = Math.PI;
var _Basics_e = Math.E;
var _Basics_cos = Math.cos;
var _Basics_sin = Math.sin;
var _Basics_tan = Math.tan;
var _Basics_acos = Math.acos;
var _Basics_asin = Math.asin;
var _Basics_atan = Math.atan;
var _Basics_atan2 = F2(Math.atan2);


// MORE MATH

function _Basics_toFloat(x) { return x; }
function _Basics_truncate(n) { return n | 0; }
function _Basics_isInfinite(n) { return n === Infinity || n === -Infinity; }

var _Basics_ceiling = Math.ceil;
var _Basics_floor = Math.floor;
var _Basics_round = Math.round;
var _Basics_sqrt = Math.sqrt;
var _Basics_log = Math.log;
var _Basics_isNaN = isNaN;


// BOOLEANS

function _Basics_not(bool) { return !bool; }
var _Basics_and = F2(function(a, b) { return a && b; });
var _Basics_or  = F2(function(a, b) { return a || b; });
var _Basics_xor = F2(function(a, b) { return a !== b; });



var _String_cons = F2(function(chr, str)
{
	return chr + str;
});

function _String_uncons(string)
{
	var word = string.charCodeAt(0);
	return !isNaN(word)
		? $elm$core$Maybe$Just(
			0xD800 <= word && word <= 0xDBFF
				? _Utils_Tuple2(_Utils_chr(string[0] + string[1]), string.slice(2))
				: _Utils_Tuple2(_Utils_chr(string[0]), string.slice(1))
		)
		: $elm$core$Maybe$Nothing;
}

var _String_append = F2(function(a, b)
{
	return a + b;
});

function _String_length(str)
{
	return str.length;
}

var _String_map = F2(function(func, string)
{
	var len = string.length;
	var array = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = string.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			array[i] = func(_Utils_chr(string[i] + string[i+1]));
			i += 2;
			continue;
		}
		array[i] = func(_Utils_chr(string[i]));
		i++;
	}
	return array.join('');
});

var _String_filter = F2(function(isGood, str)
{
	var arr = [];
	var len = str.length;
	var i = 0;
	while (i < len)
	{
		var char = str[i];
		var word = str.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += str[i];
			i++;
		}

		if (isGood(_Utils_chr(char)))
		{
			arr.push(char);
		}
	}
	return arr.join('');
});

function _String_reverse(str)
{
	var len = str.length;
	var arr = new Array(len);
	var i = 0;
	while (i < len)
	{
		var word = str.charCodeAt(i);
		if (0xD800 <= word && word <= 0xDBFF)
		{
			arr[len - i] = str[i + 1];
			i++;
			arr[len - i] = str[i - 1];
			i++;
		}
		else
		{
			arr[len - i] = str[i];
			i++;
		}
	}
	return arr.join('');
}

var _String_foldl = F3(function(func, state, string)
{
	var len = string.length;
	var i = 0;
	while (i < len)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		i++;
		if (0xD800 <= word && word <= 0xDBFF)
		{
			char += string[i];
			i++;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_foldr = F3(function(func, state, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		state = A2(func, _Utils_chr(char), state);
	}
	return state;
});

var _String_split = F2(function(sep, str)
{
	return str.split(sep);
});

var _String_join = F2(function(sep, strs)
{
	return strs.join(sep);
});

var _String_slice = F3(function(start, end, str) {
	return str.slice(start, end);
});

function _String_trim(str)
{
	return str.trim();
}

function _String_trimLeft(str)
{
	return str.replace(/^\s+/, '');
}

function _String_trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function _String_words(str)
{
	return _List_fromArray(str.trim().split(/\s+/g));
}

function _String_lines(str)
{
	return _List_fromArray(str.split(/\r\n|\r|\n/g));
}

function _String_toUpper(str)
{
	return str.toUpperCase();
}

function _String_toLower(str)
{
	return str.toLowerCase();
}

var _String_any = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (isGood(_Utils_chr(char)))
		{
			return true;
		}
	}
	return false;
});

var _String_all = F2(function(isGood, string)
{
	var i = string.length;
	while (i--)
	{
		var char = string[i];
		var word = string.charCodeAt(i);
		if (0xDC00 <= word && word <= 0xDFFF)
		{
			i--;
			char = string[i] + char;
		}
		if (!isGood(_Utils_chr(char)))
		{
			return false;
		}
	}
	return true;
});

var _String_contains = F2(function(sub, str)
{
	return str.indexOf(sub) > -1;
});

var _String_startsWith = F2(function(sub, str)
{
	return str.indexOf(sub) === 0;
});

var _String_endsWith = F2(function(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
});

var _String_indexes = F2(function(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _List_Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _List_fromArray(is);
});


// TO STRING

function _String_fromNumber(number)
{
	return number + '';
}


// INT CONVERSIONS

function _String_toInt(str)
{
	var total = 0;
	var code0 = str.charCodeAt(0);
	var start = code0 == 0x2B /* + */ || code0 == 0x2D /* - */ ? 1 : 0;

	for (var i = start; i < str.length; ++i)
	{
		var code = str.charCodeAt(i);
		if (code < 0x30 || 0x39 < code)
		{
			return $elm$core$Maybe$Nothing;
		}
		total = 10 * total + code - 0x30;
	}

	return i == start
		? $elm$core$Maybe$Nothing
		: $elm$core$Maybe$Just(code0 == 0x2D ? -total : total);
}


// FLOAT CONVERSIONS

function _String_toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return $elm$core$Maybe$Nothing;
	}
	var n = +s;
	// faster isNaN check
	return n === n ? $elm$core$Maybe$Just(n) : $elm$core$Maybe$Nothing;
}

function _String_fromList(chars)
{
	return _List_toArray(chars).join('');
}




function _Char_toCode(char)
{
	var code = char.charCodeAt(0);
	if (0xD800 <= code && code <= 0xDBFF)
	{
		return (code - 0xD800) * 0x400 + char.charCodeAt(1) - 0xDC00 + 0x10000
	}
	return code;
}

function _Char_fromCode(code)
{
	return _Utils_chr(
		(code < 0 || 0x10FFFF < code)
			? '\uFFFD'
			:
		(code <= 0xFFFF)
			? String.fromCharCode(code)
			:
		(code -= 0x10000,
			String.fromCharCode(Math.floor(code / 0x400) + 0xD800, code % 0x400 + 0xDC00)
		)
	);
}

function _Char_toUpper(char)
{
	return _Utils_chr(char.toUpperCase());
}

function _Char_toLower(char)
{
	return _Utils_chr(char.toLowerCase());
}

function _Char_toLocaleUpper(char)
{
	return _Utils_chr(char.toLocaleUpperCase());
}

function _Char_toLocaleLower(char)
{
	return _Utils_chr(char.toLocaleLowerCase());
}



/**_UNUSED/
function _Json_errorToString(error)
{
	return $elm$json$Json$Decode$errorToString(error);
}
//*/


// CORE DECODERS

function _Json_succeed(msg)
{
	return {
		$: 0,
		a: msg
	};
}

function _Json_fail(msg)
{
	return {
		$: 1,
		a: msg
	};
}

function _Json_decodePrim(decoder)
{
	return { $: 2, b: decoder };
}

var _Json_decodeInt = _Json_decodePrim(function(value) {
	return (typeof value !== 'number')
		? _Json_expecting('an INT', value)
		:
	(-2147483647 < value && value < 2147483647 && (value | 0) === value)
		? $elm$core$Result$Ok(value)
		:
	(isFinite(value) && !(value % 1))
		? $elm$core$Result$Ok(value)
		: _Json_expecting('an INT', value);
});

var _Json_decodeBool = _Json_decodePrim(function(value) {
	return (typeof value === 'boolean')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a BOOL', value);
});

var _Json_decodeFloat = _Json_decodePrim(function(value) {
	return (typeof value === 'number')
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FLOAT', value);
});

var _Json_decodeValue = _Json_decodePrim(function(value) {
	return $elm$core$Result$Ok(_Json_wrap(value));
});

var _Json_decodeString = _Json_decodePrim(function(value) {
	return (typeof value === 'string')
		? $elm$core$Result$Ok(value)
		: (value instanceof String)
			? $elm$core$Result$Ok(value + '')
			: _Json_expecting('a STRING', value);
});

function _Json_decodeList(decoder) { return { $: 3, b: decoder }; }
function _Json_decodeArray(decoder) { return { $: 4, b: decoder }; }

function _Json_decodeNull(value) { return { $: 5, c: value }; }

var _Json_decodeField = F2(function(field, decoder)
{
	return {
		$: 6,
		d: field,
		b: decoder
	};
});

var _Json_decodeIndex = F2(function(index, decoder)
{
	return {
		$: 7,
		e: index,
		b: decoder
	};
});

function _Json_decodeKeyValuePairs(decoder)
{
	return {
		$: 8,
		b: decoder
	};
}

function _Json_mapMany(f, decoders)
{
	return {
		$: 9,
		f: f,
		g: decoders
	};
}

var _Json_andThen = F2(function(callback, decoder)
{
	return {
		$: 10,
		b: decoder,
		h: callback
	};
});

function _Json_oneOf(decoders)
{
	return {
		$: 11,
		g: decoders
	};
}


// DECODING OBJECTS

var _Json_map1 = F2(function(f, d1)
{
	return _Json_mapMany(f, [d1]);
});

var _Json_map2 = F3(function(f, d1, d2)
{
	return _Json_mapMany(f, [d1, d2]);
});

var _Json_map3 = F4(function(f, d1, d2, d3)
{
	return _Json_mapMany(f, [d1, d2, d3]);
});

var _Json_map4 = F5(function(f, d1, d2, d3, d4)
{
	return _Json_mapMany(f, [d1, d2, d3, d4]);
});

var _Json_map5 = F6(function(f, d1, d2, d3, d4, d5)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5]);
});

var _Json_map6 = F7(function(f, d1, d2, d3, d4, d5, d6)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6]);
});

var _Json_map7 = F8(function(f, d1, d2, d3, d4, d5, d6, d7)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
});

var _Json_map8 = F9(function(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return _Json_mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
});


// DECODE

var _Json_runOnString = F2(function(decoder, string)
{
	try
	{
		var value = JSON.parse(string);
		return _Json_runHelp(decoder, value);
	}
	catch (e)
	{
		return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'This is not valid JSON! ' + e.message, _Json_wrap(string)));
	}
});

var _Json_run = F2(function(decoder, value)
{
	return _Json_runHelp(decoder, _Json_unwrap(value));
});

function _Json_runHelp(decoder, value)
{
	switch (decoder.$)
	{
		case 2:
			return decoder.b(value);

		case 5:
			return (value === null)
				? $elm$core$Result$Ok(decoder.c)
				: _Json_expecting('null', value);

		case 3:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('a LIST', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _List_fromArray);

		case 4:
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			return _Json_runArrayDecoder(decoder.b, value, _Json_toElmArray);

		case 6:
			var field = decoder.d;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return _Json_expecting('an OBJECT with a field named `' + field + '`', value);
			}
			var result = _Json_runHelp(decoder.b, value[field]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, field, result.a));

		case 7:
			var index = decoder.e;
			if (!_Json_isArray(value))
			{
				return _Json_expecting('an ARRAY', value);
			}
			if (index >= value.length)
			{
				return _Json_expecting('a LONGER array. Need index ' + index + ' but only see ' + value.length + ' entries', value);
			}
			var result = _Json_runHelp(decoder.b, value[index]);
			return ($elm$core$Result$isOk(result)) ? result : $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, index, result.a));

		case 8:
			if (typeof value !== 'object' || value === null || _Json_isArray(value))
			{
				return _Json_expecting('an OBJECT', value);
			}

			var keyValuePairs = _List_Nil;
			// TODO test perf of Object.keys and switch when support is good enough
			for (var key in value)
			{
				if (Object.prototype.hasOwnProperty.call(value, key))
				{
					var result = _Json_runHelp(decoder.b, value[key]);
					if (!$elm$core$Result$isOk(result))
					{
						return $elm$core$Result$Err(A2($elm$json$Json$Decode$Field, key, result.a));
					}
					keyValuePairs = _List_Cons(_Utils_Tuple2(key, result.a), keyValuePairs);
				}
			}
			return $elm$core$Result$Ok($elm$core$List$reverse(keyValuePairs));

		case 9:
			var answer = decoder.f;
			var decoders = decoder.g;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = _Json_runHelp(decoders[i], value);
				if (!$elm$core$Result$isOk(result))
				{
					return result;
				}
				answer = answer(result.a);
			}
			return $elm$core$Result$Ok(answer);

		case 10:
			var result = _Json_runHelp(decoder.b, value);
			return (!$elm$core$Result$isOk(result))
				? result
				: _Json_runHelp(decoder.h(result.a), value);

		case 11:
			var errors = _List_Nil;
			for (var temp = decoder.g; temp.b; temp = temp.b) // WHILE_CONS
			{
				var result = _Json_runHelp(temp.a, value);
				if ($elm$core$Result$isOk(result))
				{
					return result;
				}
				errors = _List_Cons(result.a, errors);
			}
			return $elm$core$Result$Err($elm$json$Json$Decode$OneOf($elm$core$List$reverse(errors)));

		case 1:
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, decoder.a, _Json_wrap(value)));

		case 0:
			return $elm$core$Result$Ok(decoder.a);
	}
}

function _Json_runArrayDecoder(decoder, value, toElmValue)
{
	var len = value.length;
	var array = new Array(len);
	for (var i = 0; i < len; i++)
	{
		var result = _Json_runHelp(decoder, value[i]);
		if (!$elm$core$Result$isOk(result))
		{
			return $elm$core$Result$Err(A2($elm$json$Json$Decode$Index, i, result.a));
		}
		array[i] = result.a;
	}
	return $elm$core$Result$Ok(toElmValue(array));
}

function _Json_isArray(value)
{
	return Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList);
}

function _Json_toElmArray(array)
{
	return A2($elm$core$Array$initialize, array.length, function(i) { return array[i]; });
}

function _Json_expecting(type, value)
{
	return $elm$core$Result$Err(A2($elm$json$Json$Decode$Failure, 'Expecting ' + type, _Json_wrap(value)));
}


// EQUALITY

function _Json_equality(x, y)
{
	if (x === y)
	{
		return true;
	}

	if (x.$ !== y.$)
	{
		return false;
	}

	switch (x.$)
	{
		case 0:
		case 1:
			return x.a === y.a;

		case 2:
			return x.b === y.b;

		case 5:
			return x.c === y.c;

		case 3:
		case 4:
		case 8:
			return _Json_equality(x.b, y.b);

		case 6:
			return x.d === y.d && _Json_equality(x.b, y.b);

		case 7:
			return x.e === y.e && _Json_equality(x.b, y.b);

		case 9:
			return x.f === y.f && _Json_listEquality(x.g, y.g);

		case 10:
			return x.h === y.h && _Json_equality(x.b, y.b);

		case 11:
			return _Json_listEquality(x.g, y.g);
	}
}

function _Json_listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!_Json_equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

var _Json_encode = F2(function(indentLevel, value)
{
	return JSON.stringify(_Json_unwrap(value), null, indentLevel) + '';
});

function _Json_wrap_UNUSED(value) { return { $: 0, a: value }; }
function _Json_unwrap_UNUSED(value) { return value.a; }

function _Json_wrap(value) { return value; }
function _Json_unwrap(value) { return value; }

function _Json_emptyArray() { return []; }
function _Json_emptyObject() { return {}; }

var _Json_addField = F3(function(key, value, object)
{
	var unwrapped = _Json_unwrap(value);
	if (!(key === 'toJSON' && typeof unwrapped === 'function'))
	{
		object[key] = unwrapped;
	}
	return object;
});

function _Json_addEntry(func)
{
	return F2(function(entry, array)
	{
		array.push(_Json_unwrap(func(entry)));
		return array;
	});
}

var _Json_encodeNull = _Json_wrap(null);



// TASKS

function _Scheduler_succeed(value)
{
	return {
		$: 0,
		a: value
	};
}

function _Scheduler_fail(error)
{
	return {
		$: 1,
		a: error
	};
}

function _Scheduler_binding(callback)
{
	return {
		$: 2,
		b: callback,
		c: null
	};
}

var _Scheduler_andThen = F2(function(callback, task)
{
	return {
		$: 3,
		b: callback,
		d: task
	};
});

var _Scheduler_onError = F2(function(callback, task)
{
	return {
		$: 4,
		b: callback,
		d: task
	};
});

function _Scheduler_receive(callback)
{
	return {
		$: 5,
		b: callback
	};
}


// PROCESSES

var _Scheduler_guid = 0;

function _Scheduler_rawSpawn(task)
{
	var proc = {
		$: 0,
		e: _Scheduler_guid++,
		f: task,
		g: null,
		h: []
	};

	_Scheduler_enqueue(proc);

	return proc;
}

function _Scheduler_spawn(task)
{
	return _Scheduler_binding(function(callback) {
		callback(_Scheduler_succeed(_Scheduler_rawSpawn(task)));
	});
}

function _Scheduler_rawSend(proc, msg)
{
	proc.h.push(msg);
	_Scheduler_enqueue(proc);
}

var _Scheduler_send = F2(function(proc, msg)
{
	return _Scheduler_binding(function(callback) {
		_Scheduler_rawSend(proc, msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});

function _Scheduler_kill(proc)
{
	return _Scheduler_binding(function(callback) {
		var task = proc.f;
		if (task.$ === 2 && task.c)
		{
			task.c();
		}

		proc.f = null;

		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
}


/* STEP PROCESSES

type alias Process =
  { $ : tag
  , id : unique_id
  , root : Task
  , stack : null | { $: SUCCEED | FAIL, a: callback, b: stack }
  , mailbox : [msg]
  }

*/


var _Scheduler_working = false;
var _Scheduler_queue = [];


function _Scheduler_enqueue(proc)
{
	_Scheduler_queue.push(proc);
	if (_Scheduler_working)
	{
		return;
	}
	_Scheduler_working = true;
	while (proc = _Scheduler_queue.shift())
	{
		_Scheduler_step(proc);
	}
	_Scheduler_working = false;
}


function _Scheduler_step(proc)
{
	while (proc.f)
	{
		var rootTag = proc.f.$;
		if (rootTag === 0 || rootTag === 1)
		{
			while (proc.g && proc.g.$ !== rootTag)
			{
				proc.g = proc.g.i;
			}
			if (!proc.g)
			{
				return;
			}
			proc.f = proc.g.b(proc.f.a);
			proc.g = proc.g.i;
		}
		else if (rootTag === 2)
		{
			proc.f.c = proc.f.b(function(newRoot) {
				proc.f = newRoot;
				_Scheduler_enqueue(proc);
			});
			return;
		}
		else if (rootTag === 5)
		{
			if (proc.h.length === 0)
			{
				return;
			}
			proc.f = proc.f.b(proc.h.shift());
		}
		else // if (rootTag === 3 || rootTag === 4)
		{
			proc.g = {
				$: rootTag === 3 ? 0 : 1,
				b: proc.f.b,
				i: proc.g
			};
			proc.f = proc.f.d;
		}
	}
}



function _Process_sleep(time)
{
	return _Scheduler_binding(function(callback) {
		var id = setTimeout(function() {
			callback(_Scheduler_succeed(_Utils_Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}




// PROGRAMS


var _Platform_worker = F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.bf,
		impl.bx,
		impl.bu,
		function() { return function() {} }
	);
});



// INITIALIZE A PROGRAM


function _Platform_initialize(flagDecoder, args, init, update, subscriptions, stepperBuilder)
{
	var result = A2(_Json_run, flagDecoder, _Json_wrap(args ? args['flags'] : undefined));
	$elm$core$Result$isOk(result) || _Debug_crash(2 /**_UNUSED/, _Json_errorToString(result.a) /**/);
	var managers = {};
	var initPair = init(result.a);
	var model = initPair.a;
	var stepper = stepperBuilder(sendToApp, model);
	var ports = _Platform_setupEffects(managers, sendToApp);

	function sendToApp(msg, viewMetadata)
	{
		var pair = A2(update, msg, model);
		stepper(model = pair.a, viewMetadata);
		_Platform_enqueueEffects(managers, pair.b, subscriptions(model));
	}

	_Platform_enqueueEffects(managers, initPair.b, subscriptions(model));

	return ports ? { ports: ports } : {};
}



// TRACK PRELOADS
//
// This is used by code in elm/browser and elm/http
// to register any HTTP requests that are triggered by init.
//


var _Platform_preload;


function _Platform_registerPreload(url)
{
	_Platform_preload.add(url);
}



// EFFECT MANAGERS


var _Platform_effectManagers = {};


function _Platform_setupEffects(managers, sendToApp)
{
	var ports;

	// setup all necessary effect managers
	for (var key in _Platform_effectManagers)
	{
		var manager = _Platform_effectManagers[key];

		if (manager.a)
		{
			ports = ports || {};
			ports[key] = manager.a(key, sendToApp);
		}

		managers[key] = _Platform_instantiateManager(manager, sendToApp);
	}

	return ports;
}


function _Platform_createManager(init, onEffects, onSelfMsg, cmdMap, subMap)
{
	return {
		b: init,
		c: onEffects,
		d: onSelfMsg,
		e: cmdMap,
		f: subMap
	};
}


function _Platform_instantiateManager(info, sendToApp)
{
	var router = {
		g: sendToApp,
		h: undefined
	};

	var onEffects = info.c;
	var onSelfMsg = info.d;
	var cmdMap = info.e;
	var subMap = info.f;

	function loop(state)
	{
		return A2(_Scheduler_andThen, loop, _Scheduler_receive(function(msg)
		{
			var value = msg.a;

			if (msg.$ === 0)
			{
				return A3(onSelfMsg, router, value, state);
			}

			return cmdMap && subMap
				? A4(onEffects, router, value.i, value.j, state)
				: A3(onEffects, router, cmdMap ? value.i : value.j, state);
		}));
	}

	return router.h = _Scheduler_rawSpawn(A2(_Scheduler_andThen, loop, info.b));
}



// ROUTING


var _Platform_sendToApp = F2(function(router, msg)
{
	return _Scheduler_binding(function(callback)
	{
		router.g(msg);
		callback(_Scheduler_succeed(_Utils_Tuple0));
	});
});


var _Platform_sendToSelf = F2(function(router, msg)
{
	return A2(_Scheduler_send, router.h, {
		$: 0,
		a: msg
	});
});



// BAGS


function _Platform_leaf(home)
{
	return function(value)
	{
		return {
			$: 1,
			k: home,
			l: value
		};
	};
}


function _Platform_batch(list)
{
	return {
		$: 2,
		m: list
	};
}


var _Platform_map = F2(function(tagger, bag)
{
	return {
		$: 3,
		n: tagger,
		o: bag
	}
});



// PIPE BAGS INTO EFFECT MANAGERS
//
// Effects must be queued!
//
// Say your init contains a synchronous command, like Time.now or Time.here
//
//   - This will produce a batch of effects (FX_1)
//   - The synchronous task triggers the subsequent `update` call
//   - This will produce a batch of effects (FX_2)
//
// If we just start dispatching FX_2, subscriptions from FX_2 can be processed
// before subscriptions from FX_1. No good! Earlier versions of this code had
// this problem, leading to these reports:
//
//   https://github.com/elm/core/issues/980
//   https://github.com/elm/core/pull/981
//   https://github.com/elm/compiler/issues/1776
//
// The queue is necessary to avoid ordering issues for synchronous commands.


// Why use true/false here? Why not just check the length of the queue?
// The goal is to detect "are we currently dispatching effects?" If we
// are, we need to bail and let the ongoing while loop handle things.
//
// Now say the queue has 1 element. When we dequeue the final element,
// the queue will be empty, but we are still actively dispatching effects.
// So you could get queue jumping in a really tricky category of cases.
//
var _Platform_effectsQueue = [];
var _Platform_effectsActive = false;


function _Platform_enqueueEffects(managers, cmdBag, subBag)
{
	_Platform_effectsQueue.push({ p: managers, q: cmdBag, r: subBag });

	if (_Platform_effectsActive) return;

	_Platform_effectsActive = true;
	for (var fx; fx = _Platform_effectsQueue.shift(); )
	{
		_Platform_dispatchEffects(fx.p, fx.q, fx.r);
	}
	_Platform_effectsActive = false;
}


function _Platform_dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	_Platform_gatherEffects(true, cmdBag, effectsDict, null);
	_Platform_gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		_Scheduler_rawSend(managers[home], {
			$: 'fx',
			a: effectsDict[home] || { i: _List_Nil, j: _List_Nil }
		});
	}
}


function _Platform_gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.$)
	{
		case 1:
			var home = bag.k;
			var effect = _Platform_toEffect(isCmd, home, taggers, bag.l);
			effectsDict[home] = _Platform_insert(isCmd, effect, effectsDict[home]);
			return;

		case 2:
			for (var list = bag.m; list.b; list = list.b) // WHILE_CONS
			{
				_Platform_gatherEffects(isCmd, list.a, effectsDict, taggers);
			}
			return;

		case 3:
			_Platform_gatherEffects(isCmd, bag.o, effectsDict, {
				s: bag.n,
				t: taggers
			});
			return;
	}
}


function _Platform_toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		for (var temp = taggers; temp; temp = temp.t)
		{
			x = temp.s(x);
		}
		return x;
	}

	var map = isCmd
		? _Platform_effectManagers[home].e
		: _Platform_effectManagers[home].f;

	return A2(map, applyTaggers, value)
}


function _Platform_insert(isCmd, newEffect, effects)
{
	effects = effects || { i: _List_Nil, j: _List_Nil };

	isCmd
		? (effects.i = _List_Cons(newEffect, effects.i))
		: (effects.j = _List_Cons(newEffect, effects.j));

	return effects;
}



// PORTS


function _Platform_checkPortName(name)
{
	if (_Platform_effectManagers[name])
	{
		_Debug_crash(3, name)
	}
}



// OUTGOING PORTS


function _Platform_outgoingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		e: _Platform_outgoingPortMap,
		u: converter,
		a: _Platform_setupOutgoingPort
	};
	return _Platform_leaf(name);
}


var _Platform_outgoingPortMap = F2(function(tagger, value) { return value; });


function _Platform_setupOutgoingPort(name)
{
	var subs = [];
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Process_sleep(0);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, cmdList, state)
	{
		for ( ; cmdList.b; cmdList = cmdList.b) // WHILE_CONS
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = _Json_unwrap(converter(cmdList.a));
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
		}
		return init;
	});

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}



// INCOMING PORTS


function _Platform_incomingPort(name, converter)
{
	_Platform_checkPortName(name);
	_Platform_effectManagers[name] = {
		f: _Platform_incomingPortMap,
		u: converter,
		a: _Platform_setupIncomingPort
	};
	return _Platform_leaf(name);
}


var _Platform_incomingPortMap = F2(function(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});


function _Platform_setupIncomingPort(name, sendToApp)
{
	var subs = _List_Nil;
	var converter = _Platform_effectManagers[name].u;

	// CREATE MANAGER

	var init = _Scheduler_succeed(null);

	_Platform_effectManagers[name].b = init;
	_Platform_effectManagers[name].c = F3(function(router, subList, state)
	{
		subs = subList;
		return init;
	});

	// PUBLIC API

	function send(incomingValue)
	{
		var result = A2(_Json_run, converter, _Json_wrap(incomingValue));

		$elm$core$Result$isOk(result) || _Debug_crash(4, name, result.a);

		var value = result.a;
		for (var temp = subs; temp.b; temp = temp.b) // WHILE_CONS
		{
			sendToApp(temp.a(value));
		}
	}

	return { send: send };
}



// EXPORT ELM MODULES
//
// Have DEBUG and PROD versions so that we can (1) give nicer errors in
// debug mode and (2) not pay for the bits needed for that in prod mode.
//


function _Platform_export(exports)
{
	scope['Elm']
		? _Platform_mergeExportsProd(scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsProd(obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6)
				: _Platform_mergeExportsProd(obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}


function _Platform_export_UNUSED(exports)
{
	scope['Elm']
		? _Platform_mergeExportsDebug('Elm', scope['Elm'], exports)
		: scope['Elm'] = exports;
}


function _Platform_mergeExportsDebug(moduleName, obj, exports)
{
	for (var name in exports)
	{
		(name in obj)
			? (name == 'init')
				? _Debug_crash(6, moduleName)
				: _Platform_mergeExportsDebug(moduleName + '.' + name, obj[name], exports[name])
			: (obj[name] = exports[name]);
	}
}




// HELPERS


var _VirtualDom_divertHrefToApp;

var _VirtualDom_doc = typeof document !== 'undefined' ? document : {};


function _VirtualDom_appendChild(parent, child)
{
	parent.appendChild(child);
}

var _VirtualDom_init = F4(function(virtualNode, flagDecoder, debugMetadata, args)
{
	// NOTE: this function needs _Platform_export available to work

	/**/
	var node = args['node'];
	//*/
	/**_UNUSED/
	var node = args && args['node'] ? args['node'] : _Debug_crash(0);
	//*/

	node.parentNode.replaceChild(
		_VirtualDom_render(virtualNode, function() {}),
		node
	);

	return {};
});



// TEXT


function _VirtualDom_text(string)
{
	return {
		$: 0,
		a: string
	};
}



// NODE


var _VirtualDom_nodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 1,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_node = _VirtualDom_nodeNS(undefined);



// KEYED NODE


var _VirtualDom_keyedNodeNS = F2(function(namespace, tag)
{
	return F2(function(factList, kidList)
	{
		for (var kids = [], descendantsCount = 0; kidList.b; kidList = kidList.b) // WHILE_CONS
		{
			var kid = kidList.a;
			descendantsCount += (kid.b.b || 0);
			kids.push(kid);
		}
		descendantsCount += kids.length;

		return {
			$: 2,
			c: tag,
			d: _VirtualDom_organizeFacts(factList),
			e: kids,
			f: namespace,
			b: descendantsCount
		};
	});
});


var _VirtualDom_keyedNode = _VirtualDom_keyedNodeNS(undefined);



// CUSTOM


function _VirtualDom_custom(factList, model, render, diff)
{
	return {
		$: 3,
		d: _VirtualDom_organizeFacts(factList),
		g: model,
		h: render,
		i: diff
	};
}



// MAP


var _VirtualDom_map = F2(function(tagger, node)
{
	return {
		$: 4,
		j: tagger,
		k: node,
		b: 1 + (node.b || 0)
	};
});



// LAZY


function _VirtualDom_thunk(refs, thunk)
{
	return {
		$: 5,
		l: refs,
		m: thunk,
		k: undefined
	};
}

var _VirtualDom_lazy = F2(function(func, a)
{
	return _VirtualDom_thunk([func, a], function() {
		return func(a);
	});
});

var _VirtualDom_lazy2 = F3(function(func, a, b)
{
	return _VirtualDom_thunk([func, a, b], function() {
		return A2(func, a, b);
	});
});

var _VirtualDom_lazy3 = F4(function(func, a, b, c)
{
	return _VirtualDom_thunk([func, a, b, c], function() {
		return A3(func, a, b, c);
	});
});

var _VirtualDom_lazy4 = F5(function(func, a, b, c, d)
{
	return _VirtualDom_thunk([func, a, b, c, d], function() {
		return A4(func, a, b, c, d);
	});
});

var _VirtualDom_lazy5 = F6(function(func, a, b, c, d, e)
{
	return _VirtualDom_thunk([func, a, b, c, d, e], function() {
		return A5(func, a, b, c, d, e);
	});
});

var _VirtualDom_lazy6 = F7(function(func, a, b, c, d, e, f)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f], function() {
		return A6(func, a, b, c, d, e, f);
	});
});

var _VirtualDom_lazy7 = F8(function(func, a, b, c, d, e, f, g)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g], function() {
		return A7(func, a, b, c, d, e, f, g);
	});
});

var _VirtualDom_lazy8 = F9(function(func, a, b, c, d, e, f, g, h)
{
	return _VirtualDom_thunk([func, a, b, c, d, e, f, g, h], function() {
		return A8(func, a, b, c, d, e, f, g, h);
	});
});



// FACTS


var _VirtualDom_on = F2(function(key, handler)
{
	return {
		$: 'a0',
		n: key,
		o: handler
	};
});
var _VirtualDom_style = F2(function(key, value)
{
	return {
		$: 'a1',
		n: key,
		o: value
	};
});
var _VirtualDom_property = F2(function(key, value)
{
	return {
		$: 'a2',
		n: key,
		o: value
	};
});
var _VirtualDom_attribute = F2(function(key, value)
{
	return {
		$: 'a3',
		n: key,
		o: value
	};
});
var _VirtualDom_attributeNS = F3(function(namespace, key, value)
{
	return {
		$: 'a4',
		n: key,
		o: { f: namespace, o: value }
	};
});



// XSS ATTACK VECTOR CHECKS
//
// For some reason, tabs can appear in href protocols and it still works.
// So '\tjava\tSCRIPT:alert("!!!")' and 'javascript:alert("!!!")' are the same
// in practice. That is why _VirtualDom_RE_js and _VirtualDom_RE_js_html look
// so freaky.
//
// Pulling the regular expressions out to the top level gives a slight speed
// boost in small benchmarks (4-10%) but hoisting values to reduce allocation
// can be unpredictable in large programs where JIT may have a harder time with
// functions are not fully self-contained. The benefit is more that the js and
// js_html ones are so weird that I prefer to see them near each other.


var _VirtualDom_RE_script = /^script$/i;
var _VirtualDom_RE_on_formAction = /^(on|formAction$)/i;
var _VirtualDom_RE_js = /^\s*j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:/i;
var _VirtualDom_RE_js_html = /^\s*(j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:|d\s*a\s*t\s*a\s*:\s*t\s*e\s*x\s*t\s*\/\s*h\s*t\s*m\s*l\s*(,|;))/i;


function _VirtualDom_noScript(tag)
{
	return _VirtualDom_RE_script.test(tag) ? 'p' : tag;
}

function _VirtualDom_noOnOrFormAction(key)
{
	return _VirtualDom_RE_on_formAction.test(key) ? 'data-' + key : key;
}

function _VirtualDom_noInnerHtmlOrFormAction(key)
{
	return key == 'innerHTML' || key == 'outerHTML' || key == 'formAction' ? 'data-' + key : key;
}

function _VirtualDom_noJavaScriptUri(value)
{
	return _VirtualDom_RE_js.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlUri(value)
{
	return _VirtualDom_RE_js_html.test(value)
		? /**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		: value;
}

function _VirtualDom_noJavaScriptOrHtmlJson(value)
{
	return (
		(typeof _Json_unwrap(value) === 'string' && _VirtualDom_RE_js_html.test(_Json_unwrap(value)))
		||
		(Array.isArray(_Json_unwrap(value)) && _VirtualDom_RE_js_html.test(String(_Json_unwrap(value))))
	)
		? _Json_wrap(
			/**/''//*//**_UNUSED/'javascript:alert("This is an XSS vector. Please use ports or web components instead.")'//*/
		) : value;
}



// MAP FACTS


var _VirtualDom_mapAttribute = F2(function(func, attr)
{
	return (attr.$ === 'a0')
		? A2(_VirtualDom_on, attr.n, _VirtualDom_mapHandler(func, attr.o))
		: attr;
});

function _VirtualDom_mapHandler(func, handler)
{
	var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

	// 0 = Normal
	// 1 = MayStopPropagation
	// 2 = MayPreventDefault
	// 3 = Custom

	return {
		$: handler.$,
		a:
			!tag
				? A2($elm$json$Json$Decode$map, func, handler.a)
				:
			A3($elm$json$Json$Decode$map2,
				tag < 3
					? _VirtualDom_mapEventTuple
					: _VirtualDom_mapEventRecord,
				$elm$json$Json$Decode$succeed(func),
				handler.a
			)
	};
}

var _VirtualDom_mapEventTuple = F2(function(func, tuple)
{
	return _Utils_Tuple2(func(tuple.a), tuple.b);
});

var _VirtualDom_mapEventRecord = F2(function(func, record)
{
	return {
		bj: func(record.bj),
		bt: record.bt,
		bn: record.bn
	}
});



// ORGANIZE FACTS


function _VirtualDom_organizeFacts(factList)
{
	for (var facts = {}; factList.b; factList = factList.b) // WHILE_CONS
	{
		var entry = factList.a;

		var tag = entry.$;
		var key = entry.n;
		var value = entry.o;

		if (tag === 'a2')
		{
			(key === 'className')
				? _VirtualDom_addClass(facts, key, _Json_unwrap(value))
				: facts[key] = _Json_unwrap(value);

			continue;
		}

		var subFacts = facts[tag] || (facts[tag] = {});
		(tag === 'a3' && key === 'class')
			? _VirtualDom_addClass(subFacts, key, value)
			: subFacts[key] = value;
	}

	return facts;
}

function _VirtualDom_addClass(object, key, newClass)
{
	var classes = object[key];
	object[key] = classes ? classes + ' ' + newClass : newClass;
}



// RENDER


function _VirtualDom_render(vNode, eventNode)
{
	var tag = vNode.$;

	if (tag === 5)
	{
		return _VirtualDom_render(vNode.k || (vNode.k = vNode.m()), eventNode);
	}

	if (tag === 0)
	{
		return _VirtualDom_doc.createTextNode(vNode.a);
	}

	if (tag === 4)
	{
		var subNode = vNode.k;
		var tagger = vNode.j;

		while (subNode.$ === 4)
		{
			typeof tagger !== 'object'
				? tagger = [tagger, subNode.j]
				: tagger.push(subNode.j);

			subNode = subNode.k;
		}

		var subEventRoot = { j: tagger, p: eventNode };
		var domNode = _VirtualDom_render(subNode, subEventRoot);
		domNode.elm_event_node_ref = subEventRoot;
		return domNode;
	}

	if (tag === 3)
	{
		var domNode = vNode.h(vNode.g);
		_VirtualDom_applyFacts(domNode, eventNode, vNode.d);
		return domNode;
	}

	// at this point `tag` must be 1 or 2

	var domNode = vNode.f
		? _VirtualDom_doc.createElementNS(vNode.f, vNode.c)
		: _VirtualDom_doc.createElement(vNode.c);

	if (_VirtualDom_divertHrefToApp && vNode.c == 'a')
	{
		domNode.addEventListener('click', _VirtualDom_divertHrefToApp(domNode));
	}

	_VirtualDom_applyFacts(domNode, eventNode, vNode.d);

	for (var kids = vNode.e, i = 0; i < kids.length; i++)
	{
		_VirtualDom_appendChild(domNode, _VirtualDom_render(tag === 1 ? kids[i] : kids[i].b, eventNode));
	}

	return domNode;
}



// APPLY FACTS


function _VirtualDom_applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		key === 'a1'
			? _VirtualDom_applyStyles(domNode, value)
			:
		key === 'a0'
			? _VirtualDom_applyEvents(domNode, eventNode, value)
			:
		key === 'a3'
			? _VirtualDom_applyAttrs(domNode, value)
			:
		key === 'a4'
			? _VirtualDom_applyAttrsNS(domNode, value)
			:
		((key !== 'value' && key !== 'checked') || domNode[key] !== value) && (domNode[key] = value);
	}
}



// APPLY STYLES


function _VirtualDom_applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}



// APPLY ATTRS


function _VirtualDom_applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		typeof value !== 'undefined'
			? domNode.setAttribute(key, value)
			: domNode.removeAttribute(key);
	}
}



// APPLY NAMESPACED ATTRS


function _VirtualDom_applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.f;
		var value = pair.o;

		typeof value !== 'undefined'
			? domNode.setAttributeNS(namespace, key, value)
			: domNode.removeAttributeNS(namespace, key);
	}
}



// APPLY EVENTS


function _VirtualDom_applyEvents(domNode, eventNode, events)
{
	var allCallbacks = domNode.elmFs || (domNode.elmFs = {});

	for (var key in events)
	{
		var newHandler = events[key];
		var oldCallback = allCallbacks[key];

		if (!newHandler)
		{
			domNode.removeEventListener(key, oldCallback);
			allCallbacks[key] = undefined;
			continue;
		}

		if (oldCallback)
		{
			var oldHandler = oldCallback.q;
			if (oldHandler.$ === newHandler.$)
			{
				oldCallback.q = newHandler;
				continue;
			}
			domNode.removeEventListener(key, oldCallback);
		}

		oldCallback = _VirtualDom_makeCallback(eventNode, newHandler);
		domNode.addEventListener(key, oldCallback,
			_VirtualDom_passiveSupported
			&& { passive: $elm$virtual_dom$VirtualDom$toHandlerInt(newHandler) < 2 }
		);
		allCallbacks[key] = oldCallback;
	}
}



// PASSIVE EVENTS


var _VirtualDom_passiveSupported;

try
{
	window.addEventListener('t', null, Object.defineProperty({}, 'passive', {
		get: function() { _VirtualDom_passiveSupported = true; }
	}));
}
catch(e) {}



// EVENT HANDLERS


function _VirtualDom_makeCallback(eventNode, initialHandler)
{
	function callback(event)
	{
		var handler = callback.q;
		var result = _Json_runHelp(handler.a, event);

		if (!$elm$core$Result$isOk(result))
		{
			return;
		}

		var tag = $elm$virtual_dom$VirtualDom$toHandlerInt(handler);

		// 0 = Normal
		// 1 = MayStopPropagation
		// 2 = MayPreventDefault
		// 3 = Custom

		var value = result.a;
		var message = !tag ? value : tag < 3 ? value.a : value.bj;
		var stopPropagation = tag == 1 ? value.b : tag == 3 && value.bt;
		var currentEventNode = (
			stopPropagation && event.stopPropagation(),
			(tag == 2 ? value.b : tag == 3 && value.bn) && event.preventDefault(),
			eventNode
		);
		var tagger;
		var i;
		while (tagger = currentEventNode.j)
		{
			if (typeof tagger == 'function')
			{
				message = tagger(message);
			}
			else
			{
				for (var i = tagger.length; i--; )
				{
					message = tagger[i](message);
				}
			}
			currentEventNode = currentEventNode.p;
		}
		currentEventNode(message, stopPropagation); // stopPropagation implies isSync
	}

	callback.q = initialHandler;

	return callback;
}

function _VirtualDom_equalEvents(x, y)
{
	return x.$ == y.$ && _Json_equality(x.a, y.a);
}



// DIFF


// TODO: Should we do patches like in iOS?
//
// type Patch
//   = At Int Patch
//   | Batch (List Patch)
//   | Change ...
//
// How could it not be better?
//
function _VirtualDom_diff(x, y)
{
	var patches = [];
	_VirtualDom_diffHelp(x, y, patches, 0);
	return patches;
}


function _VirtualDom_pushPatch(patches, type, index, data)
{
	var patch = {
		$: type,
		r: index,
		s: data,
		t: undefined,
		u: undefined
	};
	patches.push(patch);
	return patch;
}


function _VirtualDom_diffHelp(x, y, patches, index)
{
	if (x === y)
	{
		return;
	}

	var xType = x.$;
	var yType = y.$;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (xType !== yType)
	{
		if (xType === 1 && yType === 2)
		{
			y = _VirtualDom_dekey(y);
			yType = 1;
		}
		else
		{
			_VirtualDom_pushPatch(patches, 0, index, y);
			return;
		}
	}

	// Now we know that both nodes are the same $.
	switch (yType)
	{
		case 5:
			var xRefs = x.l;
			var yRefs = y.l;
			var i = xRefs.length;
			var same = i === yRefs.length;
			while (same && i--)
			{
				same = xRefs[i] === yRefs[i];
			}
			if (same)
			{
				y.k = x.k;
				return;
			}
			y.k = y.m();
			var subPatches = [];
			_VirtualDom_diffHelp(x.k, y.k, subPatches, 0);
			subPatches.length > 0 && _VirtualDom_pushPatch(patches, 1, index, subPatches);
			return;

		case 4:
			// gather nested taggers
			var xTaggers = x.j;
			var yTaggers = y.j;
			var nesting = false;

			var xSubNode = x.k;
			while (xSubNode.$ === 4)
			{
				nesting = true;

				typeof xTaggers !== 'object'
					? xTaggers = [xTaggers, xSubNode.j]
					: xTaggers.push(xSubNode.j);

				xSubNode = xSubNode.k;
			}

			var ySubNode = y.k;
			while (ySubNode.$ === 4)
			{
				nesting = true;

				typeof yTaggers !== 'object'
					? yTaggers = [yTaggers, ySubNode.j]
					: yTaggers.push(ySubNode.j);

				ySubNode = ySubNode.k;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && xTaggers.length !== yTaggers.length)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !_VirtualDom_pairwiseRefEqual(xTaggers, yTaggers) : xTaggers !== yTaggers)
			{
				_VirtualDom_pushPatch(patches, 2, index, yTaggers);
			}

			// diff everything below the taggers
			_VirtualDom_diffHelp(xSubNode, ySubNode, patches, index + 1);
			return;

		case 0:
			if (x.a !== y.a)
			{
				_VirtualDom_pushPatch(patches, 3, index, y.a);
			}
			return;

		case 1:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKids);
			return;

		case 2:
			_VirtualDom_diffNodes(x, y, patches, index, _VirtualDom_diffKeyedKids);
			return;

		case 3:
			if (x.h !== y.h)
			{
				_VirtualDom_pushPatch(patches, 0, index, y);
				return;
			}

			var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
			factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

			var patch = y.i(x.g, y.g);
			patch && _VirtualDom_pushPatch(patches, 5, index, patch);

			return;
	}
}

// assumes the incoming arrays are the same length
function _VirtualDom_pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}

function _VirtualDom_diffNodes(x, y, patches, index, diffKids)
{
	// Bail if obvious indicators have changed. Implies more serious
	// structural changes such that it's not worth it to diff.
	if (x.c !== y.c || x.f !== y.f)
	{
		_VirtualDom_pushPatch(patches, 0, index, y);
		return;
	}

	var factsDiff = _VirtualDom_diffFacts(x.d, y.d);
	factsDiff && _VirtualDom_pushPatch(patches, 4, index, factsDiff);

	diffKids(x, y, patches, index);
}



// DIFF FACTS


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function _VirtualDom_diffFacts(x, y, category)
{
	var diff;

	// look for changes and removals
	for (var xKey in x)
	{
		if (xKey === 'a1' || xKey === 'a0' || xKey === 'a3' || xKey === 'a4')
		{
			var subDiff = _VirtualDom_diffFacts(x[xKey], y[xKey] || {}, xKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[xKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(xKey in y))
		{
			diff = diff || {};
			diff[xKey] =
				!category
					? (typeof x[xKey] === 'string' ? '' : null)
					:
				(category === 'a1')
					? ''
					:
				(category === 'a0' || category === 'a3')
					? undefined
					:
				{ f: x[xKey].f, o: undefined };

			continue;
		}

		var xValue = x[xKey];
		var yValue = y[xKey];

		// reference equal, so don't worry about it
		if (xValue === yValue && xKey !== 'value' && xKey !== 'checked'
			|| category === 'a0' && _VirtualDom_equalEvents(xValue, yValue))
		{
			continue;
		}

		diff = diff || {};
		diff[xKey] = yValue;
	}

	// add new stuff
	for (var yKey in y)
	{
		if (!(yKey in x))
		{
			diff = diff || {};
			diff[yKey] = y[yKey];
		}
	}

	return diff;
}



// DIFF KIDS


function _VirtualDom_diffKids(xParent, yParent, patches, index)
{
	var xKids = xParent.e;
	var yKids = yParent.e;

	var xLen = xKids.length;
	var yLen = yKids.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (xLen > yLen)
	{
		_VirtualDom_pushPatch(patches, 6, index, {
			v: yLen,
			i: xLen - yLen
		});
	}
	else if (xLen < yLen)
	{
		_VirtualDom_pushPatch(patches, 7, index, {
			v: xLen,
			e: yKids
		});
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	for (var minLen = xLen < yLen ? xLen : yLen, i = 0; i < minLen; i++)
	{
		var xKid = xKids[i];
		_VirtualDom_diffHelp(xKid, yKids[i], patches, ++index);
		index += xKid.b || 0;
	}
}



// KEYED DIFF


function _VirtualDom_diffKeyedKids(xParent, yParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var xKids = xParent.e;
	var yKids = yParent.e;
	var xLen = xKids.length;
	var yLen = yKids.length;
	var xIndex = 0;
	var yIndex = 0;

	var index = rootIndex;

	while (xIndex < xLen && yIndex < yLen)
	{
		var x = xKids[xIndex];
		var y = yKids[yIndex];

		var xKey = x.a;
		var yKey = y.a;
		var xNode = x.b;
		var yNode = y.b;

		var newMatch = undefined;
		var oldMatch = undefined;

		// check if keys match

		if (xKey === yKey)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNode, localPatches, index);
			index += xNode.b || 0;

			xIndex++;
			yIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var xNext = xKids[xIndex + 1];
		var yNext = yKids[yIndex + 1];

		if (xNext)
		{
			var xNextKey = xNext.a;
			var xNextNode = xNext.b;
			oldMatch = yKey === xNextKey;
		}

		if (yNext)
		{
			var yNextKey = yNext.a;
			var yNextNode = yNext.b;
			newMatch = xKey === yNextKey;
		}


		// swap x and y
		if (newMatch && oldMatch)
		{
			index++;
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			_VirtualDom_insertNode(changes, localPatches, xKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNextNode, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		// insert y
		if (newMatch)
		{
			index++;
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			_VirtualDom_diffHelp(xNode, yNextNode, localPatches, index);
			index += xNode.b || 0;

			xIndex += 1;
			yIndex += 2;
			continue;
		}

		// remove x
		if (oldMatch)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 1;
			continue;
		}

		// remove x, insert y
		if (xNext && xNextKey === yNextKey)
		{
			index++;
			_VirtualDom_removeNode(changes, localPatches, xKey, xNode, index);
			_VirtualDom_insertNode(changes, localPatches, yKey, yNode, yIndex, inserts);
			index += xNode.b || 0;

			index++;
			_VirtualDom_diffHelp(xNextNode, yNextNode, localPatches, index);
			index += xNextNode.b || 0;

			xIndex += 2;
			yIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (xIndex < xLen)
	{
		index++;
		var x = xKids[xIndex];
		var xNode = x.b;
		_VirtualDom_removeNode(changes, localPatches, x.a, xNode, index);
		index += xNode.b || 0;
		xIndex++;
	}

	while (yIndex < yLen)
	{
		var endInserts = endInserts || [];
		var y = yKids[yIndex];
		_VirtualDom_insertNode(changes, localPatches, y.a, y.b, undefined, endInserts);
		yIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || endInserts)
	{
		_VirtualDom_pushPatch(patches, 8, rootIndex, {
			w: localPatches,
			x: inserts,
			y: endInserts
		});
	}
}



// CHANGES FROM KEYED DIFF


var _VirtualDom_POSTFIX = '_elmW6BL';


function _VirtualDom_insertNode(changes, localPatches, key, vnode, yIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		entry = {
			c: 0,
			z: vnode,
			r: yIndex,
			s: undefined
		};

		inserts.push({ r: yIndex, A: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.c === 1)
	{
		inserts.push({ r: yIndex, A: entry });

		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(entry.z, vnode, subPatches, entry.r);
		entry.r = yIndex;
		entry.s.s = {
			w: subPatches,
			A: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	_VirtualDom_insertNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, yIndex, inserts);
}


function _VirtualDom_removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (!entry)
	{
		var patch = _VirtualDom_pushPatch(localPatches, 9, index, undefined);

		changes[key] = {
			c: 1,
			z: vnode,
			r: index,
			s: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.c === 0)
	{
		entry.c = 2;
		var subPatches = [];
		_VirtualDom_diffHelp(vnode, entry.z, subPatches, index);

		_VirtualDom_pushPatch(localPatches, 9, index, {
			w: subPatches,
			A: entry
		});

		return;
	}

	// this key has already been removed or moved, a duplicate!
	_VirtualDom_removeNode(changes, localPatches, key + _VirtualDom_POSTFIX, vnode, index);
}



// ADD DOM NODES
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function _VirtualDom_addDomNodes(domNode, vNode, patches, eventNode)
{
	_VirtualDom_addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.b, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function _VirtualDom_addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.r;

	while (index === low)
	{
		var patchType = patch.$;

		if (patchType === 1)
		{
			_VirtualDom_addDomNodes(domNode, vNode.k, patch.s, eventNode);
		}
		else if (patchType === 8)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var subPatches = patch.s.w;
			if (subPatches.length > 0)
			{
				_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 9)
		{
			patch.t = domNode;
			patch.u = eventNode;

			var data = patch.s;
			if (data)
			{
				data.A.s = domNode;
				var subPatches = data.w;
				if (subPatches.length > 0)
				{
					_VirtualDom_addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.t = domNode;
			patch.u = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.r) > high)
		{
			return i;
		}
	}

	var tag = vNode.$;

	if (tag === 4)
	{
		var subNode = vNode.k;

		while (subNode.$ === 4)
		{
			subNode = subNode.k;
		}

		return _VirtualDom_addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);
	}

	// tag must be 1 or 2 at this point

	var vKids = vNode.e;
	var childNodes = domNode.childNodes;
	for (var j = 0; j < vKids.length; j++)
	{
		low++;
		var vKid = tag === 1 ? vKids[j] : vKids[j].b;
		var nextLow = low + (vKid.b || 0);
		if (low <= index && index <= nextLow)
		{
			i = _VirtualDom_addDomNodesHelp(childNodes[j], vKid, patches, i, low, nextLow, eventNode);
			if (!(patch = patches[i]) || (index = patch.r) > high)
			{
				return i;
			}
		}
		low = nextLow;
	}
	return i;
}



// APPLY PATCHES


function _VirtualDom_applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	_VirtualDom_addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return _VirtualDom_applyPatchesHelp(rootDomNode, patches);
}

function _VirtualDom_applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.t
		var newNode = _VirtualDom_applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function _VirtualDom_applyPatch(domNode, patch)
{
	switch (patch.$)
	{
		case 0:
			return _VirtualDom_applyPatchRedraw(domNode, patch.s, patch.u);

		case 4:
			_VirtualDom_applyFacts(domNode, patch.u, patch.s);
			return domNode;

		case 3:
			domNode.replaceData(0, domNode.length, patch.s);
			return domNode;

		case 1:
			return _VirtualDom_applyPatchesHelp(domNode, patch.s);

		case 2:
			if (domNode.elm_event_node_ref)
			{
				domNode.elm_event_node_ref.j = patch.s;
			}
			else
			{
				domNode.elm_event_node_ref = { j: patch.s, p: patch.u };
			}
			return domNode;

		case 6:
			var data = patch.s;
			for (var i = 0; i < data.i; i++)
			{
				domNode.removeChild(domNode.childNodes[data.v]);
			}
			return domNode;

		case 7:
			var data = patch.s;
			var kids = data.e;
			var i = data.v;
			var theEnd = domNode.childNodes[i];
			for (; i < kids.length; i++)
			{
				domNode.insertBefore(_VirtualDom_render(kids[i], patch.u), theEnd);
			}
			return domNode;

		case 9:
			var data = patch.s;
			if (!data)
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.A;
			if (typeof entry.r !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.s = _VirtualDom_applyPatchesHelp(domNode, data.w);
			return domNode;

		case 8:
			return _VirtualDom_applyPatchReorder(domNode, patch);

		case 5:
			return patch.s(domNode);

		default:
			_Debug_crash(10); // 'Ran into an unknown patch!'
	}
}


function _VirtualDom_applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = _VirtualDom_render(vNode, eventNode);

	if (!newNode.elm_event_node_ref)
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function _VirtualDom_applyPatchReorder(domNode, patch)
{
	var data = patch.s;

	// remove end inserts
	var frag = _VirtualDom_applyPatchReorderEndInsertsHelp(data.y, patch);

	// removals
	domNode = _VirtualDom_applyPatchesHelp(domNode, data.w);

	// inserts
	var inserts = data.x;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.A;
		var node = entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u);
		domNode.insertBefore(node, domNode.childNodes[insert.r]);
	}

	// add end inserts
	if (frag)
	{
		_VirtualDom_appendChild(domNode, frag);
	}

	return domNode;
}


function _VirtualDom_applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (!endInserts)
	{
		return;
	}

	var frag = _VirtualDom_doc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.A;
		_VirtualDom_appendChild(frag, entry.c === 2
			? entry.s
			: _VirtualDom_render(entry.z, patch.u)
		);
	}
	return frag;
}


function _VirtualDom_virtualize(node)
{
	// TEXT NODES

	if (node.nodeType === 3)
	{
		return _VirtualDom_text(node.textContent);
	}


	// WEIRD NODES

	if (node.nodeType !== 1)
	{
		return _VirtualDom_text('');
	}


	// ELEMENT NODES

	var attrList = _List_Nil;
	var attrs = node.attributes;
	for (var i = attrs.length; i--; )
	{
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		attrList = _List_Cons( A2(_VirtualDom_attribute, name, value), attrList );
	}

	var tag = node.tagName.toLowerCase();
	var kidList = _List_Nil;
	var kids = node.childNodes;

	for (var i = kids.length; i--; )
	{
		kidList = _List_Cons(_VirtualDom_virtualize(kids[i]), kidList);
	}
	return A3(_VirtualDom_node, tag, attrList, kidList);
}

function _VirtualDom_dekey(keyedNode)
{
	var keyedKids = keyedNode.e;
	var len = keyedKids.length;
	var kids = new Array(len);
	for (var i = 0; i < len; i++)
	{
		kids[i] = keyedKids[i].b;
	}

	return {
		$: 1,
		c: keyedNode.c,
		d: keyedNode.d,
		e: kids,
		f: keyedNode.f,
		b: keyedNode.b
	};
}




// ELEMENT


var _Debugger_element;

var _Browser_element = _Debugger_element || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.bf,
		impl.bx,
		impl.bu,
		function(sendToApp, initialModel) {
			var view = impl.bz;
			/**/
			var domNode = args['node'];
			//*/
			/**_UNUSED/
			var domNode = args && args['node'] ? args['node'] : _Debug_crash(0);
			//*/
			var currNode = _VirtualDom_virtualize(domNode);

			return _Browser_makeAnimator(initialModel, function(model)
			{
				var nextNode = view(model);
				var patches = _VirtualDom_diff(currNode, nextNode);
				domNode = _VirtualDom_applyPatches(domNode, currNode, patches, sendToApp);
				currNode = nextNode;
			});
		}
	);
});



// DOCUMENT


var _Debugger_document;

var _Browser_document = _Debugger_document || F4(function(impl, flagDecoder, debugMetadata, args)
{
	return _Platform_initialize(
		flagDecoder,
		args,
		impl.bf,
		impl.bx,
		impl.bu,
		function(sendToApp, initialModel) {
			var divertHrefToApp = impl.ap && impl.ap(sendToApp)
			var view = impl.bz;
			var title = _VirtualDom_doc.title;
			var bodyNode = _VirtualDom_doc.body;
			var currNode = _VirtualDom_virtualize(bodyNode);
			return _Browser_makeAnimator(initialModel, function(model)
			{
				_VirtualDom_divertHrefToApp = divertHrefToApp;
				var doc = view(model);
				var nextNode = _VirtualDom_node('body')(_List_Nil)(doc.a7);
				var patches = _VirtualDom_diff(currNode, nextNode);
				bodyNode = _VirtualDom_applyPatches(bodyNode, currNode, patches, sendToApp);
				currNode = nextNode;
				_VirtualDom_divertHrefToApp = 0;
				(title !== doc.bw) && (_VirtualDom_doc.title = title = doc.bw);
			});
		}
	);
});



// ANIMATION


var _Browser_cancelAnimationFrame =
	typeof cancelAnimationFrame !== 'undefined'
		? cancelAnimationFrame
		: function(id) { clearTimeout(id); };

var _Browser_requestAnimationFrame =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { return setTimeout(callback, 1000 / 60); };


function _Browser_makeAnimator(model, draw)
{
	draw(model);

	var state = 0;

	function updateIfNeeded()
	{
		state = state === 1
			? 0
			: ( _Browser_requestAnimationFrame(updateIfNeeded), draw(model), 1 );
	}

	return function(nextModel, isSync)
	{
		model = nextModel;

		isSync
			? ( draw(model),
				state === 2 && (state = 1)
				)
			: ( state === 0 && _Browser_requestAnimationFrame(updateIfNeeded),
				state = 2
				);
	};
}



// APPLICATION


function _Browser_application(impl)
{
	var onUrlChange = impl.bk;
	var onUrlRequest = impl.bl;
	var key = function() { key.a(onUrlChange(_Browser_getUrl())); };

	return _Browser_document({
		ap: function(sendToApp)
		{
			key.a = sendToApp;
			_Browser_window.addEventListener('popstate', key);
			_Browser_window.navigator.userAgent.indexOf('Trident') < 0 || _Browser_window.addEventListener('hashchange', key);

			return F2(function(domNode, event)
			{
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button < 1 && !domNode.target && !domNode.hasAttribute('download'))
				{
					event.preventDefault();
					var href = domNode.href;
					var curr = _Browser_getUrl();
					var next = $elm$url$Url$fromString(href).a;
					sendToApp(onUrlRequest(
						(next
							&& curr.aM === next.aM
							&& curr.aA === next.aA
							&& curr.aJ.a === next.aJ.a
						)
							? $elm$browser$Browser$Internal(next)
							: $elm$browser$Browser$External(href)
					));
				}
			});
		},
		bf: function(flags)
		{
			return A3(impl.bf, flags, _Browser_getUrl(), key);
		},
		bz: impl.bz,
		bx: impl.bx,
		bu: impl.bu
	});
}

function _Browser_getUrl()
{
	return $elm$url$Url$fromString(_VirtualDom_doc.location.href).a || _Debug_crash(1);
}

var _Browser_go = F2(function(key, n)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		n && history.go(n);
		key();
	}));
});

var _Browser_pushUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.pushState({}, '', url);
		key();
	}));
});

var _Browser_replaceUrl = F2(function(key, url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function() {
		history.replaceState({}, '', url);
		key();
	}));
});



// GLOBAL EVENTS


var _Browser_fakeNode = { addEventListener: function() {}, removeEventListener: function() {} };
var _Browser_doc = typeof document !== 'undefined' ? document : _Browser_fakeNode;
var _Browser_window = typeof window !== 'undefined' ? window : _Browser_fakeNode;

var _Browser_on = F3(function(node, eventName, sendToSelf)
{
	return _Scheduler_spawn(_Scheduler_binding(function(callback)
	{
		function handler(event)	{ _Scheduler_rawSpawn(sendToSelf(event)); }
		node.addEventListener(eventName, handler, _VirtualDom_passiveSupported && { passive: true });
		return function() { node.removeEventListener(eventName, handler); };
	}));
});

var _Browser_decodeEvent = F2(function(decoder, event)
{
	var result = _Json_runHelp(decoder, event);
	return $elm$core$Result$isOk(result) ? $elm$core$Maybe$Just(result.a) : $elm$core$Maybe$Nothing;
});



// PAGE VISIBILITY


function _Browser_visibilityInfo()
{
	return (typeof _VirtualDom_doc.hidden !== 'undefined')
		? { bc: 'hidden', a8: 'visibilitychange' }
		:
	(typeof _VirtualDom_doc.mozHidden !== 'undefined')
		? { bc: 'mozHidden', a8: 'mozvisibilitychange' }
		:
	(typeof _VirtualDom_doc.msHidden !== 'undefined')
		? { bc: 'msHidden', a8: 'msvisibilitychange' }
		:
	(typeof _VirtualDom_doc.webkitHidden !== 'undefined')
		? { bc: 'webkitHidden', a8: 'webkitvisibilitychange' }
		: { bc: 'hidden', a8: 'visibilitychange' };
}



// ANIMATION FRAMES


function _Browser_rAF()
{
	return _Scheduler_binding(function(callback)
	{
		var id = _Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(Date.now()));
		});

		return function() {
			_Browser_cancelAnimationFrame(id);
		};
	});
}


function _Browser_now()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(Date.now()));
	});
}



// DOM STUFF


function _Browser_withNode(id, doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			var node = document.getElementById(id);
			callback(node
				? _Scheduler_succeed(doStuff(node))
				: _Scheduler_fail($elm$browser$Browser$Dom$NotFound(id))
			);
		});
	});
}


function _Browser_withWindow(doStuff)
{
	return _Scheduler_binding(function(callback)
	{
		_Browser_requestAnimationFrame(function() {
			callback(_Scheduler_succeed(doStuff()));
		});
	});
}


// FOCUS and BLUR


var _Browser_call = F2(function(functionName, id)
{
	return _Browser_withNode(id, function(node) {
		node[functionName]();
		return _Utils_Tuple0;
	});
});



// WINDOW VIEWPORT


function _Browser_getViewport()
{
	return {
		aR: _Browser_getScene(),
		aY: {
			a0: _Browser_window.pageXOffset,
			a1: _Browser_window.pageYOffset,
			a_: _Browser_doc.documentElement.clientWidth,
			az: _Browser_doc.documentElement.clientHeight
		}
	};
}

function _Browser_getScene()
{
	var body = _Browser_doc.body;
	var elem = _Browser_doc.documentElement;
	return {
		a_: Math.max(body.scrollWidth, body.offsetWidth, elem.scrollWidth, elem.offsetWidth, elem.clientWidth),
		az: Math.max(body.scrollHeight, body.offsetHeight, elem.scrollHeight, elem.offsetHeight, elem.clientHeight)
	};
}

var _Browser_setViewport = F2(function(x, y)
{
	return _Browser_withWindow(function()
	{
		_Browser_window.scroll(x, y);
		return _Utils_Tuple0;
	});
});



// ELEMENT VIEWPORT


function _Browser_getViewportOf(id)
{
	return _Browser_withNode(id, function(node)
	{
		return {
			aR: {
				a_: node.scrollWidth,
				az: node.scrollHeight
			},
			aY: {
				a0: node.scrollLeft,
				a1: node.scrollTop,
				a_: node.clientWidth,
				az: node.clientHeight
			}
		};
	});
}


var _Browser_setViewportOf = F3(function(id, x, y)
{
	return _Browser_withNode(id, function(node)
	{
		node.scrollLeft = x;
		node.scrollTop = y;
		return _Utils_Tuple0;
	});
});



// ELEMENT


function _Browser_getElement(id)
{
	return _Browser_withNode(id, function(node)
	{
		var rect = node.getBoundingClientRect();
		var x = _Browser_window.pageXOffset;
		var y = _Browser_window.pageYOffset;
		return {
			aR: _Browser_getScene(),
			aY: {
				a0: x,
				a1: y,
				a_: _Browser_doc.documentElement.clientWidth,
				az: _Browser_doc.documentElement.clientHeight
			},
			ba: {
				a0: x + rect.left,
				a1: y + rect.top,
				a_: rect.width,
				az: rect.height
			}
		};
	});
}



// LOAD and RELOAD


function _Browser_reload(skipCache)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		_VirtualDom_doc.location.reload(skipCache);
	}));
}

function _Browser_load(url)
{
	return A2($elm$core$Task$perform, $elm$core$Basics$never, _Scheduler_binding(function(callback)
	{
		try
		{
			_Browser_window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			_VirtualDom_doc.location.reload(false);
		}
	}));
}



function _Time_now(millisToPosix)
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(millisToPosix(Date.now())));
	});
}

var _Time_setInterval = F2(function(interval, task)
{
	return _Scheduler_binding(function(callback)
	{
		var id = setInterval(function() { _Scheduler_rawSpawn(task); }, interval);
		return function() { clearInterval(id); };
	});
});

function _Time_here()
{
	return _Scheduler_binding(function(callback)
	{
		callback(_Scheduler_succeed(
			A2($elm$time$Time$customZone, -(new Date().getTimezoneOffset()), _List_Nil)
		));
	});
}


function _Time_getZoneName()
{
	return _Scheduler_binding(function(callback)
	{
		try
		{
			var name = $elm$time$Time$Name(Intl.DateTimeFormat().resolvedOptions().timeZone);
		}
		catch (e)
		{
			var name = $elm$time$Time$Offset(new Date().getTimezoneOffset());
		}
		callback(_Scheduler_succeed(name));
	});
}



var _Bitwise_and = F2(function(a, b)
{
	return a & b;
});

var _Bitwise_or = F2(function(a, b)
{
	return a | b;
});

var _Bitwise_xor = F2(function(a, b)
{
	return a ^ b;
});

function _Bitwise_complement(a)
{
	return ~a;
};

var _Bitwise_shiftLeftBy = F2(function(offset, a)
{
	return a << offset;
});

var _Bitwise_shiftRightBy = F2(function(offset, a)
{
	return a >> offset;
});

var _Bitwise_shiftRightZfBy = F2(function(offset, a)
{
	return a >>> offset;
});



// DECODER

var _File_decoder = _Json_decodePrim(function(value) {
	// NOTE: checks if `File` exists in case this is run on node
	return (typeof File !== 'undefined' && value instanceof File)
		? $elm$core$Result$Ok(value)
		: _Json_expecting('a FILE', value);
});


// METADATA

function _File_name(file) { return file.name; }
function _File_mime(file) { return file.type; }
function _File_size(file) { return file.size; }

function _File_lastModified(file)
{
	return $elm$time$Time$millisToPosix(file.lastModified);
}


// DOWNLOAD

var _File_downloadNode;

function _File_getDownloadNode()
{
	return _File_downloadNode || (_File_downloadNode = document.createElement('a'));
}

var _File_download = F3(function(name, mime, content)
{
	return _Scheduler_binding(function(callback)
	{
		var blob = new Blob([content], {type: mime});

		// for IE10+
		if (navigator.msSaveOrOpenBlob)
		{
			navigator.msSaveOrOpenBlob(blob, name);
			return;
		}

		// for HTML5
		var node = _File_getDownloadNode();
		var objectUrl = URL.createObjectURL(blob);
		node.href = objectUrl;
		node.download = name;
		_File_click(node);
		URL.revokeObjectURL(objectUrl);
	});
});

function _File_downloadUrl(href)
{
	return _Scheduler_binding(function(callback)
	{
		var node = _File_getDownloadNode();
		node.href = href;
		node.download = '';
		node.origin === location.origin || (node.target = '_blank');
		_File_click(node);
	});
}


// IE COMPATIBILITY

function _File_makeBytesSafeForInternetExplorer(bytes)
{
	// only needed by IE10 and IE11 to fix https://github.com/elm/file/issues/10
	// all other browsers can just run `new Blob([bytes])` directly with no problem
	//
	return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function _File_click(node)
{
	// only needed by IE10 and IE11 to fix https://github.com/elm/file/issues/11
	// all other browsers have MouseEvent and do not need this conditional stuff
	//
	if (typeof MouseEvent === 'function')
	{
		node.dispatchEvent(new MouseEvent('click'));
	}
	else
	{
		var event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		document.body.appendChild(node);
		node.dispatchEvent(event);
		document.body.removeChild(node);
	}
}


// UPLOAD

var _File_node;

function _File_uploadOne(mimes)
{
	return _Scheduler_binding(function(callback)
	{
		_File_node = document.createElement('input');
		_File_node.type = 'file';
		_File_node.accept = A2($elm$core$String$join, ',', mimes);
		_File_node.addEventListener('change', function(event)
		{
			callback(_Scheduler_succeed(event.target.files[0]));
		});
		_File_click(_File_node);
	});
}

function _File_uploadOneOrMore(mimes)
{
	return _Scheduler_binding(function(callback)
	{
		_File_node = document.createElement('input');
		_File_node.type = 'file';
		_File_node.multiple = true;
		_File_node.accept = A2($elm$core$String$join, ',', mimes);
		_File_node.addEventListener('change', function(event)
		{
			var elmFiles = _List_fromArray(event.target.files);
			callback(_Scheduler_succeed(_Utils_Tuple2(elmFiles.a, elmFiles.b)));
		});
		_File_click(_File_node);
	});
}


// CONTENT

function _File_toString(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(reader.result));
		});
		reader.readAsText(blob);
		return function() { reader.abort(); };
	});
}

function _File_toBytes(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(new DataView(reader.result)));
		});
		reader.readAsArrayBuffer(blob);
		return function() { reader.abort(); };
	});
}

function _File_toUrl(blob)
{
	return _Scheduler_binding(function(callback)
	{
		var reader = new FileReader();
		reader.addEventListener('loadend', function() {
			callback(_Scheduler_succeed(reader.result));
		});
		reader.readAsDataURL(blob);
		return function() { reader.abort(); };
	});
}

var $elm$core$Basics$EQ = 1;
var $elm$core$Basics$GT = 2;
var $elm$core$Basics$LT = 0;
var $elm$core$List$cons = _List_cons;
var $elm$core$Dict$foldr = F3(
	function (func, acc, t) {
		foldr:
		while (true) {
			if (t.$ === -2) {
				return acc;
			} else {
				var key = t.b;
				var value = t.c;
				var left = t.d;
				var right = t.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldr, func, acc, right)),
					$temp$t = left;
				func = $temp$func;
				acc = $temp$acc;
				t = $temp$t;
				continue foldr;
			}
		}
	});
var $elm$core$Dict$toList = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					$elm$core$List$cons,
					_Utils_Tuple2(key, value),
					list);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Dict$keys = function (dict) {
	return A3(
		$elm$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2($elm$core$List$cons, key, keyList);
			}),
		_List_Nil,
		dict);
};
var $elm$core$Set$toList = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$keys(dict);
};
var $elm$core$Elm$JsArray$foldr = _JsArray_foldr;
var $elm$core$Array$foldr = F3(
	function (func, baseCase, _v0) {
		var tree = _v0.c;
		var tail = _v0.d;
		var helper = F2(
			function (node, acc) {
				if (!node.$) {
					var subTree = node.a;
					return A3($elm$core$Elm$JsArray$foldr, helper, acc, subTree);
				} else {
					var values = node.a;
					return A3($elm$core$Elm$JsArray$foldr, func, acc, values);
				}
			});
		return A3(
			$elm$core$Elm$JsArray$foldr,
			helper,
			A3($elm$core$Elm$JsArray$foldr, func, baseCase, tail),
			tree);
	});
var $elm$core$Array$toList = function (array) {
	return A3($elm$core$Array$foldr, $elm$core$List$cons, _List_Nil, array);
};
var $elm$core$Result$Err = function (a) {
	return {$: 1, a: a};
};
var $elm$json$Json$Decode$Failure = F2(
	function (a, b) {
		return {$: 3, a: a, b: b};
	});
var $elm$json$Json$Decode$Field = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$json$Json$Decode$Index = F2(
	function (a, b) {
		return {$: 1, a: a, b: b};
	});
var $elm$core$Result$Ok = function (a) {
	return {$: 0, a: a};
};
var $elm$json$Json$Decode$OneOf = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Basics$False = 1;
var $elm$core$Basics$add = _Basics_add;
var $elm$core$Maybe$Just = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Maybe$Nothing = {$: 1};
var $elm$core$String$all = _String_all;
var $elm$core$Basics$and = _Basics_and;
var $elm$core$Basics$append = _Utils_append;
var $elm$json$Json$Encode$encode = _Json_encode;
var $elm$core$String$fromInt = _String_fromNumber;
var $elm$core$String$join = F2(
	function (sep, chunks) {
		return A2(
			_String_join,
			sep,
			_List_toArray(chunks));
	});
var $elm$core$String$split = F2(
	function (sep, string) {
		return _List_fromArray(
			A2(_String_split, sep, string));
	});
var $elm$json$Json$Decode$indent = function (str) {
	return A2(
		$elm$core$String$join,
		'\u000A    ',
		A2($elm$core$String$split, '\u000A', str));
};
var $elm$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			if (!list.b) {
				return acc;
			} else {
				var x = list.a;
				var xs = list.b;
				var $temp$func = func,
					$temp$acc = A2(func, x, acc),
					$temp$list = xs;
				func = $temp$func;
				acc = $temp$acc;
				list = $temp$list;
				continue foldl;
			}
		}
	});
var $elm$core$List$length = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (_v0, i) {
				return i + 1;
			}),
		0,
		xs);
};
var $elm$core$List$map2 = _List_map2;
var $elm$core$Basics$le = _Utils_le;
var $elm$core$Basics$sub = _Basics_sub;
var $elm$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_Utils_cmp(lo, hi) < 1) {
				var $temp$lo = lo,
					$temp$hi = hi - 1,
					$temp$list = A2($elm$core$List$cons, hi, list);
				lo = $temp$lo;
				hi = $temp$hi;
				list = $temp$list;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var $elm$core$List$range = F2(
	function (lo, hi) {
		return A3($elm$core$List$rangeHelp, lo, hi, _List_Nil);
	});
var $elm$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$map2,
			f,
			A2(
				$elm$core$List$range,
				0,
				$elm$core$List$length(xs) - 1),
			xs);
	});
var $elm$core$Char$toCode = _Char_toCode;
var $elm$core$Char$isLower = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (97 <= code) && (code <= 122);
};
var $elm$core$Char$isUpper = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 90) && (65 <= code);
};
var $elm$core$Basics$or = _Basics_or;
var $elm$core$Char$isAlpha = function (_char) {
	return $elm$core$Char$isLower(_char) || $elm$core$Char$isUpper(_char);
};
var $elm$core$Char$isDigit = function (_char) {
	var code = $elm$core$Char$toCode(_char);
	return (code <= 57) && (48 <= code);
};
var $elm$core$Char$isAlphaNum = function (_char) {
	return $elm$core$Char$isLower(_char) || ($elm$core$Char$isUpper(_char) || $elm$core$Char$isDigit(_char));
};
var $elm$core$List$reverse = function (list) {
	return A3($elm$core$List$foldl, $elm$core$List$cons, _List_Nil, list);
};
var $elm$core$String$uncons = _String_uncons;
var $elm$json$Json$Decode$errorOneOf = F2(
	function (i, error) {
		return '\u000A\u000A(' + ($elm$core$String$fromInt(i + 1) + (') ' + $elm$json$Json$Decode$indent(
			$elm$json$Json$Decode$errorToString(error))));
	});
var $elm$json$Json$Decode$errorToString = function (error) {
	return A2($elm$json$Json$Decode$errorToStringHelp, error, _List_Nil);
};
var $elm$json$Json$Decode$errorToStringHelp = F2(
	function (error, context) {
		errorToStringHelp:
		while (true) {
			switch (error.$) {
				case 0:
					var f = error.a;
					var err = error.b;
					var isSimple = function () {
						var _v1 = $elm$core$String$uncons(f);
						if (_v1.$ === 1) {
							return false;
						} else {
							var _v2 = _v1.a;
							var _char = _v2.a;
							var rest = _v2.b;
							return $elm$core$Char$isAlpha(_char) && A2($elm$core$String$all, $elm$core$Char$isAlphaNum, rest);
						}
					}();
					var fieldName = isSimple ? ('.' + f) : ('[\u0027' + (f + '\u0027]'));
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, fieldName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 1:
					var i = error.a;
					var err = error.b;
					var indexName = '[' + ($elm$core$String$fromInt(i) + ']');
					var $temp$error = err,
						$temp$context = A2($elm$core$List$cons, indexName, context);
					error = $temp$error;
					context = $temp$context;
					continue errorToStringHelp;
				case 2:
					var errors = error.a;
					if (!errors.b) {
						return 'Ran into a Json.Decode.oneOf with no possibilities' + function () {
							if (!context.b) {
								return '!';
							} else {
								return ' at json' + A2(
									$elm$core$String$join,
									'',
									$elm$core$List$reverse(context));
							}
						}();
					} else {
						if (!errors.b.b) {
							var err = errors.a;
							var $temp$error = err,
								$temp$context = context;
							error = $temp$error;
							context = $temp$context;
							continue errorToStringHelp;
						} else {
							var starter = function () {
								if (!context.b) {
									return 'Json.Decode.oneOf';
								} else {
									return 'The Json.Decode.oneOf at json' + A2(
										$elm$core$String$join,
										'',
										$elm$core$List$reverse(context));
								}
							}();
							var introduction = starter + (' failed in the following ' + ($elm$core$String$fromInt(
								$elm$core$List$length(errors)) + ' ways:'));
							return A2(
								$elm$core$String$join,
								'\u000A\u000A',
								A2(
									$elm$core$List$cons,
									introduction,
									A2($elm$core$List$indexedMap, $elm$json$Json$Decode$errorOneOf, errors)));
						}
					}
				default:
					var msg = error.a;
					var json = error.b;
					var introduction = function () {
						if (!context.b) {
							return 'Problem with the given value:\u000A\u000A';
						} else {
							return 'Problem with the value at json' + (A2(
								$elm$core$String$join,
								'',
								$elm$core$List$reverse(context)) + ':\u000A\u000A    ');
						}
					}();
					return introduction + ($elm$json$Json$Decode$indent(
						A2($elm$json$Json$Encode$encode, 4, json)) + ('\u000A\u000A' + msg));
			}
		}
	});
var $elm$core$Array$branchFactor = 32;
var $elm$core$Array$Array_elm_builtin = F4(
	function (a, b, c, d) {
		return {$: 0, a: a, b: b, c: c, d: d};
	});
var $elm$core$Elm$JsArray$empty = _JsArray_empty;
var $elm$core$Basics$ceiling = _Basics_ceiling;
var $elm$core$Basics$fdiv = _Basics_fdiv;
var $elm$core$Basics$logBase = F2(
	function (base, number) {
		return _Basics_log(number) / _Basics_log(base);
	});
var $elm$core$Basics$toFloat = _Basics_toFloat;
var $elm$core$Array$shiftStep = $elm$core$Basics$ceiling(
	A2($elm$core$Basics$logBase, 2, $elm$core$Array$branchFactor));
var $elm$core$Array$empty = A4($elm$core$Array$Array_elm_builtin, 0, $elm$core$Array$shiftStep, $elm$core$Elm$JsArray$empty, $elm$core$Elm$JsArray$empty);
var $elm$core$Elm$JsArray$initialize = _JsArray_initialize;
var $elm$core$Array$Leaf = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Basics$apL = F2(
	function (f, x) {
		return f(x);
	});
var $elm$core$Basics$apR = F2(
	function (x, f) {
		return f(x);
	});
var $elm$core$Basics$eq = _Utils_equal;
var $elm$core$Basics$floor = _Basics_floor;
var $elm$core$Elm$JsArray$length = _JsArray_length;
var $elm$core$Basics$gt = _Utils_gt;
var $elm$core$Basics$max = F2(
	function (x, y) {
		return (_Utils_cmp(x, y) > 0) ? x : y;
	});
var $elm$core$Basics$mul = _Basics_mul;
var $elm$core$Array$SubTree = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Elm$JsArray$initializeFromList = _JsArray_initializeFromList;
var $elm$core$Array$compressNodes = F2(
	function (nodes, acc) {
		compressNodes:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodes);
			var node = _v0.a;
			var remainingNodes = _v0.b;
			var newAcc = A2(
				$elm$core$List$cons,
				$elm$core$Array$SubTree(node),
				acc);
			if (!remainingNodes.b) {
				return $elm$core$List$reverse(newAcc);
			} else {
				var $temp$nodes = remainingNodes,
					$temp$acc = newAcc;
				nodes = $temp$nodes;
				acc = $temp$acc;
				continue compressNodes;
			}
		}
	});
var $elm$core$Tuple$first = function (_v0) {
	var x = _v0.a;
	return x;
};
var $elm$core$Array$treeFromBuilder = F2(
	function (nodeList, nodeListSize) {
		treeFromBuilder:
		while (true) {
			var newNodeSize = $elm$core$Basics$ceiling(nodeListSize / $elm$core$Array$branchFactor);
			if (newNodeSize === 1) {
				return A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, nodeList).a;
			} else {
				var $temp$nodeList = A2($elm$core$Array$compressNodes, nodeList, _List_Nil),
					$temp$nodeListSize = newNodeSize;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue treeFromBuilder;
			}
		}
	});
var $elm$core$Array$builderToArray = F2(
	function (reverseNodeList, builder) {
		if (!builder.b) {
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.d),
				$elm$core$Array$shiftStep,
				$elm$core$Elm$JsArray$empty,
				builder.d);
		} else {
			var treeLen = builder.b * $elm$core$Array$branchFactor;
			var depth = $elm$core$Basics$floor(
				A2($elm$core$Basics$logBase, $elm$core$Array$branchFactor, treeLen - 1));
			var correctNodeList = reverseNodeList ? $elm$core$List$reverse(builder.e) : builder.e;
			var tree = A2($elm$core$Array$treeFromBuilder, correctNodeList, builder.b);
			return A4(
				$elm$core$Array$Array_elm_builtin,
				$elm$core$Elm$JsArray$length(builder.d) + treeLen,
				A2($elm$core$Basics$max, 5, depth * $elm$core$Array$shiftStep),
				tree,
				builder.d);
		}
	});
var $elm$core$Basics$idiv = _Basics_idiv;
var $elm$core$Basics$lt = _Utils_lt;
var $elm$core$Array$initializeHelp = F5(
	function (fn, fromIndex, len, nodeList, tail) {
		initializeHelp:
		while (true) {
			if (fromIndex < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					false,
					{e: nodeList, b: (len / $elm$core$Array$branchFactor) | 0, d: tail});
			} else {
				var leaf = $elm$core$Array$Leaf(
					A3($elm$core$Elm$JsArray$initialize, $elm$core$Array$branchFactor, fromIndex, fn));
				var $temp$fn = fn,
					$temp$fromIndex = fromIndex - $elm$core$Array$branchFactor,
					$temp$len = len,
					$temp$nodeList = A2($elm$core$List$cons, leaf, nodeList),
					$temp$tail = tail;
				fn = $temp$fn;
				fromIndex = $temp$fromIndex;
				len = $temp$len;
				nodeList = $temp$nodeList;
				tail = $temp$tail;
				continue initializeHelp;
			}
		}
	});
var $elm$core$Basics$remainderBy = _Basics_remainderBy;
var $elm$core$Array$initialize = F2(
	function (len, fn) {
		if (len <= 0) {
			return $elm$core$Array$empty;
		} else {
			var tailLen = len % $elm$core$Array$branchFactor;
			var tail = A3($elm$core$Elm$JsArray$initialize, tailLen, len - tailLen, fn);
			var initialFromIndex = (len - tailLen) - $elm$core$Array$branchFactor;
			return A5($elm$core$Array$initializeHelp, fn, initialFromIndex, len, _List_Nil, tail);
		}
	});
var $elm$core$Basics$True = 0;
var $elm$core$Result$isOk = function (result) {
	if (!result.$) {
		return true;
	} else {
		return false;
	}
};
var $elm$json$Json$Decode$map = _Json_map1;
var $elm$json$Json$Decode$map2 = _Json_map2;
var $elm$json$Json$Decode$succeed = _Json_succeed;
var $elm$virtual_dom$VirtualDom$toHandlerInt = function (handler) {
	switch (handler.$) {
		case 0:
			return 0;
		case 1:
			return 1;
		case 2:
			return 2;
		default:
			return 3;
	}
};
var $elm$browser$Browser$External = function (a) {
	return {$: 1, a: a};
};
var $elm$browser$Browser$Internal = function (a) {
	return {$: 0, a: a};
};
var $elm$core$Basics$identity = function (x) {
	return x;
};
var $elm$browser$Browser$Dom$NotFound = $elm$core$Basics$identity;
var $elm$url$Url$Http = 0;
var $elm$url$Url$Https = 1;
var $elm$url$Url$Url = F6(
	function (protocol, host, port_, path, query, fragment) {
		return {ay: fragment, aA: host, aH: path, aJ: port_, aM: protocol, aN: query};
	});
var $elm$core$String$contains = _String_contains;
var $elm$core$String$length = _String_length;
var $elm$core$String$slice = _String_slice;
var $elm$core$String$dropLeft = F2(
	function (n, string) {
		return (n < 1) ? string : A3(
			$elm$core$String$slice,
			n,
			$elm$core$String$length(string),
			string);
	});
var $elm$core$String$indexes = _String_indexes;
var $elm$core$String$isEmpty = function (string) {
	return string === '';
};
var $elm$core$String$left = F2(
	function (n, string) {
		return (n < 1) ? '' : A3($elm$core$String$slice, 0, n, string);
	});
var $elm$core$String$toInt = _String_toInt;
var $elm$url$Url$chompBeforePath = F5(
	function (protocol, path, params, frag, str) {
		if ($elm$core$String$isEmpty(str) || A2($elm$core$String$contains, '@', str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, ':', str);
			if (!_v0.b) {
				return $elm$core$Maybe$Just(
					A6($elm$url$Url$Url, protocol, str, $elm$core$Maybe$Nothing, path, params, frag));
			} else {
				if (!_v0.b.b) {
					var i = _v0.a;
					var _v1 = $elm$core$String$toInt(
						A2($elm$core$String$dropLeft, i + 1, str));
					if (_v1.$ === 1) {
						return $elm$core$Maybe$Nothing;
					} else {
						var port_ = _v1;
						return $elm$core$Maybe$Just(
							A6(
								$elm$url$Url$Url,
								protocol,
								A2($elm$core$String$left, i, str),
								port_,
								path,
								params,
								frag));
					}
				} else {
					return $elm$core$Maybe$Nothing;
				}
			}
		}
	});
var $elm$url$Url$chompBeforeQuery = F4(
	function (protocol, params, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '/', str);
			if (!_v0.b) {
				return A5($elm$url$Url$chompBeforePath, protocol, '/', params, frag, str);
			} else {
				var i = _v0.a;
				return A5(
					$elm$url$Url$chompBeforePath,
					protocol,
					A2($elm$core$String$dropLeft, i, str),
					params,
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompBeforeFragment = F3(
	function (protocol, frag, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '?', str);
			if (!_v0.b) {
				return A4($elm$url$Url$chompBeforeQuery, protocol, $elm$core$Maybe$Nothing, frag, str);
			} else {
				var i = _v0.a;
				return A4(
					$elm$url$Url$chompBeforeQuery,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					frag,
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$url$Url$chompAfterProtocol = F2(
	function (protocol, str) {
		if ($elm$core$String$isEmpty(str)) {
			return $elm$core$Maybe$Nothing;
		} else {
			var _v0 = A2($elm$core$String$indexes, '#', str);
			if (!_v0.b) {
				return A3($elm$url$Url$chompBeforeFragment, protocol, $elm$core$Maybe$Nothing, str);
			} else {
				var i = _v0.a;
				return A3(
					$elm$url$Url$chompBeforeFragment,
					protocol,
					$elm$core$Maybe$Just(
						A2($elm$core$String$dropLeft, i + 1, str)),
					A2($elm$core$String$left, i, str));
			}
		}
	});
var $elm$core$String$startsWith = _String_startsWith;
var $elm$url$Url$fromString = function (str) {
	return A2($elm$core$String$startsWith, 'http://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		0,
		A2($elm$core$String$dropLeft, 7, str)) : (A2($elm$core$String$startsWith, 'https://', str) ? A2(
		$elm$url$Url$chompAfterProtocol,
		1,
		A2($elm$core$String$dropLeft, 8, str)) : $elm$core$Maybe$Nothing);
};
var $elm$core$Basics$never = function (_v0) {
	never:
	while (true) {
		var nvr = _v0;
		var $temp$_v0 = nvr;
		_v0 = $temp$_v0;
		continue never;
	}
};
var $elm$core$Task$Perform = $elm$core$Basics$identity;
var $elm$core$Task$succeed = _Scheduler_succeed;
var $elm$core$Task$init = $elm$core$Task$succeed(0);
var $elm$core$List$foldrHelper = F4(
	function (fn, acc, ctr, ls) {
		if (!ls.b) {
			return acc;
		} else {
			var a = ls.a;
			var r1 = ls.b;
			if (!r1.b) {
				return A2(fn, a, acc);
			} else {
				var b = r1.a;
				var r2 = r1.b;
				if (!r2.b) {
					return A2(
						fn,
						a,
						A2(fn, b, acc));
				} else {
					var c = r2.a;
					var r3 = r2.b;
					if (!r3.b) {
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(fn, c, acc)));
					} else {
						var d = r3.a;
						var r4 = r3.b;
						var res = (ctr > 500) ? A3(
							$elm$core$List$foldl,
							fn,
							acc,
							$elm$core$List$reverse(r4)) : A4($elm$core$List$foldrHelper, fn, acc, ctr + 1, r4);
						return A2(
							fn,
							a,
							A2(
								fn,
								b,
								A2(
									fn,
									c,
									A2(fn, d, res))));
					}
				}
			}
		}
	});
var $elm$core$List$foldr = F3(
	function (fn, acc, ls) {
		return A4($elm$core$List$foldrHelper, fn, acc, 0, ls);
	});
var $elm$core$List$map = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						$elm$core$List$cons,
						f(x),
						acc);
				}),
			_List_Nil,
			xs);
	});
var $elm$core$Task$andThen = _Scheduler_andThen;
var $elm$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return $elm$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var $elm$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			$elm$core$Task$andThen,
			function (a) {
				return A2(
					$elm$core$Task$andThen,
					function (b) {
						return $elm$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var $elm$core$Task$sequence = function (tasks) {
	return A3(
		$elm$core$List$foldr,
		$elm$core$Task$map2($elm$core$List$cons),
		$elm$core$Task$succeed(_List_Nil),
		tasks);
};
var $elm$core$Platform$sendToApp = _Platform_sendToApp;
var $elm$core$Task$spawnCmd = F2(
	function (router, _v0) {
		var task = _v0;
		return _Scheduler_spawn(
			A2(
				$elm$core$Task$andThen,
				$elm$core$Platform$sendToApp(router),
				task));
	});
var $elm$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			$elm$core$Task$map,
			function (_v0) {
				return 0;
			},
			$elm$core$Task$sequence(
				A2(
					$elm$core$List$map,
					$elm$core$Task$spawnCmd(router),
					commands)));
	});
var $elm$core$Task$onSelfMsg = F3(
	function (_v0, _v1, _v2) {
		return $elm$core$Task$succeed(0);
	});
var $elm$core$Task$cmdMap = F2(
	function (tagger, _v0) {
		var task = _v0;
		return A2($elm$core$Task$map, tagger, task);
	});
_Platform_effectManagers['Task'] = _Platform_createManager($elm$core$Task$init, $elm$core$Task$onEffects, $elm$core$Task$onSelfMsg, $elm$core$Task$cmdMap);
var $elm$core$Task$command = _Platform_leaf('Task');
var $elm$core$Task$perform = F2(
	function (toMessage, task) {
		return $elm$core$Task$command(
			A2($elm$core$Task$map, toMessage, task));
	});
var $elm$browser$Browser$element = _Browser_element;
var $author$project$Main$Tick = function (a) {
	return {$: 1, a: a};
};
var $elm$core$Set$Set_elm_builtin = $elm$core$Basics$identity;
var $elm$core$Dict$RBEmpty_elm_builtin = {$: -2};
var $elm$core$Dict$empty = $elm$core$Dict$RBEmpty_elm_builtin;
var $elm$core$Set$empty = $elm$core$Dict$empty;
var $elm$time$Time$Name = function (a) {
	return {$: 0, a: a};
};
var $elm$time$Time$Offset = function (a) {
	return {$: 1, a: a};
};
var $elm$time$Time$Zone = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$customZone = $elm$time$Time$Zone;
var $elm$time$Time$Posix = $elm$core$Basics$identity;
var $elm$time$Time$millisToPosix = $elm$core$Basics$identity;
var $elm$time$Time$now = _Time_now($elm$time$Time$millisToPosix);
var $author$project$Main$init = function (_v0) {
	return _Utils_Tuple2(
		{n: $elm$core$Set$empty, a3: $elm$core$Maybe$Nothing, J: false, K: '', A: '', L: true, M: '', ab: false, i: $elm$core$Maybe$Nothing, o: $elm$core$Maybe$Nothing, w: $elm$core$Maybe$Nothing, p: $elm$core$Maybe$Nothing, x: $elm$core$Maybe$Nothing, g: $elm$core$Maybe$Nothing, ac: $elm$core$Maybe$Nothing, q: 0, P: '', Q: false, R: '', ae: false, m: 0, F: $elm$core$Maybe$Nothing, S: $elm$core$Maybe$Nothing, T: $elm$core$Maybe$Nothing, U: $elm$core$Maybe$Nothing, G: $elm$core$Maybe$Nothing, bq: _List_Nil, af: $elm$core$Maybe$Nothing, V: false, ag: '', a: $elm$core$Set$empty, bv: _List_Nil},
		A2($elm$core$Task$perform, $author$project$Main$Tick, $elm$time$Time$now));
};
var $author$project$Main$DataLoaded = function (a) {
	return {$: 2, a: a};
};
var $elm$core$Platform$Sub$batch = _Platform_batch;
var $elm$time$Time$Every = F2(
	function (a, b) {
		return {$: 0, a: a, b: b};
	});
var $elm$time$Time$State = F2(
	function (taggers, processes) {
		return {aL: processes, aT: taggers};
	});
var $elm$time$Time$init = $elm$core$Task$succeed(
	A2($elm$time$Time$State, $elm$core$Dict$empty, $elm$core$Dict$empty));
var $elm$core$Basics$compare = _Utils_compare;
var $elm$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			if (dict.$ === -2) {
				return $elm$core$Maybe$Nothing;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var _v1 = A2($elm$core$Basics$compare, targetKey, key);
				switch (_v1) {
					case 0:
						var $temp$targetKey = targetKey,
							$temp$dict = left;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
					case 1:
						return $elm$core$Maybe$Just(value);
					default:
						var $temp$targetKey = targetKey,
							$temp$dict = right;
						targetKey = $temp$targetKey;
						dict = $temp$dict;
						continue get;
				}
			}
		}
	});
var $elm$core$Dict$Black = 1;
var $elm$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {$: -1, a: a, b: b, c: c, d: d, e: e};
	});
var $elm$core$Dict$Red = 0;
var $elm$core$Dict$balance = F5(
	function (color, key, value, left, right) {
		if ((right.$ === -1) && (!right.a)) {
			var _v1 = right.a;
			var rK = right.b;
			var rV = right.c;
			var rLeft = right.d;
			var rRight = right.e;
			if ((left.$ === -1) && (!left.a)) {
				var _v3 = left.a;
				var lK = left.b;
				var lV = left.c;
				var lLeft = left.d;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					key,
					value,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					rK,
					rV,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, left, rLeft),
					rRight);
			}
		} else {
			if ((((left.$ === -1) && (!left.a)) && (left.d.$ === -1)) && (!left.d.a)) {
				var _v5 = left.a;
				var lK = left.b;
				var lV = left.c;
				var _v6 = left.d;
				var _v7 = _v6.a;
				var llK = _v6.b;
				var llV = _v6.c;
				var llLeft = _v6.d;
				var llRight = _v6.e;
				var lRight = left.e;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					0,
					lK,
					lV,
					A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 1, key, value, lRight, right));
			} else {
				return A5($elm$core$Dict$RBNode_elm_builtin, color, key, value, left, right);
			}
		}
	});
var $elm$core$Dict$insertHelp = F3(
	function (key, value, dict) {
		if (dict.$ === -2) {
			return A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, $elm$core$Dict$RBEmpty_elm_builtin, $elm$core$Dict$RBEmpty_elm_builtin);
		} else {
			var nColor = dict.a;
			var nKey = dict.b;
			var nValue = dict.c;
			var nLeft = dict.d;
			var nRight = dict.e;
			var _v1 = A2($elm$core$Basics$compare, key, nKey);
			switch (_v1) {
				case 0:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						A3($elm$core$Dict$insertHelp, key, value, nLeft),
						nRight);
				case 1:
					return A5($elm$core$Dict$RBNode_elm_builtin, nColor, nKey, value, nLeft, nRight);
				default:
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						nLeft,
						A3($elm$core$Dict$insertHelp, key, value, nRight));
			}
		}
	});
var $elm$core$Dict$insert = F3(
	function (key, value, dict) {
		var _v0 = A3($elm$core$Dict$insertHelp, key, value, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$time$Time$addMySub = F2(
	function (_v0, state) {
		var interval = _v0.a;
		var tagger = _v0.b;
		var _v1 = A2($elm$core$Dict$get, interval, state);
		if (_v1.$ === 1) {
			return A3(
				$elm$core$Dict$insert,
				interval,
				_List_fromArray(
					[tagger]),
				state);
		} else {
			var taggers = _v1.a;
			return A3(
				$elm$core$Dict$insert,
				interval,
				A2($elm$core$List$cons, tagger, taggers),
				state);
		}
	});
var $elm$core$Process$kill = _Scheduler_kill;
var $elm$core$Dict$foldl = F3(
	function (func, acc, dict) {
		foldl:
		while (true) {
			if (dict.$ === -2) {
				return acc;
			} else {
				var key = dict.b;
				var value = dict.c;
				var left = dict.d;
				var right = dict.e;
				var $temp$func = func,
					$temp$acc = A3(
					func,
					key,
					value,
					A3($elm$core$Dict$foldl, func, acc, left)),
					$temp$dict = right;
				func = $temp$func;
				acc = $temp$acc;
				dict = $temp$dict;
				continue foldl;
			}
		}
	});
var $elm$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _v0) {
				stepState:
				while (true) {
					var list = _v0.a;
					var result = _v0.b;
					if (!list.b) {
						return _Utils_Tuple2(
							list,
							A3(rightStep, rKey, rValue, result));
					} else {
						var _v2 = list.a;
						var lKey = _v2.a;
						var lValue = _v2.b;
						var rest = list.b;
						if (_Utils_cmp(lKey, rKey) < 0) {
							var $temp$rKey = rKey,
								$temp$rValue = rValue,
								$temp$_v0 = _Utils_Tuple2(
								rest,
								A3(leftStep, lKey, lValue, result));
							rKey = $temp$rKey;
							rValue = $temp$rValue;
							_v0 = $temp$_v0;
							continue stepState;
						} else {
							if (_Utils_cmp(lKey, rKey) > 0) {
								return _Utils_Tuple2(
									list,
									A3(rightStep, rKey, rValue, result));
							} else {
								return _Utils_Tuple2(
									rest,
									A4(bothStep, lKey, lValue, rValue, result));
							}
						}
					}
				}
			});
		var _v3 = A3(
			$elm$core$Dict$foldl,
			stepState,
			_Utils_Tuple2(
				$elm$core$Dict$toList(leftDict),
				initialResult),
			rightDict);
		var leftovers = _v3.a;
		var intermediateResult = _v3.b;
		return A3(
			$elm$core$List$foldl,
			F2(
				function (_v4, result) {
					var k = _v4.a;
					var v = _v4.b;
					return A3(leftStep, k, v, result);
				}),
			intermediateResult,
			leftovers);
	});
var $elm$core$Platform$sendToSelf = _Platform_sendToSelf;
var $elm$time$Time$setInterval = _Time_setInterval;
var $elm$core$Process$spawn = _Scheduler_spawn;
var $elm$time$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		if (!intervals.b) {
			return $elm$core$Task$succeed(processes);
		} else {
			var interval = intervals.a;
			var rest = intervals.b;
			var spawnTimer = $elm$core$Process$spawn(
				A2(
					$elm$time$Time$setInterval,
					interval,
					A2($elm$core$Platform$sendToSelf, router, interval)));
			var spawnRest = function (id) {
				return A3(
					$elm$time$Time$spawnHelp,
					router,
					rest,
					A3($elm$core$Dict$insert, interval, id, processes));
			};
			return A2($elm$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var $elm$time$Time$onEffects = F3(
	function (router, subs, _v0) {
		var processes = _v0.aL;
		var rightStep = F3(
			function (_v6, id, _v7) {
				var spawns = _v7.a;
				var existing = _v7.b;
				var kills = _v7.c;
				return _Utils_Tuple3(
					spawns,
					existing,
					A2(
						$elm$core$Task$andThen,
						function (_v5) {
							return kills;
						},
						$elm$core$Process$kill(id)));
			});
		var newTaggers = A3($elm$core$List$foldl, $elm$time$Time$addMySub, $elm$core$Dict$empty, subs);
		var leftStep = F3(
			function (interval, taggers, _v4) {
				var spawns = _v4.a;
				var existing = _v4.b;
				var kills = _v4.c;
				return _Utils_Tuple3(
					A2($elm$core$List$cons, interval, spawns),
					existing,
					kills);
			});
		var bothStep = F4(
			function (interval, taggers, id, _v3) {
				var spawns = _v3.a;
				var existing = _v3.b;
				var kills = _v3.c;
				return _Utils_Tuple3(
					spawns,
					A3($elm$core$Dict$insert, interval, id, existing),
					kills);
			});
		var _v1 = A6(
			$elm$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			processes,
			_Utils_Tuple3(
				_List_Nil,
				$elm$core$Dict$empty,
				$elm$core$Task$succeed(0)));
		var spawnList = _v1.a;
		var existingDict = _v1.b;
		var killTask = _v1.c;
		return A2(
			$elm$core$Task$andThen,
			function (newProcesses) {
				return $elm$core$Task$succeed(
					A2($elm$time$Time$State, newTaggers, newProcesses));
			},
			A2(
				$elm$core$Task$andThen,
				function (_v2) {
					return A3($elm$time$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var $elm$time$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _v0 = A2($elm$core$Dict$get, interval, state.aT);
		if (_v0.$ === 1) {
			return $elm$core$Task$succeed(state);
		} else {
			var taggers = _v0.a;
			var tellTaggers = function (time) {
				return $elm$core$Task$sequence(
					A2(
						$elm$core$List$map,
						function (tagger) {
							return A2(
								$elm$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						taggers));
			};
			return A2(
				$elm$core$Task$andThen,
				function (_v1) {
					return $elm$core$Task$succeed(state);
				},
				A2($elm$core$Task$andThen, tellTaggers, $elm$time$Time$now));
		}
	});
var $elm$core$Basics$composeL = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var $elm$time$Time$subMap = F2(
	function (f, _v0) {
		var interval = _v0.a;
		var tagger = _v0.b;
		return A2(
			$elm$time$Time$Every,
			interval,
			A2($elm$core$Basics$composeL, f, tagger));
	});
_Platform_effectManagers['Time'] = _Platform_createManager($elm$time$Time$init, $elm$time$Time$onEffects, $elm$time$Time$onSelfMsg, 0, $elm$time$Time$subMap);
var $elm$time$Time$subscription = _Platform_leaf('Time');
var $elm$time$Time$every = F2(
	function (interval, tagger) {
		return $elm$time$Time$subscription(
			A2($elm$time$Time$Every, interval, tagger));
	});
var $elm$json$Json$Decode$value = _Json_decodeValue;
var $author$project$Ports$loadFromDb = _Platform_incomingPort('loadFromDb', $elm$json$Json$Decode$value);
var $author$project$Main$subscriptions = function (_v0) {
	return $elm$core$Platform$Sub$batch(
		_List_fromArray(
			[
				A2($elm$time$Time$every, 1000, $author$project$Main$Tick),
				$author$project$Ports$loadFromDb($author$project$Main$DataLoaded)
			]));
};
var $author$project$Main$AddMode = 0;
var $author$project$Main$EditMode = 1;
var $author$project$Main$FromBank = function (a) {
	return {$: 0, a: a};
};
var $author$project$Main$FromTest = function (a) {
	return {$: 1, a: a};
};
var $author$project$Main$GotBackupFile = function (a) {
	return {$: 23, a: a};
};
var $author$project$Main$GotBackupText = function (a) {
	return {$: 24, a: a};
};
var $elm$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		if (!maybeValue.$) {
			var value = maybeValue.a;
			return callback(value);
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$core$List$head = function (list) {
	if (list.b) {
		var x = list.a;
		var xs = list.b;
		return $elm$core$Maybe$Just(x);
	} else {
		return $elm$core$Maybe$Nothing;
	}
};
var $elm$core$Maybe$map = F2(
	function (f, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return $elm$core$Maybe$Just(
				f(value));
		} else {
			return $elm$core$Maybe$Nothing;
		}
	});
var $elm$json$Json$Encode$object = function (pairs) {
	return _Json_wrap(
		A3(
			$elm$core$List$foldl,
			F2(
				function (_v0, obj) {
					var k = _v0.a;
					var v = _v0.b;
					return A3(_Json_addField, k, v, obj);
				}),
			_Json_emptyObject(0),
			pairs));
};
var $elm$json$Json$Encode$string = _Json_wrap;
var $author$project$Codec$encodeAnswer = function (a) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'text',
				$elm$json$Json$Encode$string(a.Y)),
				_Utils_Tuple2(
				'justification',
				$elm$json$Json$Encode$string(a.al))
			]));
};
var $elm$json$Json$Encode$int = _Json_wrap;
var $elm$json$Json$Encode$list = F2(
	function (func, entries) {
		return _Json_wrap(
			A3(
				$elm$core$List$foldl,
				_Json_addEntry(func),
				_Json_emptyArray(0),
				entries));
	});
var $author$project$Codec$encodeSnapshot = function (s) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'version',
				$elm$json$Json$Encode$int(s.aX)),
				_Utils_Tuple2(
				'savedAt',
				$elm$json$Json$Encode$int(s.bs)),
				_Utils_Tuple2(
				'category',
				$elm$json$Json$Encode$string(s.as)),
				_Utils_Tuple2(
				'text',
				$elm$json$Json$Encode$string(s.Y)),
				_Utils_Tuple2(
				'correct',
				$author$project$Codec$encodeAnswer(s.au)),
				_Utils_Tuple2(
				'wrong',
				A2($elm$json$Json$Encode$list, $author$project$Codec$encodeAnswer, s.a$)),
				_Utils_Tuple2(
				'tags',
				A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, s.aU))
			]));
};
var $author$project$Codec$encodeQuestion = function (q) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$string(q.l)),
				_Utils_Tuple2(
				'familyId',
				$elm$json$Json$Encode$string(q.O)),
				_Utils_Tuple2(
				'version',
				$elm$json$Json$Encode$int(q.aX)),
				_Utils_Tuple2(
				'history',
				A2($elm$json$Json$Encode$list, $author$project$Codec$encodeSnapshot, q.bd)),
				_Utils_Tuple2(
				'updatedAt',
				$elm$json$Json$Encode$int(q.by)),
				_Utils_Tuple2(
				'category',
				$elm$json$Json$Encode$string(q.as)),
				_Utils_Tuple2(
				'text',
				$elm$json$Json$Encode$string(q.Y)),
				_Utils_Tuple2(
				'correct',
				$author$project$Codec$encodeAnswer(q.au)),
				_Utils_Tuple2(
				'wrong',
				A2($elm$json$Json$Encode$list, $author$project$Codec$encodeAnswer, q.a$)),
				_Utils_Tuple2(
				'tags',
				A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, q.aU))
			]));
};
var $author$project$Codec$encodeQuestionList = $elm$json$Json$Encode$list($author$project$Codec$encodeQuestion);
var $author$project$Codec$encodeGroup = function (g) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$string(g.l)),
				_Utils_Tuple2(
				'name',
				$elm$json$Json$Encode$string(g.aF)),
				_Utils_Tuple2(
				'questionIds',
				A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, g.bp))
			]));
};
var $author$project$Codec$encodeTest = function (t) {
	return $elm$json$Json$Encode$object(
		_List_fromArray(
			[
				_Utils_Tuple2(
				'id',
				$elm$json$Json$Encode$string(t.l)),
				_Utils_Tuple2(
				'name',
				$elm$json$Json$Encode$string(t.aF)),
				_Utils_Tuple2(
				'looseQuestionIds',
				A2($elm$json$Json$Encode$list, $elm$json$Json$Encode$string, t.bi)),
				_Utils_Tuple2(
				'groups',
				A2($elm$json$Json$Encode$list, $author$project$Codec$encodeGroup, t.am))
			]));
};
var $elm$json$Json$Encode$null = _Json_encodeNull;
var $author$project$Codec$encodePersisted = F3(
	function (questions, tests, activeTestId) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'schemaVersion',
					$elm$json$Json$Encode$int(1)),
					_Utils_Tuple2(
					'questions',
					$author$project$Codec$encodeQuestionList(questions)),
					_Utils_Tuple2(
					'tests',
					A2($elm$json$Json$Encode$list, $author$project$Codec$encodeTest, tests)),
					_Utils_Tuple2(
					'config',
					$elm$json$Json$Encode$object(
						_List_fromArray(
							[
								_Utils_Tuple2(
								'activeTestId',
								function () {
									if (!activeTestId.$) {
										var id = activeTestId.a;
										return $elm$json$Json$Encode$string(id);
									} else {
										return $elm$json$Json$Encode$null;
									}
								}())
							])))
				]));
	});
var $author$project$Ports$saveToDb = _Platform_outgoingPort('saveToDb', $elm$core$Basics$identity);
var $author$project$Main$save = function (model) {
	return $author$project$Ports$saveToDb(
		A3($author$project$Codec$encodePersisted, model.bq, model.bv, model.a3));
};
var $author$project$Main$applyLoadedData = F2(
	function (data, model) {
		var newModel = _Utils_update(
			model,
			{
				a3: A2(
					$elm$core$Maybe$map,
					function ($) {
						return $.l;
					},
					$elm$core$List$head(data.bv)),
				bq: data.bq,
				bv: data.bv
			});
		return _Utils_Tuple2(
			newModel,
			$author$project$Main$save(newModel));
	});
var $elm$core$List$filter = F2(
	function (isGood, list) {
		return A3(
			$elm$core$List$foldr,
			F2(
				function (x, xs) {
					return isGood(x) ? A2($elm$core$List$cons, x, xs) : xs;
				}),
			_List_Nil,
			list);
	});
var $author$project$Main$findQuestion = F2(
	function (model, id) {
		return $elm$core$List$head(
			A2(
				$elm$core$List$filter,
				function (q) {
					return _Utils_eq(q.l, id);
				},
				model.bq));
	});
var $author$project$Data$nextId = F3(
	function (prefix, nowMillis, counter) {
		return prefix + ('_' + ($elm$core$String$fromInt(nowMillis) + ('_' + $elm$core$String$fromInt(counter))));
	});
var $author$project$Main$genId = F2(
	function (prefix, model) {
		return _Utils_Tuple2(
			A3($author$project$Data$nextId, prefix, model.m, model.q),
			_Utils_update(
				model,
				{q: model.q + 1}));
	});
var $author$project$Main$ifEq = F3(
	function (value, target, replacement) {
		return _Utils_eq(value, target) ? replacement : value;
	});
var $author$project$Data$snapshotOf = function (q) {
	return {as: q.as, au: q.au, bs: q.by, aU: q.aU, Y: q.Y, aX: q.aX, a$: q.a$};
};
var $author$project$Main$updateTestById = F3(
	function (id, f, tests) {
		return A2(
			$elm$core$List$map,
			function (t) {
				return _Utils_eq(t.l, id) ? f(t) : t;
			},
			tests);
	});
var $author$project$Main$applyNewVersion = F4(
	function (id, data, context, model) {
		var _v0 = A2($author$project$Main$findQuestion, model, id);
		if (_v0.$ === 1) {
			return model;
		} else {
			var original = _v0.a;
			var _v1 = A2($author$project$Main$genId, 'q', model);
			var newId = _v1.a;
			var m1 = _v1.b;
			var newQ = {
				as: data.as,
				au: data.au,
				O: original.O,
				bd: _Utils_ap(
					original.bd,
					_List_fromArray(
						[
							$author$project$Data$snapshotOf(original)
						])),
				l: newId,
				aU: data.aU,
				Y: data.Y,
				by: m1.m,
				aX: original.aX + 1,
				a$: data.a$
			};
			var m2 = _Utils_update(
				m1,
				{
					bq: _Utils_ap(
						model.bq,
						_List_fromArray(
							[newQ]))
				});
			if (context.$ === 1) {
				return m2;
			} else {
				var ctx = context.a;
				return function (newTests) {
					return _Utils_update(
						m2,
						{bv: newTests});
				}(
					A3(
						$author$project$Main$updateTestById,
						ctx.aV,
						function (t) {
							var _v3 = ctx.aD;
							if (!_v3.$) {
								return _Utils_update(
									t,
									{
										bi: A2(
											$elm$core$List$map,
											function (qid) {
												return A3($author$project$Main$ifEq, qid, id, newId);
											},
											t.bi)
									});
							} else {
								var gid = _v3.a;
								return _Utils_update(
									t,
									{
										am: A2(
											$elm$core$List$map,
											function (g) {
												return _Utils_eq(g.l, gid) ? _Utils_update(
													g,
													{
														bp: A2(
															$elm$core$List$map,
															function (qid) {
																return A3($author$project$Main$ifEq, qid, id, newId);
															},
															g.bp)
													}) : g;
											},
											t.am)
									});
							}
						},
						m2.bv));
			}
		}
	});
var $author$project$Main$applyOverwrite = F3(
	function (id, data, model) {
		return _Utils_update(
			model,
			{
				bq: A2(
					$elm$core$List$map,
					function (q) {
						return _Utils_eq(q.l, id) ? _Utils_update(
							q,
							{
								as: data.as,
								au: data.au,
								bd: _Utils_ap(
									q.bd,
									_List_fromArray(
										[
											$author$project$Data$snapshotOf(q)
										])),
								aU: data.aU,
								Y: data.Y,
								by: model.m,
								aX: q.aX + 1,
								a$: data.a$
							}) : q;
					},
					model.bq)
			});
	});
var $author$project$Main$closeFormFields = function (model) {
	return _Utils_update(
		model,
		{w: $elm$core$Maybe$Nothing, p: $elm$core$Maybe$Nothing, x: $elm$core$Maybe$Nothing, g: $elm$core$Maybe$Nothing});
};
var $elm$core$Basics$composeR = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var $author$project$Main$monthNumber = function (month) {
	switch (month) {
		case 0:
			return 1;
		case 1:
			return 2;
		case 2:
			return 3;
		case 3:
			return 4;
		case 4:
			return 5;
		case 5:
			return 6;
		case 6:
			return 7;
		case 7:
			return 8;
		case 8:
			return 9;
		case 9:
			return 10;
		case 10:
			return 11;
		default:
			return 12;
	}
};
var $elm$core$String$cons = _String_cons;
var $elm$core$String$fromChar = function (_char) {
	return A2($elm$core$String$cons, _char, '');
};
var $elm$core$Bitwise$and = _Bitwise_and;
var $elm$core$Bitwise$shiftRightBy = _Bitwise_shiftRightBy;
var $elm$core$String$repeatHelp = F3(
	function (n, chunk, result) {
		return (n <= 0) ? result : A3(
			$elm$core$String$repeatHelp,
			n >> 1,
			_Utils_ap(chunk, chunk),
			(!(n & 1)) ? result : _Utils_ap(result, chunk));
	});
var $elm$core$String$repeat = F2(
	function (n, chunk) {
		return A3($elm$core$String$repeatHelp, n, chunk, '');
	});
var $elm$core$String$padLeft = F3(
	function (n, _char, string) {
		return _Utils_ap(
			A2(
				$elm$core$String$repeat,
				n - $elm$core$String$length(string),
				$elm$core$String$fromChar(_char)),
			string);
	});
var $elm$time$Time$flooredDiv = F2(
	function (numerator, denominator) {
		return $elm$core$Basics$floor(numerator / denominator);
	});
var $elm$time$Time$posixToMillis = function (_v0) {
	var millis = _v0;
	return millis;
};
var $elm$time$Time$toAdjustedMinutesHelp = F3(
	function (defaultOffset, posixMinutes, eras) {
		toAdjustedMinutesHelp:
		while (true) {
			if (!eras.b) {
				return posixMinutes + defaultOffset;
			} else {
				var era = eras.a;
				var olderEras = eras.b;
				if (_Utils_cmp(era.aq, posixMinutes) < 0) {
					return posixMinutes + era.aG;
				} else {
					var $temp$defaultOffset = defaultOffset,
						$temp$posixMinutes = posixMinutes,
						$temp$eras = olderEras;
					defaultOffset = $temp$defaultOffset;
					posixMinutes = $temp$posixMinutes;
					eras = $temp$eras;
					continue toAdjustedMinutesHelp;
				}
			}
		}
	});
var $elm$time$Time$toAdjustedMinutes = F2(
	function (_v0, time) {
		var defaultOffset = _v0.a;
		var eras = _v0.b;
		return A3(
			$elm$time$Time$toAdjustedMinutesHelp,
			defaultOffset,
			A2(
				$elm$time$Time$flooredDiv,
				$elm$time$Time$posixToMillis(time),
				60000),
			eras);
	});
var $elm$core$Basics$ge = _Utils_ge;
var $elm$core$Basics$negate = function (n) {
	return -n;
};
var $elm$time$Time$toCivil = function (minutes) {
	var rawDay = A2($elm$time$Time$flooredDiv, minutes, 60 * 24) + 719468;
	var era = (((rawDay >= 0) ? rawDay : (rawDay - 146096)) / 146097) | 0;
	var dayOfEra = rawDay - (era * 146097);
	var yearOfEra = ((((dayOfEra - ((dayOfEra / 1460) | 0)) + ((dayOfEra / 36524) | 0)) - ((dayOfEra / 146096) | 0)) / 365) | 0;
	var dayOfYear = dayOfEra - (((365 * yearOfEra) + ((yearOfEra / 4) | 0)) - ((yearOfEra / 100) | 0));
	var mp = (((5 * dayOfYear) + 2) / 153) | 0;
	var month = mp + ((mp < 10) ? 3 : (-9));
	var year = yearOfEra + (era * 400);
	return {
		av: (dayOfYear - ((((153 * mp) + 2) / 5) | 0)) + 1,
		aE: month,
		a2: year + ((month <= 2) ? 1 : 0)
	};
};
var $elm$time$Time$toDay = F2(
	function (zone, time) {
		return $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).av;
	});
var $elm$time$Time$Apr = 3;
var $elm$time$Time$Aug = 7;
var $elm$time$Time$Dec = 11;
var $elm$time$Time$Feb = 1;
var $elm$time$Time$Jan = 0;
var $elm$time$Time$Jul = 6;
var $elm$time$Time$Jun = 5;
var $elm$time$Time$Mar = 2;
var $elm$time$Time$May = 4;
var $elm$time$Time$Nov = 10;
var $elm$time$Time$Oct = 9;
var $elm$time$Time$Sep = 8;
var $elm$time$Time$toMonth = F2(
	function (zone, time) {
		var _v0 = $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).aE;
		switch (_v0) {
			case 1:
				return 0;
			case 2:
				return 1;
			case 3:
				return 2;
			case 4:
				return 3;
			case 5:
				return 4;
			case 6:
				return 5;
			case 7:
				return 6;
			case 8:
				return 7;
			case 9:
				return 8;
			case 10:
				return 9;
			case 11:
				return 10;
			default:
				return 11;
		}
	});
var $elm$time$Time$toYear = F2(
	function (zone, time) {
		return $elm$time$Time$toCivil(
			A2($elm$time$Time$toAdjustedMinutes, zone, time)).a2;
	});
var $elm$time$Time$utc = A2($elm$time$Time$Zone, 0, _List_Nil);
var $author$project$Main$dateStamp = function (millis) {
	var posix = $elm$time$Time$millisToPosix(millis);
	var pad = function (n) {
		return A3(
			$elm$core$String$padLeft,
			2,
			'0',
			$elm$core$String$fromInt(n));
	};
	return $elm$core$String$fromInt(
		A2($elm$time$Time$toYear, $elm$time$Time$utc, posix)) + ('-' + (pad(
		$author$project$Main$monthNumber(
			A2($elm$time$Time$toMonth, $elm$time$Time$utc, posix))) + ('-' + pad(
		A2($elm$time$Time$toDay, $elm$time$Time$utc, posix)))));
};
var $author$project$Types$BackupData = F2(
	function (questions, tests) {
		return {bq: questions, bv: tests};
	});
var $elm$json$Json$Decode$list = _Json_decodeList;
var $author$project$Codec$apply = F2(
	function (argDecoder, funcDecoder) {
		return A3(
			$elm$json$Json$Decode$map2,
			F2(
				function (f, a) {
					return f(a);
				}),
			funcDecoder,
			argDecoder);
	});
var $elm$json$Json$Decode$field = _Json_decodeField;
var $elm$json$Json$Decode$oneOf = _Json_oneOf;
var $author$project$Codec$optional = F4(
	function (field, decoder, _default, pipeline) {
		return A2(
			$author$project$Codec$apply,
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						A2($elm$json$Json$Decode$field, field, decoder),
						$elm$json$Json$Decode$succeed(_default)
					])),
			pipeline);
	});
var $author$project$Types$Question = function (id) {
	return function (familyId) {
		return function (version) {
			return function (history) {
				return function (updatedAt) {
					return function (category) {
						return function (text) {
							return function (correct) {
								return function (wrong) {
									return function (tags) {
										return {as: category, au: correct, O: familyId, bd: history, l: id, aU: tags, Y: text, by: updatedAt, aX: version, a$: wrong};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var $author$project$Types$Answer = F2(
	function (text, justification) {
		return {al: justification, Y: text};
	});
var $elm$json$Json$Decode$string = _Json_decodeString;
var $author$project$Codec$answerDecoder = A4(
	$author$project$Codec$optional,
	'justification',
	$elm$json$Json$Decode$string,
	'',
	A4(
		$author$project$Codec$optional,
		'text',
		$elm$json$Json$Decode$string,
		'',
		$elm$json$Json$Decode$succeed($author$project$Types$Answer)));
var $author$project$Codec$answerWithDefault = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			$author$project$Codec$answerDecoder,
			$elm$json$Json$Decode$succeed(
			{al: '', Y: ''})
		]));
var $elm$json$Json$Decode$int = _Json_decodeInt;
var $author$project$Types$Snapshot = F7(
	function (version, savedAt, category, text, correct, wrong, tags) {
		return {as: category, au: correct, bs: savedAt, aU: tags, Y: text, aX: version, a$: wrong};
	});
var $author$project$Codec$snapshotDecoder = A4(
	$author$project$Codec$optional,
	'tags',
	$elm$json$Json$Decode$list($elm$json$Json$Decode$string),
	_List_Nil,
	A4(
		$author$project$Codec$optional,
		'wrong',
		$elm$json$Json$Decode$list($author$project$Codec$answerWithDefault),
		_List_Nil,
		A4(
			$author$project$Codec$optional,
			'correct',
			$author$project$Codec$answerWithDefault,
			{al: '', Y: ''},
			A4(
				$author$project$Codec$optional,
				'text',
				$elm$json$Json$Decode$string,
				'',
				A4(
					$author$project$Codec$optional,
					'category',
					$elm$json$Json$Decode$string,
					'',
					A4(
						$author$project$Codec$optional,
						'savedAt',
						$elm$json$Json$Decode$int,
						0,
						A4(
							$author$project$Codec$optional,
							'version',
							$elm$json$Json$Decode$int,
							1,
							$elm$json$Json$Decode$succeed($author$project$Types$Snapshot))))))));
var $author$project$Codec$questionDecoder = A4(
	$author$project$Codec$optional,
	'tags',
	$elm$json$Json$Decode$list($elm$json$Json$Decode$string),
	_List_Nil,
	A4(
		$author$project$Codec$optional,
		'wrong',
		$elm$json$Json$Decode$list($author$project$Codec$answerWithDefault),
		_List_Nil,
		A4(
			$author$project$Codec$optional,
			'correct',
			$author$project$Codec$answerWithDefault,
			{al: '', Y: ''},
			A4(
				$author$project$Codec$optional,
				'text',
				$elm$json$Json$Decode$string,
				'',
				A4(
					$author$project$Codec$optional,
					'category',
					$elm$json$Json$Decode$string,
					'',
					A4(
						$author$project$Codec$optional,
						'updatedAt',
						$elm$json$Json$Decode$int,
						0,
						A4(
							$author$project$Codec$optional,
							'history',
							$elm$json$Json$Decode$list($author$project$Codec$snapshotDecoder),
							_List_Nil,
							A4(
								$author$project$Codec$optional,
								'version',
								$elm$json$Json$Decode$int,
								1,
								A4(
									$author$project$Codec$optional,
									'familyId',
									$elm$json$Json$Decode$string,
									'',
									A4(
										$author$project$Codec$optional,
										'id',
										$elm$json$Json$Decode$string,
										'',
										$elm$json$Json$Decode$succeed($author$project$Types$Question)))))))))));
var $author$project$Types$Test = F4(
	function (id, name, looseQuestionIds, groups) {
		return {am: groups, l: id, bi: looseQuestionIds, aF: name};
	});
var $author$project$Types$Group = F3(
	function (id, name, questionIds) {
		return {l: id, aF: name, bp: questionIds};
	});
var $author$project$Codec$groupDecoder = A4(
	$author$project$Codec$optional,
	'questionIds',
	$elm$json$Json$Decode$list($elm$json$Json$Decode$string),
	_List_Nil,
	A4(
		$author$project$Codec$optional,
		'name',
		$elm$json$Json$Decode$string,
		'Group',
		A4(
			$author$project$Codec$optional,
			'id',
			$elm$json$Json$Decode$string,
			'',
			$elm$json$Json$Decode$succeed($author$project$Types$Group))));
var $author$project$Codec$testDecoder = A4(
	$author$project$Codec$optional,
	'groups',
	$elm$json$Json$Decode$list($author$project$Codec$groupDecoder),
	_List_Nil,
	A4(
		$author$project$Codec$optional,
		'looseQuestionIds',
		$elm$json$Json$Decode$list($elm$json$Json$Decode$string),
		_List_Nil,
		A4(
			$author$project$Codec$optional,
			'name',
			$elm$json$Json$Decode$string,
			'Test',
			A4(
				$author$project$Codec$optional,
				'id',
				$elm$json$Json$Decode$string,
				'',
				$elm$json$Json$Decode$succeed($author$project$Types$Test)))));
var $author$project$Codec$backupDecoder = A4(
	$author$project$Codec$optional,
	'tests',
	$elm$json$Json$Decode$list($author$project$Codec$testDecoder),
	_List_Nil,
	A4(
		$author$project$Codec$optional,
		'questions',
		$elm$json$Json$Decode$list($author$project$Codec$questionDecoder),
		_List_Nil,
		$elm$json$Json$Decode$succeed($author$project$Types$BackupData)));
var $elm$json$Json$Decode$decodeString = _Json_runOnString;
var $author$project$Codec$decodeBackup = $elm$json$Json$Decode$decodeString($author$project$Codec$backupDecoder);
var $author$project$Types$ImportItem = F6(
	function (category, question, answersCorrect, answersWrong, justificationCorrect, justificationWrong) {
		return {a4: answersCorrect, a5: answersWrong, as: category, bg: justificationCorrect, bh: justificationWrong, bo: question};
	});
var $author$project$Codec$importItemDecoder = A4(
	$author$project$Codec$optional,
	'justification',
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'wrong',
				$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
				$elm$json$Json$Decode$succeed(_List_Nil)
			])),
	_List_Nil,
	A4(
		$author$project$Codec$optional,
		'justification',
		$elm$json$Json$Decode$oneOf(
			_List_fromArray(
				[
					A2($elm$json$Json$Decode$field, 'correct', $elm$json$Json$Decode$string),
					$elm$json$Json$Decode$succeed('')
				])),
		'',
		A4(
			$author$project$Codec$optional,
			'answers',
			$elm$json$Json$Decode$oneOf(
				_List_fromArray(
					[
						A2(
						$elm$json$Json$Decode$field,
						'wrong',
						$elm$json$Json$Decode$list($elm$json$Json$Decode$string)),
						$elm$json$Json$Decode$succeed(_List_Nil)
					])),
			_List_Nil,
			A4(
				$author$project$Codec$optional,
				'answers',
				$elm$json$Json$Decode$oneOf(
					_List_fromArray(
						[
							A2($elm$json$Json$Decode$field, 'correct', $elm$json$Json$Decode$string),
							$elm$json$Json$Decode$succeed('')
						])),
				'',
				A4(
					$author$project$Codec$optional,
					'question',
					$elm$json$Json$Decode$string,
					'',
					A4(
						$author$project$Codec$optional,
						'category',
						$elm$json$Json$Decode$string,
						'',
						$elm$json$Json$Decode$succeed($author$project$Types$ImportItem)))))));
var $elm$core$List$singleton = function (value) {
	return _List_fromArray(
		[value]);
};
var $author$project$Codec$importPayloadDecoder = $elm$json$Json$Decode$oneOf(
	_List_fromArray(
		[
			$elm$json$Json$Decode$list($author$project$Codec$importItemDecoder),
			A2($elm$json$Json$Decode$map, $elm$core$List$singleton, $author$project$Codec$importItemDecoder)
		]));
var $author$project$Codec$decodeImportPayload = $elm$json$Json$Decode$decodeString($author$project$Codec$importPayloadDecoder);
var $elm$file$File$Download$string = F3(
	function (name, mime, content) {
		return A2(
			$elm$core$Task$perform,
			$elm$core$Basics$never,
			A3(_File_download, name, mime, content));
	});
var $author$project$Main$downloadJSON = F2(
	function (filename, valueAsJson) {
		return A3(
			$elm$file$File$Download$string,
			filename,
			'application/json',
			A2($elm$json$Json$Encode$encode, 2, valueAsJson));
	});
var $elm$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (n <= 0) {
				return list;
			} else {
				if (!list.b) {
					return list;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs;
					n = $temp$n;
					list = $temp$list;
					continue drop;
				}
			}
		}
	});
var $author$project$Main$emptyFormState = {
	as: '',
	B: '',
	C: '',
	X: '',
	Y: '',
	a$: _List_fromArray(
		[
			{al: '', Y: ''}
		])
};
var $author$project$Codec$encodeBackup = F2(
	function (questions, tests) {
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'schemaVersion',
					$elm$json$Json$Encode$int(1)),
					_Utils_Tuple2(
					'questions',
					$author$project$Codec$encodeQuestionList(questions)),
					_Utils_Tuple2(
					'tests',
					A2($elm$json$Json$Encode$list, $author$project$Codec$encodeTest, tests))
				]));
	});
var $elm$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _v0 = f(mx);
		if (!_v0.$) {
			var x = _v0.a;
			return A2($elm$core$List$cons, x, xs);
		} else {
			return xs;
		}
	});
var $elm$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			$elm$core$List$foldr,
			$elm$core$List$maybeCons(f),
			_List_Nil,
			xs);
	});
var $author$project$Main$encodeTestExport = F2(
	function (model, t) {
		var byId = function (qid) {
			return A2($author$project$Main$findQuestion, model, qid);
		};
		var questionsFor = function (ids) {
			return $author$project$Codec$encodeQuestionList(
				A2($elm$core$List$filterMap, byId, ids));
		};
		return $elm$json$Json$Encode$object(
			_List_fromArray(
				[
					_Utils_Tuple2(
					'name',
					$elm$json$Json$Encode$string(t.aF)),
					_Utils_Tuple2(
					'ungrouped',
					questionsFor(t.bi)),
					_Utils_Tuple2(
					'groups',
					A2(
						$elm$json$Json$Encode$list,
						function (g) {
							return $elm$json$Json$Encode$object(
								_List_fromArray(
									[
										_Utils_Tuple2(
										'name',
										$elm$json$Json$Encode$string(g.aF)),
										_Utils_Tuple2(
										'questions',
										questionsFor(g.bp))
									]));
						},
						t.am))
				]));
	});
var $elm$file$File$Select$file = F2(
	function (mimes, toMsg) {
		return A2(
			$elm$core$Task$perform,
			toMsg,
			_File_uploadOne(mimes));
	});
var $author$project$Main$findActiveTest = function (model) {
	return A2(
		$elm$core$Maybe$andThen,
		function (id) {
			return $elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (t) {
						return _Utils_eq(t.l, id);
					},
					model.bv));
		},
		model.a3);
};
var $elm$core$List$append = F2(
	function (xs, ys) {
		if (!ys.b) {
			return xs;
		} else {
			return A3($elm$core$List$foldr, $elm$core$List$cons, ys, xs);
		}
	});
var $elm$core$List$concat = function (lists) {
	return A3($elm$core$List$foldr, $elm$core$List$append, _List_Nil, lists);
};
var $elm$core$List$concatMap = F2(
	function (f, list) {
		return $elm$core$List$concat(
			A2($elm$core$List$map, f, list));
	});
var $elm$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			if (!list.b) {
				return false;
			} else {
				var x = list.a;
				var xs = list.b;
				if (isOkay(x)) {
					return true;
				} else {
					var $temp$isOkay = isOkay,
						$temp$list = xs;
					isOkay = $temp$isOkay;
					list = $temp$list;
					continue any;
				}
			}
		}
	});
var $elm$core$List$member = F2(
	function (x, xs) {
		return A2(
			$elm$core$List$any,
			function (a) {
				return _Utils_eq(a, x);
			},
			xs);
	});
var $author$project$Data$findReferences = F2(
	function (tests, questionId) {
		return A2(
			$elm$core$List$concatMap,
			function (t) {
				var looseRef = A2($elm$core$List$member, questionId, t.bi) ? _List_fromArray(
					[
						{aW: t.aF, aZ: 'ungrouped'}
					]) : _List_Nil;
				var groupRefs = A2(
					$elm$core$List$map,
					function (g) {
						return {aW: t.aF, aZ: g.aF};
					},
					A2(
						$elm$core$List$filter,
						function (g) {
							return A2($elm$core$List$member, questionId, g.bp);
						},
						t.am));
				return _Utils_ap(looseRef, groupRefs);
			},
			tests);
	});
var $author$project$Codec$fixMissingIds = F3(
	function (startCounter, questions, tests) {
		var _v0 = A3(
			$elm$core$List$foldr,
			F2(
				function (q, _v1) {
					var acc = _v1.a;
					var counter = _v1.b;
					if (q.l === '') {
						var newId = 'q_' + $elm$core$String$fromInt(counter);
						var familyId = (q.O === '') ? newId : q.O;
						return _Utils_Tuple2(
							A2(
								$elm$core$List$cons,
								_Utils_update(
									q,
									{O: familyId, l: newId}),
								acc),
							counter + 1);
					} else {
						if (q.O === '') {
							return _Utils_Tuple2(
								A2(
									$elm$core$List$cons,
									_Utils_update(
										q,
										{O: q.l}),
									acc),
								counter);
						} else {
							return _Utils_Tuple2(
								A2($elm$core$List$cons, q, acc),
								counter);
						}
					}
				}),
			_Utils_Tuple2(_List_Nil, startCounter),
			questions);
		var fixedQuestions = _v0.a;
		var afterQuestions = _v0.b;
		var _v2 = A3(
			$elm$core$List$foldr,
			F2(
				function (t, _v3) {
					var acc = _v3.a;
					var counter = _v3.b;
					var _v4 = (t.l === '') ? _Utils_Tuple2(
						'test_' + $elm$core$String$fromInt(counter),
						counter + 1) : _Utils_Tuple2(t.l, counter);
					var id = _v4.a;
					var counter1 = _v4.b;
					var _v5 = A3(
						$elm$core$List$foldr,
						F2(
							function (g, _v6) {
								var gacc = _v6.a;
								var gcounter = _v6.b;
								return (g.l === '') ? _Utils_Tuple2(
									A2(
										$elm$core$List$cons,
										_Utils_update(
											g,
											{
												l: 'grp_' + $elm$core$String$fromInt(gcounter)
											}),
										gacc),
									gcounter + 1) : _Utils_Tuple2(
									A2($elm$core$List$cons, g, gacc),
									gcounter);
							}),
						_Utils_Tuple2(_List_Nil, counter1),
						t.am);
					var fixedGroups = _v5.a;
					var counter2 = _v5.b;
					return _Utils_Tuple2(
						A2(
							$elm$core$List$cons,
							_Utils_update(
								t,
								{am: fixedGroups, l: id}),
							acc),
						counter2);
				}),
			_Utils_Tuple2(_List_Nil, afterQuestions),
			tests);
		var fixedTests = _v2.a;
		var afterTests = _v2.b;
		return _Utils_Tuple3(fixedQuestions, fixedTests, afterTests);
	});
var $elm$json$Json$Decode$decodeValue = _Json_run;
var $author$project$Main$IncomingEnvelope = F4(
	function (kind, dbAvailable, dbErrorMsg, data) {
		return {ak: data, L: dbAvailable, M: dbErrorMsg, aC: kind};
	});
var $elm$json$Json$Decode$bool = _Json_decodeBool;
var $elm$json$Json$Decode$map4 = _Json_map4;
var $elm$json$Json$Decode$null = _Json_decodeNull;
var $elm$json$Json$Decode$nullable = function (decoder) {
	return $elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				$elm$json$Json$Decode$null($elm$core$Maybe$Nothing),
				A2($elm$json$Json$Decode$map, $elm$core$Maybe$Just, decoder)
			]));
};
var $author$project$Codec$Persisted = F3(
	function (questions, tests, activeTestId) {
		return {a3: activeTestId, bq: questions, bv: tests};
	});
var $author$project$Codec$persistedDecoder = A4(
	$author$project$Codec$optional,
	'config',
	A2(
		$elm$json$Json$Decode$field,
		'activeTestId',
		$elm$json$Json$Decode$nullable($elm$json$Json$Decode$string)),
	$elm$core$Maybe$Nothing,
	A4(
		$author$project$Codec$optional,
		'tests',
		$elm$json$Json$Decode$list($author$project$Codec$testDecoder),
		_List_Nil,
		A4(
			$author$project$Codec$optional,
			'questions',
			$elm$json$Json$Decode$list($author$project$Codec$questionDecoder),
			_List_Nil,
			$elm$json$Json$Decode$succeed($author$project$Codec$Persisted))));
var $author$project$Main$incomingDecoder = A5(
	$elm$json$Json$Decode$map4,
	$author$project$Main$IncomingEnvelope,
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'kind', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('')
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'dbAvailable', $elm$json$Json$Decode$bool),
				$elm$json$Json$Decode$succeed(true)
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2($elm$json$Json$Decode$field, 'dbErrorMsg', $elm$json$Json$Decode$string),
				$elm$json$Json$Decode$succeed('')
			])),
	$elm$json$Json$Decode$oneOf(
		_List_fromArray(
			[
				A2(
				$elm$json$Json$Decode$field,
				'data',
				$elm$json$Json$Decode$nullable($author$project$Codec$persistedDecoder)),
				$elm$json$Json$Decode$succeed($elm$core$Maybe$Nothing)
			])));
var $elm$core$List$isEmpty = function (xs) {
	if (!xs.b) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Platform$Cmd$batch = _Platform_batch;
var $elm$core$Platform$Cmd$none = $elm$core$Platform$Cmd$batch(_List_Nil);
var $author$project$Data$seedRaw = _List_fromArray(
	[
		{
		as: 'combined (cyber intelligence) — case study: Darknet Diaries Ep.178 \u0027Ubiquiti\u0027',
		B: 'The course defines a threat as the combination of Intent, Capability and Opportunity. In this case, Nick\u0027s discontent (intent) and his cloud engineering expertise (capability) both predate the pandemic; what changed was routine, less-scrutinized remote access to privileged systems, which supplied the missing opportunity to act on an intent and capability he already had.',
		C: 'Opportunity — Threat = Intent + Capability + Opportunity; remote access removed the practical barrier that had been keeping an already-motivated, already-skilled insider from acting',
		aU: _List_fromArray(
			['cyber-intel', 'ubiquiti-case-study']),
		Y: 'The engineer already had the technical skill to abuse the company\u0027s cloud environment (capability) and, after years of feeling underpaid and overlooked, the personal grievance to want to act on it (intent). What he lacked for a long time was a way to reach the master credential vault without immediate suspicion — something the shift to near-universal remote work during the pandemic quietly gave him, since privileged remote access to the cloud environment became routine for his role. Using the standard threat equation from the course, which missing element did remote work primarily supply, completing the threat?',
		a$: _List_fromArray(
			[
				{al: 'His resentment grew from years of pay and promotion decisions, not from the work-from-home arrangement itself.', Y: 'Intent — remote work is what first made him resentful about his pay and lack of recognition'},
				{al: 'His technical skill came from his career at AWS and then Ubiquiti, well before the pandemic reshaped work arrangements.', Y: 'Capability — remote work is what taught him the technical skills needed to navigate the cloud environment'},
				{al: 'Attribution is a separate, later problem for defenders/investigators; it is not one of the three elements of the threat equation.', Y: 'Attribution — remote work is what allowed investigators to identify him as the culprit'},
				{al: 'One option correctly names the missing element of the threat equation.', Y: 'None of the others.'}
			])
	},
		{
		as: 'combined (offensive) — case study: Darknet Diaries Ep.178 \u0027Ubiquiti\u0027',
		B: 'Nothing about the ransom persona or the backdoor claim damaged, denied or degraded any system — its entire purpose was to make Ubiquiti\u0027s leadership and investigators believe a sophisticated outside actor was responsible, which matches the course\u0027s definition of Deceive exactly.',
		C: 'Deceive — to cause a person (here, the company\u0027s leadership and investigators) to believe what is not true',
		aU: _List_fromArray(
			['offensive', 'ubiquiti-case-study']),
		Y: 'In his anonymous ransom email, the engineer claimed to be an unrelated outside hacker, demanded 25 Bitcoin, and dangled a second \u0027secret backdoor\u0027 for an additional 25 Bitcoin — all while secretly being the Ubiquiti employee assigned to help investigate the very \u0027breach\u0027 he had staged. Using the JP 3-13 desired-effects framework from the course, which effect does constructing this false external-attacker persona best represent?',
		a$: _List_fromArray(
			[
				{al: 'No systems were rendered permanently unusable by the ransom note or the false persona itself.', Y: 'Destroy — to damage a system so badly it cannot be restored without being entirely rebuilt'},
				{al: 'The company\u0027s systems remained accessible to legitimate users throughout; nothing was denied.', Y: 'Deny — to prevent the adversary from accessing and using critical information, systems and services'},
				{al: 'No communications or command-and-control systems were degraded by posing as an outsider.', Y: 'Degrade — to reduce the effectiveness or efficiency of adversary C2 or communications systems'},
				{al: 'Influence is about shaping behavior toward the attacker\u0027s favor in a broad strategic sense; here the mechanism is specifically getting the target to believe a false claim, which is Deceive.', Y: 'Influence — to cause others to behave in a manner favorable to friendly forces'}
			])
	},
		{
		as: 'combined (tools and tactics + defensive) — case study: Darknet Diaries Ep.178 \u0027Ubiquiti\u0027',
		B: 'No technical control caught this — a human colleague noticed an inconsistency (a question implying knowledge of an unreported issue) and preserved it. This matches the course\u0027s point that closely monitoring employee behaviour, including seemingly small anomalies, is a valuable practice in environments hosting sensitive infrastructure, and it can generate evidence long before a technical alert ever fires.',
		C: 'Monitoring employee behaviour — closely observing and noting unusual conduct, even when not obviously malicious at the time, is a recognized and valuable defensive measure, especially around sensitive infrastructure',
		aU: _List_fromArray(
			['defensive', 'tools-tactics', 'ubiquiti-case-study']),
		Y: 'Before staging the extortion attempt, the engineer privately messaged a colleague asking whether an employee could be paid through the company\u0027s bug-bounty program for reporting a security issue. The colleague found the question odd, given no such issue had been reported, and quietly saved the message. That saved message later became part of the evidence trail. Which course concept does the colleague\u0027s reaction best illustrate?',
		a$: _List_fromArray(
			[
				{al: 'Access scoping addresses what systems a user can reach, not how a suspicious verbal or written question gets noticed and escalated.', Y: 'Least privilege authorization — the colleague should have restricted the engineer\u0027s bug-bounty program access'},
				{al: 'Packet filtering operates on network traffic, not on the content or intent behind an internal chat message between colleagues.', Y: 'Packet filtering — the message should have been automatically blocked by a networking device'},
				{al: 'Encryption protects confidentiality in transit or storage; it has nothing to do with why this message was significant, and encrypting it would not have prevented it from being used as evidence once disclosed.', Y: 'Communication encryption — the message should have been encrypted to prevent later use as evidence'},
				{al: 'One option correctly names the concept the colleague\u0027s behaviour illustrates.', Y: 'None of the others.'}
			])
	},
		{
		as: 'combined (defensive) — case study: Darknet Diaries Ep.178 \u0027Ubiquiti\u0027',
		B: 'The case shows a clean split between the company\u0027s visibility (camera footage, the issued laptop — both clean) and where the actual attack occurred (a personal device on a home network). This is precisely why detection ultimately had to rely on account/credential-level evidence — anomalous logins, session renaming, log-retention changes — rather than on monitoring physical assets, illustrating that insider-threat defense must follow the account and the data, not just the hardware the organization owns.',
		C: 'Physical security and monitoring of company-issued devices have limited value against an insider using personal, unmonitored hardware and networks; effective detection has to extend to anomalous use of the privileged accounts and credentials themselves, not just the endpoints the organization controls',
		aU: _List_fromArray(
			['defensive', 'ubiquiti-case-study']),
		Y: 'As part of the investigation, forensic examiners reviewed hours of footage from the company-issued security camera and dissected the engineer\u0027s company-issued laptop bit by bit — and found nothing. The intrusion had in fact been carried out from a separate, personal MacBook connected through his home Wi-Fi router, a device the company had no visibility into at all. What does this best illustrate about defending against insider threats operating from home?',
		a$: _List_fromArray(
			[
				{al: 'The case is presented explicitly as a gap: physical/device monitoring found nothing, which is the point being tested, not evidence of an investigative failure.', Y: 'Reviewing camera footage and company devices is always sufficient to detect an insider attack, so the investigators must have missed something on the seized laptop'},
				{al: 'Attribution ultimately succeeded through IP, MAC-address and traffic-volume analysis at the router and through account activity logs — the personal device did not place the intrusion outside investigative reach.', Y: 'Since the personal laptop was outside company control, the intrusion legally could not be attributed to the employee at all'},
				{al: 'Physical security remains highly relevant for other threat categories (e.g., theft of hardware, unauthorized facility access); the point here is narrower — it has limited value against this specific insider scenario.', Y: 'Physical security measures are irrelevant to every category of cyber threat and should be deprioritized generally'},
				{al: 'One option correctly states the lesson about defending beyond company-owned endpoints.', Y: 'None of the others.'}
			])
	},
		{
		as: 'combined (offensive + defensive, ethics) — case study: Darknet Diaries Ep.178 \u0027Ubiquiti\u0027',
		B: 'The course frames authorized offensive activity (bug bounties, sanctioned red-teaming) as bounded by prior authorization and defined scope. Here, every hallmark of a legitimate test was absent: the activity was hidden through obfuscation, a genuine ransom was demanded, and the engineer lied to the FBI — factors the court treated as decisive, resulting in guilty pleas to damaging protected computers, wire fraud and false statements.',
		C: 'Legitimate security testing requires prior authorization, a defined scope, and transparency with the organization; here the activity was concealed, involved covering tracks, an extortion demand for money, and false statements to federal investigators — none of which are compatible with an authorized test regardless of the stated intent',
		aU: _List_fromArray(
			['offensive', 'defensive', 'ethics', 'ubiquiti-case-study']),
		Y: 'At sentencing, the engineer argued the entire episode was really an unsanctioned \u0027security drill\u0027 meant to force the company to take its vulnerabilities seriously, and asked for no prison time. The judge rejected this framing and imposed a six-year sentence. Based on how the course distinguishes legitimate security testing (e.g., authorized penetration testing, bug-bounty programs) from illegitimate activity, why does this defense fail?',
		a$: _List_fromArray(
			[
				{al: 'Technical skill or job role does not confer authorization; scope and prior approval are what define legitimate testing, and neither was present here.', Y: 'Any employee with sufficient technical skill is automatically authorized to test their employer\u0027s production systems without approval'},
				{al: 'Motive can be considered at sentencing, but it does not retroactively authorize an intrusion or excuse extortion and lying to federal investigators — the guilty plea and sentence reflect this.', Y: 'A stated good intention legally converts an unauthorized intrusion into an authorized one after the fact'},
				{al: 'The presence of real vulnerabilities does not make unauthorized exploitation lawful; the course\u0027s ethical-hacking framing is about authorization, not about whether flaws existed.', Y: 'Because Ubiquiti\u0027s security practices were genuinely weak, exploiting them was not a crime'},
				{al: 'The wire fraud and computer damage charges rested on the intrusion, exfiltration and extortion attempt itself, not on whether the ransom was ultimately collected.', Y: 'Since no ransom was ultimately paid, no crime occurred'}
			])
	}
	]);
var $author$project$Data$seedQuestions = function (nowMillis) {
	return A2(
		$elm$core$List$indexedMap,
		F2(
			function (i, r) {
				var id = A3($author$project$Data$nextId, 'q', nowMillis, i);
				return {
					as: r.as,
					au: {al: r.B, Y: r.C},
					O: id,
					bd: _List_Nil,
					l: id,
					aU: r.aU,
					Y: r.Y,
					by: nowMillis,
					aX: 1,
					a$: r.a$
				};
			}),
		$author$project$Data$seedRaw);
};
var $author$project$Main$seedAndSave = function (base) {
	var seeded = $author$project$Data$seedQuestions(base.m);
	var seededModel = _Utils_update(
		base,
		{a3: $elm$core$Maybe$Nothing, ae: true, bq: seeded, bv: _List_Nil});
	return _Utils_Tuple2(
		seededModel,
		$author$project$Main$save(seededModel));
};
var $author$project$Main$handleDataLoaded = F2(
	function (value, model) {
		var _v0 = A2($elm$json$Json$Decode$decodeValue, $author$project$Main$incomingDecoder, value);
		if (_v0.$ === 1) {
			return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
		} else {
			var env = _v0.a;
			var _v1 = env.aC;
			if (_v1 === 'saveError') {
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{ab: true}),
					$elm$core$Platform$Cmd$none);
			} else {
				var base = _Utils_update(
					model,
					{L: env.L, M: env.M, ab: false});
				var _v2 = env.ak;
				if (!_v2.$) {
					var persisted = _v2.a;
					var _v3 = A3($author$project$Codec$fixMissingIds, model.q, persisted.bq, persisted.bv);
					var fixedQ = _v3.a;
					var fixedT = _v3.b;
					var newCounter = _v3.c;
					if ($elm$core$List$isEmpty(fixedQ) && $elm$core$List$isEmpty(fixedT)) {
						return $author$project$Main$seedAndSave(
							_Utils_update(
								base,
								{q: newCounter}));
					} else {
						var activeId = function () {
							var _v4 = persisted.a3;
							if (!_v4.$) {
								var id = _v4.a;
								return A2(
									$elm$core$List$any,
									function (t) {
										return _Utils_eq(t.l, id);
									},
									fixedT) ? $elm$core$Maybe$Just(id) : A2(
									$elm$core$Maybe$map,
									function ($) {
										return $.l;
									},
									$elm$core$List$head(fixedT));
							} else {
								return A2(
									$elm$core$Maybe$map,
									function ($) {
										return $.l;
									},
									$elm$core$List$head(fixedT));
							}
						}();
						return _Utils_Tuple2(
							_Utils_update(
								base,
								{a3: activeId, q: newCounter, ae: true, bq: fixedQ, bv: fixedT}),
							$elm$core$Platform$Cmd$none);
					}
				} else {
					return $author$project$Main$seedAndSave(base);
				}
			}
		}
	});
var $elm$core$Set$insert = F2(
	function (key, _v0) {
		var dict = _v0;
		return A3($elm$core$Dict$insert, key, 0, dict);
	});
var $elm$core$Dict$isEmpty = function (dict) {
	if (dict.$ === -2) {
		return true;
	} else {
		return false;
	}
};
var $elm$core$Set$isEmpty = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$isEmpty(dict);
};
var $author$project$Main$loadFormStateFrom = F2(
	function (model, id) {
		var _v0 = A2($author$project$Main$findQuestion, model, id);
		if (_v0.$ === 1) {
			return $author$project$Main$emptyFormState;
		} else {
			var q = _v0.a;
			return {
				as: q.as,
				B: q.au.al,
				C: q.au.Y,
				X: A2($elm$core$String$join, ', ', q.aU),
				Y: q.Y,
				a$: $elm$core$List$isEmpty(q.a$) ? _List_fromArray(
					[
						{al: '', Y: ''}
					]) : q.a$
			};
		}
	});
var $author$project$Main$mapFormState = F2(
	function (f, model) {
		return _Utils_update(
			model,
			{
				g: A2($elm$core$Maybe$map, f, model.g)
			});
	});
var $elm$core$Dict$member = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$get, key, dict);
		if (!_v0.$) {
			return true;
		} else {
			return false;
		}
	});
var $elm$core$Set$member = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$member, key, dict);
	});
var $author$project$Main$dedupe = function (xs) {
	return A3(
		$elm$core$List$foldl,
		F2(
			function (x, acc) {
				return A2($elm$core$List$member, x, acc) ? acc : _Utils_ap(
					acc,
					_List_fromArray(
						[x]));
			}),
		_List_Nil,
		xs);
};
var $elm$core$Basics$not = _Basics_not;
var $author$project$Main$mergeTags = F2(
	function (existing, added) {
		return _Utils_ap(
			existing,
			A2(
				$elm$core$List$filter,
				function (t) {
					return !A2($elm$core$List$member, t, existing);
				},
				$author$project$Main$dedupe(added)));
	});
var $author$project$Data$insertBefore = F3(
	function (beforeId, questionId, ids) {
		if (beforeId.$ === 1) {
			return _Utils_ap(
				ids,
				_List_fromArray(
					[questionId]));
		} else {
			var before = beforeId.a;
			return A2($elm$core$List$member, before, ids) ? A3(
				$elm$core$List$foldr,
				F2(
					function (id, acc) {
						return _Utils_eq(id, before) ? A2(
							$elm$core$List$cons,
							questionId,
							A2($elm$core$List$cons, id, acc)) : A2($elm$core$List$cons, id, acc);
					}),
				_List_Nil,
				ids) : _Utils_ap(
				ids,
				_List_fromArray(
					[questionId]));
		}
	});
var $elm$core$Basics$neq = _Utils_notEqual;
var $author$project$Data$withQuestionRemoved = F2(
	function (questionId, test) {
		return _Utils_update(
			test,
			{
				am: A2(
					$elm$core$List$map,
					function (g) {
						return _Utils_update(
							g,
							{
								bp: A2(
									$elm$core$List$filter,
									$elm$core$Basics$neq(questionId),
									g.bp)
							});
					},
					test.am),
				bi: A2(
					$elm$core$List$filter,
					$elm$core$Basics$neq(questionId),
					test.bi)
			});
	});
var $author$project$Data$moveQuestionInTest = F4(
	function (questionId, target, beforeId, test) {
		var cleared = A2($author$project$Data$withQuestionRemoved, questionId, test);
		if (!target.$) {
			return _Utils_update(
				cleared,
				{
					bi: A3($author$project$Data$insertBefore, beforeId, questionId, cleared.bi)
				});
		} else {
			var groupId = target.a;
			return _Utils_update(
				cleared,
				{
					am: A2(
						$elm$core$List$map,
						function (g) {
							return _Utils_eq(g.l, groupId) ? _Utils_update(
								g,
								{
									bp: A3($author$project$Data$insertBefore, beforeId, questionId, g.bp)
								}) : g;
						},
						cleared.am)
				});
		}
	});
var $elm$core$String$trim = _String_trim;
var $author$project$Main$questionDataFromForm = function (fs) {
	return ($elm$core$String$isEmpty(
		$elm$core$String$trim(fs.Y)) || $elm$core$String$isEmpty(
		$elm$core$String$trim(fs.C))) ? $elm$core$Maybe$Nothing : $elm$core$Maybe$Just(
		{
			as: $elm$core$String$trim(fs.as),
			au: {
				al: $elm$core$String$trim(fs.B),
				Y: $elm$core$String$trim(fs.C)
			},
			aU: A2(
				$elm$core$List$filter,
				A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
				A2(
					$elm$core$List$map,
					$elm$core$String$trim,
					A2($elm$core$String$split, ',', fs.X))),
			Y: $elm$core$String$trim(fs.Y),
			a$: A2(
				$elm$core$List$filter,
				function (w) {
					return !$elm$core$String$isEmpty(
						$elm$core$String$trim(w.Y));
				},
				fs.a$)
		});
};
var $elm$core$Dict$getMin = function (dict) {
	getMin:
	while (true) {
		if ((dict.$ === -1) && (dict.d.$ === -1)) {
			var left = dict.d;
			var $temp$dict = left;
			dict = $temp$dict;
			continue getMin;
		} else {
			return dict;
		}
	}
};
var $elm$core$Dict$moveRedLeft = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.e.d.$ === -1) && (!dict.e.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var lLeft = _v1.d;
			var lRight = _v1.e;
			var _v2 = dict.e;
			var rClr = _v2.a;
			var rK = _v2.b;
			var rV = _v2.c;
			var rLeft = _v2.d;
			var _v3 = rLeft.a;
			var rlK = rLeft.b;
			var rlV = rLeft.c;
			var rlL = rLeft.d;
			var rlR = rLeft.e;
			var rRight = _v2.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				rlK,
				rlV,
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					rlL),
				A5($elm$core$Dict$RBNode_elm_builtin, 1, rK, rV, rlR, rRight));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v4 = dict.d;
			var lClr = _v4.a;
			var lK = _v4.b;
			var lV = _v4.c;
			var lLeft = _v4.d;
			var lRight = _v4.e;
			var _v5 = dict.e;
			var rClr = _v5.a;
			var rK = _v5.b;
			var rV = _v5.c;
			var rLeft = _v5.d;
			var rRight = _v5.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$moveRedRight = function (dict) {
	if (((dict.$ === -1) && (dict.d.$ === -1)) && (dict.e.$ === -1)) {
		if ((dict.d.d.$ === -1) && (!dict.d.d.a)) {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v1 = dict.d;
			var lClr = _v1.a;
			var lK = _v1.b;
			var lV = _v1.c;
			var _v2 = _v1.d;
			var _v3 = _v2.a;
			var llK = _v2.b;
			var llV = _v2.c;
			var llLeft = _v2.d;
			var llRight = _v2.e;
			var lRight = _v1.e;
			var _v4 = dict.e;
			var rClr = _v4.a;
			var rK = _v4.b;
			var rV = _v4.c;
			var rLeft = _v4.d;
			var rRight = _v4.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				0,
				lK,
				lV,
				A5($elm$core$Dict$RBNode_elm_builtin, 1, llK, llV, llLeft, llRight),
				A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					lRight,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight)));
		} else {
			var clr = dict.a;
			var k = dict.b;
			var v = dict.c;
			var _v5 = dict.d;
			var lClr = _v5.a;
			var lK = _v5.b;
			var lV = _v5.c;
			var lLeft = _v5.d;
			var lRight = _v5.e;
			var _v6 = dict.e;
			var rClr = _v6.a;
			var rK = _v6.b;
			var rV = _v6.c;
			var rLeft = _v6.d;
			var rRight = _v6.e;
			if (clr === 1) {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			} else {
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					1,
					k,
					v,
					A5($elm$core$Dict$RBNode_elm_builtin, 0, lK, lV, lLeft, lRight),
					A5($elm$core$Dict$RBNode_elm_builtin, 0, rK, rV, rLeft, rRight));
			}
		}
	} else {
		return dict;
	}
};
var $elm$core$Dict$removeHelpPrepEQGT = F7(
	function (targetKey, dict, color, key, value, left, right) {
		if ((left.$ === -1) && (!left.a)) {
			var _v1 = left.a;
			var lK = left.b;
			var lV = left.c;
			var lLeft = left.d;
			var lRight = left.e;
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				lK,
				lV,
				lLeft,
				A5($elm$core$Dict$RBNode_elm_builtin, 0, key, value, lRight, right));
		} else {
			_v2$2:
			while (true) {
				if ((right.$ === -1) && (right.a === 1)) {
					if (right.d.$ === -1) {
						if (right.d.a === 1) {
							var _v3 = right.a;
							var _v4 = right.d;
							var _v5 = _v4.a;
							return $elm$core$Dict$moveRedRight(dict);
						} else {
							break _v2$2;
						}
					} else {
						var _v6 = right.a;
						var _v7 = right.d;
						return $elm$core$Dict$moveRedRight(dict);
					}
				} else {
					break _v2$2;
				}
			}
			return dict;
		}
	});
var $elm$core$Dict$removeMin = function (dict) {
	if ((dict.$ === -1) && (dict.d.$ === -1)) {
		var color = dict.a;
		var key = dict.b;
		var value = dict.c;
		var left = dict.d;
		var lColor = left.a;
		var lLeft = left.d;
		var right = dict.e;
		if (lColor === 1) {
			if ((lLeft.$ === -1) && (!lLeft.a)) {
				var _v3 = lLeft.a;
				return A5(
					$elm$core$Dict$RBNode_elm_builtin,
					color,
					key,
					value,
					$elm$core$Dict$removeMin(left),
					right);
			} else {
				var _v4 = $elm$core$Dict$moveRedLeft(dict);
				if (_v4.$ === -1) {
					var nColor = _v4.a;
					var nKey = _v4.b;
					var nValue = _v4.c;
					var nLeft = _v4.d;
					var nRight = _v4.e;
					return A5(
						$elm$core$Dict$balance,
						nColor,
						nKey,
						nValue,
						$elm$core$Dict$removeMin(nLeft),
						nRight);
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			}
		} else {
			return A5(
				$elm$core$Dict$RBNode_elm_builtin,
				color,
				key,
				value,
				$elm$core$Dict$removeMin(left),
				right);
		}
	} else {
		return $elm$core$Dict$RBEmpty_elm_builtin;
	}
};
var $elm$core$Dict$removeHelp = F2(
	function (targetKey, dict) {
		if (dict.$ === -2) {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		} else {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_cmp(targetKey, key) < 0) {
				if ((left.$ === -1) && (left.a === 1)) {
					var _v4 = left.a;
					var lLeft = left.d;
					if ((lLeft.$ === -1) && (!lLeft.a)) {
						var _v6 = lLeft.a;
						return A5(
							$elm$core$Dict$RBNode_elm_builtin,
							color,
							key,
							value,
							A2($elm$core$Dict$removeHelp, targetKey, left),
							right);
					} else {
						var _v7 = $elm$core$Dict$moveRedLeft(dict);
						if (_v7.$ === -1) {
							var nColor = _v7.a;
							var nKey = _v7.b;
							var nValue = _v7.c;
							var nLeft = _v7.d;
							var nRight = _v7.e;
							return A5(
								$elm$core$Dict$balance,
								nColor,
								nKey,
								nValue,
								A2($elm$core$Dict$removeHelp, targetKey, nLeft),
								nRight);
						} else {
							return $elm$core$Dict$RBEmpty_elm_builtin;
						}
					}
				} else {
					return A5(
						$elm$core$Dict$RBNode_elm_builtin,
						color,
						key,
						value,
						A2($elm$core$Dict$removeHelp, targetKey, left),
						right);
				}
			} else {
				return A2(
					$elm$core$Dict$removeHelpEQGT,
					targetKey,
					A7($elm$core$Dict$removeHelpPrepEQGT, targetKey, dict, color, key, value, left, right));
			}
		}
	});
var $elm$core$Dict$removeHelpEQGT = F2(
	function (targetKey, dict) {
		if (dict.$ === -1) {
			var color = dict.a;
			var key = dict.b;
			var value = dict.c;
			var left = dict.d;
			var right = dict.e;
			if (_Utils_eq(targetKey, key)) {
				var _v1 = $elm$core$Dict$getMin(right);
				if (_v1.$ === -1) {
					var minKey = _v1.b;
					var minValue = _v1.c;
					return A5(
						$elm$core$Dict$balance,
						color,
						minKey,
						minValue,
						left,
						$elm$core$Dict$removeMin(right));
				} else {
					return $elm$core$Dict$RBEmpty_elm_builtin;
				}
			} else {
				return A5(
					$elm$core$Dict$balance,
					color,
					key,
					value,
					left,
					A2($elm$core$Dict$removeHelp, targetKey, right));
			}
		} else {
			return $elm$core$Dict$RBEmpty_elm_builtin;
		}
	});
var $elm$core$Dict$remove = F2(
	function (key, dict) {
		var _v0 = A2($elm$core$Dict$removeHelp, key, dict);
		if ((_v0.$ === -1) && (!_v0.a)) {
			var _v1 = _v0.a;
			var k = _v0.b;
			var v = _v0.c;
			var l = _v0.d;
			var r = _v0.e;
			return A5($elm$core$Dict$RBNode_elm_builtin, 1, k, v, l, r);
		} else {
			var x = _v0;
			return x;
		}
	});
var $elm$core$Set$remove = F2(
	function (key, _v0) {
		var dict = _v0;
		return A2($elm$core$Dict$remove, key, dict);
	});
var $elm$core$List$takeReverse = F3(
	function (n, list, kept) {
		takeReverse:
		while (true) {
			if (n <= 0) {
				return kept;
			} else {
				if (!list.b) {
					return kept;
				} else {
					var x = list.a;
					var xs = list.b;
					var $temp$n = n - 1,
						$temp$list = xs,
						$temp$kept = A2($elm$core$List$cons, x, kept);
					n = $temp$n;
					list = $temp$list;
					kept = $temp$kept;
					continue takeReverse;
				}
			}
		}
	});
var $elm$core$List$takeTailRec = F2(
	function (n, list) {
		return $elm$core$List$reverse(
			A3($elm$core$List$takeReverse, n, list, _List_Nil));
	});
var $elm$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (n <= 0) {
			return _List_Nil;
		} else {
			var _v0 = _Utils_Tuple2(n, list);
			_v0$1:
			while (true) {
				_v0$5:
				while (true) {
					if (!_v0.b.b) {
						return list;
					} else {
						if (_v0.b.b.b) {
							switch (_v0.a) {
								case 1:
									break _v0$1;
								case 2:
									var _v2 = _v0.b;
									var x = _v2.a;
									var _v3 = _v2.b;
									var y = _v3.a;
									return _List_fromArray(
										[x, y]);
								case 3:
									if (_v0.b.b.b.b) {
										var _v4 = _v0.b;
										var x = _v4.a;
										var _v5 = _v4.b;
										var y = _v5.a;
										var _v6 = _v5.b;
										var z = _v6.a;
										return _List_fromArray(
											[x, y, z]);
									} else {
										break _v0$5;
									}
								default:
									if (_v0.b.b.b.b && _v0.b.b.b.b.b) {
										var _v7 = _v0.b;
										var x = _v7.a;
										var _v8 = _v7.b;
										var y = _v8.a;
										var _v9 = _v8.b;
										var z = _v9.a;
										var _v10 = _v9.b;
										var w = _v10.a;
										var tl = _v10.b;
										return (ctr > 1000) ? A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A2($elm$core$List$takeTailRec, n - 4, tl))))) : A2(
											$elm$core$List$cons,
											x,
											A2(
												$elm$core$List$cons,
												y,
												A2(
													$elm$core$List$cons,
													z,
													A2(
														$elm$core$List$cons,
														w,
														A3($elm$core$List$takeFast, ctr + 1, n - 4, tl)))));
									} else {
										break _v0$5;
									}
							}
						} else {
							if (_v0.a === 1) {
								break _v0$1;
							} else {
								break _v0$5;
							}
						}
					}
				}
				return list;
			}
			var _v1 = _v0.b;
			var x = _v1.a;
			return _List_fromArray(
				[x]);
		}
	});
var $elm$core$List$take = F2(
	function (n, list) {
		return A3($elm$core$List$takeFast, 0, n, list);
	});
var $author$project$Main$removeAt = F2(
	function (index, xs) {
		return _Utils_ap(
			A2($elm$core$List$take, index, xs),
			A2($elm$core$List$drop, index + 1, xs));
	});
var $elm$core$String$replace = F3(
	function (before, after, string) {
		return A2(
			$elm$core$String$join,
			after,
			A2($elm$core$String$split, before, string));
	});
var $elm$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			if (dict.$ === -2) {
				return n;
			} else {
				var left = dict.d;
				var right = dict.e;
				var $temp$n = A2($elm$core$Dict$sizeHelp, n + 1, right),
					$temp$dict = left;
				n = $temp$n;
				dict = $temp$dict;
				continue sizeHelp;
			}
		}
	});
var $elm$core$Dict$size = function (dict) {
	return A2($elm$core$Dict$sizeHelp, 0, dict);
};
var $elm$core$Set$size = function (_v0) {
	var dict = _v0;
	return $elm$core$Dict$size(dict);
};
var $elm$core$Array$fromListHelp = F3(
	function (list, nodeList, nodeListSize) {
		fromListHelp:
		while (true) {
			var _v0 = A2($elm$core$Elm$JsArray$initializeFromList, $elm$core$Array$branchFactor, list);
			var jsArray = _v0.a;
			var remainingItems = _v0.b;
			if (_Utils_cmp(
				$elm$core$Elm$JsArray$length(jsArray),
				$elm$core$Array$branchFactor) < 0) {
				return A2(
					$elm$core$Array$builderToArray,
					true,
					{e: nodeList, b: nodeListSize, d: jsArray});
			} else {
				var $temp$list = remainingItems,
					$temp$nodeList = A2(
					$elm$core$List$cons,
					$elm$core$Array$Leaf(jsArray),
					nodeList),
					$temp$nodeListSize = nodeListSize + 1;
				list = $temp$list;
				nodeList = $temp$nodeList;
				nodeListSize = $temp$nodeListSize;
				continue fromListHelp;
			}
		}
	});
var $elm$core$Array$fromList = function (list) {
	if (!list.b) {
		return $elm$core$Array$empty;
	} else {
		return A3($elm$core$Array$fromListHelp, list, _List_Nil, 0);
	}
};
var $elm$core$Bitwise$shiftRightZfBy = _Bitwise_shiftRightZfBy;
var $elm$core$Array$bitMask = 4294967295 >>> (32 - $elm$core$Array$shiftStep);
var $elm$core$Elm$JsArray$unsafeGet = _JsArray_unsafeGet;
var $elm$core$Array$getHelp = F3(
	function (shift, index, tree) {
		getHelp:
		while (true) {
			var pos = $elm$core$Array$bitMask & (index >>> shift);
			var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
			if (!_v0.$) {
				var subTree = _v0.a;
				var $temp$shift = shift - $elm$core$Array$shiftStep,
					$temp$index = index,
					$temp$tree = subTree;
				shift = $temp$shift;
				index = $temp$index;
				tree = $temp$tree;
				continue getHelp;
			} else {
				var values = _v0.a;
				return A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, values);
			}
		}
	});
var $elm$core$Bitwise$shiftLeftBy = _Bitwise_shiftLeftBy;
var $elm$core$Array$tailIndex = function (len) {
	return (len >>> 5) << 5;
};
var $elm$core$Array$get = F2(
	function (index, _v0) {
		var len = _v0.a;
		var startShift = _v0.b;
		var tree = _v0.c;
		var tail = _v0.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? $elm$core$Maybe$Nothing : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? $elm$core$Maybe$Just(
			A2($elm$core$Elm$JsArray$unsafeGet, $elm$core$Array$bitMask & index, tail)) : $elm$core$Maybe$Just(
			A3($elm$core$Array$getHelp, startShift, index, tree)));
	});
var $elm$core$Tuple$pair = F2(
	function (a, b) {
		return _Utils_Tuple2(a, b);
	});
var $elm$core$Elm$JsArray$unsafeSet = _JsArray_unsafeSet;
var $elm$core$Array$setHelp = F4(
	function (shift, index, value, tree) {
		var pos = $elm$core$Array$bitMask & (index >>> shift);
		var _v0 = A2($elm$core$Elm$JsArray$unsafeGet, pos, tree);
		if (!_v0.$) {
			var subTree = _v0.a;
			var newSub = A4($elm$core$Array$setHelp, shift - $elm$core$Array$shiftStep, index, value, subTree);
			return A3(
				$elm$core$Elm$JsArray$unsafeSet,
				pos,
				$elm$core$Array$SubTree(newSub),
				tree);
		} else {
			var values = _v0.a;
			var newLeaf = A3($elm$core$Elm$JsArray$unsafeSet, $elm$core$Array$bitMask & index, value, values);
			return A3(
				$elm$core$Elm$JsArray$unsafeSet,
				pos,
				$elm$core$Array$Leaf(newLeaf),
				tree);
		}
	});
var $elm$core$Array$set = F3(
	function (index, value, array) {
		var len = array.a;
		var startShift = array.b;
		var tree = array.c;
		var tail = array.d;
		return ((index < 0) || (_Utils_cmp(index, len) > -1)) ? array : ((_Utils_cmp(
			index,
			$elm$core$Array$tailIndex(len)) > -1) ? A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			tree,
			A3($elm$core$Elm$JsArray$unsafeSet, $elm$core$Array$bitMask & index, value, tail)) : A4(
			$elm$core$Array$Array_elm_builtin,
			len,
			startShift,
			A4($elm$core$Array$setHelp, startShift, index, value, tree),
			tail));
	});
var $author$project$Main$swapAdjacent = F3(
	function (id, dir, groups) {
		var idx = A2(
			$elm$core$Maybe$map,
			$elm$core$Tuple$first,
			$elm$core$List$head(
				A2(
					$elm$core$List$filter,
					function (_v2) {
						var g = _v2.b;
						return _Utils_eq(g.l, id);
					},
					A2($elm$core$List$indexedMap, $elm$core$Tuple$pair, groups))));
		if (idx.$ === 1) {
			return groups;
		} else {
			var i = idx.a;
			var newIdx = i + dir;
			if ((newIdx < 0) || (_Utils_cmp(
				newIdx,
				$elm$core$List$length(groups)) > -1)) {
				return groups;
			} else {
				var arr = $elm$core$Array$fromList(groups);
				var b = A2($elm$core$Array$get, newIdx, arr);
				var a = A2($elm$core$Array$get, i, arr);
				var _v1 = _Utils_Tuple2(a, b);
				if ((!_v1.a.$) && (!_v1.b.$)) {
					var av = _v1.a.a;
					var bv = _v1.b.a;
					return $elm$core$Array$toList(
						A3(
							$elm$core$Array$set,
							newIdx,
							av,
							A3($elm$core$Array$set, i, bv, arr)));
				} else {
					return groups;
				}
			}
		}
	});
var $elm$file$File$toString = _File_toString;
var $author$project$Main$updateActiveTest = F2(
	function (f, model) {
		var _v0 = model.a3;
		if (_v0.$ === 1) {
			return model;
		} else {
			var id = _v0.a;
			return _Utils_update(
				model,
				{
					bv: A3($author$project$Main$updateTestById, id, f, model.bv)
				});
		}
	});
var $author$project$Main$updateAt = F3(
	function (index, f, xs) {
		return A2(
			$elm$core$List$indexedMap,
			F2(
				function (i, x) {
					return _Utils_eq(i, index) ? f(x) : x;
				}),
			xs);
	});
var $elm$core$Maybe$withDefault = F2(
	function (_default, maybe) {
		if (!maybe.$) {
			var value = maybe.a;
			return value;
		} else {
			return _default;
		}
	});
var $author$project$Main$update = F2(
	function (msg, model) {
		switch (msg.$) {
			case 0:
				return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
			case 1:
				var posix = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							m: $elm$time$Time$posixToMillis(posix)
						}),
					$elm$core$Platform$Cmd$none);
			case 2:
				var value = msg.a;
				return A2($author$project$Main$handleDataLoaded, value, model);
			case 3:
				var s = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{ag: s}),
					$elm$core$Platform$Cmd$none);
			case 4:
				var tag = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							n: A2($elm$core$Set$member, tag, model.n) ? A2($elm$core$Set$remove, tag, model.n) : A2($elm$core$Set$insert, tag, model.n)
						}),
					$elm$core$Platform$Cmd$none);
			case 5:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{n: $elm$core$Set$empty}),
					$elm$core$Platform$Cmd$none);
			case 6:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							a: A2($elm$core$Set$member, id, model.a) ? A2($elm$core$Set$remove, id, model.a) : A2($elm$core$Set$insert, id, model.a)
						}),
					$elm$core$Platform$Cmd$none);
			case 7:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{a: $elm$core$Set$empty}),
					$elm$core$Platform$Cmd$none);
			case 8:
				var s = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{A: s}),
					$elm$core$Platform$Cmd$none);
			case 9:
				var newTags = A2(
					$elm$core$List$filter,
					A2($elm$core$Basics$composeL, $elm$core$Basics$not, $elm$core$String$isEmpty),
					A2(
						$elm$core$List$map,
						$elm$core$String$trim,
						A2($elm$core$String$split, ',', model.A)));
				if ($elm$core$List$isEmpty(newTags)) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var newQuestions = A2(
						$elm$core$List$map,
						function (q) {
							return A2($elm$core$Set$member, q.l, model.a) ? _Utils_update(
								q,
								{
									aU: A2($author$project$Main$mergeTags, q.aU, newTags)
								}) : q;
						},
						model.bq);
					var newModel = _Utils_update(
						model,
						{A: '', bq: newQuestions});
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$save(newModel));
				}
			case 10:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{J: !model.J}),
					$elm$core$Platform$Cmd$none);
			case 11:
				var target = msg.a;
				var _v1 = model.a3;
				if (_v1.$ === 1) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var ids = $elm$core$Set$toList(model.a);
					var newModel = function (m) {
						return _Utils_update(
							m,
							{J: false, a: $elm$core$Set$empty});
					}(
						A2(
							$author$project$Main$updateActiveTest,
							function (t) {
								return A3(
									$elm$core$List$foldl,
									F2(
										function (qid, acc) {
											return A4($author$project$Data$moveQuestionInTest, qid, target, $elm$core$Maybe$Nothing, acc);
										}),
									t,
									ids);
							},
							model));
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$save(newModel));
				}
			case 12:
				var list = $elm$core$Set$isEmpty(model.a) ? model.bq : A2(
					$elm$core$List$filter,
					function (q) {
						return A2($elm$core$Set$member, q.l, model.a);
					},
					model.bq);
				return _Utils_Tuple2(
					model,
					A2(
						$author$project$Main$downloadJSON,
						'questions-' + ($author$project$Main$dateStamp(model.m) + '.json'),
						$author$project$Codec$encodeQuestionList(list)));
			case 13:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{P: '', Q: true, R: ''}),
					$elm$core$Platform$Cmd$none);
			case 14:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{Q: false}),
					$elm$core$Platform$Cmd$none);
			case 15:
				var s = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{R: s}),
					$elm$core$Platform$Cmd$none);
			case 16:
				var _v2 = $author$project$Codec$decodeImportPayload(model.R);
				if (_v2.$ === 1) {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{P: 'Couldn\u0027t parse that as JSON. Check the format and try again.'}),
						$elm$core$Platform$Cmd$none);
				} else {
					var items = _v2.a;
					var _v3 = A3(
						$elm$core$List$foldl,
						F2(
							function (item, _v4) {
								var acc = _v4.a;
								var m = _v4.b;
								var _v5 = A2($author$project$Main$genId, 'q', m);
								var id = _v5.a;
								var m2 = _v5.b;
								var q = {
									as: item.as,
									au: {al: item.bg, Y: item.a4},
									O: id,
									bd: _List_Nil,
									l: id,
									aU: _List_Nil,
									Y: item.bo,
									by: m2.m,
									aX: 1,
									a$: A2(
										$elm$core$List$indexedMap,
										F2(
											function (i, w) {
												return {
													al: A2(
														$elm$core$Maybe$withDefault,
														'',
														$elm$core$List$head(
															A2($elm$core$List$drop, i, item.bh))),
													Y: w
												};
											}),
										item.a5)
								};
								return _Utils_Tuple2(
									_Utils_ap(
										acc,
										_List_fromArray(
											[q])),
									m2);
							}),
						_Utils_Tuple2(_List_Nil, model),
						items);
					var newQuestions = _v3.a;
					var newModel1 = _v3.b;
					var newModel = _Utils_update(
						newModel1,
						{
							Q: false,
							bq: _Utils_ap(newModel1.bq, newQuestions)
						});
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$save(newModel));
				}
			case 17:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							w: $elm$core$Maybe$Nothing,
							p: $elm$core$Maybe$Nothing,
							x: $elm$core$Maybe$Just(0),
							g: $elm$core$Maybe$Just($author$project$Main$emptyFormState)
						}),
					$elm$core$Platform$Cmd$none);
			case 18:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{V: true}),
					$elm$core$Platform$Cmd$none);
			case 19:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{V: false}),
					$elm$core$Platform$Cmd$none);
			case 20:
				var newModel = _Utils_update(
					model,
					{a3: $elm$core$Maybe$Nothing, bq: _List_Nil, V: false, a: $elm$core$Set$empty, bv: _List_Nil});
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 21:
				return _Utils_Tuple2(
					model,
					A2(
						$author$project$Main$downloadJSON,
						'qbank-backup-' + ($author$project$Main$dateStamp(model.m) + '.json'),
						A2($author$project$Codec$encodeBackup, model.bq, model.bv)));
			case 22:
				return _Utils_Tuple2(
					model,
					A2(
						$elm$file$File$Select$file,
						_List_fromArray(
							['application/json']),
						$author$project$Main$GotBackupFile));
			case 23:
				var file = msg.a;
				return _Utils_Tuple2(
					model,
					A2(
						$elm$core$Task$perform,
						$author$project$Main$GotBackupText,
						$elm$file$File$toString(file)));
			case 24:
				var content = msg.a;
				var _v6 = $author$project$Codec$decodeBackup(content);
				if (_v6.$ === 1) {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{K: 'Couldn\u0027t read that file as a backup.'}),
						$elm$core$Platform$Cmd$none);
				} else {
					var data = _v6.a;
					var _v7 = A3($author$project$Codec$fixMissingIds, model.q, data.bq, data.bv);
					var fixedQ = _v7.a;
					var fixedT = _v7.b;
					var newCounter = _v7.c;
					var fixed = {bq: fixedQ, bv: fixedT};
					var modelWithCounter = _Utils_update(
						model,
						{K: '', q: newCounter});
					return ($elm$core$List$isEmpty(model.bq) && $elm$core$List$isEmpty(model.bv)) ? A2($author$project$Main$applyLoadedData, fixed, modelWithCounter) : _Utils_Tuple2(
						_Utils_update(
							modelWithCounter,
							{
								F: $elm$core$Maybe$Just(fixed)
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 25:
				var _v8 = model.F;
				if (_v8.$ === 1) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var data = _v8.a;
					return A2(
						$author$project$Main$applyLoadedData,
						data,
						_Utils_update(
							model,
							{F: $elm$core$Maybe$Nothing}));
				}
			case 26:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{F: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 27:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							T: $elm$core$Maybe$Just(id)
						}),
					$elm$core$Platform$Cmd$none);
			case 28:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{T: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 29:
				var id = msg.a;
				var newModel = _Utils_update(
					model,
					{
						T: $elm$core$Maybe$Nothing,
						bq: A2(
							$elm$core$List$filter,
							function (q) {
								return !_Utils_eq(q.l, id);
							},
							model.bq),
						a: A2($elm$core$Set$remove, id, model.a),
						bv: A2(
							$elm$core$List$map,
							$author$project$Data$withQuestionRemoved(id),
							model.bv)
					});
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 30:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							ac: $elm$core$Maybe$Just(id)
						}),
					$elm$core$Platform$Cmd$none);
			case 31:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{ac: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 32:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							w: $elm$core$Maybe$Nothing,
							p: $elm$core$Maybe$Just(id),
							x: $elm$core$Maybe$Just(1),
							g: $elm$core$Maybe$Just(
								A2($author$project$Main$loadFormStateFrom, model, id))
						}),
					$elm$core$Platform$Cmd$none);
			case 33:
				var id = msg.a;
				var slot = msg.b;
				var _v9 = model.a3;
				if (_v9.$ === 1) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var testId = _v9.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{
								w: $elm$core$Maybe$Just(
									{aD: slot, aV: testId}),
								p: $elm$core$Maybe$Just(id),
								x: $elm$core$Maybe$Just(1),
								g: $elm$core$Maybe$Just(
									A2($author$project$Main$loadFormStateFrom, model, id))
							}),
						$elm$core$Platform$Cmd$none);
				}
			case 34:
				var id = msg.a;
				var ids = (A2($elm$core$Set$member, id, model.a) && ($elm$core$Set$size(model.a) > 1)) ? $elm$core$Set$toList(model.a) : _List_fromArray(
					[id]);
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							o: $elm$core$Maybe$Just(
								$author$project$Main$FromBank(ids))
						}),
					$elm$core$Platform$Cmd$none);
			case 35:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							o: $elm$core$Maybe$Just(
								$author$project$Main$FromTest(id))
						}),
					$elm$core$Platform$Cmd$none);
			case 36:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{i: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 37:
				var slot = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							i: $elm$core$Maybe$Just(slot)
						}),
					$elm$core$Platform$Cmd$none);
			case 38:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{i: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 39:
				var _v10 = _Utils_Tuple2(model.o, model.a3);
				if (((!_v10.a.$) && (_v10.a.a.$ === 1)) && (!_v10.b.$)) {
					var qid = _v10.a.a.a;
					var newModel = function (m) {
						return _Utils_update(
							m,
							{i: $elm$core$Maybe$Nothing, o: $elm$core$Maybe$Nothing});
					}(
						A2(
							$author$project$Main$updateActiveTest,
							$author$project$Data$withQuestionRemoved(qid),
							model));
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$save(newModel));
				} else {
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{i: $elm$core$Maybe$Nothing, o: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				}
			case 40:
				var target = msg.a;
				var beforeId = msg.b;
				var _v11 = _Utils_Tuple2(model.o, model.a3);
				if (_v11.a.$ === 1) {
					var _v12 = _v11.a;
					return _Utils_Tuple2(
						_Utils_update(
							model,
							{i: $elm$core$Maybe$Nothing}),
						$elm$core$Platform$Cmd$none);
				} else {
					if (_v11.b.$ === 1) {
						var _v13 = _v11.b;
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{i: $elm$core$Maybe$Nothing}),
							$elm$core$Platform$Cmd$none);
					} else {
						if (!_v11.a.a.$) {
							var ids = _v11.a.a.a;
							var newModel = function (m) {
								return _Utils_update(
									m,
									{i: $elm$core$Maybe$Nothing, o: $elm$core$Maybe$Nothing});
							}(
								A2(
									$author$project$Main$updateActiveTest,
									function (t) {
										return A3(
											$elm$core$List$foldl,
											F2(
												function (qid, acc) {
													return A4($author$project$Data$moveQuestionInTest, qid, target, beforeId, acc);
												}),
											t,
											ids);
									},
									model));
							return _Utils_Tuple2(
								newModel,
								$author$project$Main$save(newModel));
						} else {
							var qid = _v11.a.a.a;
							var newModel = function (m) {
								return _Utils_update(
									m,
									{i: $elm$core$Maybe$Nothing, o: $elm$core$Maybe$Nothing});
							}(
								A2(
									$author$project$Main$updateActiveTest,
									A3($author$project$Data$moveQuestionInTest, qid, target, beforeId),
									model));
							return _Utils_Tuple2(
								newModel,
								$author$project$Main$save(newModel));
						}
					}
				}
			case 41:
				var _v14 = A2($author$project$Main$genId, 'test', model);
				var testId = _v14.a;
				var m1 = _v14.b;
				var _v15 = A2($author$project$Main$genId, 'grp', m1);
				var groupId = _v15.a;
				var m2 = _v15.b;
				var newTest = {
					am: _List_fromArray(
						[
							{l: groupId, aF: 'Group 1', bp: _List_Nil}
						]),
					l: testId,
					bi: _List_Nil,
					aF: 'Test ' + $elm$core$String$fromInt(
						$elm$core$List$length(model.bv) + 1)
				};
				var newModel = _Utils_update(
					m2,
					{
						a3: $elm$core$Maybe$Just(testId),
						bv: _Utils_ap(
							model.bv,
							_List_fromArray(
								[newTest]))
					});
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 42:
				var id = msg.a;
				var newModel = _Utils_update(
					model,
					{
						a3: $elm$core$Maybe$Just(id)
					});
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 43:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							af: $elm$core$Maybe$Just(id)
						}),
					$elm$core$Platform$Cmd$none);
			case 44:
				var id = msg.a;
				var rawName = msg.b;
				var name = $elm$core$String$trim(rawName);
				var newModel = _Utils_update(
					model,
					{
						af: $elm$core$Maybe$Nothing,
						bv: $elm$core$String$isEmpty(name) ? model.bv : A3(
							$author$project$Main$updateTestById,
							id,
							function (t) {
								return _Utils_update(
									t,
									{aF: name});
							},
							model.bv)
					});
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 45:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							U: $elm$core$Maybe$Just(id)
						}),
					$elm$core$Platform$Cmd$none);
			case 46:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{U: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 47:
				var id = msg.a;
				var wasActive = _Utils_eq(
					model.a3,
					$elm$core$Maybe$Just(id));
				var remaining = A2(
					$elm$core$List$filter,
					function (t) {
						return !_Utils_eq(t.l, id);
					},
					model.bv);
				var newModel = _Utils_update(
					model,
					{
						a3: wasActive ? A2(
							$elm$core$Maybe$map,
							function ($) {
								return $.l;
							},
							$elm$core$List$head(remaining)) : model.a3,
						U: $elm$core$Maybe$Nothing,
						bv: remaining
					});
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 48:
				var _v16 = model.a3;
				if (_v16.$ === 1) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var activeGroupCount = A2(
						$elm$core$Maybe$withDefault,
						0,
						A2(
							$elm$core$Maybe$map,
							A2(
								$elm$core$Basics$composeR,
								function ($) {
									return $.am;
								},
								$elm$core$List$length),
							$author$project$Main$findActiveTest(model)));
					var _v17 = A2($author$project$Main$genId, 'grp', model);
					var groupId = _v17.a;
					var m1 = _v17.b;
					var newModel = A2(
						$author$project$Main$updateActiveTest,
						function (t) {
							return _Utils_update(
								t,
								{
									am: _Utils_ap(
										t.am,
										_List_fromArray(
											[
												{
												l: groupId,
												aF: 'Group ' + $elm$core$String$fromInt(activeGroupCount + 1),
												bp: _List_Nil
											}
											]))
								});
						},
						m1);
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$save(newModel));
				}
			case 49:
				var groupId = msg.a;
				var rawName = msg.b;
				var name = $elm$core$String$trim(rawName);
				if ($elm$core$String$isEmpty(name)) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var newModel = A2(
						$author$project$Main$updateActiveTest,
						function (t) {
							return _Utils_update(
								t,
								{
									am: A2(
										$elm$core$List$map,
										function (g) {
											return _Utils_eq(g.l, groupId) ? _Utils_update(
												g,
												{aF: name}) : g;
										},
										t.am)
								});
						},
						model);
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$save(newModel));
				}
			case 50:
				var id = msg.a;
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{
							S: $elm$core$Maybe$Just(id)
						}),
					$elm$core$Platform$Cmd$none);
			case 51:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{S: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 52:
				var id = msg.a;
				var newModel = function (m) {
					return _Utils_update(
						m,
						{S: $elm$core$Maybe$Nothing});
				}(
					A2(
						$author$project$Main$updateActiveTest,
						function (t) {
							return _Utils_update(
								t,
								{
									am: A2(
										$elm$core$List$filter,
										function (g) {
											return !_Utils_eq(g.l, id);
										},
										t.am)
								});
						},
						model));
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 53:
				var id = msg.a;
				var dir = msg.b;
				var newModel = A2(
					$author$project$Main$updateActiveTest,
					function (t) {
						return _Utils_update(
							t,
							{
								am: A3($author$project$Main$swapAdjacent, id, dir, t.am)
							});
					},
					model);
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 54:
				var id = msg.a;
				var _v18 = $elm$core$List$head(
					A2(
						$elm$core$List$filter,
						function (t) {
							return _Utils_eq(t.l, id);
						},
						model.bv));
				if (_v18.$ === 1) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var t = _v18.a;
					return _Utils_Tuple2(
						model,
						A2(
							$author$project$Main$downloadJSON,
							A3($elm$core$String$replace, ' ', '_', t.aF) + '.json',
							A2($author$project$Main$encodeTestExport, model, t)));
				}
			case 55:
				var qid = msg.a;
				var newModel = A2(
					$author$project$Main$updateActiveTest,
					$author$project$Data$withQuestionRemoved(qid),
					model);
				return _Utils_Tuple2(
					newModel,
					$author$project$Main$save(newModel));
			case 56:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{w: $elm$core$Maybe$Nothing, p: $elm$core$Maybe$Nothing, x: $elm$core$Maybe$Nothing, g: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
			case 57:
				var s = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{as: s});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 58:
				var s = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{Y: s});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 59:
				var s = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{C: s});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 60:
				var s = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{B: s});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 61:
				var s = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{X: s});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 62:
				var i = msg.a;
				var s = msg.b;
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{
									a$: A3(
										$author$project$Main$updateAt,
										i,
										function (w) {
											return _Utils_update(
												w,
												{Y: s});
										},
										fs.a$)
								});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 63:
				var i = msg.a;
				var s = msg.b;
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{
									a$: A3(
										$author$project$Main$updateAt,
										i,
										function (w) {
											return _Utils_update(
												w,
												{al: s});
										},
										fs.a$)
								});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 64:
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{
									a$: _Utils_ap(
										fs.a$,
										_List_fromArray(
											[
												{al: '', Y: ''}
											]))
								});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 65:
				var i = msg.a;
				return _Utils_Tuple2(
					A2(
						$author$project$Main$mapFormState,
						function (fs) {
							return _Utils_update(
								fs,
								{
									a$: A2($author$project$Main$removeAt, i, fs.a$)
								});
						},
						model),
					$elm$core$Platform$Cmd$none);
			case 66:
				var _v19 = model.g;
				if (_v19.$ === 1) {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				} else {
					var fs = _v19.a;
					var _v20 = $author$project$Main$questionDataFromForm(fs);
					if (_v20.$ === 1) {
						return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
					} else {
						var data = _v20.a;
						var _v21 = A2($author$project$Main$genId, 'q', model);
						var id = _v21.a;
						var m1 = _v21.b;
						var q = {as: data.as, au: data.au, O: id, bd: _List_Nil, l: id, aU: data.aU, Y: data.Y, by: m1.m, aX: 1, a$: data.a$};
						var newModel = $author$project$Main$closeFormFields(
							_Utils_update(
								m1,
								{
									bq: _Utils_ap(
										model.bq,
										_List_fromArray(
											[q]))
								}));
						return _Utils_Tuple2(
							newModel,
							$author$project$Main$save(newModel));
					}
				}
			case 68:
				var _v22 = _Utils_Tuple2(
					model.p,
					A2($elm$core$Maybe$andThen, $author$project$Main$questionDataFromForm, model.g));
				if ((!_v22.a.$) && (!_v22.b.$)) {
					var id = _v22.a.a;
					var data = _v22.b.a;
					var refs = A2($author$project$Data$findReferences, model.bv, id);
					if ($elm$core$List$isEmpty(refs)) {
						var newModel = $author$project$Main$closeFormFields(
							A3($author$project$Main$applyOverwrite, id, data, model));
						return _Utils_Tuple2(
							newModel,
							$author$project$Main$save(newModel));
					} else {
						return _Utils_Tuple2(
							_Utils_update(
								model,
								{
									G: $elm$core$Maybe$Just(
										{ak: data, aO: refs})
								}),
							$elm$core$Platform$Cmd$none);
					}
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 67:
				var _v23 = _Utils_Tuple2(
					model.p,
					A2($elm$core$Maybe$andThen, $author$project$Main$questionDataFromForm, model.g));
				if ((!_v23.a.$) && (!_v23.b.$)) {
					var id = _v23.a.a;
					var data = _v23.b.a;
					var newModel = $author$project$Main$closeFormFields(
						A4($author$project$Main$applyNewVersion, id, data, model.w, model));
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$save(newModel));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			case 69:
				var _v24 = _Utils_Tuple2(model.p, model.G);
				if ((!_v24.a.$) && (!_v24.b.$)) {
					var id = _v24.a.a;
					var pending = _v24.b.a;
					var newModel = $author$project$Main$closeFormFields(
						function (m) {
							return _Utils_update(
								m,
								{G: $elm$core$Maybe$Nothing});
						}(
							A3($author$project$Main$applyOverwrite, id, pending.ak, model)));
					return _Utils_Tuple2(
						newModel,
						$author$project$Main$save(newModel));
				} else {
					return _Utils_Tuple2(model, $elm$core$Platform$Cmd$none);
				}
			default:
				return _Utils_Tuple2(
					_Utils_update(
						model,
						{G: $elm$core$Maybe$Nothing}),
					$elm$core$Platform$Cmd$none);
		}
	});
var $author$project$Main$DropOnBank = {$: 39};
var $author$project$Main$ExportQuestionsOnly = {$: 12};
var $author$project$Main$NoOp = {$: 0};
var $author$project$Main$OpenAddQuestion = {$: 17};
var $author$project$Main$OpenImport = {$: 13};
var $author$project$Main$SearchInput = function (a) {
	return {$: 3, a: a};
};
var $elm$html$Html$Attributes$stringProperty = F2(
	function (key, string) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$string(string));
	});
var $elm$html$Html$Attributes$class = $elm$html$Html$Attributes$stringProperty('className');
var $elm$html$Html$div = _VirtualDom_node('div');
var $elm$core$String$toLower = _String_toLower;
var $author$project$Data$filteredQuestions = F3(
	function (search, activeTags, questions) {
		var needle = $elm$core$String$toLower(
			$elm$core$String$trim(search));
		var matchesTags = function (q) {
			return $elm$core$Set$isEmpty(activeTags) || A2(
				$elm$core$List$any,
				function (t) {
					return A2($elm$core$Set$member, t, activeTags);
				},
				q.aU);
		};
		var matchesSearch = function (q) {
			return (needle === '') ? true : A2(
				$elm$core$String$contains,
				needle,
				$elm$core$String$toLower(
					A2(
						$elm$core$String$join,
						' ',
						A2(
							$elm$core$List$cons,
							q.as,
							A2($elm$core$List$cons, q.Y, q.aU)))));
		};
		return A2(
			$elm$core$List$filter,
			function (q) {
				return matchesTags(q) && matchesSearch(q);
			},
			questions);
	});
var $author$project$Main$AskDeleteQuestion = function (a) {
	return {$: 27, a: a};
};
var $author$project$Main$CancelDeleteQuestion = {$: 28};
var $author$project$Main$DeleteQuestion = function (a) {
	return {$: 29, a: a};
};
var $author$project$Main$DragEnd = {$: 36};
var $author$project$Main$DragStartFromBank = function (a) {
	return {$: 34, a: a};
};
var $author$project$Main$OpenEditFromBank = function (a) {
	return {$: 32, a: a};
};
var $author$project$Main$OpenHistory = function (a) {
	return {$: 30, a: a};
};
var $author$project$Main$ToggleSelect = function (a) {
	return {$: 6, a: a};
};
var $elm$json$Json$Encode$bool = _Json_wrap;
var $elm$html$Html$Attributes$boolProperty = F2(
	function (key, bool) {
		return A2(
			_VirtualDom_property,
			key,
			$elm$json$Json$Encode$bool(bool));
	});
var $elm$html$Html$Attributes$checked = $elm$html$Html$Attributes$boolProperty('checked');
var $elm$core$Tuple$second = function (_v0) {
	var y = _v0.b;
	return y;
};
var $elm$html$Html$Attributes$classList = function (classes) {
	return $elm$html$Html$Attributes$class(
		A2(
			$elm$core$String$join,
			' ',
			A2(
				$elm$core$List$map,
				$elm$core$Tuple$first,
				A2($elm$core$List$filter, $elm$core$Tuple$second, classes))));
};
var $elm$html$Html$button = _VirtualDom_node('button');
var $elm$virtual_dom$VirtualDom$Normal = function (a) {
	return {$: 0, a: a};
};
var $elm$virtual_dom$VirtualDom$on = _VirtualDom_on;
var $elm$html$Html$Events$on = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Normal(decoder));
	});
var $elm$html$Html$Events$onClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'click',
		$elm$json$Json$Decode$succeed(msg));
};
var $elm$virtual_dom$VirtualDom$text = _VirtualDom_text;
var $elm$html$Html$text = $elm$virtual_dom$VirtualDom$text;
var $author$project$Main$dangerBtnXs = F2(
	function (label_, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-[11px] px-1.5 py-0.5 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer border border-rose-600'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $elm$html$Html$Attributes$draggable = _VirtualDom_attribute('draggable');
var $author$project$Main$iconBtn = F2(
	function (icon, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('bg-transparent border-none cursor-pointer text-stone-400 text-[13px] p-0.5 leading-none hover:text-teal-700'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(icon)
				]));
	});
var $author$project$Main$iconBtnDanger = F2(
	function (icon, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('bg-transparent border-none cursor-pointer text-stone-400 text-[13px] p-0.5 leading-none hover:text-rose-600'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(icon)
				]));
	});
var $elm$html$Html$input = _VirtualDom_node('input');
var $author$project$Main$linkBtn = F2(
	function (label_, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('bg-transparent border-none text-stone-500 underline decoration-dotted cursor-pointer text-xs p-0 hover:text-stone-900'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $elm$html$Html$span = _VirtualDom_node('span');
var $author$project$Main$tagColorClasses = function (idx) {
	switch (idx) {
		case 0:
			return 'bg-emerald-50 border-emerald-200 text-emerald-700';
		case 1:
			return 'bg-sky-100 border-sky-200 text-sky-700';
		case 2:
			return 'bg-amber-50 border-amber-200 text-amber-800';
		case 3:
			return 'bg-rose-50 border-rose-200 text-rose-700';
		case 4:
			return 'bg-violet-50 border-violet-200 text-violet-700';
		default:
			return 'bg-teal-50 border-teal-200 text-teal-800';
	}
};
var $elm$core$String$foldl = _String_foldl;
var $elm$core$Basics$modBy = _Basics_modBy;
var $author$project$Data$tagColorIndex = function (tag) {
	var step = F2(
		function (acc, ch) {
			return A2(
				$elm$core$Basics$modBy,
				4294967296,
				(acc * 31) + $elm$core$Char$toCode(ch));
		});
	var hash = A3(
		$elm$core$String$foldl,
		F2(
			function (ch, acc) {
				return A2(step, acc, ch);
			}),
		0,
		tag);
	return A2($elm$core$Basics$modBy, 6, hash);
};
var $author$project$Main$tagPill = function (t) {
	return A2(
		$elm$html$Html$span,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class(
				'font-mono text-[10px] px-1.5 py-0.5 rounded-full border ' + $author$project$Main$tagColorClasses(
					$author$project$Data$tagColorIndex(t)))
			]),
		_List_fromArray(
			[
				$elm$html$Html$text(t)
			]));
};
var $elm$html$Html$Attributes$type_ = $elm$html$Html$Attributes$stringProperty('type');
var $author$project$Main$questionCardView = F2(
	function (model, q) {
		var isSel = A2($elm$core$Set$member, q.l, model.a);
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('px-4 py-3 flex gap-2.5 cursor-grab border-b border-stone-100 hover:bg-stone-50 active:cursor-grabbing', true),
							_Utils_Tuple2('bg-teal-50', isSel)
						])),
					$elm$html$Html$Attributes$draggable('true'),
					A2(
					$elm$html$Html$Events$on,
					'dragstart',
					$elm$json$Json$Decode$succeed(
						$author$project$Main$DragStartFromBank(q.l))),
					A2(
					$elm$html$Html$Events$on,
					'dragend',
					$elm$json$Json$Decode$succeed($author$project$Main$DragEnd))
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$type_('checkbox'),
							$elm$html$Html$Attributes$checked(isSel),
							$elm$html$Html$Events$onClick(
							$author$project$Main$ToggleSelect(q.l))
						]),
					_List_Nil),
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-stone-400 flex-shrink-0 mt-0.5')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('⠿')
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex-1 min-w-0')
						]),
					_List_fromArray(
						[
							$elm$core$String$isEmpty(q.as) ? $elm$html$Html$text('') : A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('font-mono text-stone-500 text-[11px] truncate')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(q.as)
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-[13px] text-stone-800 mt-0.5')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(q.Y)
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex flex-wrap gap-1 mt-1.5')
								]),
							A2($elm$core$List$map, $author$project$Main$tagPill, q.aU))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex flex-col items-center gap-1.5 flex-shrink-0')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('font-mono text-[11px] text-stone-400')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									'v' + $elm$core$String$fromInt(q.aX))
								])),
							$elm$core$List$isEmpty(q.bd) ? $elm$html$Html$text('') : A2(
							$author$project$Main$iconBtn,
							'🕓',
							$author$project$Main$OpenHistory(q.l)),
							A2(
							$author$project$Main$iconBtn,
							'✎',
							$author$project$Main$OpenEditFromBank(q.l)),
							_Utils_eq(
							model.T,
							$elm$core$Maybe$Just(q.l)) ? A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex items-center gap-1')
								]),
							_List_fromArray(
								[
									A2(
									$author$project$Main$dangerBtnXs,
									'yes',
									$author$project$Main$DeleteQuestion(q.l)),
									A2($author$project$Main$linkBtn, 'no', $author$project$Main$CancelDeleteQuestion)
								])) : A2(
							$author$project$Main$iconBtnDanger,
							'🗑',
							$author$project$Main$AskDeleteQuestion(q.l))
						]))
				]));
	});
var $author$project$Main$bankListView = function (model) {
	var filtered = A3($author$project$Data$filteredQuestions, model.ag, model.n, model.bq);
	return $elm$core$List$isEmpty(filtered) ? _List_fromArray(
		[
			A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('p-8 text-center text-[13px] text-stone-400')
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(
					$elm$core$List$isEmpty(model.bq) ? 'No questions yet — add one or import a batch.' : 'No questions match this search or tag filter.')
				]))
		]) : A2(
		$elm$core$List$map,
		$author$project$Main$questionCardView(model),
		filtered);
};
var $author$project$Main$ApplyBulkTag = {$: 9};
var $author$project$Main$BulkTagInput = function (a) {
	return {$: 8, a: a};
};
var $author$project$Main$ClearSelection = {$: 7};
var $author$project$Main$ToggleAddToMenu = {$: 10};
var $author$project$Main$AddSelectedTo = function (a) {
	return {$: 11, a: a};
};
var $author$project$Types$InGroup = function (a) {
	return {$: 1, a: a};
};
var $author$project$Types$Loose = {$: 0};
var $author$project$Main$addToMenuView = function (maybeTest) {
	if (maybeTest.$ === 1) {
		return $elm$html$Html$text('');
	} else {
		var t = maybeTest.a;
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('absolute z-20 top-full mt-1 bg-white border border-stone-200 rounded-md shadow-lg min-w-[140px]')
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('block w-full text-left px-3 py-1.5 border-none bg-transparent cursor-pointer text-[12px] whitespace-nowrap hover:bg-stone-100'),
							$elm$html$Html$Events$onClick(
							$author$project$Main$AddSelectedTo($author$project$Types$Loose))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('Ungrouped')
						])),
				A2(
					$elm$core$List$map,
					function (g) {
						return A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('block w-full text-left px-3 py-1.5 border-none bg-transparent cursor-pointer text-[12px] whitespace-nowrap hover:bg-stone-100'),
									$elm$html$Html$Events$onClick(
									$author$project$Main$AddSelectedTo(
										$author$project$Types$InGroup(g.l)))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(g.aF)
								]));
					},
					t.am)));
	}
};
var $elm$html$Html$Attributes$disabled = $elm$html$Html$Attributes$boolProperty('disabled');
var $elm$html$Html$Events$alwaysStop = function (x) {
	return _Utils_Tuple2(x, true);
};
var $elm$virtual_dom$VirtualDom$MayStopPropagation = function (a) {
	return {$: 1, a: a};
};
var $elm$html$Html$Events$stopPropagationOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayStopPropagation(decoder));
	});
var $elm$json$Json$Decode$at = F2(
	function (fields, decoder) {
		return A3($elm$core$List$foldr, $elm$json$Json$Decode$field, decoder, fields);
	});
var $elm$html$Html$Events$targetValue = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $elm$html$Html$Events$onInput = function (tagger) {
	return A2(
		$elm$html$Html$Events$stopPropagationOn,
		'input',
		A2(
			$elm$json$Json$Decode$map,
			$elm$html$Html$Events$alwaysStop,
			A2($elm$json$Json$Decode$map, tagger, $elm$html$Html$Events$targetValue)));
};
var $elm$html$Html$Attributes$placeholder = $elm$html$Html$Attributes$stringProperty('placeholder');
var $author$project$Main$primaryBtnSmDisabled = F3(
	function (label_, isDisabled, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-[11px] px-2 py-1 rounded-md cursor-pointer border bg-teal-700 text-white border-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed'),
					$elm$html$Html$Events$onClick(msg),
					$elm$html$Html$Attributes$disabled(isDisabled)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $elm$html$Html$Attributes$value = $elm$html$Html$Attributes$stringProperty('value');
var $author$project$Main$bulkToolbarView = function (model) {
	if ($elm$core$Set$isEmpty(model.a)) {
		return $elm$html$Html$text('');
	} else {
		var activeTest = $author$project$Main$findActiveTest(model);
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('px-4 py-2 bg-teal-50 border-b border-teal-200 flex flex-wrap items-center gap-2 text-xs')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$span,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('font-semibold')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(
							$elm$core$String$fromInt(
								$elm$core$Set$size(model.a)) + ' selected')
						])),
					A2(
					$elm$html$Html$input,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('w-[110px] border border-stone-300 rounded-md px-2 py-1 text-[12px] focus:outline-none focus:border-teal-700'),
							$elm$html$Html$Attributes$placeholder('tag, tag'),
							$elm$html$Html$Attributes$value(model.A),
							$elm$html$Html$Events$onInput($author$project$Main$BulkTagInput)
						]),
					_List_Nil),
					A3(
					$author$project$Main$primaryBtnSmDisabled,
					'Apply tag',
					$elm$core$String$isEmpty(
						$elm$core$String$trim(model.A)),
					$author$project$Main$ApplyBulkTag),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('relative inline-block')
						]),
					A2(
						$elm$core$List$cons,
						A2(
							$elm$html$Html$button,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-[11px] px-2 py-1 rounded-md cursor-pointer border bg-white text-stone-900 border-stone-300 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed'),
									$elm$html$Html$Events$onClick($author$project$Main$ToggleAddToMenu),
									$elm$html$Html$Attributes$disabled(
									_Utils_eq(activeTest, $elm$core$Maybe$Nothing))
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Add to ▾')
								])),
						model.J ? _List_fromArray(
							[
								$author$project$Main$addToMenuView(activeTest)
							]) : _List_Nil)),
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('bg-transparent border-none text-stone-500 underline decoration-dotted cursor-pointer text-xs p-0 hover:text-stone-900 ml-auto'),
							$elm$html$Html$Events$onClick($author$project$Main$ClearSelection)
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('clear')
						]))
				]));
	}
};
var $author$project$Main$formInput = F2(
	function (attrs, children) {
		return A2(
			$elm$html$Html$input,
			A2(
				$elm$core$List$cons,
				$elm$html$Html$Attributes$class('w-full border border-stone-300 rounded-md px-2.5 py-2 text-[13px] focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-50'),
				attrs),
			children);
	});
var $elm$html$Html$h2 = _VirtualDom_node('h2');
var $author$project$Main$btnBase = 'text-xs px-2.5 py-1.5 rounded-md cursor-pointer border inline-flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed';
var $author$project$Main$outlineBtn = F2(
	function (label_, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($author$project$Main$btnBase + ' bg-white text-stone-900 border-stone-300 hover:bg-stone-100'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $elm$virtual_dom$VirtualDom$MayPreventDefault = function (a) {
	return {$: 2, a: a};
};
var $elm$html$Html$Events$preventDefaultOn = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$MayPreventDefault(decoder));
	});
var $author$project$Main$primaryBtn = F2(
	function (label_, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($author$project$Main$btnBase + ' bg-teal-700 text-white border-teal-700 hover:bg-teal-800'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $elm$html$Html$section = _VirtualDom_node('section');
var $author$project$Main$ClearTagFilters = {$: 5};
var $elm$core$Set$fromList = function (list) {
	return A3($elm$core$List$foldl, $elm$core$Set$insert, $elm$core$Set$empty, list);
};
var $elm$core$List$sortBy = _List_sortBy;
var $elm$core$List$sort = function (xs) {
	return A2($elm$core$List$sortBy, $elm$core$Basics$identity, xs);
};
var $author$project$Data$allTags = function (questions) {
	return $elm$core$List$sort(
		$elm$core$Set$toList(
			$elm$core$Set$fromList(
				A2(
					$elm$core$List$concatMap,
					function ($) {
						return $.aU;
					},
					questions))));
};
var $author$project$Main$ToggleTagFilter = function (a) {
	return {$: 4, a: a};
};
var $author$project$Main$tagChip = F2(
	function (activeTags, t) {
		var isActive = A2($elm$core$Set$member, t, activeTags);
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$classList(
					_List_fromArray(
						[
							_Utils_Tuple2('font-mono text-[11px] px-2.5 py-1 rounded-full border cursor-pointer', true),
							_Utils_Tuple2(
							$author$project$Main$tagColorClasses(
								$author$project$Data$tagColorIndex(t)),
							true),
							_Utils_Tuple2('ring-1 ring-teal-700', isActive),
							_Utils_Tuple2('hover:bg-stone-100', !isActive)
						])),
					$elm$html$Html$Events$onClick(
					$author$project$Main$ToggleTagFilter(t))
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(t)
				]));
	});
var $author$project$Main$tagChipsView = function (model) {
	var all = $author$project$Data$allTags(model.bq);
	return $elm$core$List$isEmpty(all) ? $elm$html$Html$text('') : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-wrap gap-1.5')
			]),
		_Utils_ap(
			A2(
				$elm$core$List$map,
				$author$project$Main$tagChip(model.n),
				all),
			$elm$core$Set$isEmpty(model.n) ? _List_Nil : _List_fromArray(
				[
					A2($author$project$Main$linkBtn, 'clear', $author$project$Main$ClearTagFilters)
				])));
};
var $author$project$Main$bankPanelView = function (model) {
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bg-white border border-stone-200 rounded-xl flex flex-col'),
				A2(
				$elm$html$Html$Events$preventDefaultOn,
				'dragover',
				$elm$json$Json$Decode$succeed(
					_Utils_Tuple2($author$project$Main$NoOp, true))),
				A2(
				$elm$html$Html$Events$preventDefaultOn,
				'drop',
				$elm$json$Json$Decode$succeed(
					_Utils_Tuple2($author$project$Main$DropOnBank, true)))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('p-4 border-b border-stone-200 flex flex-col gap-2.5')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('flex items-center justify-between gap-2.5 flex-wrap')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h2,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('font-serif text-[15px] font-semibold')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Question bank '),
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('text-stone-500')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												'(' + ($elm$core$String$fromInt(
													$elm$core$List$length(model.bq)) + ')'))
											]))
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('flex gap-2 flex-wrap')
									]),
								_List_fromArray(
									[
										A2($author$project$Main$outlineBtn, '⭳ Export questions', $author$project$Main$ExportQuestionsOnly),
										A2($author$project$Main$outlineBtn, '⭱ Import', $author$project$Main$OpenImport),
										A2($author$project$Main$primaryBtn, '+ Add question', $author$project$Main$OpenAddQuestion)
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('relative')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('🔍')
									])),
								A2(
								$author$project$Main$formInput,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$placeholder('Search questions, tags, categories...'),
										$elm$html$Html$Events$onInput($author$project$Main$SearchInput),
										$elm$html$Html$Attributes$value(model.ag),
										$elm$html$Html$Attributes$class('pl-8')
									]),
								_List_Nil)
							])),
						$author$project$Main$tagChipsView(model)
					])),
				$author$project$Main$bulkToolbarView(model),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex-1 overflow-y-auto max-h-screen')
					]),
				$author$project$Main$bankListView(model))
			]));
};
var $elm$html$Html$p = _VirtualDom_node('p');
var $author$project$Main$AddTest = {$: 41};
var $author$project$Main$ExportTest = function (a) {
	return {$: 54, a: a};
};
var $author$project$Main$outlineBtnSmDisabled = F3(
	function (label_, isDisabled, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-[11px] px-2 py-1 rounded-md cursor-pointer border bg-white text-stone-900 border-stone-300 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed'),
					$elm$html$Html$Events$onClick(msg),
					$elm$html$Html$Attributes$disabled(isDisabled)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $author$project$Main$primaryBtnSm = F2(
	function (label_, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('text-[11px] px-2 py-1 rounded-md cursor-pointer border bg-teal-700 text-white border-teal-700 hover:bg-teal-800'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $author$project$Main$testActionsView = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex gap-2 flex-wrap')
			]),
		_Utils_ap(
			function () {
				var _v0 = $author$project$Main$findActiveTest(model);
				if (!_v0.$) {
					var t = _v0.a;
					return _List_fromArray(
						[
							A3(
							$author$project$Main$outlineBtnSmDisabled,
							'Export JSON',
							false,
							$author$project$Main$ExportTest(t.l))
						]);
				} else {
					return _List_Nil;
				}
			}(),
			_List_fromArray(
				[
					A2($author$project$Main$primaryBtnSm, '+ New test', $author$project$Main$AddTest)
				])));
};
var $author$project$Main$AddGroup = {$: 48};
var $author$project$Main$AskDeleteGroup = function (a) {
	return {$: 50, a: a};
};
var $author$project$Main$CancelDeleteGroup = {$: 51};
var $author$project$Main$CommitRenameGroup = F2(
	function (a, b) {
		return {$: 49, a: a, b: b};
	});
var $author$project$Main$DeleteGroup = function (a) {
	return {$: 52, a: a};
};
var $author$project$Main$MoveGroup = F2(
	function (a, b) {
		return {$: 53, a: a, b: b};
	});
var $author$project$Main$DragEnterTarget = function (a) {
	return {$: 37, a: a};
};
var $author$project$Main$DragLeaveTarget = {$: 38};
var $author$project$Main$DropOnTarget = F2(
	function (a, b) {
		return {$: 40, a: a, b: b};
	});
var $author$project$Main$dropTargetAttrs = function (slot) {
	return _List_fromArray(
		[
			A2(
			$elm$html$Html$Events$preventDefaultOn,
			'dragover',
			$elm$json$Json$Decode$succeed(
				_Utils_Tuple2($author$project$Main$NoOp, true))),
			A2(
			$elm$html$Html$Events$on,
			'dragenter',
			$elm$json$Json$Decode$succeed(
				$author$project$Main$DragEnterTarget(slot))),
			A2(
			$elm$html$Html$Events$on,
			'dragleave',
			$elm$json$Json$Decode$succeed($author$project$Main$DragLeaveTarget)),
			A2(
			$elm$html$Html$Events$preventDefaultOn,
			'drop',
			$elm$json$Json$Decode$succeed(
				_Utils_Tuple2(
					A2($author$project$Main$DropOnTarget, slot, $elm$core$Maybe$Nothing),
					true)))
		]);
};
var $author$project$Main$dropTargetClass = F3(
	function (slot, baseClass, model) {
		return $elm$html$Html$Attributes$classList(
			_List_fromArray(
				[
					_Utils_Tuple2(baseClass, true),
					_Utils_Tuple2(
					'drop-target-active',
					_Utils_eq(
						model.i,
						$elm$core$Maybe$Just(slot)))
				]));
	});
var $author$project$Main$miniBtn = F3(
	function (label_, isDisabled, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('bg-transparent border-none text-stone-400 cursor-pointer text-[10px] px-0.5 disabled:opacity-40 disabled:cursor-not-allowed'),
					$elm$html$Html$Events$onClick(msg),
					$elm$html$Html$Attributes$disabled(isDisabled)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $author$project$Main$targetValueDecoder = A2(
	$elm$json$Json$Decode$at,
	_List_fromArray(
		['target', 'value']),
	$elm$json$Json$Decode$string);
var $author$project$Main$onBlurWithValue = function (toMsg) {
	return A2(
		$elm$html$Html$Events$on,
		'blur',
		A2($elm$json$Json$Decode$map, toMsg, $author$project$Main$targetValueDecoder));
};
var $elm$json$Json$Decode$andThen = _Json_andThen;
var $elm$json$Json$Decode$fail = _Json_fail;
var $author$project$Main$onEnterWithValue = function (toMsg) {
	return A2(
		$elm$html$Html$Events$on,
		'keydown',
		A2(
			$elm$json$Json$Decode$andThen,
			function (key) {
				return (key === 'Enter') ? A2($elm$json$Json$Decode$map, toMsg, $author$project$Main$targetValueDecoder) : $elm$json$Json$Decode$fail('not enter');
			},
			A2($elm$json$Json$Decode$field, 'key', $elm$json$Json$Decode$string)));
};
var $author$project$Main$pluralS = function (n) {
	return (n === 1) ? '' : 's';
};
var $author$project$Main$DragStartFromTest = function (a) {
	return {$: 35, a: a};
};
var $author$project$Main$OpenEditFromTest = F2(
	function (a, b) {
		return {$: 33, a: a, b: b};
	});
var $author$project$Main$RemoveFromTest = function (a) {
	return {$: 55, a: a};
};
var $elm$virtual_dom$VirtualDom$Custom = function (a) {
	return {$: 3, a: a};
};
var $elm$html$Html$Events$custom = F2(
	function (event, decoder) {
		return A2(
			$elm$virtual_dom$VirtualDom$on,
			event,
			$elm$virtual_dom$VirtualDom$Custom(decoder));
	});
var $author$project$Main$testRowView = F3(
	function (model, qid, slot) {
		var _v0 = A2($author$project$Main$findQuestion, model, qid);
		if (_v0.$ === 1) {
			return $elm$html$Html$text('');
		} else {
			var q = _v0.a;
			return A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('border border-stone-200 rounded-md p-2.5 bg-white cursor-grab hover:border-teal-200 active:cursor-grabbing'),
						$elm$html$Html$Attributes$draggable('true'),
						A2(
						$elm$html$Html$Events$on,
						'dragstart',
						$elm$json$Json$Decode$succeed(
							$author$project$Main$DragStartFromTest(qid))),
						A2(
						$elm$html$Html$Events$on,
						'dragend',
						$elm$json$Json$Decode$succeed($author$project$Main$DragEnd)),
						A2(
						$elm$html$Html$Events$preventDefaultOn,
						'dragover',
						$elm$json$Json$Decode$succeed(
							_Utils_Tuple2($author$project$Main$NoOp, true))),
						A2(
						$elm$html$Html$Events$custom,
						'drop',
						$elm$json$Json$Decode$succeed(
							{
								bj: A2(
									$author$project$Main$DropOnTarget,
									slot,
									$elm$core$Maybe$Just(qid)),
								bn: true,
								bt: true
							}))
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('flex items-start gap-2')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('text-stone-400 flex-shrink-0')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('⠿')
									])),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('flex-1 min-w-0 flex flex-col gap-1')
									]),
								_Utils_ap(
									$elm$core$String$isEmpty(q.as) ? _List_Nil : _List_fromArray(
										[
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('font-mono text-stone-500 text-[11px] truncate')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text(q.as)
												]))
										]),
									_Utils_ap(
										_List_fromArray(
											[
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('text-[13px] text-stone-800')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text(q.Y)
													])),
												A2(
												$elm$html$Html$div,
												_List_fromArray(
													[
														$elm$html$Html$Attributes$class('text-[12px] flex gap-1.5 items-start text-emerald-700')
													]),
												_List_fromArray(
													[
														$elm$html$Html$text('✓ ' + q.au.Y)
													]))
											]),
										A2(
											$elm$core$List$map,
											function (w) {
												return A2(
													$elm$html$Html$div,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('text-[12px] flex gap-1.5 items-start text-stone-500')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('• ' + w.Y)
														]));
											},
											q.a$)))),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('flex flex-col items-center gap-1.5 flex-shrink-0')
									]),
								_List_fromArray(
									[
										A2(
										$elm$html$Html$span,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class('font-mono text-[11px] text-stone-400')
											]),
										_List_fromArray(
											[
												$elm$html$Html$text(
												'v' + $elm$core$String$fromInt(q.aX))
											])),
										A2(
										$author$project$Main$iconBtn,
										'✎',
										A2($author$project$Main$OpenEditFromTest, qid, slot)),
										A2(
										$author$project$Main$iconBtnDanger,
										'🗑',
										$author$project$Main$RemoveFromTest(qid))
									]))
							]))
					]));
		}
	});
var $author$project$Main$groupCardView = F4(
	function (model, t, gi, g) {
		var isLast = _Utils_eq(
			gi,
			$elm$core$List$length(t.am) - 1);
		var isFirst = !gi;
		var count = $elm$core$List$length(g.bp);
		return A2(
			$elm$html$Html$div,
			A2(
				$elm$core$List$cons,
				A3(
					$author$project$Main$dropTargetClass,
					$author$project$Types$InGroup(g.l),
					'border border-stone-200 rounded-lg',
					model),
				$author$project$Main$dropTargetAttrs(
					$author$project$Types$InGroup(g.l))),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('px-3.5 py-2 border-b border-stone-200 flex items-center gap-2')
						]),
					_List_fromArray(
						[
							A3(
							$author$project$Main$miniBtn,
							'▲',
							isFirst,
							A2($author$project$Main$MoveGroup, g.l, -1)),
							A3(
							$author$project$Main$miniBtn,
							'▼',
							isLast,
							A2($author$project$Main$MoveGroup, g.l, 1)),
							A2(
							$elm$html$Html$input,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-[13px] font-semibold border-none bg-transparent flex-1 min-w-0 px-1 py-0.5 rounded focus:outline-none focus:bg-stone-50'),
									$elm$html$Html$Attributes$value(g.aF),
									$author$project$Main$onBlurWithValue(
									$author$project$Main$CommitRenameGroup(g.l)),
									$author$project$Main$onEnterWithValue(
									$author$project$Main$CommitRenameGroup(g.l))
								]),
							_List_Nil),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('font-mono text-[11px] text-stone-400')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(count) + (' question' + $author$project$Main$pluralS(count)))
								])),
							_Utils_eq(
							model.S,
							$elm$core$Maybe$Just(g.l)) ? A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex items-center gap-1')
								]),
							_List_fromArray(
								[
									A2(
									$author$project$Main$dangerBtnXs,
									'yes',
									$author$project$Main$DeleteGroup(g.l)),
									A2($author$project$Main$linkBtn, 'no', $author$project$Main$CancelDeleteGroup)
								])) : A2(
							$author$project$Main$iconBtnDanger,
							'🗑',
							$author$project$Main$AskDeleteGroup(g.l))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('p-2 flex flex-col gap-2 min-h-[50px]')
						]),
					_Utils_ap(
						(!count) ? _List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('p-2.5 text-center text-[11px] text-stone-400')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('drop questions here')
									]))
							]) : _List_Nil,
						A2(
							$elm$core$List$map,
							function (qid) {
								return A3(
									$author$project$Main$testRowView,
									model,
									qid,
									$author$project$Types$InGroup(g.l));
							},
							g.bp)))
				]));
	});
var $author$project$Main$looseSectionView = F2(
	function (model, t) {
		var count = $elm$core$List$length(t.bi);
		return A2(
			$elm$html$Html$div,
			A2(
				$elm$core$List$cons,
				A3($author$project$Main$dropTargetClass, $author$project$Types$Loose, 'border border-dashed border-stone-200 rounded-lg', model),
				$author$project$Main$dropTargetAttrs($author$project$Types$Loose)),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('px-3.5 py-2 border-b border-stone-200 flex items-center gap-2')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-[13px] font-semibold text-stone-500')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Ungrouped questions')
								])),
							A2(
							$elm$html$Html$span,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('font-mono text-[11px] text-stone-400')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text(
									$elm$core$String$fromInt(count) + (' question' + $author$project$Main$pluralS(count)))
								]))
						])),
					A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('p-2 flex flex-col gap-2 min-h-[50px]')
						]),
					_Utils_ap(
						(!count) ? _List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('p-2.5 text-center text-[11px] text-stone-400')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('drop questions here to add them without a group')
									]))
							]) : _List_Nil,
						A2(
							$elm$core$List$map,
							function (qid) {
								return A3($author$project$Main$testRowView, model, qid, $author$project$Types$Loose);
							},
							t.bi)))
				]));
	});
var $author$project$Main$testContentView = function (model) {
	var _v0 = $author$project$Main$findActiveTest(model);
	if (_v0.$ === 1) {
		return _List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('p-8 text-center text-[13px] text-stone-400')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('Create a test to start building — then drag questions in from the bank.')
					]))
			]);
	} else {
		var t = _v0.a;
		return A2(
			$elm$core$List$cons,
			A2($author$project$Main$looseSectionView, model, t),
			_Utils_ap(
				A2(
					$elm$core$List$indexedMap,
					A2($author$project$Main$groupCardView, model, t),
					t.am),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('w-full p-2.5 rounded-md border border-dashed border-stone-300 bg-transparent text-stone-500 text-xs cursor-pointer hover:border-teal-700 hover:text-teal-700'),
								$elm$html$Html$Events$onClick($author$project$Main$AddGroup)
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('+ Add group')
							]))
					])));
	}
};
var $author$project$Main$AskDeleteTest = function (a) {
	return {$: 45, a: a};
};
var $author$project$Main$CancelDeleteTest = {$: 46};
var $author$project$Main$CommitRenameTest = F2(
	function (a, b) {
		return {$: 44, a: a, b: b};
	});
var $author$project$Main$DeleteTest = function (a) {
	return {$: 47, a: a};
};
var $author$project$Main$SetActiveTest = function (a) {
	return {$: 42, a: a};
};
var $author$project$Main$StartRenameTest = function (a) {
	return {$: 43, a: a};
};
var $elm$html$Html$Attributes$autofocus = $elm$html$Html$Attributes$boolProperty('autofocus');
var $elm$html$Html$Events$onDoubleClick = function (msg) {
	return A2(
		$elm$html$Html$Events$on,
		'dblclick',
		$elm$json$Json$Decode$succeed(msg));
};
var $author$project$Main$testTabView = F2(
	function (model, t) {
		if (_Utils_eq(
			model.af,
			$elm$core$Maybe$Just(t.l))) {
			return A2(
				$elm$html$Html$input,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-[12px] px-2 py-1 border border-teal-700 rounded-md'),
						$elm$html$Html$Attributes$autofocus(true),
						$elm$html$Html$Attributes$value(t.aF),
						$author$project$Main$onBlurWithValue(
						$author$project$Main$CommitRenameTest(t.l)),
						$author$project$Main$onEnterWithValue(
						$author$project$Main$CommitRenameTest(t.l))
					]),
				_List_Nil);
		} else {
			var isActive = _Utils_eq(
				model.a3,
				$elm$core$Maybe$Just(t.l));
			return A2(
				$elm$html$Html$span,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex items-center')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$classList(
								_List_fromArray(
									[
										_Utils_Tuple2('font-mono text-[11px] px-2.5 py-1 rounded-full border cursor-pointer bg-stone-50 border-stone-200 text-stone-500', true),
										_Utils_Tuple2('bg-teal-700 text-white border-teal-700', isActive)
									])),
								$elm$html$Html$Events$onClick(
								$author$project$Main$SetActiveTest(t.l)),
								$elm$html$Html$Events$onDoubleClick(
								$author$project$Main$StartRenameTest(t.l))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(t.aF)
							])),
						isActive ? (_Utils_eq(
						model.U,
						$elm$core$Maybe$Just(t.l)) ? A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('flex items-center gap-1 ml-1')
							]),
						_List_fromArray(
							[
								A2(
								$author$project$Main$dangerBtnXs,
								'yes',
								$author$project$Main$DeleteTest(t.l)),
								A2($author$project$Main$linkBtn, 'no', $author$project$Main$CancelDeleteTest)
							])) : A2(
						$elm$html$Html$button,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('bg-transparent border-none text-stone-400 cursor-pointer text-[13px] ml-1 px-0.5'),
								$elm$html$Html$Events$onClick(
								$author$project$Main$AskDeleteTest(t.l))
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('×')
							]))) : $elm$html$Html$text('')
					]));
		}
	});
var $author$project$Main$testTabsView = function (model) {
	return $elm$core$List$isEmpty(model.bv) ? $elm$html$Html$text('') : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('flex flex-wrap gap-1.5')
			]),
		A2(
			$elm$core$List$map,
			$author$project$Main$testTabView(model),
			model.bv));
};
var $author$project$Main$builderPanelView = function (model) {
	return A2(
		$elm$html$Html$section,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bg-white border border-stone-200 rounded-xl flex flex-col')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('p-4 border-b border-stone-200 flex flex-col gap-2.5')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('flex items-center justify-between gap-2.5 flex-wrap')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h2,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('font-serif text-[15px] font-semibold')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Test builder')
									])),
								$author$project$Main$testActionsView(model)
							])),
						$author$project$Main$testTabsView(model),
						A2(
						$elm$html$Html$p,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-[11px] text-stone-400 m-0')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('Double-click a test\u0027s name to rename it. Drag a question back onto the bank to remove it from the test.')
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex-1 overflow-y-auto max-h-screen p-4 flex flex-col gap-3.5')
					]),
				$author$project$Main$testContentView(model))
			]));
};
var $author$project$Main$AskReset = {$: 18};
var $author$project$Main$CancelLoadBackup = {$: 26};
var $author$project$Main$CancelReset = {$: 19};
var $author$project$Main$ConfirmLoadBackup = {$: 25};
var $author$project$Main$ExportBackup = {$: 21};
var $author$project$Main$RequestLoadBackup = {$: 22};
var $author$project$Main$ResetAll = {$: 20};
var $elm$html$Html$h1 = _VirtualDom_node('h1');
var $author$project$Main$linkDangerBtn = F2(
	function (label_, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('bg-transparent border-none text-rose-600 font-semibold cursor-pointer text-xs p-0'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $author$project$Main$headerView = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_Nil,
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex items-start justify-between gap-4')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_Nil,
						_List_fromArray(
							[
								A2(
								$elm$html$Html$h1,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('font-serif text-[22px] font-semibold tracking-tight')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Question Bank & Test Builder')
									])),
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('mt-1 text-[13px] text-stone-500')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Tag, filter, and assemble questions into tests by drag-and-drop.')
									]))
							])),
						model.ab ? A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-rose-600 text-xs')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text('⚠ couldn\u0027t save')
							])) : $elm$html$Html$text('')
					])),
				(!model.L) ? A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 text-xs mt-2.5')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(model.M)
					])) : $elm$html$Html$text(''),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex flex-wrap items-center gap-3 text-xs text-stone-500 border-t border-stone-200 pt-3 mt-3')
					]),
				_List_fromArray(
					[
						A2($author$project$Main$outlineBtn, '⭳ Download backup', $author$project$Main$ExportBackup),
						A2($author$project$Main$outlineBtn, '⭱ Load backup', $author$project$Main$RequestLoadBackup),
						$elm$core$String$isEmpty(model.K) ? $elm$html$Html$text('') : A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('text-rose-600 text-xs')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(model.K)
							])),
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('flex-1')
							]),
						_List_Nil),
						model.V ? A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('flex items-center gap-1')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text('erase everything?')
									])),
								A2($author$project$Main$linkDangerBtn, 'yes', $author$project$Main$ResetAll),
								A2($author$project$Main$linkBtn, 'no', $author$project$Main$CancelReset)
							])) : A2($author$project$Main$linkBtn, 'reset data', $author$project$Main$AskReset)
					])),
				function () {
				var _v0 = model.F;
				if (_v0.$ === 1) {
					return $elm$html$Html$text('');
				} else {
					var data = _v0.a;
					return A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 text-xs mt-2.5 flex items-center gap-2 flex-wrap')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_Nil,
								_List_fromArray(
									[
										$elm$html$Html$text(
										'Loaded file has ' + ($elm$core$String$fromInt(
											$elm$core$List$length(data.bq)) + (' question(s) and ' + ($elm$core$String$fromInt(
											$elm$core$List$length(data.bv)) + ' test(s) — replace current data?'))))
									])),
								A2($author$project$Main$primaryBtnSm, 'Replace', $author$project$Main$ConfirmLoadBackup),
								A2($author$project$Main$linkBtn, 'Cancel', $author$project$Main$CancelLoadBackup)
							]));
				}
			}()
			]));
};
var $author$project$Main$CancelOverwrite = {$: 70};
var $author$project$Main$ConfirmOverwrite = {$: 69};
var $elm$html$Html$li = _VirtualDom_node('li');
var $author$project$Main$modalOverlay = function (children) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('fixed inset-0 bg-stone-900/40 flex items-center justify-center p-4 z-50')
			]),
		children);
};
var $author$project$Main$modalShell = F2(
	function (extraClass, children) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('bg-white border border-stone-200 rounded-xl w-full max-h-screen overflow-y-auto ' + extraClass)
				]),
			children);
	});
var $elm$html$Html$ul = _VirtualDom_node('ul');
var $author$project$Main$confirmOverwriteModalView = function (pending) {
	return $author$project$Main$modalOverlay(
		_List_fromArray(
			[
				A2(
				$author$project$Main$modalShell,
				'max-w-md',
				_List_fromArray(
					[
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('px-5.5 py-4 border-b border-stone-200 flex items-center gap-2 justify-between sticky top-0 bg-white')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$span,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('text-amber-800')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('⚠')
									])),
								A2(
								$elm$html$Html$h2,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('font-serif text-base m-0 flex-1')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('This question is used elsewhere')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('px-5.5 py-4 flex flex-col gap-3.5')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('m-0')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('Editing this version directly will change it everywhere it\u0027s referenced:')
									])),
								A2(
								$elm$html$Html$ul,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('text-[13px] pl-4.5 m-0')
									]),
								A2(
									$elm$core$List$map,
									function (r) {
										return A2(
											$elm$html$Html$li,
											_List_Nil,
											_List_fromArray(
												[
													$elm$html$Html$text(r.aW + (' — ' + r.aZ))
												]));
									},
									pending.aO)),
								A2(
								$elm$html$Html$p,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('text-[11px] text-stone-400 m-0')
									]),
								_List_fromArray(
									[
										$elm$html$Html$text('If you only want this test to see the change, cancel and choose \u0022Save as new version\u0022 instead.')
									]))
							])),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('px-5.5 py-3.5 border-t border-stone-200 sticky bottom-0 bg-white')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('flex justify-end gap-2')
									]),
								_List_fromArray(
									[
										A2($author$project$Main$outlineBtn, 'Cancel', $author$project$Main$CancelOverwrite),
										A2(
										$elm$html$Html$button,
										_List_fromArray(
											[
												$elm$html$Html$Attributes$class($author$project$Main$btnBase + ' bg-rose-600 text-white border-rose-600 hover:bg-rose-700'),
												$elm$html$Html$Events$onClick($author$project$Main$ConfirmOverwrite)
											]),
										_List_fromArray(
											[
												$elm$html$Html$text('Edit everywhere')
											]))
									]))
							]))
					]))
			]));
};
var $author$project$Main$CloseImport = {$: 14};
var $author$project$Main$ImportInput = function (a) {
	return {$: 15, a: a};
};
var $author$project$Main$SubmitImport = {$: 16};
var $elm$html$Html$textarea = _VirtualDom_node('textarea');
var $author$project$Main$formTextarea = F2(
	function (attrs, children) {
		return A2(
			$elm$html$Html$textarea,
			A2(
				$elm$core$List$cons,
				$elm$html$Html$Attributes$class('w-full border border-stone-300 rounded-md px-2.5 py-2 text-[13px] font-inherit focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-50'),
				attrs),
			children);
	});
var $author$project$Main$modalHeader = F2(
	function (title, closeMsg) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('px-5.5 py-4 border-b border-stone-200 flex items-center gap-2 justify-between sticky top-0 bg-white')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$h2,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('font-serif text-base m-0')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(title)
						])),
					function () {
					if (!closeMsg.$) {
						var msg = closeMsg.a;
						return A2($author$project$Main$iconBtn, '✕', msg);
					} else {
						return $elm$html$Html$text('');
					}
				}()
				]));
	});
var $elm$html$Html$Attributes$rows = function (n) {
	return A2(
		_VirtualDom_attribute,
		'rows',
		$elm$core$String$fromInt(n));
};
var $author$project$Main$importModalView = function (model) {
	return $author$project$Main$modalOverlay(
		_List_fromArray(
			[
				A2(
				$author$project$Main$modalShell,
				'max-w-xl',
				_List_fromArray(
					[
						A2(
						$author$project$Main$modalHeader,
						'Import questions (JSON)',
						$elm$core$Maybe$Just($author$project$Main$CloseImport)),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('px-5.5 py-4 flex flex-col gap-3.5')
							]),
						_Utils_ap(
							_List_fromArray(
								[
									A2(
									$elm$html$Html$p,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('text-[11px] text-stone-400 m-0')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text('Paste an array of questions in the category / question / answers / justification format. Tags come in empty — select the imported items in the bank and apply tags in bulk afterward.')
										])),
									A2(
									$author$project$Main$formTextarea,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('font-mono'),
											$elm$html$Html$Attributes$rows(10),
											$elm$html$Html$Events$onInput($author$project$Main$ImportInput),
											$elm$html$Html$Attributes$placeholder('[ { \u0022category\u0022: ..., \u0022question\u0022: ..., \u0022answers\u0022: {...}, \u0022justification\u0022: {...} } ]'),
											$elm$html$Html$Attributes$value(model.R)
										]),
									_List_Nil)
								]),
							$elm$core$String$isEmpty(model.P) ? _List_Nil : _List_fromArray(
								[
									A2(
									$elm$html$Html$p,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('text-rose-600 text-xs m-0')
										]),
									_List_fromArray(
										[
											$elm$html$Html$text(model.P)
										]))
								]))),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('px-5.5 py-3.5 border-t border-stone-200 sticky bottom-0 bg-white')
							]),
						_List_fromArray(
							[
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('flex justify-end gap-2')
									]),
								_List_fromArray(
									[
										A2($author$project$Main$outlineBtn, 'Cancel', $author$project$Main$CloseImport),
										A2($author$project$Main$primaryBtn, 'Import', $author$project$Main$SubmitImport)
									]))
							]))
					]))
			]));
};
var $author$project$Main$AddWrongRow = {$: 64};
var $author$project$Main$CloseForm = {$: 56};
var $author$project$Main$FormSetCategory = function (a) {
	return {$: 57, a: a};
};
var $author$project$Main$FormSetCorrectJust = function (a) {
	return {$: 60, a: a};
};
var $author$project$Main$FormSetCorrectText = function (a) {
	return {$: 59, a: a};
};
var $author$project$Main$FormSetTagsInput = function (a) {
	return {$: 61, a: a};
};
var $author$project$Main$FormSetText = function (a) {
	return {$: 58, a: a};
};
var $author$project$Main$SaveAsNewVersion = {$: 67};
var $author$project$Main$SaveNewQuestion = {$: 66};
var $author$project$Main$SaveOverwrite = {$: 68};
var $author$project$Main$dangerOutlineBtn = F2(
	function (label_, msg) {
		return A2(
			$elm$html$Html$button,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class($author$project$Main$btnBase + ' bg-white text-rose-700 border-rose-200 hover:bg-rose-50'),
					$elm$html$Html$Events$onClick(msg)
				]),
			_List_fromArray(
				[
					$elm$html$Html$text(label_)
				]));
	});
var $elm$html$Html$label = _VirtualDom_node('label');
var $author$project$Main$formField = F2(
	function (labelText, children) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('flex flex-col gap-1')
				]),
			A2(
				$elm$core$List$cons,
				A2(
					$elm$html$Html$label,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('text-[11px] font-semibold uppercase tracking-wide text-stone-500')
						]),
					_List_fromArray(
						[
							$elm$html$Html$text(labelText)
						])),
				children));
	});
var $author$project$Main$FormSetWrongJust = F2(
	function (a, b) {
		return {$: 63, a: a, b: b};
	});
var $author$project$Main$FormSetWrongText = F2(
	function (a, b) {
		return {$: 62, a: a, b: b};
	});
var $author$project$Main$RemoveWrongRow = function (a) {
	return {$: 65, a: a};
};
var $author$project$Main$wrongAnswerView = F2(
	function (i, w) {
		return A2(
			$elm$html$Html$div,
			_List_fromArray(
				[
					$elm$html$Html$Attributes$class('rounded-md p-2.5 flex flex-col gap-1.5 relative bg-rose-50 border border-rose-200')
				]),
			_List_fromArray(
				[
					A2(
					$elm$html$Html$button,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('bg-transparent border-none cursor-pointer text-stone-400 text-[13px] p-0.5 leading-none hover:text-rose-600 absolute top-1.5 right-1.5'),
							$elm$html$Html$Events$onClick(
							$author$project$Main$RemoveWrongRow(i))
						]),
					_List_fromArray(
						[
							$elm$html$Html$text('✕')
						])),
					A2(
					$author$project$Main$formTextarea,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$rows(2),
							$elm$html$Html$Attributes$value(w.Y),
							$elm$html$Html$Events$onInput(
							$author$project$Main$FormSetWrongText(i)),
							$elm$html$Html$Attributes$placeholder('Answer text')
						]),
					_List_Nil),
					A2(
					$author$project$Main$formTextarea,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$rows(2),
							$elm$html$Html$Attributes$value(w.al),
							$elm$html$Html$Events$onInput(
							$author$project$Main$FormSetWrongJust(i)),
							$elm$html$Html$Attributes$placeholder('Justification')
						]),
					_List_Nil)
				]));
	});
var $author$project$Main$questionFormModalView = F2(
	function (model, mode) {
		var fs = A2($elm$core$Maybe$withDefault, $author$project$Main$emptyFormState, model.g);
		var footer = function () {
			if (mode === 1) {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex flex-col gap-2')
						]),
					_List_fromArray(
						[
							A2(
							$elm$html$Html$p,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('text-[11px] text-stone-400 m-0')
								]),
							_List_fromArray(
								[
									$elm$html$Html$text('Editing this version changes it everywhere it\u0027s used. Saving as a new version leaves other tests on the old one.')
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('flex justify-end gap-2')
								]),
							_List_fromArray(
								[
									A2($author$project$Main$outlineBtn, 'Cancel', $author$project$Main$CloseForm),
									A2($author$project$Main$primaryBtn, 'Save as new version', $author$project$Main$SaveAsNewVersion),
									A2($author$project$Main$dangerOutlineBtn, 'Edit this version', $author$project$Main$SaveOverwrite)
								]))
						]));
			} else {
				return A2(
					$elm$html$Html$div,
					_List_fromArray(
						[
							$elm$html$Html$Attributes$class('flex justify-end gap-2')
						]),
					_List_fromArray(
						[
							A2($author$project$Main$outlineBtn, 'Cancel', $author$project$Main$CloseForm),
							A2($author$project$Main$primaryBtn, 'Save', $author$project$Main$SaveNewQuestion)
						]));
			}
		}();
		return $author$project$Main$modalOverlay(
			_List_fromArray(
				[
					A2(
					$author$project$Main$modalShell,
					'max-w-xl',
					_List_fromArray(
						[
							A2(
							$author$project$Main$modalHeader,
							function () {
								if (mode === 1) {
									return 'Edit question';
								} else {
									return 'Add question';
								}
							}(),
							$elm$core$Maybe$Just($author$project$Main$CloseForm)),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('px-5.5 py-4 flex flex-col gap-3.5')
								]),
							_List_fromArray(
								[
									A2(
									$author$project$Main$formField,
									'Category',
									_List_fromArray(
										[
											A2(
											$author$project$Main$formInput,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$value(fs.as),
													$elm$html$Html$Events$onInput($author$project$Main$FormSetCategory),
													$elm$html$Html$Attributes$placeholder('e.g. combined (offensive) — case study: ...')
												]),
											_List_Nil)
										])),
									A2(
									$author$project$Main$formField,
									'Question',
									_List_fromArray(
										[
											A2(
											$author$project$Main$formTextarea,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$rows(3),
													$elm$html$Html$Attributes$value(fs.Y),
													$elm$html$Html$Events$onInput($author$project$Main$FormSetText)
												]),
											_List_Nil)
										])),
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('rounded-md p-2.5 flex flex-col gap-1.5 relative bg-emerald-50 border border-emerald-200')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$label,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('text-[11px] font-semibold uppercase tracking-wide text-emerald-700')
												]),
											_List_fromArray(
												[
													$elm$html$Html$text('Correct answer')
												])),
											A2(
											$author$project$Main$formTextarea,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$rows(2),
													$elm$html$Html$Attributes$value(fs.C),
													$elm$html$Html$Events$onInput($author$project$Main$FormSetCorrectText),
													$elm$html$Html$Attributes$placeholder('Answer text')
												]),
											_List_Nil),
											A2(
											$author$project$Main$formTextarea,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$rows(2),
													$elm$html$Html$Attributes$value(fs.B),
													$elm$html$Html$Events$onInput($author$project$Main$FormSetCorrectJust),
													$elm$html$Html$Attributes$placeholder('Justification')
												]),
											_List_Nil)
										])),
									A2(
									$elm$html$Html$div,
									_List_fromArray(
										[
											$elm$html$Html$Attributes$class('flex flex-col gap-1.5')
										]),
									_List_fromArray(
										[
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('flex items-center justify-between')
												]),
											_List_fromArray(
												[
													A2(
													$elm$html$Html$label,
													_List_fromArray(
														[
															$elm$html$Html$Attributes$class('text-[11px] font-semibold uppercase tracking-wide text-stone-500')
														]),
													_List_fromArray(
														[
															$elm$html$Html$text('Wrong answers')
														])),
													A2($author$project$Main$linkBtn, '+ add', $author$project$Main$AddWrongRow)
												])),
											A2(
											$elm$html$Html$div,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('flex flex-col gap-2')
												]),
											A2($elm$core$List$indexedMap, $author$project$Main$wrongAnswerView, fs.a$))
										])),
									A2(
									$author$project$Main$formField,
									'Tags',
									_List_fromArray(
										[
											A2(
											$author$project$Main$formInput,
											_List_fromArray(
												[
													$elm$html$Html$Attributes$class('font-mono'),
													$elm$html$Html$Attributes$value(fs.X),
													$elm$html$Html$Events$onInput($author$project$Main$FormSetTagsInput),
													$elm$html$Html$Attributes$placeholder('comma, separated, tags')
												]),
											_List_Nil)
										]))
								])),
							A2(
							$elm$html$Html$div,
							_List_fromArray(
								[
									$elm$html$Html$Attributes$class('px-5.5 py-3.5 border-t border-stone-200 sticky bottom-0 bg-white flex flex-col gap-2')
								]),
							_List_fromArray(
								[footer]))
						]))
				]));
	});
var $author$project$Main$CloseHistory = {$: 31};
var $elm$time$Time$toHour = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			24,
			A2(
				$elm$time$Time$flooredDiv,
				A2($elm$time$Time$toAdjustedMinutes, zone, time),
				60));
	});
var $elm$time$Time$toMinute = F2(
	function (zone, time) {
		return A2(
			$elm$core$Basics$modBy,
			60,
			A2($elm$time$Time$toAdjustedMinutes, zone, time));
	});
var $author$project$Main$formatTimestamp = function (millis) {
	if (!millis) {
		return '';
	} else {
		var posix = $elm$time$Time$millisToPosix(millis);
		var pad = function (n) {
			return A3(
				$elm$core$String$padLeft,
				2,
				'0',
				$elm$core$String$fromInt(n));
		};
		return $elm$core$String$fromInt(
			A2($elm$time$Time$toYear, $elm$time$Time$utc, posix)) + ('-' + (pad(
			$author$project$Main$monthNumber(
				A2($elm$time$Time$toMonth, $elm$time$Time$utc, posix))) + ('-' + (pad(
			A2($elm$time$Time$toDay, $elm$time$Time$utc, posix)) + (' ' + (pad(
			A2($elm$time$Time$toHour, $elm$time$Time$utc, posix)) + (':' + (pad(
			A2($elm$time$Time$toMinute, $elm$time$Time$utc, posix)) + ' UTC'))))))));
	}
};
var $author$project$Main$historyEntryView = function (e) {
	return A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$classList(
				_List_fromArray(
					[
						_Utils_Tuple2('border rounded-md p-2.5 mb-2.5', true),
						_Utils_Tuple2('border-teal-200 bg-teal-50', e.aa),
						_Utils_Tuple2('border-stone-200', !e.aa)
					]))
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('flex items-center justify-between text-[11px] text-stone-500')
					]),
				_List_fromArray(
					[
						A2(
						$elm$html$Html$span,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('font-mono')
							]),
						_List_fromArray(
							[
								$elm$html$Html$text(
								'v' + ($elm$core$String$fromInt(e.aX) + (e.aa ? ' (current)' : '')))
							])),
						A2(
						$elm$html$Html$span,
						_List_Nil,
						_List_fromArray(
							[
								$elm$html$Html$text(
								$author$project$Main$formatTimestamp(e.bs))
							]))
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-[13px] text-stone-800 mt-0.5')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text(e.Y)
					])),
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('text-[11px] text-emerald-700')
					]),
				_List_fromArray(
					[
						$elm$html$Html$text('✓ ' + e.au.Y)
					]))
			]));
};
var $author$project$Main$versionHistoryModalView = F2(
	function (model, id) {
		var _v0 = A2($author$project$Main$findQuestion, model, id);
		if (_v0.$ === 1) {
			return $elm$html$Html$text('');
		} else {
			var q = _v0.a;
			var pastEntries = A2(
				$elm$core$List$map,
				function (h) {
					return {au: h.au, aa: false, bs: h.bs, Y: h.Y, aX: h.aX};
				},
				q.bd);
			var currentEntry = {au: q.au, aa: true, bs: q.by, Y: q.Y, aX: q.aX};
			var entries = A2(
				$elm$core$List$sortBy,
				function (e) {
					return -e.aX;
				},
				A2($elm$core$List$cons, currentEntry, pastEntries));
			return $author$project$Main$modalOverlay(
				_List_fromArray(
					[
						A2(
						$author$project$Main$modalShell,
						'max-w-md',
						_List_fromArray(
							[
								A2(
								$author$project$Main$modalHeader,
								'Version history',
								$elm$core$Maybe$Just($author$project$Main$CloseHistory)),
								A2(
								$elm$html$Html$div,
								_List_fromArray(
									[
										$elm$html$Html$Attributes$class('px-5.5 py-4 flex flex-col gap-0')
									]),
								A2($elm$core$List$map, $author$project$Main$historyEntryView, entries))
							]))
					]));
		}
	});
var $author$project$Main$modalRootView = function (model) {
	return A2(
		$elm$html$Html$div,
		_List_Nil,
		_Utils_ap(
			function () {
				var _v0 = model.x;
				if (!_v0.$) {
					var mode = _v0.a;
					return _List_fromArray(
						[
							A2($author$project$Main$questionFormModalView, model, mode)
						]);
				} else {
					return _List_Nil;
				}
			}(),
			_Utils_ap(
				function () {
					var _v1 = model.G;
					if (!_v1.$) {
						var pending = _v1.a;
						return _List_fromArray(
							[
								$author$project$Main$confirmOverwriteModalView(pending)
							]);
					} else {
						return _List_Nil;
					}
				}(),
				_Utils_ap(
					function () {
						var _v2 = model.ac;
						if (!_v2.$) {
							var id = _v2.a;
							return _List_fromArray(
								[
									A2($author$project$Main$versionHistoryModalView, model, id)
								]);
						} else {
							return _List_Nil;
						}
					}(),
					model.Q ? _List_fromArray(
						[
							$author$project$Main$importModalView(model)
						]) : _List_Nil))));
};
var $author$project$Main$view = function (model) {
	return (!model.ae) ? A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('min-h-screen flex items-center justify-center text-stone-400 bg-stone-50')
			]),
		_List_fromArray(
			[
				$elm$html$Html$text('Loading…')
			])) : A2(
		$elm$html$Html$div,
		_List_fromArray(
			[
				$elm$html$Html$Attributes$class('bg-stone-50 min-h-screen text-stone-900')
			]),
		_List_fromArray(
			[
				A2(
				$elm$html$Html$div,
				_List_fromArray(
					[
						$elm$html$Html$Attributes$class('max-w-7xl mx-auto px-6 py-7')
					]),
				_List_fromArray(
					[
						$author$project$Main$headerView(model),
						A2(
						$elm$html$Html$div,
						_List_fromArray(
							[
								$elm$html$Html$Attributes$class('grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5')
							]),
						_List_fromArray(
							[
								$author$project$Main$bankPanelView(model),
								$author$project$Main$builderPanelView(model)
							]))
					])),
				$author$project$Main$modalRootView(model)
			]));
};
var $author$project$Main$main = $elm$browser$Browser$element(
	{bf: $author$project$Main$init, bu: $author$project$Main$subscriptions, bx: $author$project$Main$update, bz: $author$project$Main$view});
_Platform_export({'Main':{'init':$author$project$Main$main(
	$elm$json$Json$Decode$succeed(0))(0)}});}(this));