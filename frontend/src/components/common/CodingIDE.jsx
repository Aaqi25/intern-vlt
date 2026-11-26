import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Terminal,
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCode,
  Send,
  Sparkles,
  Code2,
  Layers,
  Clock,
  Trash2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript (Node.js)', extension: 'js', defaultCode: '// Write your JavaScript solution here\nfunction solution(input) {\n  // Your code logic\n  return input;\n}\n' },
  { id: 'typescript', label: 'TypeScript', extension: 'ts', defaultCode: '// Write your TypeScript solution here\nfunction solution(input: any): any {\n  // Your code logic\n  return input;\n}\n' },
  { id: 'python', label: 'Python 3', extension: 'py', defaultCode: '# Write your Python solution here\ndef solution(input_data):\n    # Your code logic\n    return input_data\n' },
  { id: 'java', label: 'Java 17', extension: 'java', defaultCode: '// Write your Java solution here\nclass Solution {\n    public static Object solve(Object input) {\n        // Your code logic\n        return input;\n    }\n}\n' },
  { id: 'cpp', label: 'C++ 20', extension: 'cpp', defaultCode: '// Write your C++ solution here\n#include <iostream>\n#include <vector>\n\nauto solution(auto input) {\n    // Your code logic\n    return input;\n}\n' },
  { id: 'sql', label: 'PostgreSQL / SQL', extension: 'sql', defaultCode: '-- Write your SQL query here\nSELECT * \nFROM candidates\nWHERE status = \'Active\'\nORDER BY created_at DESC;\n' }
];

