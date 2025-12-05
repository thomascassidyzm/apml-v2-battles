import { parseAPML } from './dist/parser/parser.js';
import { readFileSync } from 'fs';

const apmlContent = readFileSync('../../BUILDS/x-pwa/x-feed.apml', 'utf-8');
const ast = parseAPML(apmlContent);

console.log('=== INTERFACES ===');
console.log(JSON.stringify(ast.interfaces, null, 2));
