#!/usr/bin/env node
/**
 * Corporate Brain Logger
 * @governance COMPONENT-001, DOC-002
 *
 * Logs component development milestones to the Corporate Brain.
 * Used via: npm run brain:log -- --task "Task name" --outcome success
 *
 * Usage:
 *   npm run brain:log -- --task "Built P6ConnectionForm" --outcome success
 *   npm run brain:log -- --task "Fixed accessibility" --outcome partial --lessons "aria-label needed"
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuration
const SUPABASE_URL = 'https://jqsdctrwmbkwysyxpmql.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const PROJECT_ID = 'f043ebd9-83cb-4ec7-9433-f19a1060257a'; // ORION PMS

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return null;
};

const task = getArg('task');
const outcome = getArg('outcome') || 'success';
const lessons = getArg('lessons');

if (!task) {
  console.log('Usage: npm run brain:log -- --task "Task name" --outcome success|partial|failure --lessons "Lesson learned"');
  process.exit(1);
}

// Get git info
let gitBranch = 'unknown';
let gitCommit = 'unknown';
try {
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch {
  // Git not available
}

// Build payload
const payload = {
  project_id: PROJECT_ID,
  agent_id: 'claude-session',
  task_name: task,
  task_description: `Frontend component work on ${gitBranch}`,
  input_data: {
    branch: gitBranch,
    commit: gitCommit,
    timestamp: new Date().toISOString(),
  },
  output_data: {
    logged_at: new Date().toISOString(),
  },
  decision_made: task,
  reasoning: `Component development following COMPONENT-001`,
  outcome: outcome,
  result_quality: outcome === 'success' ? 0.95 : outcome === 'partial' ? 0.7 : 0.4,
  lessons_learned: lessons ? [lessons] : [],
  what_went_well: outcome === 'success' ? 'Gate criteria met' : null,
  what_could_improve: outcome !== 'success' ? 'Needs additional work' : null,
  model_used: 'claude-opus-4-5',
};

// Log to console (always works)
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║           CORPORATE BRAIN LOG ENTRY                     ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log(`║ Task:     ${task.substring(0, 45).padEnd(45)} ║`);
console.log(`║ Outcome:  ${outcome.padEnd(45)} ║`);
console.log(`║ Branch:   ${gitBranch.substring(0, 45).padEnd(45)} ║`);
console.log(`║ Commit:   ${gitCommit.padEnd(45)} ║`);
if (lessons) {
  console.log(`║ Lessons:  ${lessons.substring(0, 45).padEnd(45)} ║`);
}
console.log('╚══════════════════════════════════════════════════════════╝');

// Try to log to Supabase
if (SUPABASE_ANON_KEY) {
  const data = JSON.stringify(payload);
  const options = {
    hostname: 'jqsdctrwmbkwysyxpmql.supabase.co',
    path: '/rest/v1/project_history',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 201) {
      console.log('\n✅ Logged to Corporate Brain (project_history)');
    } else {
      console.log(`\n⚠️  Supabase responded with status ${res.statusCode}`);
    }
  });

  req.on('error', (e) => {
    console.log('\n⚠️  Could not reach Supabase (offline mode)');
  });

  req.write(data);
  req.end();
} else {
  console.log('\n⚠️  SUPABASE_ANON_KEY not set - logged locally only');
  console.log('   Set it in .env.local to enable remote logging');
}
