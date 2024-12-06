const { src, dest } = require('gulp');

function buildIcons() {
	const iconFiles = ['nodes/**/*.{png,svg}'];
	return src(iconFiles).pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
