function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function createEventDispatcher() {
    const component = current_component;
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_render: [],
            after_render: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.head
            };
        },
        $$render
    };
}

/* src/CodeMirror.svelte generated by Svelte v3.5.1 */

const css = {
	code: "textarea.svelte-1jpkv2x{visibility:hidden}pre.svelte-1jpkv2x{position:absolute;width:100%;height:100%;top:0;left:0;border:none;padding:4px 4px 4px 60px;resize:none;font-family:var(--font-mono);font-size:13px;line-height:1.7;user-select:none;pointer-events:none;color:#ccc;tab-size:2;-moz-tab-size:2}",
	map: "{\"version\":3,\"file\":\"CodeMirror.svelte\",\"sources\":[\"CodeMirror.svelte\"],\"sourcesContent\":[\"<script context=\\\"module\\\">\\n  const is_browser = typeof window !== \\\"undefined\\\";\\n\\n  let codemirror_promise;\\n  let _CodeMirror;\\n\\n  if (is_browser) {\\n    codemirror_promise = import(\\\"codemirror\\\");\\n\\n    codemirror_promise.then(mod => {\\n      _CodeMirror = mod.default;\\n    });\\n  }\\n</script>\\n\\n<script>\\n  import { onMount, createEventDispatcher } from \\\"svelte\\\";\\n\\n  const dispatch = createEventDispatcher();\\n\\n  export let code = \\\"\\\";\\n  export let readonly = false;\\n  export let errorLoc = null;\\n  export let flex = false;\\n  export let lineNumbers = true;\\n  export let tab = true;\\n\\n  let w;\\n  let h;\\n  let mode;\\n\\n  // We have to expose set and update methods, rather\\n  // than making this state-driven through props,\\n  // because it's difficult to update an editor\\n  // without resetting scroll otherwise\\n  export async function set(new_code, new_mode) {\\n    if (new_mode !== mode) {\\n      await createEditor((mode = new_mode));\\n    }\\n\\n    code = new_code;\\n    updating_externally = true;\\n    if (editor) editor.setValue(code);\\n    updating_externally = false;\\n  }\\n\\n  export function update(new_code) {\\n    code = new_code;\\n\\n    if (editor) {\\n      const { left, top } = editor.getScrollInfo();\\n      editor.setValue((code = new_code));\\n      editor.scrollTo(left, top);\\n    }\\n  }\\n\\n  export function resize() {\\n    editor.refresh();\\n  }\\n\\n  export function focus() {\\n    editor.focus();\\n  }\\n\\n  const modes = {\\n    js: {\\n      name: \\\"javascript\\\",\\n      json: false\\n    },\\n    json: {\\n      name: \\\"javascript\\\",\\n      json: true\\n    },\\n    svelte: {\\n      name: \\\"handlebars\\\",\\n      base: \\\"text/html\\\"\\n    }\\n  };\\n\\n  const refs = {};\\n  let editor;\\n  let updating_externally = false;\\n  let marker;\\n  let error_line;\\n  let destroyed = false;\\n  let CodeMirror;\\n\\n  $: if (editor && w && h) {\\n    editor.refresh();\\n  }\\n\\n  $: {\\n    if (marker) marker.clear();\\n\\n    if (errorLoc) {\\n      const line = errorLoc.line - 1;\\n      const ch = errorLoc.column;\\n\\n      marker = editor.markText(\\n        { line, ch },\\n        { line, ch: ch + 1 },\\n        {\\n          className: \\\"error-loc\\\"\\n        }\\n      );\\n\\n      error_line = line;\\n    } else {\\n      error_line = null;\\n    }\\n  }\\n\\n  let previous_error_line;\\n  $: if (editor) {\\n    if (previous_error_line != null) {\\n      editor.removeLineClass(previous_error_line, \\\"wrap\\\", \\\"error-line\\\");\\n    }\\n\\n    if (error_line && error_line !== previous_error_line) {\\n      editor.addLineClass(error_line, \\\"wrap\\\", \\\"error-line\\\");\\n      previous_error_line = error_line;\\n    }\\n  }\\n\\n  onMount(() => {\\n    if (_CodeMirror) {\\n      CodeMirror = _CodeMirror;\\n      createEditor(mode || \\\"svelte\\\").then(() => {\\n        if (editor) editor.setValue(code || \\\"\\\");\\n      });\\n    } else {\\n      codemirror_promise.then(async mod => {\\n        CodeMirror = mod.default;\\n        await createEditor(mode || \\\"svelte\\\");\\n        if (editor) editor.setValue(code || \\\"\\\");\\n      });\\n    }\\n\\n    return () => {\\n      destroyed = true;\\n      if (editor) editor.toTextArea();\\n    };\\n  });\\n\\n  let first = true;\\n\\n  async function createEditor(mode) {\\n    if (destroyed || !CodeMirror) return;\\n\\n    if (editor) editor.toTextArea();\\n\\n    const opts = {\\n      lineNumbers,\\n      lineWrapping: true,\\n      indentWithTabs: true,\\n      indentUnit: 2,\\n      tabSize: 2,\\n      value: \\\"\\\",\\n      mode: modes[mode] || {\\n        name: mode\\n      },\\n      readOnly: readonly,\\n      autoCloseBrackets: true,\\n      autoCloseTags: true\\n    };\\n\\n    if (!tab)\\n      opts.extraKeys = {\\n        Tab: tab,\\n        \\\"Shift-Tab\\\": tab\\n      };\\n\\n    // Creating a text editor is a lot of work, so we yield\\n    // the main thread for a moment. This helps reduce jank\\n    if (first) await sleep(50);\\n\\n    if (destroyed) return;\\n\\n    editor = CodeMirror.fromTextArea(refs.editor, opts);\\n\\n    editor.on(\\\"change\\\", instance => {\\n      if (!updating_externally) {\\n        const value = instance.getValue();\\n        dispatch(\\\"change\\\", { value });\\n      }\\n    });\\n\\n    if (first) await sleep(50);\\n    editor.refresh();\\n\\n    first = false;\\n  }\\n\\n  function sleep(ms) {\\n    return new Promise(fulfil => setTimeout(fulfil, ms));\\n  }\\n</script>\\n\\n<style>\\n  textarea {\\n    visibility: hidden;\\n  }\\n\\n  pre {\\n    position: absolute;\\n    width: 100%;\\n    height: 100%;\\n    top: 0;\\n    left: 0;\\n    border: none;\\n    padding: 4px 4px 4px 60px;\\n    resize: none;\\n    font-family: var(--font-mono);\\n    font-size: 13px;\\n    line-height: 1.7;\\n    user-select: none;\\n    pointer-events: none;\\n    color: #ccc;\\n    tab-size: 2;\\n    -moz-tab-size: 2;\\n  }\\n</style>\\n\\n<textarea tabindex=\\\"0\\\" bind:this={refs.editor} readonly value={code} />\\n{#if !CodeMirror}\\n  <pre>{code}</pre>\\n{/if}\\n\"],\"names\":[],\"mappings\":\"AAuME,QAAQ,eAAC,CAAC,AACR,UAAU,CAAE,MAAM,AACpB,CAAC,AAED,GAAG,eAAC,CAAC,AACH,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CACzB,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,IAAI,WAAW,CAAC,CAC7B,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,GAAG,CAChB,WAAW,CAAE,IAAI,CACjB,cAAc,CAAE,IAAI,CACpB,KAAK,CAAE,IAAI,CACX,QAAQ,CAAE,CAAC,CACX,aAAa,CAAE,CAAC,AAClB,CAAC\"}"
};

