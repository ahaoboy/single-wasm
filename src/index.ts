import { readFileSync, readdirSync, existsSync } from "fs";
import { join, relative } from "path";
import { getCode, getInit } from "./util";
import { Command } from "commander";
import { outputFileSync, removeSync } from "fs-extra";
const program = new Command();
const cwd = process.cwd();
import { build } from "esbuild";

program
  .argument("[inDir]")
  .option("-d, --dir [type]", "output dir", ".")
  .option("-o, --name [type]", "output name")
  .option("-dts, --dts [type]", "copy dts")
  .action(async (inDir: string) => {
    const rootDir = join(cwd, inDir);
    const options = program.opts();
    const fileList = readdirSync(rootDir);
    if (!fileList.length) {
      console.error("${rootDir} has no files");
      return;
    }
    // wasm
    const wasmName = fileList.find(file => file.endsWith("_bg.wasm"))!;
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
    const tsupPath = join(rootDir, "esm", jsName);

    await build({
      entryPoints: [rePath],
      outdir: join(rootDir, 'esm'),
      bundle: true,
      splitting: false,
      format: 'esm',
      target: 'esnext',
    });


    const jsStr = readFileSync(tsupPath, "utf8");
    removeSync(join(rootDir, "esm"));
    const reg = getInit(jsStr);
    const bufferData = readFileSync(wasmPath).toString("base64");
    const jsOutStr = jsStr.replace(reg, getCode(bufferData));

    // out
    const outName = !options.name
      ? "single_" + jsName
      : options.name?.endsWith?.(".js")
      ? options.name
      : options.name + ".js";
    const outPath = join(cwd, options.dir, outName);
    outputFileSync(outPath, jsOutStr);

    if (typeof options.dts !== "undefined") {
      const dtsPath = join(cwd, options.dir, outName.replace(".js", ".d.ts"));
      outputFileSync(
        dtsPath,
        readFileSync(jsPath.replace(".js", ".d.ts"), "utf-8")
      );
    }
  });
program.parse();
