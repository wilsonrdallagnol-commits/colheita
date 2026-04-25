#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('check-commit-msg: missing commit message file path');
  process.exit(2);
}

const firstLine = readFileSync(file, 'utf8').split(/\r?\n/)[0] ?? '';
const pattern = /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci)(\(.+\))?: .{1,100}$/;

if (!pattern.test(firstLine)) {
  console.error('Commit message must follow Conventional Commits: type(scope): subject');
  console.error(`Got: ${firstLine}`);
  process.exit(1);
}
