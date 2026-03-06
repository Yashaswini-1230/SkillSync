console.log('Testing route loading...\n');

const routes = [
  { name: 'auth', path: './routes/auth' },
  { name: 'resumes', path: './routes/resumes' },
  { name: 'analysis', path: './routes/analysis' },
  { name: 'profile', path: './routes/profile' },
  { name: 'interview', path: './routes/interview' },
  { name: 'savedResumes', path: './routes/savedResumes' },
  { name: 'jobs', path: './routes/jobs.routes' }
];

for (const route of routes) {
  try {
    console.log(`Loading ${route.name}...`);
    require(route.path);
    console.log(`✅ ${route.name} loaded successfully\n`);
  } catch (error) {
    console.error(`❌ Error loading ${route.name}:`);
    console.error('  Error:', error.message);
    console.error('  Stack:', error.stack);
    console.error('');
    process.exit(1);
  }
}

console.log('✅ All routes loaded successfully!');
