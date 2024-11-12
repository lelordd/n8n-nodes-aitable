const { src, dest } = require('gulp')

function copyIcons() {
	return src('~/n8n-nodes-aitable/nodes/Aitable/*.{png,svg}')
		.pipe(dest('dist/nodes'))
}

exports.default = copyIcons