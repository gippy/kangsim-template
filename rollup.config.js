import glob from "glob";
import path from "path";

import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload';
import scss from 'rollup-plugin-scss';
import serve from 'rollup-plugin-serve';

const watcher = (globs) => ({
    buildStart() {
        for (const item of globs) {
            glob.sync(path.resolve(item)).forEach((filename) => {
                this.addWatchFile(filename);
            });
        }
    },
});

export default {
    input: 'src/js/main.js',
    output: {
        file: 'dist/main.js',
        format: 'iife'
    },
    watch: {
        include: 'src/**/*'
    },
    plugins: [
        scss({
            output: true,
            output: 'dist/main.css',
            processor: () => postcss([autoprefixer({})]),
            watch: 'src/scss',
        }),
        watcher(['src/scss/*', 'src/favicon/*', 'src/images/*', 'src/index.html']),
        copy({
            targets: [
                {
                    src: 'src/index.html',
                    dest: 'dist/'
                },
                {
                    src: 'src/prihlaseni.html',
                    dest: 'dist/'
                },
                {
                    src: 'src/nejaky-jiny-obsah.html',
                    dest: 'dist/'
                },
                {
                    src: 'src/fonts/**/*',
                    dest: 'dist/fonts'
                },
                {
                    src: 'src/favicon/**/*',
                    dest: 'dist'
                },
                {
                    src: 'src/images/**/*',
                    dest: 'dist/images'
                }
            ]
        }),
        serve({
            open: true,
            host: 'localhost',
            port: 3333,
            contentBase: './dist',
        }),
        livereload({
            watch: 'dist',
            verbose: false, // Disable console output
        })
    ],
};
