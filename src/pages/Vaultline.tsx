import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import { Archive, ArrowLeft, ChevronDown, Download, File, FileImage, FileText, Folder, HardDrive, MoreHorizontal, Plus, Search, ShieldCheck, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';

type StoredFile = { name: string; type: string; size: string; updated: string; icon: 'image' | 'text' | 'archive' | 'file' };

const initialFiles: StoredFile[] = [
  { name: 'brand-guidelines.pdf', type: 'PDF document', size: '4.8 MB', updated: 'Today, 09:42', icon: 'text' },
  { name: 'homepage-final.png', type: 'Image', size: '2.1 MB', updated: 'Yesterday', icon: 'image' },
  { name: 'project-archive.zip', type: 'Archive', size: '18.4 MB', updated: 'Sep 12, 2026', icon: 'archive' },
  { name: 'content-plan.docx', type: 'Word document', size: '820 KB', updated: 'Sep 10, 2026', icon: 'text' },
  { name: 'meeting-notes.txt', type: 'Text file', size: '24 KB', updated: 'Sep 08, 2026', icon: 'file' },
];

const folders = ['All files', 'Shared with me', 'Design assets', 'Projects', 'Archives'];

const Vaultline = () => {
  const [activeFolder, setActiveFolder] = useState('All files');
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const visibleFiles = useMemo(() => files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase())), [files, query]);

  const iconFor = (icon: StoredFile['icon']) => icon === 'image' ? <FileImage size={19} /> : icon === 'archive' ? <Archive size={19} /> : icon === 'text' ? <FileText size={19} /> : <File size={19} />;
  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return;
    setUploading(true);
    const added = Array.from(selectedFiles).map((file) => ({ name: file.name, type: file.type || 'File', size: `${Math.max(1, Math.round(file.size / 1024))} KB`, updated: 'Just now', icon: file.type.startsWith('image/') ? 'image' as const : 'file' as const }));
    setFiles((current) => [...added, ...current]);
    window.setTimeout(() => setUploading(false), 500);
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); addFiles(event.dataTransfer.files); };
  const onChange = (event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files);

  return <main className="vaultline-page">
    <aside className="vaultline-sidebar"><Link className="vaultline-brand" to="/"><span>V</span> Vaultline</Link><button className="vaultline-upload" onClick={() => inputRef.current?.click()}><Plus size={16} /> Upload files</button><nav className="vaultline-nav">{folders.map((folder, index) => <button key={folder} className={activeFolder === folder ? 'active' : ''} onClick={() => setActiveFolder(folder)}>{index === 0 ? <HardDrive size={16} /> : <Folder size={16} />}{folder}</button>)}</nav><div className="vaultline-sidebar-bottom"><div className="vaultline-storage"><div><span>Storage</span><strong>24.1 GB <small>of 50 GB</small></strong></div><div className="vaultline-progress"><i /></div><p>48% used</p></div><div className="vaultline-secure"><ShieldCheck size={16} /> End-to-end encrypted</div></div></aside>
    <section className="vaultline-main"><header className="vaultline-topbar"><div className="vaultline-mobile-brand"><Link to="/"><ArrowLeft size={16} /> Vaultline</Link></div><div className="vaultline-user"><span className="vaultline-avatar">OM</span><span>One Media</span><ChevronDown size={14} /></div></header><div className="vaultline-content"><div className="vaultline-heading"><div><p className="vaultline-kicker">Personal workspace</p><h1>{activeFolder}</h1><p>Keep your important files close, clear, and protected.</p></div><button className="vaultline-new-folder"><Folder size={15} /> New folder</button></div><div className="vaultline-toolbar"><label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files" /></label><button aria-label="More file options"><MoreHorizontal size={19} /></button></div><div className={uploading ? 'vaultline-dropzone uploading' : 'vaultline-dropzone'} onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => inputRef.current?.click()}><input ref={inputRef} type="file" multiple onChange={onChange} /><div className="vaultline-drop-icon"><Upload size={21} /></div><div><strong>{uploading ? 'Adding your files...' : 'Drop files here or browse'}</strong><span>Up to 2 GB per file</span></div></div><div className="vaultline-table-head"><span>Name</span><span>Last modified</span><span>Size</span><span>Actions</span></div><div className="vaultline-files">{visibleFiles.map((file) => <article className="vaultline-file" key={file.name}><div className="vaultline-file-name"><span className={`vaultline-file-icon ${file.icon}`}>{iconFor(file.icon)}</span><div><strong>{file.name}</strong><small>{file.type}</small></div></div><span>{file.updated}</span><span>{file.size}</span><button aria-label={`Download ${file.name}`}><Download size={16} /></button></article>)}</div>{visibleFiles.length === 0 && <div className="vaultline-empty"><Search size={22} /><strong>No files found</strong><span>Try a different search.</span></div>}<div className="vaultline-footnote"><ShieldCheck size={15} /> Your files are encrypted at rest and in transit.</div></div></section>
  </main>;
};

export default Vaultline;
