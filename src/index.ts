import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { getCode } from "./util";
import { Command } from "commander";
import { outputFileSync } from "fs-extra";
const program = new Command();
const cwd = process.cwd();
program.version("0.0.1");
program
  .argument("[inDir]")
  .option("-d, --dir [type]", "output dir", ".")
  .option("-n, --name [type]", "output name")
  .action((inDir) => {
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
    let jsName = wasmName.replace(".wasm", ".js");
    let jsPath = join(rootDir, jsName);
    if (!existsSync(jsPath)) {
      jsName = wasmName.replace(/_bg\.wasm/gs, ".js");
      jsPath = join(rootDir, jsName);
    }
    if (!existsSync(jsPath)) {
      console.error(`${rootDir} has no js file ${jsPath}`);
      return;
    }
    const jsStr = readFileSync(jsPath, "utf8");
    const reg = /async function load(.*?)export default init;/gs;
    const bufferData = readFileSync(wasmPath).toString("base64");
    const jsOutStr = jsStr.replace(reg, getCode(bufferData));

    // out
    const outName =
      options.name && options.name?.endsWith?.(".js")
        ? options.name
        : options.name + ".js";
    const outPath = join(cwd, options.dir, outName || "single_" + jsName);
    outputFileSync(outPath, jsOutStr);
  });
program.parse();
