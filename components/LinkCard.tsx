
import React from 'react';
import { LinkItem } from '../types';

interface LinkCardProps {
  link: LinkItem;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  isHighlighted?: boolean;
  theme: 'dark' | 'light' | 'oled' | 'cute';
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onDelete, onTagClick, isHighlighted, theme }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDeleting) return;
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(link.id);
    setIsDeleting(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(false);
  };

  const cardStyles = {
    dark: 'bg-slate-900/30 border-slate-800/40 hover:border-slate-700/60',
    light: 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm',
    oled: 'bg-black border-zinc-900 hover:border-zinc-800',
    cute: 'bg-white border-rose-100 hover:border-rose-300 shadow-sm shadow-rose-500/5'
  };

  const textStyles = {
    dark: 'text-slate-100',
    light: 'text-slate-900',
    oled: 'text-white',
    cute: 'text-rose-900'
  };

  return (
    <div 
      data-id={link.id}
      data-highlighted={isHighlighted}
      onClick={handleCardClick}
      className={`border cursor-pointer relative ${isHighlighted ? 'border-indigo-500 ring-4 ring-indigo-500/10 scale-[1.02]' : cardStyles[theme]} rounded-[2rem] p-7 transition-all group flex flex-col h-full overflow-hidden`}
    >
      {/* Delete Confirmation Overlay */}
      {isDeleting && (
        <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md ${theme === 'light' ? 'bg-white/95' : 'bg-slate-950/95'}`}>
          <div className="mb-4 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
             <i className="fas fa-trash-can text-red-500 text-xs"></i>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Archive this item?</p>
          <div className="flex gap-2">
            <button onClick={confirmDelete} className="bg-red-500 text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Delete</button>
            <button onClick={cancelDelete} className="bg-slate-200 text-slate-700 text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl hover:bg-slate-300 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-4 mb-4">
        <div className={`${textStyles[theme]} group-hover:text-indigo-500 font-bold text-sm leading-snug line-clamp-2 transition-colors`}>
          {link.title}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsDeleting(true); }}
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all opacity-20 hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}
          title="Delete"
        >
          <i className="fas fa-trash-can text-[10px]"></i>
        </button>
      </div>

      <p className={`text-[10px] mb-6 line-clamp-3 leading-relaxed flex-1 font-medium ${theme === 'light' ? 'text-slate-500' : theme === 'cute' ? 'text-rose-300' : 'text-slate-500'}`}>
        {link.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {link.tags.map((tag, idx) => (
          <span 
            key={idx} 
            onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
            className={`px-2.5 py-1 rounded-lg text-[8px] uppercase tracking-widest font-black transition-all ${theme === 'cute' ? 'bg-rose-50 text-rose-400 border border-rose-100 hover:bg-rose-100' : 'bg-slate-500/5 text-slate-500 border border-transparent hover:border-slate-500/20 hover:text-indigo-500'}`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className={`flex items-center justify-between mt-auto pt-5 border-t ${theme === 'light' ? 'border-slate-100' : 'border-slate-800/30'}`}>
        <span className="text-[8px] text-slate-400 truncate flex-1 pr-4 uppercase tracking-[0.1em] font-black opacity-60">
          {new URL(link.url).hostname}
        </span>
        <span className="text-[8px] text-slate-400 font-black opacity-30">
          {new Date(link.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default LinkCard;
