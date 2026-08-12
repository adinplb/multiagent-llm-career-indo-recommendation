import { useRef, useState } from "react";

export default function CvDropzone({ file, onFileChange }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    preventDefaults(e);
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length) onFileChange(files[0]);
  }

  function handleZoneClick(e) {
    if (e.target.closest("button")) return;
    inputRef.current?.click();
  }

  return (
    <section className="glass-card rounded-xl p-lg relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary-container rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-base flex items-center gap-sm">
        <span className="material-symbols-outlined text-secondary">upload_file</span>
        Curriculum Vitae
      </h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
        Upload your most recent CV in PDF format. Our AI agent will extract your skills and map them to SKKNI competencies.
      </p>
      <div
        className={`drop-zone rounded-lg p-xl flex flex-col items-center justify-center text-center cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low ${isDragOver ? "dragover" : ""}`}
        onClick={handleZoneClick}
        onDragEnter={(e) => { preventDefaults(e); setIsDragOver(true); }}
        onDragOver={preventDefaults}
        onDragLeave={(e) => { preventDefaults(e); setIsDragOver(false); }}
        onDrop={handleDrop}
      >
        <span className="material-symbols-outlined text-[48px] text-outline mb-sm">cloud_upload</span>
        <p className="font-body-md text-body-md font-semibold text-on-surface mb-xs">
          {file ? file.name : "Drag and drop your file here"}
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">or click to browse from your computer</p>
        <button
          type="button"
          className="bg-surface text-on-surface border border-outline-variant font-body-sm text-body-sm px-md py-sm rounded-lg hover:bg-surface-container transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          Select File
        </button>
        <p className="font-label-caps text-label-caps text-outline-variant mt-sm">PDF only, up to 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files.length && onFileChange(e.target.files[0])}
        />
      </div>
    </section>
  );
}
