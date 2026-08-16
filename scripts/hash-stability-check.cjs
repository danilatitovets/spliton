const { computeLegalPolicyContentHash, normalizeLegalPolicyContent } = require('./apps/backend/dist/modules/legal/legal-content-hash.util');
const input = { type: 'TERMS_OF_SERVICE', version: '2026.06.1', contentFormat: 'MARKDOWN', content: 'Hello\nWorld' };
const h1 = computeLegalPolicyContentHash(input);
const h2 = computeLegalPolicyContentHash({ ...input, content: 'Hello\r\nWorld' });
console.log(JSON.stringify({ stable: h1 === h2, hashLen: h1.length, normalized: normalizeLegalPolicyContent('Hello\r\nWorld') }));