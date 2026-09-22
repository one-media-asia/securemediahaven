import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, LayoutGrid, List,
  Plus, X, Search, Target, Zap, Brain, Lightbulb, ChevronRight
} from 'lucide-react';

type Board = {
  id: string;
  name: string;
  type: 'list' | 'board' | 'focus';
  category: string;
  description: string;
  color: string;
  icon: React.ReactNode;
};

const flowboards: Board[] = [
  {
    id: 'daily-standup',
    name: 'Daily Standup',
    type: 'list',
    category: 'work',
    description: 'Three things today: what you did, what you\'re doing, what\'s blocking you.',
    color: 'flow-coral',
    icon: <List size={20} />,
  },
  {
    id: 'project-tracker',
    name: 'Project Tracker',
    type: 'board',
    category: 'work',
    description: 'Kanban-style board for active projects. Move items from backlog to done.',
    color: 'flow-blue',
    icon: <LayoutGrid size={20} />,
  },
  {
    id: 'focus-mode',
    name: 'Focus Mode',
    type: 'focus',
    category: 'productivity',
    description: 'Pomodoro-style timer with task list. Work in 25-minute sprints with 5-minute breaks.',
    color: 'flow-mint',
    icon: <Target size={20} />,
  },
  {
    id: 'inbox',
    name: 'Inbox Zero',
    type: 'list',
    category: 'productivity',
    description: 'Capture everything that pops into your head. Process it later — don\'t let it clutter your mind.',
    color: 'flow-yellow',
    icon: <Brain size={20} />,
  },
  {
    id: 'habit-tracker',
    name: 'Habit Tracker',
    type: 'list',
    category: 'lifestyle',
    description: 'Track daily habits and build streaks. Water, exercise, reading, meditation — whatever matters to you.',
    color: 'flow-green',
    icon: <Zap size={20} />,
  },
  {
    id: 'idea-incubator',
    name: 'Idea Incubator',
    type: 'board',
    category: 'creative',
    description: 'Capture ideas without pressure. Move them to active projects when they\'re ready.',
    color: 'flow-purple',
    icon: <Lightbulb size={20} />,
  },
];

const categories = ['All', 'work', 'productivity', 'lifestyle', 'creative'];

