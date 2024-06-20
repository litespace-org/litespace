import React, { useCallback, useRef, useState } from "react";
import { Button } from "../Button";

export const TextEditor: React.FC = () => {
  const [content, setContent] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const onChange = useCallback(() => {
    if (!editorRef || !editorRef.current) return;
    console.log("here...");
    setContent(editorRef.current.innerHTML);
  }, []);

  const execCommand = useCallback((command: string) => {
    document.execCommand(command, false);
  }, []);

  const toggleStyles = useCallback((command: string) => {
    document.execCommand(command, false);
  }, []);

  console.log({ content });

  return (
    <div>
      <div
        dir="rtl"
        className="block ui-border focus:ui-outline-none focus:ui-ring-2 ui-rounded-md ui-p-2"
        contentEditable
        ref={editorRef}
        onInput={onChange}
      />

      <div className="ui-flex ui-gap-3">
        <Button onClick={() => toggleStyles("bold")}>Bold</Button>
        <Button onClick={() => toggleStyles("italic")}>Italic</Button>
        <Button onClick={() => toggleStyles("underline")}>Underline</Button>
        <Button onClick={() => execCommand("insertUnorderedList")}>
          Bullet Points
        </Button>
      </div>
    </div>
  );
};
