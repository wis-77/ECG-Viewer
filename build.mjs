import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minify } from "terser";
import JavaScriptObfuscator from "javascript-obfuscator";

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(projectDir, "dist");
const pages = ["index.html", "map.html", "print.html"];

function getReservedNames(html) {
    const names = new Set();
    const eventAttributes = /\bon[a-z]+\s*=\s*(["'])(.*?)\1/gi;

    for (const [, , handler] of html.matchAll(eventAttributes)) {
        for (const [, name] of handler.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
            names.add(name);
        }
    }

    return [...names];
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function buildPage(pageName) {
    const html = fs.readFileSync(path.join(projectDir, pageName), "utf8");
    const scriptTags = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
    const inlineScripts = scriptTags.filter(([, attributes]) => !/\bsrc\s*=/i.test(attributes));

    if (inlineScripts.length !== 1) {
        throw new Error(`${pageName}: genau ein Inline-Script erwartet, gefunden: ${inlineScripts.length}`);
    }

    const reservedNames = getReservedNames(html);
    const minified = await minify(inlineScripts[0][2], {
        compress: true,
        mangle: { reserved: reservedNames }
    });

    if (!minified.code) {
        throw new Error(`${pageName}: Minifizierung hat keinen JavaScript-Code erzeugt`);
    }

    const reservedPatterns = reservedNames.map(name => `^${escapeRegExp(name)}$`);
    const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
        compact: true,
        identifierNamesGenerator: "hexadecimal",
        renameGlobals: true,
        reservedNames: reservedPatterns,
        stringArray: true,
        stringArrayThreshold: 0.75
    }).getObfuscatedCode();

    const scriptName = `${path.parse(pageName).name}.js`;
    const publicHtml = html.replace(
        /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,
        (tag, attributes) => /\bsrc\s*=/i.test(attributes)
            ? tag
            : `<script src="${scriptName}"></script>`
    );

    fs.writeFileSync(path.join(outputDir, pageName), publicHtml);
    fs.writeFileSync(path.join(outputDir, scriptName), obfuscated);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const page of pages) {
    await buildPage(page);
}

console.log(`Build abgeschlossen: ${path.relative(projectDir, outputDir)}`);
