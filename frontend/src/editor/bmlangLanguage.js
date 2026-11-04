export const LANGUAGE_ID = 'bmlang';
export const THEME_ID = 'bmlang-dark';

const KEYWORDS = ['DEC', 'MAIN', 'READ', 'WRITE', 'IF', 'ELSE', 'WHILE', 'FOR'];

let registered = false;

/** Registra el lenguaje BMLang (tokens Monarch + tema). Idempotente. */
export function registerBmlang(monaco) {
  if (registered) return;
  registered = true;

  monaco.languages.register({ id: LANGUAGE_ID, extensions: ['.bml'] });

  monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
    keywords: KEYWORDS,
    tokenizer: {
      root: [
        // bmlang.l exige que el comentario cierre en la misma línea: sin "!#" se marca inválido.
        [/#!.*?!#/, 'comment'],
        [/#!.*$/, 'invalid'],
        [/\$[a-zA-Z_]\w*/, 'variable'],
        [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
        [/\d+/, 'number'],
        [/=>|<=|>=|==|<>|!=|&&|\|\|/, 'operator'],
        [/[+\-*/:<>]/, 'operator'],
        [/[{}()]/, '@brackets'],
        [/[;,]/, 'delimiter'],
        [/\s+/, 'white'],
        [/./, 'invalid'],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
    comments: { blockComment: ['#!', '!#'] },
    brackets: [['{', '}'], ['(', ')']],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '(', close: ')' },
    ],
  });

  monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      return {
        suggestions: KEYWORDS.map((k) => ({
          label: k,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: k,
          range,
        })),
      };
    },
  });

  monaco.editor.defineTheme(THEME_ID, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '4FD1A5', fontStyle: 'bold' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'number', foreground: 'E5C07B' },
      { token: 'operator', foreground: 'F2A65A' },
      { token: 'comment', foreground: '6A8F80', fontStyle: 'italic' },
      { token: 'delimiter', foreground: 'A0A8B0' },
      { token: 'identifier', foreground: 'D4D4D4' },
      { token: 'invalid', foreground: 'FF6B6B', fontStyle: 'underline' },
    ],
    colors: {
      'editor.background': '#14181B',
      'editor.lineHighlightBackground': '#1C2226',
      'editorLineNumber.foreground': '#4A5560',
      'editorLineNumber.activeForeground': '#4FD1A5',
      'editorCursor.foreground': '#4FD1A5',
      'editor.selectionBackground': '#0B4F3A88',
      'editorGutter.background': '#14181B',
    },
  });
}
