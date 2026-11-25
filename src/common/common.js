import dayjs from 'dayjs'
export default {
	isNull(d) {
		return d == null || d == undefined || d == 'null'
	},
	shortTime(time) {
		let ret = ""
		if (time && dayjs(time).isValid()) {
			let curtime = new Date();
			//如果是今天 取时分
			//如果是昨天 取‘昨天’
			//如果是今年 取月日
			//否则取 年月日
			if (dayjs(time).format('YYYY-MM-DD') == dayjs(curtime).format('YYYY-MM-DD')) {
				ret = dayjs(time).format('HH:mm')
			} else if (dayjs(time).diff(curtime, 'd') <= 0 && dayjs(time).diff(curtime, 'd') > -2) {
				ret = '昨天 ' + dayjs(time).format('HH:mm')
			} else if (dayjs(time).diff(curtime, 'y') == 0) {
				ret = dayjs(time).format('MM月DD日')
			} else {
				ret = dayjs(time).format('YYYY年MM月DD日')
			}
		}
		return ret
	},
	dayjs(time) {
		return dayjs(time)
	},
	timeDiff(start, end, type = "") {
		return dayjs(end).diff(start, type) || 0
	},
	worktimeStint(start, end, worktime, type = '') {
		let stint = 0
		if (!dayjs(start).isValid() || !dayjs(end).isValid())
			return stint
		//取时间去除年月日的影响
		let current = dayjs(new Date()).format('YYYY-MM-DD') + " "
		let curstart = dayjs(current + dayjs(start).format("HH:mm:ss"))
		let curend = dayjs(current + dayjs(end).format("HH:mm:ss"))
		let startup = dayjs(current + dayjs(worktime[0]).format("HH:mm:ss"))
		let endup = dayjs(current + dayjs(worktime[1]).format("HH:mm:ss"))
		let startdown = dayjs(current + dayjs(worktime[2]).format("HH:mm:ss"))
		let enddown = dayjs(current + dayjs(worktime[3]).format("HH:mm:ss"))

		let diffDay = dayjs(dayjs(end).format("YYYY-MM-DD")).diff(dayjs(start).format("YYYY-MM-DD"), 'd')
		let workDateTime = dayjs(endup).diff(startup, 's') + dayjs(enddown).diff(startdown, 's')
		//跨天的
		if (diffDay > 0) {
			// if(curstart < startup){ //开始时间 小于上午上班
			// 	stint = diffDay * workDateTime
			// } else if (curstart > enddown){ //开始时间 大于下午下班 则减一天
			// 	curstart = startup
			// 	stint = (diffDay-1) * workDateTime
			// } else {
			// 	stint = (diffDay-1) * workDateTime
			// }
			stint += this.worktimeDayStint(curstart, enddown, startup, endup, startdown, enddown)
			stint += this.worktimeDayStint(startup, curend, startup, endup, startdown, enddown)
			stint += (diffDay - 1) * workDateTime
		}
		else {
			stint = this.worktimeDayStint(curstart, curend, startup, endup, startdown, enddown)
		}

		return this.worktimeConvert(stint, type)
	},
	floatFix(num) {
		return Math.round(num * 10) / 10
	},
	worktimeDayStint(curstart, curend, startup, endup, startdown, enddown) {
		let stint = 0
		//如果开始结束时间都在休息期间则为0
		if ((curstart > endup && curstart < startdown && curend > endup && curend < startdown)
			|| curstart > enddown || curend < startup) {
			return stint
		}
		else {
			//确定开始时间
			if (curstart < startup) {
				curstart = startup
			} else if (curstart > endup && curstart < startdown) {
				curstart = startdown
			}
			//确定结束时间
			if (curend > endup && curend < startdown) {
				curend = endup
			} else if (curend > enddown) {
				curend = enddown
			}

			//如果跨过中午休息时间则减去中午时间
			if (curstart < endup && curend > startdown) {
				stint += this.timeDifBetween(curstart, curend, endup, startdown, 's')
			}
			else {
				stint += this.timeDif(curstart, curend, 's')
			}
			return stint
		}
	},
	worktimeConvert(stint, type) {
		let ret = 0
		let d = this.floatFix(stint / (24 * 60 * 60))
		let h = this.floatFix(stint / (60 * 60))
		let m = this.floatFix(stint / (60))
		let s = stint
		switch (type) {
			case 'd':
				ret = d
				break
			case 'h':
				ret = h
				break
			case 'm':
				ret = m
				break
			case 's':
				ret = s
				break
			default:
				{
					if (h >= 1) {
						ret = h + "h"
					} else if (m >= 1) {
						ret = m + "m"
					} else if (s >= 0) {
						ret = s + "s"
					}
				}
				break

		}

		return ret
	},
	timeDifBetween(start, end, delstart, delend, type) {
		let ret = ""
		if (type) {
			let tmp = dayjs(delstart).diff(start, type) + dayjs(end).diff(delend, type)
			ret = tmp < 0 ? "" : tmp
		}
		else {
			let d = dayjs(delstart).diff(start, 'd') + dayjs(end).diff(delend, 'd')
			let h = dayjs(delstart).diff(start, 'h') + dayjs(end).diff(delend, 'h')
			let m = dayjs(delstart).diff(start, 'm') + dayjs(end).diff(delend, 'm')
			let s = dayjs(delstart).diff(start, 's') + dayjs(end).diff(delend, 's')
			if (d > 0) {
				ret = h + "h"
			} else if (h > 0) {
				ret = (m / 60).toFixed(1) + "h"
			} else if (m > 0) {
				ret = (s / 60).toFixed(1) + "m"
			} else if (s > 0) {
				ret = s + "s"
			}
		}

		return ret || 0
	},
	timeDif(start, end, type = "") {
		let ret = ""
		if (!dayjs(start).isValid() || !dayjs(end).isValid())
			return 0

		if (type) {
			let tmp = dayjs(end).diff(start, type)
			ret = tmp < 0 ? "" : tmp
		}
		else {
			let d = dayjs(end).diff(start, 'd')
			let h = dayjs(end).diff(start, 'h')
			let m = dayjs(end).diff(start, 'm')
			let s = dayjs(end).diff(start, 's')
			if (d > 0) {
				ret = h + "h"
			} else if (h > 0) {
				ret = (m / 60).toFixed(1) + "h"
			} else if (m > 0) {
				ret = (s / 60).toFixed(1) + "m"
			} else if (s > 0) {
				ret = s + "s"
			}
		}

		return ret || 0
	},
	fIsTime(time) {
		if (time) {
			let myRe = /^((0?[0-9])|(1[0-9]|2[0-3])):(([1-5][0-9])|(0?[0-9])):(([1-5][0-9])|(0?[0-9]))$/g
			let myRe2 = /^((0?[0-9])|(1[0-9]|2[0-3])):(([1-5][0-9])|(0?[0-9]))$/g
			return myRe.test(time) || myRe2.test(time)
		}
		else if (time === "") {
			return true
		}
		else return false
	},
	fIsUrL(sUrl) {
		var sRegex = '^((https|http|ftp|rtsp|mms)?://)' +
			'?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@ 
			+
			'(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184 
			+
			'|' // 允许IP和DOMAIN（域名） 
			+
			'([0-9a-z_!~*\'()-]+.)*' // 域名- www. 
			+
			'([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名 
			+
			'[a-z]{2,6})' // first level domain- .com or .museum 
			+
			'(:[0-9]{1,4})?' // 端口- :80 
			+
			'((/?)|' // a slash isn't required if there is no file name 
			+
			'(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$';
		var re = new RegExp(sRegex);
		//re.test() 
		if (re.test(sUrl)) {
			return true;
		}
		return false;
	},
	uuid() {
		return Date.now().toString()
	},
	myTimer(starttime, delay, fn) {
		let current = dayjs(new Date()).format('YYYY-MM-DD') + " "
		let curtime = new Date()
		starttime = current + starttime
		let d = 24 * 60 * 60 * 1000
		let curDelay = d
		if (dayjs(starttime) < curtime) {
			curDelay = dayjs(curtime).diff(starttime, "s") * 1000 + d
		}
		else {
			curDelay = dayjs(starttime).diff(curtime, "s") * 1000
		}
		console.log("定时毫秒curDelay", curDelay)
		console.log("定时毫秒delay", delay)
		setTimeout(function () {
			fn()
		}, curDelay)
		let timer = setInterval(function () {
			fn()
		}, delay)

		return timer
	},

}