const is_browser = typeof window !== "undefined";

let codemirror_promise;
let _CodeMirror;

if (is_browser) {
  codemirror_promise = import('codemirror');

  codemirror_promise.then(mod => {
    _CodeMirror = mod.default;
  });
}

function sleep(ms) {
  return new Promise(fulfil => setTimeout(fulfil, ms));
}

const CodeMirror_1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	const dispatch = createEventDispatcher();

  let { code = "", readonly = false, errorLoc = null, flex = false, lineNumbers = true, tab = true } = $$props;

  let w;
  let h;
  let mode;

  // We have to expose set and update methods, rather
  // than making this state-driven through props,
  // because it's difficult to update an editor
  // without resetting scroll otherwise
  async function set(new_code, new_mode) {
    if (new_mode !== mode) {
      await createEditor((mode = new_mode));
    }

    code = new_code;
    updating_externally = true;
    if (editor) editor.setValue(code);
    updating_externally = false;
  }

  function update(new_code) {
    code = new_code;

    if (editor) {
      const { left, top } = editor.getScrollInfo();
      editor.setValue((code = new_code));
      editor.scrollTo(left, top);
    }
  }

  function resize() {
    editor.refresh();
  }

  function focus() {
    editor.focus();
  }

  const modes = {
    js: {
      name: "javascript",
      json: false
    },
    json: {
      name: "javascript",
      json: true
    },
    svelte: {
      name: "handlebars",
      base: "text/html"
    }
  };

  const refs = {};
  let editor;
  let updating_externally = false;
  let marker;
  let error_line;
  let destroyed = false;
  let CodeMirror;

  let previous_error_line;

  onMount(() => {
    if (_CodeMirror) {
      CodeMirror = _CodeMirror;
      createEditor(mode || "svelte").then(() => {
        if (editor) editor.setValue(code || "");
      });
    } else {
      codemirror_promise.then(async mod => {
        CodeMirror = mod.default;
        await createEditor(mode || "svelte");
        if (editor) editor.setValue(code || "");
      });
    }

    return () => {
      destroyed = true;
      if (editor) editor.toTextArea();
    };
  });

  let first = true;

  async function createEditor(mode) {
    if (destroyed || !CodeMirror) return;

    if (editor) editor.toTextArea();

    const opts = {
      lineNumbers,
      lineWrapping: true,
      indentWithTabs: true,
      indentUnit: 2,
      tabSize: 2,
      value: "",
      mode: modes[mode] || {
        name: mode
      },
      readOnly: readonly,
      autoCloseBrackets: true,
      autoCloseTags: true
    };

    if (!tab)
      opts.extraKeys = {
        Tab: tab,
        "Shift-Tab": tab
      };

    // Creating a text editor is a lot of work, so we yield
    // the main thread for a moment. This helps reduce jank
    if (first) await sleep(50);

    if (destroyed) return;

    editor = CodeMirror.fromTextArea(refs.editor, opts);

    editor.on("change", instance => {
      if (!updating_externally) {
        const value = instance.getValue();
        dispatch("change", { value });
      }
    });

    if (first) await sleep(50);
    editor.refresh();

    first = false;
  }

	if ($$props.code === void 0 && $$bindings.code && code !== void 0) $$bindings.code(code);
	if ($$props.readonly === void 0 && $$bindings.readonly && readonly !== void 0) $$bindings.readonly(readonly);
	if ($$props.errorLoc === void 0 && $$bindings.errorLoc && errorLoc !== void 0) $$bindings.errorLoc(errorLoc);
	if ($$props.flex === void 0 && $$bindings.flex && flex !== void 0) $$bindings.flex(flex);
	if ($$props.lineNumbers === void 0 && $$bindings.lineNumbers && lineNumbers !== void 0) $$bindings.lineNumbers(lineNumbers);
	if ($$props.tab === void 0 && $$bindings.tab && tab !== void 0) $$bindings.tab(tab);
	if ($$props.set === void 0 && $$bindings.set && set !== void 0) $$bindings.set(set);
	if ($$props.update === void 0 && $$bindings.update && update !== void 0) $$bindings.update(update);
	if ($$props.resize === void 0 && $$bindings.resize && resize !== void 0) $$bindings.resize(resize);
	if ($$props.focus === void 0 && $$bindings.focus && focus !== void 0) $$bindings.focus(focus);

	$$result.css.add(css);

	if (editor && w && h) {
        editor.refresh();
      }
	{
        if (marker) marker.clear();
    
        if (errorLoc) {
          const line = errorLoc.line - 1;
          const ch = errorLoc.column;
    
          marker = editor.markText(
            { line, ch },
            { line, ch: ch + 1 },
            {
              className: "error-loc"
            }
          );
    
          error_line = line;
        } else {
          error_line = null;
        }
      }
	if (editor) {
        if (previous_error_line != null) {
          editor.removeLineClass(previous_error_line, "wrap", "error-line");
        }
    
        if (error_line && error_line !== previous_error_line) {
          editor.addLineClass(error_line, "wrap", "error-line");
          previous_error_line = error_line;
        }
      }

	return `<textarea tabindex="0" readonly class="svelte-1jpkv2x" ${(v => v ? ("this" + (v === true ? "" : "=" + JSON.stringify(v))) : "")(refs.editor)}>${escape(code)}</textarea>
	${ !CodeMirror ? `<pre class="svelte-1jpkv2x">${escape(code)}</pre>` : `` }`;
});

export default CodeMirror_1;
