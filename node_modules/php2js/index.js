/**/

var php2js = {

	/*
	 *	php rawurlencode eqvivalent code 
	 *	http://phpjs.org/functions/rawurlencode/
	 *	Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
	 *	PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
	*/
	rawurlencode : function(str) {
	  
	  str = (str + '')
	    .toString();

	  return encodeURIComponent(str)
	    .replace(/!/g, '%21')
	    .replace(/'/g, '%27')
	    .replace(/\(/g, '%28')
	    .replace(/\)/g, '%29')
	    .replace(/\*/g, '%2A')
	    .replace(/\+/g, ' ');
	},


	/*
	 *	php http_build_query eqvivalent code 
	 *	http://phpjs.org/functions/http_build_query/
	 *	depends on: urlencode
	 *	example : http_build_query({'php': 'hypertext processor', 0: 'foo', 1: 'bar', 2: 'baz', 3: 'boom', 'cow': 'milk'}, 'myvar_');
	 *	returns : 'myvar_0=foo&myvar_1=bar&myvar_2=baz&myvar_3=boom&php=hypertext+processor&cow=milk'
	*/
	http_build_query : function(formdata, numeric_prefix, arg_separator) {

	  var value, key, tmp = [],
	    that = this;

	  var _http_build_query_helper = function(key, val, arg_separator) {
	    var k, tmp = [];
	    if (val === true) {
	      val = '1';
	    } else if (val === false) {
	      val = '0';
	    }
	    if (val != null) {
	      if (typeof val === 'object') {
	        for (k in val) {
	          if (val[k] != null) {
	            tmp.push(_http_build_query_helper(key + '[' + k + ']', val[k], arg_separator));
	          }
	        }
	        return tmp.join(arg_separator);
	      } else if (typeof val !== 'function') {
	        return php2js.urlencode(key) + '=' + php2js.urlencode(val);
	      } else {
	        throw new Error('There was an error processing for http_build_query().');
	      }
	    } else {
	      return '';
	    }
	  };

	  if (!arg_separator) {
	    arg_separator = '&';
	  }
	  for (key in formdata) {
	    value = formdata[key];
	    if (numeric_prefix && !isNaN(key)) {
	      key = String(numeric_prefix) + key;
	    }
	    var query = _http_build_query_helper(key, value, arg_separator);
	    if (query !== '') {
	      tmp.push(query);
	    }
	  }

	  return tmp.join(arg_separator);
	},

	/*
	 *	php http_build_query eqvivalent code 
	 *	http://phpjs.org/functions/urlencode/
	 *	Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
	 *	PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
	 *	example 3: urlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
	 *	returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'
	*/
	urlencode : function(str) {
		str = (str + '')
		.toString();

		return encodeURIComponent(str)
			.replace(/!/g, '%21')
			.replace(/'/g, '%27')
			.replace(/\(/g, '%28')
			.replace(/\)/g, '%29')
			.replace(/\*/g, '%2A')
			.replace(/%20/g, '+');
	},

};

module.exports = php2js;