/**
 * 通用的周期定时器
 * @param fn 回调函数
 * @param time 延时
 */
export function timer(fn, time) {
	return function walk() {
		clearTimeout(aeta);
		var aeta = setTimeout(function () {
			fn();
			walk();
		}, time);
		return aeta;
	};
}

/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 */
export function openDownloadDialog(url, saveName) {
	if (typeof url == 'object' && url instanceof Blob) {
		url = URL.createObjectURL(url); // 创建blob地址
	}
	var aLink = document.createElement('a');
	aLink.href = url;
	aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
	var event;
	if (window.MouseEvent) event = new MouseEvent('click');
	else {
		event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	}
	aLink.dispatchEvent(event);
}

export function date(d) {
	return dayjs(d)
}

/**
 * @param {function} fn
 * @param {number} delay
 * @return {function(): void}
 */
export function debounce(fn, delay) {
	let timeout;
	return function () {
		const context = this;
		const args = arguments;
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			fn.apply(context, args);
		}, delay);
	};
}

/**
 * @param {function} fn
 * @param {number} delay
 * @return {function(): void}
 */
export function throttle(fn, delay) {
	let canRun = true
	return function () {
		if (!canRun) return
		canRun = false
		setTimeout(() => {
			fn.apply(this, arguments)
			canRun = true
		}, delay)
	}
}

/**
 * 判断是否为 uTools 平台
 * @return {boolean}
 */
export function isUTools() {
	return Reflect.has(window, 'utools')
}

export function isMacOS() {
	return isUTools() ? utools.isMacOs() : /mac/i.test(navigator.platform)
}

export function isWindows() {
	return isUTools() ? utools.isWindows() : /win/i.test(navigator.platform)
}


/**
 * @param {any} obj
 * @return {any}
 */
export function deepCopy(obj) {
	return JSON.parse(JSON.stringify(obj))
}

/**
 * @param {number} length
 * @param {any} defaultVal
 * @return {any[]}
 */
export function createArray(length, defaultVal = undefined) {
	if (defaultVal === undefined) return new Array(length)
	return new Array(length).fill(defaultVal, 0, length)
}

