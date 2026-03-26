// Build script: compiles vital-dashboard.js (JSX) → vital-compiled.js (plain JS)
// Runs at Vercel deploy time — no Babel needed in the browser
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['./public/vital-dashboard.js'],
  bundle: false,
  format: 'iife',
  globalName: '__vital__',
  outfile: './public/vital-compiled.js',
  loader: { '.js': 'jsx' },
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  define: {
    'process.env.NODE_ENV': '"production"'
  },
}).then(() => {
  console.log('✓ vital-compiled.js built successfully');
}).catch(e => {
  console.error('Build failed:', e);
  process.exit(1);
});
