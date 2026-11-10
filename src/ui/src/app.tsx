import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import "./app.css";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [notice, setNotice] = useState("");
  const [sql, setSql] = useState("");
  const [loading, setLoading] = useState(false);
  const [schemaText, setSchemaText] = useState("");
  const [schemaMessage, setSchemaMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setSchemaText("");
    setSchemaMessage("");
    setNotice("");
  }

  function dropFile(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setSchemaText("");
      setSchemaMessage("");
      setNotice("");
    }
  }

  async function handleUploadSchema() {
    if (!file) return;
    setUploading(true);
    setSchemaMessage("");
    const formData = new FormData();
    formData.append("schema", file);
    try {
      const response = await fetch("http://localhost:8000/upload-schema", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "Schema upload failed.");
      setSchemaText(result.schema_text);
      setSchemaMessage("Schema uploaded and ready to use.");
    } catch (error) {
      setSchemaMessage(error instanceof Error ? error.message : "Could not reach the SQL API.");
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    if (!question.trim()) {
      setNotice("Add a question in plain English to get started.");
      return;
    }
    if (file && !schemaText) {
      setNotice("Upload the selected schema file before generating SQL.");
      return;
    }
    setLoading(true);
    setNotice("");
    setSql("");
    const formData = new FormData();
    formData.append("question", question.trim());
    if (schemaText) formData.append("schema_text", schemaText);

    try {
      const response = await fetch("http://localhost:8000/generate-sql", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail ?? "Could not generate SQL.");
      setSql(result.sql);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not reach the SQL API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="main-area" id="home">
        <header className="topbar"><a className="brand" href="#home" aria-label="Query Studio home"><span className="brand-mark">Q</span><span>query<span className="brand-light">studio</span></span></a></header>
        <div className="content">
          <div className="intro"><div className="eyebrow"><span className="sparkle">✳</span> YOUR DATA, IN PLAIN ENGLISH</div><h1>Ask your data<br /><em>anything.</em></h1><p>Turn your questions into SQL. Start with a schema, then tell us what you want to know.</p></div>

          <div className="workspace-grid">
            <section className="panel schema-panel" id="data-source">
              <div className="panel-heading"><div className="step">01</div><div><h2>Add your schema</h2><p>Give us context about your database.</p></div></div>
              <button className={`dropzone ${file ? "has-file" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={dropFile} type="button">
                <span className="upload-icon">{file ? "✓" : "↑"}</span>
                {file ? <><strong>{file.name}</strong><span>Click to choose a different file</span></> : <><strong>Drop your schema file here</strong><span>or <b>browse files</b> to upload</span></>}
                <small>SQL, CSV, or TXT · up to 1 MB</small>
              </button>
              <input ref={inputRef} className="visually-hidden" type="file" accept=".sql,.csv,.txt" onChange={selectFile} />
              {file && <div className="upload-row"><button className="upload-button" type="button" onClick={handleUploadSchema} disabled={uploading || Boolean(schemaText)}>{uploading ? "Uploading…" : schemaText ? "Schema uploaded ✓" : "Upload schema ↑"}</button>{schemaMessage && <span className={schemaText ? "upload-success" : "upload-error"} role="status">{schemaMessage}</span>}</div>}
              <div className="schema-tip"><span>✦</span><p><strong>Good to know</strong><br />A schema file helps generate more accurate queries. You can add one later, too.</p></div>
            </section>

            <section className="panel question-panel" id="new-query">
              <div className="panel-heading"><div className="step">02</div><div><h2>Ask a question</h2><p>Describe what you want to find.</p></div></div>
              <label className="textarea-label" htmlFor="question">YOUR QUESTION</label>
              <textarea id="question" maxLength={500} value={question} onChange={(event) => { setQuestion(event.target.value); setNotice(""); }} placeholder="e.g. Which 10 customers spent the most last month?" />
              <div className="prompt-footer"><span>Be specific for the best results</span><span>{question.length}/500</span></div>
              <div className="suggestions"><span>Try asking</span><button onClick={() => setQuestion("Show me monthly revenue for this year")}>Monthly revenue</button><button onClick={() => setQuestion("Which products are low in stock?")}>Low stock</button></div>
              <button className="generate-button" onClick={handleGenerate} disabled={loading}><span>✳</span> {loading ? "Generating…" : "Generate SQL"} <span className="button-arrow">→</span></button>
              {notice && <p className="notice" role="status">{notice}</p>}
            </section>
          </div>

          <section className="result-panel"><div className="result-title"><div className="result-icon">⌁</div><div><h2>{sql ? "Generated SQL" : "Your SQL will appear here"}</h2><p>{sql ? "Review the query before using it." : "Generated queries are ready to review and copy."}</p></div></div>{sql ? <pre className="sql-output">{sql}</pre> : <div className="result-placeholder"><span>SELECT</span><span className="placeholder-line"/><span>FROM</span><span className="placeholder-line short"/><span>WHERE</span><span className="placeholder-line"/></div>}<div className="result-meta"><span><i /> {sql ? "Query generated" : "Waiting for your first question"}</span><button disabled={!sql} onClick={() => navigator.clipboard.writeText(sql)}>Copy SQL&nbsp; ↗</button></div></section>
        </div>
      </section>
    </main>
  );
}
