import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

export function Preview({ content }: { content: string }) {
  return (
    <div className="h-full overflow-y-auto">
      <article className="prose-muse mx-auto max-w-3xl px-8 py-10">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
