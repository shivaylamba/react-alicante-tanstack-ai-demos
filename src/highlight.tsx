import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
// Only Prism-generated, escaped markup is inserted. Model code is never evaluated here.
export function Highlight({ code }: { code: string }) {
  return (
    <pre className="syntax">
      <code
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(code ?? "", Prism.languages.tsx, "tsx"),
        }}
      />
    </pre>
  );
}
