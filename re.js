const list = [
  `async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('qr_code_wasm_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;

    return wasm;
}`,
  `async function init(input) {
    if (typeof input === "undefined") {
      input = new URL("qr_code_wasm_bg.wasm", importMetaUrl);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    };
    if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
      input = fetch(input);
    }
    const { instance, module: module2 } = await load(await input, imports);
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module2;
    return wasm;
  }`,
];

const getImports = (code) => {
  const re = /const imports = {};(.*?)if \(typeof input === /ms;
  const imports = code.match(re)[1];
  return imports;
};

const getInit = (code) => {
  const re = /async function init\(input\) \{(.*?)return wasm;/ms;
  const imports = code.match(re)[0];
  return imports+"\n}";
};
for (const str of list) {
  console.log(getInit(str));
}