const Flowboard = () => {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, string[]>>({});
  const [newItem, setNewItem] = useState('');

  const visibleBoards = useMemo(() =>
    flowboards.filter((b) => {
      const matchCategory = category === 'All' || b.category === category;
      const matchSearch = !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    }),
    [category, search]
  );

  const addItem = (boardId: string) => {
    if (!newItem.trim()) return;
    setItems((prev) => ({
      ...prev,
      [boardId]: [...(prev[boardId] || []), newItem.trim()],
    }));
    setNewItem('');
  };

  const removeItem = (boardId: string, index: number) => {
    setItems((prev) => ({
      ...prev,
      [boardId]: prev[boardId].filter((_, i) => i !== index),
    }));
  };

  const toggleComplete = (boardId: string, index: number) => {
    setItems((prev) => {
      const current = prev[boardId] || [];
      const updated = current.map((item, i) =>
        i === index ? `${item} ✓` : item
      );
      return { ...prev, [boardId]: updated };
    });
  };

  return (
    <main className="flowboard-page">
      {/* Header */}
      <header className="flowboard-header">
        <Link className="flowboard-back" to="/">
          <ArrowLeft size={16} /> appfolk
        </Link>
        <div className="flowboard-logo">
          <span className="flowboard-logo-mark">⌁</span> Flowboard
        </div>
        <span className="flowboard-badge">Free</span>
      </header>

      {/* Hero */}
      <section className="flowboard-hero">
        <div>
          <p className="eyebrow">Your command center</p>
          <h1>
            One place for<br />
            <em>everything that matters.</em>
          </h1>
          <p className="flowboard-intro">
            Flowboard is a lightweight workspace for projects, daily tasks, ideas, and
            habits. No bloat. No complex setup. Just a clean board to organize your day.
          </p>
        </div>
        <div className="flowboard-hero-card">
          <Target size={32} />
          <strong>Start here</strong>
          <span>Pick a board from the library below and begin adding items.</span>
        </div>
      </section>

      {/* Board Library */}
      <section className="flowboard-library">
        <div className="flowboard-section-head">
          <div>
            <p className="eyebrow">Board library</p>
            <h2>Choose your<br /><em>focus area.</em></h2>
          </div>
          <div className="flowboard-search-box">
            <Search size={16} className="flowboard-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search boards..."
              className="flowboard-search-input"
            />
          </div>
        </div>

        <div className="flowboard-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`flowboard-category ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flowboard-grid">
          {visibleBoards.map((board) => (
            <article
              key={board.id}
              className={`flowboard-card ${activeBoard === board.id ? 'active' : ''}`}
            >
              <div className={`flowboard-card-art ${board.color}`}>
                {board.icon}
                <span>{board.type}</span>
              </div>
              <div className="flowboard-card-body">
                <h3>{board.name}</h3>
                <p>{board.description}</p>
                <div className="flowboard-card-footer">
                  <span className={`flowboard-category-tag ${board.color}`}>
                    {board.category}
                  </span>
                  <button
                    className="flowboard-open-btn"
                    onClick={() => setActiveBoard(activeBoard === board.id ? null : board.id)}
                  >
                    {activeBoard === board.id ? 'Close' : 'Open'} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visibleBoards.length === 0 && (
          <div className="flowboard-empty">
            No boards match that search. Try a different category.
          </div>
        )}
      </section>

      {/* Active Board View */}
      {activeBoard && (
        <section className="flowboard-active">
          {(() => {
            const board = flowboards.find((b) => b.id === activeBoard);
            if (!board) return null;
            const boardItems = items[board.id] || [];

            return (
              <>
                <div className="flowboard-active-header">
                  <button
                    className="flowboard-back-mini"
                    onClick={() => setActiveBoard(null)}
                  >
                    <ArrowLeft size={14} /> Back to library
                  </button>
                  <div className={`flowboard-active-icon ${board.color}`}>
                    {board.icon}
                  </div>
                  <div>
                    <h2>{board.name}</h2>
                    <p>{board.description}</p>
                  </div>
                  <span className="flowboard-item-count">
                    {boardItems.length} item{boardItems.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flowboard-active-content">
                  {/* Input */}
                  <div className="flowboard-add-item">
                    <input
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addItem(board.id);
                      }}
                      placeholder={`Add to ${board.name}...`}
                      className="flowboard-item-input"
                    />
                    <button
                      className="flowboard-add-btn"
                      onClick={() => addItem(board.id)}
                      disabled={!newItem.trim()}
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>

                  {/* Items */}
                  {boardItems.length === 0 ? (
                    <div className="flowboard-empty-state">
                      <div className={`flowboard-empty-icon ${board.color}`}>
                        {board.icon}
                      </div>
                      <p>No items yet. Add your first one above.</p>
                    </div>
                  ) : (
                    <ul className="flowboard-item-list">
                      {boardItems.map((item, index) => {
                        const isComplete = item.endsWith(' ✓');
                        const cleanItem = isComplete ? item.slice(0, -2) : item;
                        return (
                          <li key={index} className={`flowboard-item ${isComplete ? 'complete' : ''}`}>
                            <button
                              className="flowboard-item-check"
                              onClick={() => toggleComplete(board.id, index)}
                              aria-label={isComplete ? 'Undo' : 'Complete'}
                            >
                              {isComplete ? <Check size={14} /> : <div className="flowboard-item-checkbox" />}
                            </button>
                            <span className="flowboard-item-text">{cleanItem}</span>
                            <button
                              className="flowboard-item-remove"
                              onClick={() => removeItem(board.id, index)}
                              aria-label="Remove"
                            >
                              <X size={12} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            );
          })()}
        </section>
      )}

      {/* Features */}
      <section className="flowboard-features">
        <div className="flowboard-features-grid">
          <div className="flowboard-feature">
            <List size={24} />
            <h3>Simple lists</h3>
            <p>Capture tasks, ideas, and notes in seconds. No complexity.</p>
          </div>
          <div className="flowboard-feature">
            <LayoutGrid size={24} />
            <h3>Board view</h3>
            <p>Organize items into columns for bigger projects.</p>
          </div>
          <div className="flowboard-feature">
            <Target size={24} />
            <h3>Focus mode</h3>
            <p>Timer + task list for deep work sessions.</p>
          </div>
          <div className="flowboard-feature">
            <Zap size={24} />
            <h3>Habit tracking</h3>
            <p>Build streaks and track daily routines.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flowboard-footer">
        <span>Flowboard by appfolk</span>
        <Link to="/">Back to appfolk <ArrowRight size={14} /></Link>
      </footer>
    </main>
  );
};

export default Flowboard;