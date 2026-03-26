// Build script: compiles vital-dashboard.js (JSX) → vital-compiled.js (plain JS)
// Runs at Vercel deploy time — no Babel needed in the browser
const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['./public/vital-dashboard.js'],
    bundle: true,
    format: 'iife',
    globalName: '__vital__',
    outfile: './public/vital-compiled.js',
    loader: { '.js': 'jsx' },
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    external: ['react', 'react-dom', 'recharts'],
    define: {
          'process.env.NODE_ENV': '"production"'
    },
    banner: {
          js: 'var require = function(m) { var map = {"react": React, "react-dom": ReactDOM, "recharts": Recharts}; if (map[m]) return map[m]; throw new Error("Cannot find module " + m); };'
    },
}).then(() => {
    console.log('✓ vital-compiled.js built successfully');
}).catch(e => {
    console.error('Build failed:', e);
    process.exit(1);
});
