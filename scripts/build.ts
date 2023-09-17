import path from 'path';
import fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig, build as viteBuild } from 'vite';
import { version, name } from '../package.json';
// eslint-disable-next-line import/no-extraneous-dependencies
import detectDuplicatedDeps from 'unplugin-detect-duplicated-deps/vite';

const banner = `\n/*!
*
* ${name} v${version}
*
* Copyright 2015-present, Alipay, Inc.
* All rights reserved.
*
*/\n`;

const restCssPath = path.join(process.cwd(), 'components', 'style', 'reset.css');

function finalizeDist() {
  if (fs.existsSync(path.join(__dirname, './dist'))) {
    fs.copyFileSync(restCssPath, path.join(process.cwd(), 'dist', 'reset.css'));
  }
}

interface Options {
  minify?: boolean;
  fileName: string;
  entry: string;
}

const getConfig = ({ entry, fileName, minify = false }: Options) =>
  defineConfig({
    plugins: [detectDuplicatedDeps()],
    build: {
      target: 'es2015',
      sourcemap: 'inline',
      lib: {
        name: 'antd',
        formats: ['umd'],
        fileName: () => fileName,
        entry,
      },
      rollupOptions: {
        external: ['dayjs', 'react', 'react-dom'],
        onLog(_, log, handler) {
          if (log.code === 'CIRCULAR_DEPENDENCY') {
            return handler('error', log);
          }
        },
        output: {
          banner,
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            dayjs: 'dayjs',
          },
        },
      },
      minify,
    },
  });

const options: Options[] = [
  {
    entry: './components/index.ts',
    fileName: 'antd.js',
  },
  {
    entry: './components/index.ts',
    fileName: 'antd.min.js',
    minify: true,
  },
  {
    entry: './index-with-locales.js',
    fileName: 'antd-with-locales.js',
  },
  {
    entry: './index-with-locales.js',
    fileName: 'antd-with-locales.min.js',
    minify: true,
  },
];

const build = async () => {
  const tasks = options.map((op, index) => {
    const config = getConfig(op);
    return () =>
      viteBuild({
        ...config,
        build: {
          ...config.build,
          emptyOutDir: index === 0,
        },
      });
  });
  // eslint-disable-next-line no-restricted-syntax
  for (const task of tasks) {
    // eslint-disable-next-line no-await-in-loop
    await task();
  }
  finalizeDist();
};

build();
