import { readFileSync, readdirSync, existsSync } from "fs";
import { join, relative } from "path";
import { getCode, getImports, getInit } from "./util";
import { Command } from "commander";
import { outputFileSync, removeSync } from "fs-extra";
const program = new Command();
const cwd = process.cwd();
import { build } from "tsup";

program
  .argument("[inDir]")
  .option("-d, --dir [type]", "output dir", ".")
  .option("-o, --name [type]", "output name")
  .action(async (inDir: string) => {
    const rootDir = join(cwd, inDir);
    const options = program.opts();
    const fileList = readdirSync(rootDir);
    if (!fileList.length) {
      console.error("${rootDir} has no files");
      return;
    }
    // wasm
    const wasmName = fileList.find((file) => file.endsWith("_bg.wasm"))!;
    const wasmPath = join(rootDir, wasmName);
    if (!existsSync(wasmPath)) {
      console.error(`${rootDir} has no wasm file ${wasmPath}`);
      return;
    }

    // js
    let jsName = wasmName.replace(/_bg\.wasm/gs, ".js");
    let jsPath = join(rootDir, jsName);
    if (!existsSync(jsPath)) {
      let jsName = wasmName.replace(".wasm", ".js");
      jsPath = join(rootDir, jsName);
    }
    if (!existsSync(jsPath)) {
      console.error(`${rootDir} has no js file ${jsPath}`);
      return;
    }
    const rePath = relative(cwd, jsPath).replace("\\", "/");
    const tsupName = "tsup_" + jsName;
    const tsupPath = join(rootDir, "esm", tsupName);
    await build({
      entry: { [tsupName.slice(0, -3)]: rePath },
      outDir: rootDir,
      format: ["esm"],
      legacyOutput: true,
    });
    const jsStr = readFileSync(tsupPath, "utf8");
    removeSync(join(rootDir, "esm"))
    const reg = getInit(jsStr);
    const bufferData = readFileSync(wasmPath).toString("base64");
    const imports = getImports(jsStr);
    const jsOutStr = jsStr.replace(reg, getCode(bufferData, imports));

    // out
    const outName = !options.name
      ? "single_" + jsName
      : options.name?.endsWith?.(".js")
      ? options.name
      : options.name + ".js";
    const outPath = join(cwd, options.dir, outName);
    outputFileSync(outPath, jsOutStr);
  });
program.parse();
