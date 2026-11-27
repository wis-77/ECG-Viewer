import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(projectDir, "dist");
const pagesRepoDir = path.resolve(projectDir, "..", "ECG-Viewer-Pages");

if (!fs.existsSync(pagesRepoDir)) {
    throw new Error(`Pages-Repository nicht gefunden: ${pagesRepoDir}`);
}

let repoRoot;
try {
    repoRoot = execFileSync("git", ["-C", pagesRepoDir, "rev-parse", "--show-toplevel"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
    }).trim();
} catch {
    throw new Error(`Kein Git-Repository unter ${pagesRepoDir}. Klone das öffentliche Pages-Repository dorthin.`);
}

const normalizePath = value => path.resolve(value).toLowerCase();
if (normalizePath(repoRoot) !== normalizePath(pagesRepoDir)) {
    throw new Error(`Der Pages-Pfad muss das Repository-Stammverzeichnis sein: ${repoRoot}`);
}

const status = execFileSync("git", ["-C", pagesRepoDir, "status", "--porcelain"], {
    encoding: "utf8"
});
if (status.trim()) {
    throw new Error("Das Pages-Repository hat lokale Änderungen. Bitte erst committen oder anderweitig sichern.");
}

await import("./build.mjs");

for (const name of fs.readdirSync(outputDir)) {
    const source = path.join(outputDir, name);
    if (!fs.statSync(source).isFile()) {
        throw new Error(`Unerwarteter Ordner im Build-Ergebnis: ${name}`);
    }

    fs.copyFileSync(source, path.join(pagesRepoDir, name));
}

console.log(`Build-Dateien nach ${pagesRepoDir} kopiert. Änderungen prüfen, committen und pushen.`);
