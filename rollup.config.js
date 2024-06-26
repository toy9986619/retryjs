const outputDir = 'dist';

const config = {
  input: './lib/index.js',
  output: [
    {
      format: 'umd',
      name: 'RetryJs',
      file: `${outputDir}/index.js`,
    },
    {
      format: 'esm',
      file: `${outputDir}/esm/index.js`,
    },
    {
      format: 'cjs',
      file: `${outputDir}/cjs/index.cjs`,
    }
  ],
};

export default config;
