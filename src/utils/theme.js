// 处理主题样式
export function handleThemeStyle(theme) {

	if (theme == "dark") {
		document.documentElement.style.setProperty(`--el-color-font`, "#ffffff")
		document.documentElement.style.setProperty(`--el-color-font-1`, "#999999")
		// document.documentElement.style.setProperty(`--el-color-background`, "#030712")
		document.documentElement.style.setProperty(`--background-color`, "#1E1E1E")
		document.documentElement.style.setProperty(`--el-color-background`, "#1E1E1E")
		document.documentElement.style.setProperty(`--background-color-home`, "#323233")
		document.documentElement.style.setProperty(`--border-color`, "#030712")
		document.documentElement.style.setProperty(`--svg-color`, "#dcdfe6")

		document.documentElement.className = "dark"
	}
	else {
		document.documentElement.style.setProperty(`--el-color-font`, "#606266")
		document.documentElement.style.setProperty(`--el-color-font-1`, "#999999")
		document.documentElement.style.setProperty(`--background-color`, "#ffffff")
		document.documentElement.style.setProperty(`--el-color-background`, "#F4F4F4")
		document.documentElement.style.setProperty(`--background-color-home`, "#ffffff")
		document.documentElement.style.setProperty(`--border-color`, "#dcdfe6")
		document.documentElement.style.setProperty(`--svg-color`, "#666666")
		document.documentElement.className = ""
	}

	// document.documentElement.style.setProperty('--el-color-primary', theme)
	// for (let i = 1; i <= 9; i++) {
	// 	document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, `${getLightColor(theme, i / 10)}`)
	// }
	// for (let i = 1; i <= 9; i++) {
	// 	document.documentElement.style.setProperty(`--el-color-primary-dark-${i}`, `${getDarkColor(theme, i / 10)}`)
	// }
}

// hex颜色转rgb颜色
export function hexToRgb(str) {
	str = str.replace('#', '')
	let hexs = str.match(/../g)
	for (let i = 0; i < 3; i++) {
		hexs[i] = parseInt(hexs[i], 16)
	}
	return hexs
}

// rgb颜色转Hex颜色
export function rgbToHex(r, g, b) {
	let hexs = [r.toString(16), g.toString(16), b.toString(16)]
	for (let i = 0; i < 3; i++) {
		if (hexs[i].length == 1) {
			hexs[i] = `0${hexs[i]}`
		}
	}
	return `#${hexs.join('')}`
}

// 变浅颜色值
export function getLightColor(color, level) {
	let rgb = hexToRgb(color)
	for (let i = 0; i < 3; i++) {
		rgb[i] = Math.floor((255 - rgb[i]) * level + rgb[i])
	}
	return rgbToHex(rgb[0], rgb[1], rgb[2])
}

// 变深颜色值
export function getDarkColor(color, level) {
	let rgb = hexToRgb(color)
	for (let i = 0; i < 3; i++) {
		rgb[i] = Math.floor(rgb[i] * (1 - level))
	}
	return rgbToHex(rgb[0], rgb[1], rgb[2])
}
