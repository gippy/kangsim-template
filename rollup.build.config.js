import glob from "glob";
import path from "path";

import { babel } from '@rollup/plugin-babel';

import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import copy from 'rollup-plugin-copy';
import scss from 'rollup-plugin-scss';

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
        file: 'docs/main.js',
        format: 'iife'
    },
    watch: {
        include: 'src/**/*'
    },
    plugins: [
        babel({ babelHelpers: 'bundled' }),
        scss({
            output: true,
            output: 'docs/main.css',
            processor: () => postcss([autoprefixer({})]),
            watch: 'src/scss',
        }),
        watcher(['src/scss/*', 'src/favicon/*', 'src/images/*', 'src/index.html']),
        copy({
            targets: [
                {
                    src: 'src/index.html',
                    dest: 'docs/'
                },
                {
                    src: 'src/prihlaseni.html',
                    dest: 'docs/'
                },
                {
                    src: 'src/nejaky-jiny-obsah.html',
                    dest: 'docs/'
                },
                {
                    src: 'src/dalsi-novinky.html',
                    dest: 'docs/'
                },
                {
                    src: 'src/fonts/**/*',
                    dest: 'docs/fonts'
                },
                {
                    src: 'src/favicon/**/*',
                    dest: 'docs'
                },
                {
                    src: 'src/images/**/*',
                    dest: 'docs/images'
                }
            ]
        }),
    ],
};
