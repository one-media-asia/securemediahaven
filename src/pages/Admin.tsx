import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, BarChart3, Clock3, MousePointer2, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getClickEvents, type ClickEvent } from '@/lib/clickTracking';

const formatTime = (timestamp: string) => new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
const formatDate = (timestamp: string) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(timestamp));

const Admin = () => {
  const [events, setEvents] = useState<ClickEvent[]>([]);
  const [range, setRange] = useState('7 days');

  const refresh = () => setEvents(getClickEvents());
  useEffect(() => { refresh(); }, []);

  const pageCounts = useMemo(() => events.reduce<Record<string, number>>((counts, event) => {
    counts[event.page] = (counts[event.page] || 0) + 1;
    return counts;
  }, {}), [events]);
  const topPage = Object.entries(pageCounts).sort(([, a], [, b]) => b - a)[0];
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toDateString();
    return { label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date), count: events.filter((event) => new Date(event.timestamp).toDateString() === key).length };
  }), [events]);
  const maxCount = Math.max(...days.map((day) => day.count), 1);

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

          <div className="admin-metrics"><article><span><MousePointer2 size={14} /> Total clicks</span><strong>{events.length}</strong><small>Recorded actions</small></article><article><span><Users size={14} /> Active pages</span><strong>{Object.keys(pageCounts).length}</strong><small>Pages with activity</small></article><article><span><Activity size={14} /> Leading page</span><strong>{topPage ? topPage[0] : '—'}</strong><small>{topPage ? `${topPage[1]} clicks` : 'Waiting for activity'}</small></article></div>

          <div className="admin-grid"><section className="admin-panel admin-chart"><div className="admin-panel-head"><div><p className="admin-kicker">Activity</p><h2>Clicks this week</h2></div><strong>{events.length} total</strong></div><div className="admin-bars">{days.map((day) => <div className="admin-bar-column" key={day.label}><span>{day.count || ''}</span><i style={{ height: `${Math.max((day.count / maxCount) * 100, day.count ? 8 : 3)}%` }} /><small>{day.label}</small></div>)}</div></section><section className="admin-panel admin-pages"><div className="admin-panel-head"><div><p className="admin-kicker">Where people click</p><h2>Top pages</h2></div></div>{Object.entries(pageCounts).sort(([, a], [, b]) => b - a).slice(0, 4).map(([page, count]) => <div className="admin-page-row" key={page}><span>{page}</span><b>{count}</b><i><em style={{ width: `${(count / (topPage?.[1] || 1)) * 100}%` }} /></i></div>)}{!topPage && <p className="admin-empty-copy">No page activity yet. Click around the site and refresh this view.</p>}</section></div>

          <section className="admin-panel admin-events" id="events"><div className="admin-panel-head"><div><p className="admin-kicker">Live log</p><h2>Recent click events</h2></div><span>{range}</span></div>{events.length === 0 ? <div className="admin-empty"><MousePointer2 size={22} /><strong>Waiting for the first click</strong><p>Events from this browser will appear here as visitors interact with the site.</p></div> : <div className="admin-event-list">{events.slice(0, 12).map((event) => <div className="admin-event" key={event.id}><span className="admin-event-icon"><MousePointer2 size={15} /></span><div><strong>{event.label}</strong><small>{event.page} <b>·</b> {event.target}</small></div><time>{formatDate(event.timestamp)} · {formatTime(event.timestamp)}</time></div>)}</div>}</section>
          <p className="admin-footnote">This prototype stores up to 500 events in local browser storage. Connect the tracker to your analytics endpoint before using it for multi-user reporting.</p>
        </div>
      </section>
    </main>
  );
};

export default Admin;