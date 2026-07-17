import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";

const museTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    fontSize: "14px",
  },
  ".cm-scroller": {
    fontFamily:
      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
    lineHeight: "1.6",
    padding: "20px 8px",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.25)",
  },
  ".cm-activeLine": { backgroundColor: "rgba(198,255,61,0.04)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
  ".cm-cursor": { borderLeftColor: "#c6ff3d" },
  ".cm-selectionBackground": {
    backgroundColor: "rgba(198,255,61,0.15) !important",
  },
});

export function Editor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="h-full overflow-hidden">
      <CodeMirror
        value={value}
        theme={oneDark}
        extensions={[markdown(), museTheme, EditorView.lineWrapping]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          autocompletion: false,
        }}
        height="100%"
        style={{ height: "100%" }}
      />
    </div>
  );
}
