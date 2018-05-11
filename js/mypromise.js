var PENDING = "pending";
var RESOLVED = "resolved";
var REJECTED = "rejected";

var Promise = (function (){
	function Promise(fn, isCatch = true){
		this.state = PENDING;
		this.doneList = [];
		this.failList = [];
		this.e = '';
		this.fn = fn;
		this. isCatch= isCatch;
		try {
			this.fn(this.resolve.bind(this), this.reject.bind(this));
		} catch (e) {
			this.e = e;
			var that = this;
			setTimeout(function () {
				if (that.isCatch) {
					throw that.e;
				}
			}, 0)
		}
	}

	Promise.all = function (promises) {
		console.log(promises);
		return new Promise(function (resolve, reject) {
			if (Object.prototype.toString.call(promises) !== '[object Array]') {
				throw new Error('nor a array');
			}
			var promiseVals = [];
			for (var i = 0, len = promises.length; i < len; i++) {
				(function (i) {
					promises[i].then(function (val) {
						promiseVals[i] = val;
						if (i === (len - 1)) {
							resolve(promiseVals);
						}
					})
				})(i);
			}
		})
	}

	var p = {
		catch: function (cb) {
			this.isCatch = false;
			cb.call(this, this.e);
			return new Promise(this.fn, false);
		},
		done: function (cb){
			if(typeof cb == "function")
				this.doneList.push(cb)
			return this;
		},
		fail: function(cb){
			if(typeof cb == "function")
				this.failList.push(cb);
			return this;
		},
		then: function(success, fail){
			this.done(success || noop).fail(fail || noop)
			return this;
		},
		always: function(cb){
			this.done(cb).fail(cb)
			return this;
		},
		resolve: function(arg){
			var that = this;
			var lists = that.doneList;
			if (lists.length === 0) {
				return arg;
			}
			setTimeout(function () {
				that.state = RESOLVED;
				console.log(lists);
				for(var i = 0, len = lists.length; i<len; i++){
					lists[0].call(that, arg);
					lists.shift();
				}
			}, 0);
			return this;
		},
		reject: function(arg){
			var that = this;
			setTimeout(function () {
				that.state = RESOLVED;
				var lists = that.failList;
				for(var i = 0, len = lists.length; i<len; i++){
					lists[0].call(that, arg);
					lists.shift();
				}
			}, 0);
			return this;
		}
	}
	for(var k in p){
		Promise.prototype[k] = p[k];
		Promise[k] = p[k];
	}

	Promise.call(Promise, function () {});

	return Promise;
})();

function noop(){}
