import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Archive, ArrowLeft, ChevronDown, Download, File, FileImage, FileText, Folder, HardDrive, MoreHorizontal, Search, ShieldCheck, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildStoredFile, getStoredFiles, saveFiles, type StoredFile } from '@/lib/fileStorage';

const initialFiles: StoredFile[] = [];

const folders = ['All files', 'Shared with me', 'Design assets', 'Projects', 'Archives'];

const Vaultline = () => {
  const [activeFolder, setActiveFolder] = useState('All files');
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<StoredFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [filesLoaded, setFilesLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    getStoredFiles().then((storedFiles) => {
      if (!isMounted) return;
      if (storedFiles.length > 0) {
        setFiles(storedFiles);
      }
      setFilesLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!filesLoaded) return;
    void saveFiles(files).catch(() => undefined);
  }, [files, filesLoaded]);

  const visibleFiles = useMemo(() => files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase())), [files, query]);
  const totalStorageUsed = 48;

  const iconFor = (icon: StoredFile['icon']) => icon === 'image' ? <FileImage size={19} /> : icon === 'archive' ? <Archive size={19} /> : icon === 'text' ? <FileText size={19} /> : <File size={19} />;

  const addFiles = async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return;

    setUploading(true);

    try {
      const uploaded = await Promise.all(Array.from(selectedFiles).map(async (file) => {
        const metadata = buildStoredFile(file);

        return metadata;
      }));

      setFiles((current) => [...uploaded, ...current]);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      window.setTimeout(() => setUploading(false), 500);
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); void addFiles(event.dataTransfer.files); };
  const onChange = (event: ChangeEvent<HTMLInputElement>) => void addFiles(event.target.files);
  const downloadFile = (file: StoredFile) => {
    if (!file.data) return;
    const url = URL.createObjectURL(file.data);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="vaultline-page">
      <aside className="vaultline-sidebar">
        <Link className="vaultline-brand" to="/">
          <span>V</span> Vaultline
        </Link>

        <button type="button" className="vaultline-upload" onClick={() => inputRef.current?.click()}>
          <Upload size={16} /> Upload files
        </button>

        <nav className="vaultline-nav">
          {folders.map((folder, index) => (
            <button
              key={folder}
              type="button"
              className={activeFolder === folder ? 'active' : ''}
              onClick={() => setActiveFolder(folder)}
            >
              {index === 0 ? <HardDrive size={16} /> : <Folder size={16} />}
              {folder}
            </button>
          ))}
        </nav>

        <div className="vaultline-sidebar-bottom">
          <div className="vaultline-storage">
            <div>
              <span>Storage</span>
              <strong>24.1 GB <small>of 50 GB</small></strong>
            </div>
            <div className="vaultline-progress"><i style={{ width: `${totalStorageUsed}%` }} /></div>
            <p>{totalStorageUsed}% used</p>
          </div>

          <div className="vaultline-secure">
            <ShieldCheck size={16} /> End-to-end encrypted
          </div>
        </div>
      </aside>

      <section className="vaultline-main">
        <header className="vaultline-topbar">
          <div className="vaultline-mobile-brand">
            <Link to="/">
              <ArrowLeft size={16} /> Vaultline
            </Link>
          </div>

          <div className="vaultline-user">
            <span className="vaultline-avatar">OM</span>
            <span>One Media</span>
            <ChevronDown size={14} />
          </div>
        </header>

        <div className="vaultline-content">
          <div className="vaultline-hero-panel">
            <div className="vaultline-hero-copy">
              <p className="vaultline-kicker">Personal workspace</p>
              <h1>{activeFolder}</h1>
              <p>Keep your important files close, clear, and protected.</p>
            </div>

            <div className="vaultline-metrics">
              <div className="vaultline-metric">
                <span>Files</span>
                <strong>{files.length}</strong>
              </div>
              <div className="vaultline-metric">
                <span>Shared</span>
                <strong>12</strong>
              </div>
              <div className="vaultline-metric">
                <span>Encrypted</span>
                <strong>100%</strong>
              </div>
            </div>
          </div>

          <div className="vaultline-heading">
            <div>
              <p className="vaultline-kicker">Workspace overview</p>
              <h2>Recent files</h2>
            </div>
            <button type="button" className="vaultline-new-folder">
              <Folder size={15} /> New folder
            </button>
          </div>

          <div className="vaultline-toolbar">
            <label>
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files" />
            </label>
            <button type="button" aria-label="More file options">
              <MoreHorizontal size={19} />
            </button>
          </div>

          <div
            className={uploading ? 'vaultline-dropzone uploading' : 'vaultline-dropzone'}
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" multiple onChange={onChange} />
            <div className="vaultline-drop-icon"><Upload size={21} /></div>
            <div>
              <strong>{uploading ? 'Adding your files...' : 'Drop files here or browse'}</strong>
              <span>Saved in this browser</span>
            </div>
          </div>

          <div className="vaultline-table-head">
            <span>Name</span>
            <span>Last modified</span>
            <span>Size</span>
            <span>Actions</span>
          </div>

          <div className="vaultline-files">
            {visibleFiles.map((file) => (
              <article className="vaultline-file" key={file.id}>
                <div className="vaultline-file-name">
                  <span className={`vaultline-file-icon ${file.icon}`}>{iconFor(file.icon)}</span>
                  <div>
                    <strong>{file.name}</strong>
                    <small>{file.type}</small>
                  </div>
                </div>
                <span>{file.updated}</span>
                <span>{file.size}</span>
                <button type="button" aria-label={`Download ${file.name}`} onClick={() => downloadFile(file)}>
                  <Download size={17} />
                </button>
              </article>
            ))}
          </div>

          {visibleFiles.length === 0 && (
            <div className="vaultline-empty">
              <Search size={22} />
              <strong>No files found</strong>
              <p>Try a different keyword or upload a file.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Vaultline;
