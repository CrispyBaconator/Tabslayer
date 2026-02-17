
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import LinkCard from './components/LinkCard';
import ChatInterface from './components/ChatInterface';
import { LinkItem } from './types';
import { generateLinkMetadata } from './services/geminiService';

type Theme = 'dark' | 'light' | 'oled' | 'cute';

const App: React.FC = () => {
  const [links, setLinks] = React.useState<LinkItem[]>([]);
  const [urlInput, setUrlInput] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [highlightedIds, setHighlightedIds] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  // Load persistence
  React.useEffect(() => {
    const savedLinks = localStorage.getItem('tabslayer_links_v2');
    const savedTheme = localStorage.getItem('tabslayer_theme') as Theme;
    if (savedLinks) {
      try {
        setLinks(JSON.parse(savedLinks));
      } catch (e) {
        console.error("Failed to parse saved links", e);
      }
    }
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Auto-save to localStorage
  React.useEffect(() => {
    localStorage.setItem('tabslayer_links_v2', JSON.stringify(links));
  }, [links]);

  React.useEffect(() => {
    localStorage.setItem('tabslayer_theme', theme);
  }, [theme]);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let finalUrl = urlInput.trim();
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }

    setIsAdding(true);
    try {
      const metadata = await generateLinkMetadata(finalUrl);
      const newLink: LinkItem = {
        id: uuidv4(),
        url: finalUrl,
        title: metadata.title || finalUrl,
        description: metadata.description || "Link saved successfully.",
        tags: metadata.tags || ["uncategorized"],
        createdAt: Date.now()
      };
      setLinks(prev => [newLink, ...prev]);
      setUrlInput('');
    } catch (err) {
      console.error("Failed to fetch metadata", err);
      const fallbackLink: LinkItem = {
        id: uuidv4(),
        url: finalUrl,
        title: finalUrl,
        description: "Metadata fetch failed.",
        tags: ["uncategorized"],
        createdAt: Date.now()
      };
      setLinks(prev => [fallbackLink, ...prev]);
      setUrlInput('');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag.toLowerCase());
  };

  const handleOpenApiKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setIsSettingsOpen(false);
    } else {
      alert("API Key selection is managed by the platform environment.");
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesTag = !selectedTag || link.tags.some(t => t.toLowerCase() === selectedTag);
    const matchesSearch = 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      link.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    links.forEach(l => l.tags.forEach(t => tags.add(t.toLowerCase())));
    return Array.from(tags).sort();
  }, [links]);

  const themeClasses = {
    dark: 'bg-slate-950 text-slate-100 border-slate-900',
    light: 'bg-slate-50 text-slate-900 border-slate-200',
    oled: 'bg-black text-white border-slate-900',
    cute: 'bg-rose-50 text-rose-900 border-rose-200'
  };

  const inputClasses = {
    dark: 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-700',
    light: 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400',
    oled: 'bg-zinc-950 border-zinc-900 text-white placeholder:text-zinc-800',
    cute: 'bg-white border-rose-100 text-rose-900 placeholder:text-rose-200'
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-inter relative ${themeClasses[theme]}`}>
      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-w-0">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5">
          {/* Header - Not Fixed */}
          <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="flex items-center justify-between w-full md:w-auto">
              <h1 className={`text-[10px] font-black tracking-[0.3em] uppercase opacity-60 ${theme === 'light' ? 'text-slate-900' : ''}`}>
                TabSlayer
              </h1>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`md:hidden p-2 rounded-lg transition-colors ${theme === 'light' ? 'hover:bg-slate-200' : 'hover:bg-slate-900'}`}
              >
                <i className="fas fa-sliders text-xs"></i>
              </button>
            </div>

            <form onSubmit={handleAddLink} className="w-full md:max-w-lg">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Drop a link here..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={isAdding}
                  className={`w-full border rounded-2xl pl-12 pr-16 py-2.5 text-xs focus:outline-none transition-all shadow-sm ${inputClasses[theme]} ${theme === 'cute' ? 'focus:border-rose-300' : 'focus:border-indigo-500/50'}`}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500/30">
                  {isAdding ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-plus text-[10px]"></i>}
                </div>
                <button 
                  type="submit"
                  disabled={isAdding || !urlInput.trim()}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${theme === 'cute' ? 'bg-rose-400 text-white shadow-lg shadow-rose-400/20' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'} disabled:opacity-30`}
                >
                  {isAdding ? 'Adding' : 'Archive'}
                </button>
              </div>
            </form>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`hidden md:flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${theme === 'light' ? 'border-slate-200 hover:bg-slate-200 text-slate-400' : 'border-slate-800 hover:bg-slate-900 text-slate-600'}`}
            >
              <i className="fas fa-sliders text-xs"></i>
            </button>
          </header>

          {/* Filters */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-3 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : theme === 'cute' ? 'bg-rose-100/20 border-rose-100/50' : 'bg-slate-900/10 border-slate-900/40'}`}>
            <div className="flex-1 max-w-sm relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[10px]"></i>
              <input 
                type="text"
                placeholder="Filter vault..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full border rounded-xl py-2 pl-9 pr-4 text-[10px] focus:outline-none transition-colors ${inputClasses[theme]}`}
              />
            </div>

            <div className="flex items-center gap-4">
              <select 
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className={`border rounded-xl py-2 px-4 text-[10px] focus:outline-none cursor-pointer appearance-none min-w-[140px] font-black tracking-widest uppercase ${inputClasses[theme]}`}
              >
                <option value="">All Tags</option>
                {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div className={`h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-[3rem] transition-all ${theme === 'light' ? 'border-slate-200 text-slate-300' : theme === 'cute' ? 'border-rose-100 text-rose-200' : 'border-slate-900/50 text-slate-800'}`}>
              <i className="fas fa-box-open text-3xl mb-4 opacity-20"></i>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Archive Empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
              {filteredLinks.map(link => (
                <LinkCard 
                  key={link.id} 
                  link={link} 
                  onDelete={deleteLink} 
                  onTagClick={handleTagClick}
                  isHighlighted={highlightedIds.includes(link.id)}
                  theme={theme}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Gemini Trigger */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-8 right-8 z-[60] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 ${theme === 'cute' ? 'bg-rose-400 border-rose-50 text-white shadow-rose-200' : 'bg-indigo-600 border-slate-950 text-white shadow-indigo-600/30'} ${isChatOpen ? 'rotate-90 opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <i className="fas fa-brain text-xl"></i>
      </button>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border ${theme === 'light' ? 'bg-white border-slate-200' : theme === 'cute' ? 'bg-rose-50 border-rose-200' : 'bg-slate-900 border-slate-800 text-white'}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Preferences</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-500 hover:text-red-400 p-2">
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Visual Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['dark', 'light', 'oled', 'cute'] as Theme[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${theme === t ? (t === 'cute' ? 'bg-rose-400 text-white border-rose-300 shadow-lg shadow-rose-400/20' : 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20') : (theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700')}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-800/20">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Engine Control</label>
                <button 
                  onClick={handleOpenApiKeyDialog}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 text-slate-400'}`}
                >
                  <span>Link API Key</span>
                  <i className="fas fa-key text-[8px] opacity-40"></i>
                </button>
                <p className="mt-3 text-[8px] opacity-40 uppercase font-black tracking-tighter leading-relaxed">
                  Authentication is managed securely by the workspace environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Panel (Gemini Chat) */}
      <aside className={`fixed lg:static top-0 right-0 h-full z-50 lg:z-30 transition-all duration-500 ease-in-out border-l flex-shrink-0
        ${theme === 'light' ? 'bg-white border-slate-200' : theme === 'cute' ? 'bg-rose-50 border-rose-200' : 'bg-slate-950 border-slate-900'}
        ${isChatOpen ? 'w-full md:w-[400px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full lg:hidden'}
      `}>
        {isChatOpen && (
          <ChatInterface links={links} theme={theme} onHighlightLinks={(ids) => {
            setHighlightedIds(ids);
            const el = document.querySelector(`[data-id="${ids[0]}"]`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => setHighlightedIds([]), 8000);
          }} onToggle={() => setIsChatOpen(false)} />
        )}
      </aside>
    </div>
  );
};

export default App;
