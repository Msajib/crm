'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Code 
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  minHeight = 120
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  // Set initial content once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []); // only on mount

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = () => {
    if (!isComposing.current && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const isActive = (command: string) => {
    try { return document.queryCommandState(command); } catch { return false; }
  };

  const toolbarItems = [
    { icon: Bold,        cmd: 'bold',        title: 'Bold' },
    { icon: Italic,      cmd: 'italic',      title: 'Italic' },
    { icon: Underline,   cmd: 'underline',   title: 'Underline' },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-muted/30">
      <div className="rte-toolbar flex flex-wrap gap-0.5 p-1 bg-muted border-b border-border">
        {toolbarItems.map(({ icon: Icon, cmd, title }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            onMouseDown={e => { e.preventDefault(); exec(cmd); }}
            className={`rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors ${isActive(cmd) ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1 self-center" />
        <button type="button" title="Heading 2" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<h2>'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground"><Heading2 className="w-3.5 h-3.5" /></button>
        <button type="button" title="Heading 3" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<h3>'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground"><Heading3 className="w-3.5 h-3.5" /></button>
        <button type="button" title="Paragraph" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<p>'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground text-xs font-bold">P</button>
        <div className="w-px h-4 bg-border mx-1 self-center" />
        <button type="button" title="Bullet List" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground"><List className="w-3.5 h-3.5" /></button>
        <button type="button" title="Numbered List" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground"><ListOrdered className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-border mx-1 self-center" />
        <button type="button" title="Align Left" onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" title="Align Center" onMouseDown={e => { e.preventDefault(); exec('justifyCenter'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" title="Align Right" onMouseDown={e => { e.preventDefault(); exec('justifyRight'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground"><AlignRight className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-border mx-1 self-center" />
        <button type="button" title="Code" onMouseDown={e => { e.preventDefault(); exec('formatBlock', '<pre>'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-primary/10 text-muted-foreground"><Code className="w-3.5 h-3.5" /></button>
        <button type="button" title="Clear Formatting" onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }} className="rte-toolbar-btn p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 text-xs font-black">✕</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
        data-placeholder={placeholder}
        className="rte-content p-4 text-body text-foreground focus:outline-none overflow-y-auto"
        style={{ minHeight }}
      />
    </div>
  );
}
