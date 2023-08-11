import * as JavaScriptObfuscator from 'javascript-obfuscator';
import * as fs from 'fs';
import * as path from 'path';
export const obfuscatorUtil = (code: string) => {
  const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    numbersToExpressions: true,
    simplify: true,
    shuffleStringArray: true,
    splitStrings: true,
    stringArrayThreshold: 0.75,
  });

  const obfuscation = obfuscationResult.getObfuscatedCode();
  fs.writeFileSync(
    path.join(process.cwd(), '/static/scripts/embed-script.js'),
    obfuscation,
  );
};
