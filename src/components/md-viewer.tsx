"use client";

import dynamic from "next/dynamic";

const UIWMDViewer = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

export default function MarkdownViewer({ source, style }: { source: string, style?: React.CSSProperties }) {
  return <UIWMDViewer source={source} style={style} />;
}
