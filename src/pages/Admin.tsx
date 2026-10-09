import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, BarChart3, Clock3, MousePointer2, RefreshCw, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getClickEvents, type ClickEvent } from '@/lib/clickTracking';
import { addManagedUser, deleteManagedUser, getManagedUsers, toggleManagedUser, type ManagedUser } from '@/lib/userControl';
import { clearInputActivity, getInputActivity, type TypedInputEvent } from '@/lib/inputMonitoring';

const formatTime = (timestamp: string) => new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
const formatDate = (timestamp: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(timestamp));

const Admin = () => {
  const [events, setEvents] = useState<ClickEvent[]>([]);
  const [range, setRange] = useState('7 days');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [typedEntries, setTypedEntries] = useState<TypedInputEvent[]>([]);
  const [draft, setDraft] = useState({ name: '', email: '', plan: 'Starter' as ManagedUser['plan'], role: 'user' as ManagedUser['role'] });

  const refreshUsers = () => setUsers(getManagedUsers());
  const refresh = () => {
    setEvents(getClickEvents());
    refreshUsers();
    setTypedEntries(getInputActivity());
  };
  useEffect(() => { refresh(); }, []);

  const pageCounts = useMemo(() => events.reduce<Record<string, number>>((counts, event) => {
    counts[event.page] = (counts[event.page] || 0) + 1;
    return counts;
  }, {}), [events]);
  const topPage = Object.entries(pageCounts).sort(([, a], [, b]) => b - a)[0];
  const toolEvents = events.filter((event) => event.kind === 'tool');
  const toolCounts = toolEvents.reduce<Record<string, number>>((counts, event) => {
    if (event.tool) counts[event.tool] = (counts[event.tool] || 0) + 1;
    return counts;
  }, {});
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toDateString();
    return { label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date), count: events.filter((event) => new Date(event.timestamp).toDateString() === key).length };
  }), [events]);
  const maxCount = Math.max(...days.map((day) => day.count), 1);
  const activeUsers = users.filter((user) => user.active).length;

  const handleAddUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.email.trim()) return;

    const nextUsers = addManagedUser({
      name: draft.name,
      email: draft.email,
      plan: draft.plan,
      role: draft.role,
      active: true,
    });

    setUsers(nextUsers);
    setDraft({ name: '', email: '', plan: 'Starter', role: 'user' });
  };

  const handleToggleUser = (email: string) => {
    const nextUsers = toggleManagedUser(email);
    setUsers(nextUsers);
  };

  const handleDeleteUser = (email: string) => {
    const nextUsers = deleteManagedUser(email);
    setUsers(nextUsers);
  };

  const handleClearInputActivity = () => {
    clearInputActivity();
    setTypedEntries([]);
  };

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/"><span>O</span> One Media</Link>
        <div className="admin-status"><span /><div><strong>Tracking active</strong><small>Browser-local events</small></div></div>
        <nav className="admin-nav"><a className="active" href="#overview"><BarChart3 size={16} /> Overview</a><a href="#events"><Activity size={16} /> Click events</a></nav>
        <div className="admin-sidebar-footer"><ShieldCheck size={15} /> Private by default</div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar"><Link to="/" className="admin-back"><ArrowLeft size={15} /> Back to site</Link><button type="button" className="admin-refresh" onClick={refresh}><RefreshCw size={15} /> Refresh</button></header>
        <div className="admin-content" id="overview">
          <div className="admin-heading"><div><p className="admin-kicker">Admin / click monitoring</p><h1>Know what gets<br /><em>attention.</em></h1><p>See the actions visitors take across this browser session.</p></div><div className="admin-range"><Clock3 size={15} /><select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Time range"><option>7 days</option><option>30 days</option><option>All time</option></select></div></div>

          <div className="admin-metrics"><article><span><MousePointer2 size={14} /> Total clicks</span><strong>{events.length}</strong><small>Recorded actions</small></article><article><span><Users size={14} /> Active users</span><strong>{activeUsers}</strong><small>{users.length} managed members</small></article><article><span><Activity size={14} /> Tools completed</span><strong>{toolEvents.length}</strong><small>{toolCounts.VulnScan ? `${toolCounts.VulnScan} VulnScan runs` : 'Waiting for a completed run'}</small></article></div>

          <div className="admin-grid"><section className="admin-panel admin-chart"><div className="admin-panel-head"><div><p className="admin-kicker">Activity</p><h2>Clicks this week</h2></div><strong>{events.length} total</strong></div><div className="admin-bars">{days.map((day) => <div className="admin-bar-column" key={day.label}><span>{day.count || ''}</span><i style={{ height: `${Math.max((day.count / maxCount) * 100, day.count ? 8 : 3)}%` }} /><small>{day.label}</small></div>)}</div></section><section className="admin-panel admin-pages"><div className="admin-panel-head"><div><p className="admin-kicker">Where people click</p><h2>Top pages</h2></div></div>{Object.entries(pageCounts).sort(([, a], [, b]) => b - a).slice(0, 4).map(([page, count]) => <div className="admin-page-row" key={page}><span>{page}</span><b>{count}</b><i><em style={{ width: `${(count / (topPage?.[1] || 1)) * 100}%` }} /></i></div>)}{!topPage && <p className="admin-empty-copy">No page activity yet. Click around the site and refresh this view.</p>}</section></div>

          <section className="admin-panel admin-user-panel"><div className="admin-panel-head"><div><p className="admin-kicker">Quick controls</p><h2>User access</h2></div><span>{users.length} total</span></div><div className="user-manager"><form className="user-form" onSubmit={handleAddUser}><div className="user-field"><label>Name</label><input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Jane Smith" /></div><div className="user-field"><label>Email</label><input type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} placeholder="jane@example.com" required /></div><div className="user-field"><label>Plan</label><select value={draft.plan} onChange={(event) => setDraft((current) => ({ ...current, plan: event.target.value as ManagedUser['plan'] }))}><option>Starter</option><option>Pro</option><option>Business</option></select></div><div className="user-field"><label>Role</label><select value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as ManagedUser['role'] }))}><option value="user">User</option><option value="admin">Admin</option><option value="owner">Owner</option></select></div><button type="submit" className="user-add-button"><UserPlus size={15} /> Add member</button></form><div className="user-list">{users.map((user) => <div className="user-row" key={user.id}><div className="user-meta"><strong>{user.name}</strong><small>{user.email}</small><span>{user.plan} · {user.role}</span></div><div className="user-actions"><button type="button" className={user.active ? 'user-status active' : 'user-status'} onClick={() => handleToggleUser(user.email)}>{user.active ? 'Active' : 'Disabled'}</button><button type="button" className="user-remove" onClick={() => handleDeleteUser(user.email)} aria-label={`Remove ${user.email}`}><Trash2 size={14} /></button></div></div>)}</div></div></section>

          <section className="admin-panel admin-typing-panel"><div className="admin-panel-head"><div><p className="admin-kicker">Input activity</p><h2>Opt-in text entries</h2></div><div className="typing-actions"><span>{typedEntries.length} items</span><button type="button" onClick={handleClearInputActivity} disabled={!typedEntries.length} aria-label="Clear input activity"><Trash2 size={14} /> Clear</button></div></div><div className="typing-list">{typedEntries.length === 0 ? <div className="admin-empty typing-empty"><MousePointer2 size={22} /><strong>No typed input yet</strong><p>Entries appear only after a visitor opts in, and only in this browser.</p></div> : typedEntries.slice(0, 8).map((entry) => <div className="typing-row" key={entry.id}><div className="typing-meta"><strong>{entry.label}</strong><small>{entry.page}</small></div><div className="typing-value">{entry.value}</div><time>{formatDate(entry.timestamp)} · {formatTime(entry.timestamp)}</time></div>)}</div></section>

          <section className="admin-panel admin-events" id="events"><div className="admin-panel-head"><div><p className="admin-kicker">Live log</p><h2>Recent click events</h2></div><span>{range}</span></div>{events.length === 0 ? <div className="admin-empty"><MousePointer2 size={22} /><strong>Waiting for the first click</strong><p>Events from this browser will appear here as visitors interact with the site.</p></div> : <div className="admin-event-list">{events.slice(0, 12).map((event) => <div className="admin-event" key={event.id}><span className="admin-event-icon"><MousePointer2 size={15} /></span><div><strong>{event.label}</strong><small>{event.page} <b>·</b> {event.target}</small></div><time>{formatDate(event.timestamp)} · {formatTime(event.timestamp)}</time></div>)}</div>}</section>
          <p className="admin-footnote">Input entries are opt-in, stored only in this browser, and are not visible across visitors or devices. Successful VulnScan runs are also written to the Vercel function log for all visitors.</p>
        </div>
      </section>
    </main>
  );
};

export default Admin;