export const CodingIDE = ({
  initialCode = '',
  language = 'javascript',
  onCodeChange,
  onRun,
  onSubmitToInterviewer,
  testCases = [],
  questionTitle = 'Technical Problem',
  readOnly = false,
  isLiveInterview = false,
  className = ''
}) => {
  const [currentLang, setCurrentLang] = useState(language || 'javascript');
  const [code, setCode] = useState(initialCode || '');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('terminal'); // 'terminal' | 'tests'
  
  // Execution & Test states
  const [isRunning, setIsRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [executionMetrics, setExecutionMetrics] = useState(null);

  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // Sync initial code if provided from question boilerplate
  useEffect(() => {
    if (initialCode && initialCode !== code) {
      setCode(initialCode);
    } else if (!initialCode && !code) {
      const defaultLangConfig = SUPPORTED_LANGUAGES.find((l) => l.id === currentLang);
      if (defaultLangConfig) {
        setCode(defaultLangConfig.defaultCode);
      }
    }
  }, [initialCode]);

  const handleLanguageChange = (newLangId) => {
    setCurrentLang(newLangId);
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === newLangId);
    if (langConfig && (!code.trim() || code === SUPPORTED_LANGUAGES.find((l) => l.id === currentLang)?.defaultCode)) {
      setCode(langConfig.defaultCode);
      if (typeof onCodeChange === 'function') {
        onCodeChange(langConfig.defaultCode, newLangId);
      }
    } else if (typeof onCodeChange === 'function') {
      onCodeChange(code, newLangId);
    }
  };

  const handleCodeEdit = (newCode) => {
    setCode(newCode);
    if (typeof onCodeChange === 'function') {
      onCodeChange(newCode, currentLang);
    }
  };

  // Keyboard enhancements (Tab key indentation & Cmd/Ctrl + Enter to run)
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = editorRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const updatedVal = val.substring(0, start) + '  ' + val.substring(end);
      handleCodeEdit(updatedVal);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Run Code via Backend Docker Sandbox API (/api/v1/sandbox/execution/run)
  const runCode = async () => {
    if (!code.trim()) {
      setTerminalLogs([{ type: 'error', text: 'Error: Code editor is empty. Write a solution before running.' }]);
      setActiveBottomTab('terminal');
      return;
    }

    const sandboxLangMap = {
      python: 'python',
      javascript: 'javascript',
      cpp: 'cpp',
      java: 'java',
    };
    const sandboxLanguage = sandboxLangMap[currentLang];

    setIsRunning(true);
    setActiveBottomTab('terminal');
    setTerminalLogs([{ type: 'info', text: `Submitting ${currentLang.toUpperCase()} code to isolated Docker sandbox...` }]);

    const startTime = performance.now();

    try {
      if (!sandboxLanguage) {
        setTerminalLogs([
          { type: 'warn', text: `Language '${currentLang}' is not configured in the server Docker sandbox.` },
          { type: 'info', text: 'Supported sandbox runtimes: Python 3, JavaScript (Node.js), C++ 17, Java 17.' }
        ]);
        setExecutionMetrics({
          durationMs: Math.round(performance.now() - startTime),
          passedCases: 0,
          totalCases: testCases.length,
          status: 'Unsupported'
        });
        return;
      }

      const payload = {
        language: sandboxLanguage,
        source_code: code,
        stdin: '',
      };

      const res = await fetch('/api/v1/sandbox/execution/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || data?.message || `Sandbox returned HTTP ${res.status}`);
      }

      const durationMs = Math.max(1, Math.round(data.execution_time_ms || (performance.now() - startTime)));
      const verdict = data.verdict || 'INTERNAL_ERROR';
      const logs = [
        {
          type: verdict === 'ACCEPTED' ? 'success' : 'error',
          text: `Sandbox Verdict: ${verdict} (${durationMs}ms, exit code ${data.exit_code ?? 0})`
        }
      ];

      if (data.compile_error) {
        logs.push({ type: 'error', text: `Compile Error:\n${data.compile_error}` });
      }
      if (data.runtime_error) {
        logs.push({ type: 'error', text: `Runtime Error:\n${data.runtime_error}` });
      }
      if (data.stdout) {
        logs.push({ type: 'log', text: data.stdout });
      }
      if (data.stderr) {
        logs.push({ type: 'warn', text: data.stderr });
      }

      setTerminalLogs(logs);
      const passedCases = Array.isArray(data.test_case_results)
        ? data.test_case_results.filter((tc) => tc.verdict === 'ACCEPTED').length
        : (verdict === 'ACCEPTED' ? testCases.length : 0);

      setTestResults(
        Array.isArray(data.test_case_results)
          ? data.test_case_results.map((tc, idx) => ({
              caseIndex: idx + 1,
              input: testCases[idx]?.input ?? `Case ${tc.id}`,
              expected: '(hidden)',
              actual: tc.stdout || tc.stderr || tc.verdict,
              passed: tc.verdict === 'ACCEPTED',
            }))
          : []
      );

      const statusLabel = verdict === 'ACCEPTED' ? 'Accepted' : verdict.replace(/_/g, ' ');
      setExecutionMetrics({
        durationMs,
        passedCases,
        totalCases: testCases.length,
        status: statusLabel,
      });

      if (typeof onRun === 'function') {
        onRun({
          status: statusLabel,
          durationMs,
          code,
          language: currentLang,
          verdict,
          stdout: data.stdout || '',
          stderr: data.stderr || '',
        });
      }
    } catch (err) {
      console.error('Code execution error:', err);
      setTerminalLogs([
        { type: 'error', text: `Sandbox Error: ${err.message}` },
        { type: 'info', text: 'Verify that the Python Sandbox service (:8000) and Docker daemon are running.' }
      ]);
      setExecutionMetrics({
        durationMs: Math.round(performance.now() - startTime),
        passedCases: 0,
        totalCases: testCases.length,
        status: 'Error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset editor to initial template? Any unsaved edits will be discarded.')) {
      const defaultCode = initialCode || SUPPORTED_LANGUAGES.find((l) => l.id === currentLang)?.defaultCode || '';
      setCode(defaultCode);
      if (typeof onCodeChange === 'function') {
        onCodeChange(defaultCode, currentLang);
      }
      setTerminalLogs([{ type: 'info', text: 'Code editor reset to boilerplate template.' }]);
    }
  };

  const lineCount = Math.max(1, code.split('\n').length);
  const charCount = code.length;

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className={`bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl font-mono text-left transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl border-blue-500/50 shadow-2xl' : 'h-full min-h-[460px]'
      } ${className}`}
    >
      {/* Top IDE Toolbar */}
      <div className="h-12 bg-[#161b22] border-b border-white/10 px-4 flex items-center justify-between shrink-0 select-none">
        {/* Left: Window Dots & Language Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center space-x-2">
            <Code2 className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-[#0d1117] border border-white/15 rounded px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-500 transition-colors"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-[#161b22] text-white">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            solution.{SUPPORTED_LANGUAGES.find((l) => l.id === currentLang)?.extension || 'js'}
          </span>
        </div>

        {/* Right: Actions (Copy, Reset, Fullscreen, Run, Submit) */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Reset to boilerplate code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors hidden sm:inline"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <Button
            onClick={runCode}
            disabled={isRunning}
            size="xs"
            variant="primary"
            icon={Play}
            loading={isRunning}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 shadow-glow-blue"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          {isLiveInterview && typeof onSubmitToInterviewer === 'function' && (
            <Button
              onClick={() => onSubmitToInterviewer(code, currentLang)}
              size="xs"
              variant="secondary"
              icon={Send}
              className="bg-emerald-600 hover:bg-emerald-500 text-white border-none font-semibold text-xs px-3"
            >
              Submit Code
            </Button>
          )}
        </div>
      </div>

      {/* Center: Split Editor & Line Numbers */}
      <div className="flex-1 flex overflow-hidden relative bg-[#0d1117] min-h-[220px]">
        {/* Line Numbers Gutter */}
        <div className="w-11 bg-[#090d14] text-slate-600 text-right py-3 pr-2.5 select-none text-[11px] leading-[22px] border-r border-white/5 shrink-0 overflow-hidden">
          {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          ref={editorRef}
          value={code}
          onChange={(e) => handleCodeEdit(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="flex-1 p-3 bg-transparent text-emerald-300 font-mono text-xs leading-[22px] resize-none focus:outline-none selection:bg-blue-600/30 whitespace-pre overflow-auto"
          placeholder="// Type your implementation here..."
        />
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-[#161b22] border-t border-white/5 px-3 flex items-center justify-between text-[10px] text-slate-500 shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <span>Lines: {lineCount}</span>
          <span>Chars: {charCount}</span>
          <span className="text-emerald-500 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Sandbox Ready</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span>UTF-8</span>
          <span>•</span>
          <span>Press Cmd+Enter to Run</span>
        </div>
      </div>

      {/* Bottom Output / Test Cases Panel */}
      <div className="h-36 bg-[#090d14] border-t border-white/10 flex flex-col shrink-0 overflow-hidden">
        {/* Output Tabs Header */}
        <div className="h-8 bg-[#111620] border-b border-white/10 px-3 flex items-center justify-between shrink-0 text-xs select-none">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveBottomTab('terminal')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                activeBottomTab === 'terminal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>Console Output</span>
            </button>

            {testCases && testCases.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveBottomTab('tests')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  activeBottomTab === 'tests' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Test Cases ({testCases.length})</span>
                {executionMetrics && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    executionMetrics.passedCases === testCases.length ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {executionMetrics.passedCases}/{testCases.length}
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500">
            {executionMetrics && (
              <span className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>{executionMetrics.durationMs}ms</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setTerminalLogs([])}
              className="hover:text-slate-300 p-1"
              title="Clear terminal logs"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Tab Content: Console Logs */}
        {activeBottomTab === 'terminal' && (
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300 leading-relaxed select-text">
            {terminalLogs.length === 0 ? (
              <div className="text-slate-500 italic text-[11px] flex items-center space-x-1.5 py-2">
                <span>Execution sandbox ready. Write your solution and click "Run Code" (Cmd+Enter).</span>
              </div>
            ) : (
              terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={`leading-snug ${
                    log.type === 'error'
                      ? 'text-rose-400 font-semibold'
                      : log.type === 'success'
                        ? 'text-emerald-400 font-semibold'
                        : log.type === 'warn'
                          ? 'text-amber-400'
                          : 'text-slate-300'
                  }`}
                >
                  {log.text}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content: Test Cases Results */}
        {activeBottomTab === 'tests' && (
          <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs select-text">
            {testResults.length === 0 ? (
              <div className="text-slate-500 italic text-[11px] py-2">
                Click "Run Code" to execute tests against defined fixtures.
              </div>
            ) : (
              testResults.map((tr) => (
                <div
                  key={tr.caseIndex}
                  className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                    tr.passed
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200'
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {tr.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">Test Case {tr.caseIndex}:</span>{' '}
                      <span className="text-slate-400">Input: {tr.input}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Expected: </span>
                    <span className="font-semibold text-slate-200">{tr.expected}</span>
                    {!tr.passed && (
                      <span className="text-rose-400 ml-2">Got: {tr.actual}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodingIDE;
