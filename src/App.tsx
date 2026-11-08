import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, MapPin, RefreshCw, CloudSun, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Gauge, Sparkles, CalendarDays, ThermometerSun, Sunrise, Sunset, AlertTriangle, ChevronDown } from 'lucide-react';

type Place = { name: string; admin1?: string; latitude: number; longitude: number; country?: string };
type Forecast = { current?: any; daily?: any; daily_units?: any; hourly?: any; timezone?: string; current_units?: any };
const DEFAULT_PLACE: Place = { name: 'Warszawa', admin1: 'mazowieckie', latitude: 52.2297, longitude: 21.0122, country: 'Polska' };
const weatherText = (code: number) => code === 0 ? 'Bezchmurnie' : code <= 2 ? 'Małe zachmurzenie' : code === 3 ? 'Pochmurno' : code <= 48 ? 'Mgła' : code <= 57 ? 'Mżawka' : code <= 67 ? 'Deszcz' : code <= 77 ? 'Śnieg' : code <= 82 ? 'Przelotne opady' : code <= 86 ? 'Opady śniegu' : 'Burza';
const WeatherIcon = ({ code, size = 22 }: { code: number; size?: number }) => {
  if (code === 0) return <Sun size={size} />;
  if (code <= 2) return <CloudSun size={size} />;
  if (code === 3 || code <= 48) return <Cloud size={size} />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain size={size} />;
  if (code <= 77 || code <= 86) return <CloudSnow size={size} />;
  return <CloudLightning size={size} />;
};
const dayName = (date: string, long = false) => new Intl.DateTimeFormat('pl-PL', { weekday: long ? 'long' : 'short', day: 'numeric', month: 'short' }).format(new Date(date + 'T12:00:00'));
const fmt = (n: number | null | undefined) => n == null ? '—' : Math.round(n).toString();
const pct = (n: number | null | undefined) => n == null ? '—' : Math.round(n) + '%';

export default function App() {
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [tab, setTab] = useState<'7' | '14'>('7');
  const [favorites, setFavorites] = useState<Place[]>(() => { try { return JSON.parse(localStorage.getItem('pogodapl-favorites') || '[]'); } catch { return []; } });
  const [air, setAir] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(typeof Notification !== 'undefined' && Notification.permission === 'granted');
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [warningsLoading, setWarningsLoading] = useState(true);
  const [warningsError, setWarningsError] = useState('');

  const loadWeather = useCallback(async (target: Place, quiet = false) => {
    if (!quiet) setLoading(true);
    setError('');
    try {
      const base = 'https://api.open-meteo.com/v1/forecast';
      const params = new URLSearchParams({
        latitude: String(target.latitude), longitude: String(target.longitude),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,pressure_msl',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,sunrise,sunset',
        hourly: 'temperature_2m,precipitation_probability,precipitation,wind_speed_10m',
        forecast_days: '16', timezone: 'auto'
      });
      const f = await fetch(base + '?' + params.toString()).then(r => { if (!r.ok) throw new Error('Nie udało się pobrać prognozy.'); return r.json(); });
      const airData = await fetch('https://air-quality-api.open-meteo.com/v1/air-quality?' + new URLSearchParams({ latitude: String(target.latitude), longitude: String(target.longitude), current: 'european_aqi,pm2_5,pm10,uv_index', timezone: 'auto' }).toString()).then(r => r.ok ? r.json() : null).catch(() => null);
      setAir(airData?.current || null);

      setForecast(f);
      setUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wystąpił błąd pobierania danych.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadWarnings = async () => {
      try {
        const response = await fetch('https://danepubliczne.imgw.pl/api/data/warningsmeteo');
        if (!response.ok) throw new Error('Nie udało się pobrać ostrzeżeń IMGW.');
        const data = await response.json();
        if (cancelled) return;
        const now = Date.now();
        const active = (Array.isArray(data) ? data : []).filter((item: any) => {
          if (!item.obowiazuje_do) return true;
          const end = new Date(String(item.obowiazuje_do).replace(' ', 'T')).getTime();
          return Number.isNaN(end) || end >= now;
        }).sort((a: any, b: any) => Number(b.stopien || 0) - Number(a.stopien || 0));
        setWarnings(active);
        setWarningsError('');
      } catch (e) {
        if (!cancelled) setWarningsError(e instanceof Error ? e.message : 'Ostrzeżenia IMGW są chwilowo niedostępne.');
      } finally {
        if (!cancelled) setWarningsLoading(false);
      }
    };
    loadWarnings();
    const interval = window.setInterval(loadWarnings, 10 * 60 * 1000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, []);

  useEffect(() => { loadWeather(place); }, [place, loadWeather]);
  useEffect(() => {
    const id = window.setInterval(() => loadWeather(place, true), 15 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [place, loadWeather]);

  useEffect(() => {
    const term = query.trim();
    let cancelled = false;
    if (term.length < 2) {
      setSuggestions([]);
      setSearchLoading(false);
      setSearchError('');
      return;
    }

    setShowSuggestions(true);
    setSuggestions([]);
    setSearchError('');
    setSearchLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const p = new URLSearchParams({ name: term, count: '10', language: 'pl', format: 'json', countryCode: 'PL' });
        const response = await fetch('https://geocoding-api.open-meteo.com/v1/search?' + p.toString());
        if (!response.ok) throw new Error('Wyszukiwarka chwilowo nie odpowiada.');
        const data = await response.json();
        if (cancelled) return;
        const results = (data.results || [])
          .filter((x: any) => x.country_code === 'PL')
          .map((x: any) => ({ name: x.name, admin1: x.admin1, latitude: x.latitude, longitude: x.longitude, country: 'Polska' }));
        setSuggestions(results);
        setSearchError(results.length ? '' : 'Nie znaleziono miejscowości. Spróbuj wpisać pełniejszą nazwę.');
      } catch (e) {
        if (!cancelled) {
          setSuggestions([]);
          setSearchError(e instanceof Error ? e.message : 'Nie udało się wyszukać miasta.');
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const current = forecast?.current;
  const daily = forecast?.daily;
  const ai = useMemo(() => {
    if (!current || !daily) return 'Pobieram najnowsze dane meteorologiczne i przygotowuję analizę dla wybranej lokalizacji.';
    const rain = daily.precipitation_probability_max?.slice(0, 3).filter((x: number) => x != null) || [];
    const maxRain = Math.max(0, ...rain);
    const avg = (daily.temperature_2m_max?.[0] + daily.temperature_2m_min?.[0]) / 2;
    const wind = current.wind_speed_10m;
    const notes: string[] = [];
    if (maxRain >= 70) notes.push('W najbliższych dniach modele wskazują podwyższone ryzyko opadów — warto mieć przy sobie parasol.');
    else if (maxRain >= 40) notes.push('Możliwe są przelotne opady. Sytuacja opadowa wymaga obserwacji kolejnych aktualizacji.');
    else notes.push('Najbliższe dni zapowiadają się raczej sucho.');
    if (wind >= 35) notes.push('Wiatr może być dokuczliwy, szczególnie na otwartej przestrzeni.');
    if (avg >= 27) notes.push('Warto ograniczyć długą aktywność na słońcu w najcieplejszej części dnia.');
    if (avg <= 2) notes.push('Temperatura będzie niska — uwzględnij możliwość śliskich nawierzchni.');
    return notes.join(' ');
  }, [current, daily]);

  const hourly = forecast?.hourly;
  const hourRows = useMemo(() => {
    if (!hourly?.time) return [];
    const now = new Date();
    let start = hourly.time.findIndex((t: string) => new Date(t) >= now);
    if (start < 0) start = 0;
    return hourly.time.slice(start, start + 12).map((time: string, i: number) => {
      const n = start + i;
      return { time: new Date(time).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }), temp: hourly.temperature_2m?.[n], rain: hourly.precipitation_probability?.[n], code: daily?.weather_code?.[0] ?? 3 };
    });
  }, [hourly, daily]);

  const selectPlace = (p: Place) => { setPlace(p); setQuery(''); setShowSuggestions(false); setTab('7'); };
  const refresh = () => { setRefreshing(true); loadWeather(place, true); };
  const visibleDays = tab === '7' ? 7 : 14;
  const saveFavorites = (next: Place[]) => { setFavorites(next); localStorage.setItem('pogodapl-favorites', JSON.stringify(next)); };
  const toggleFavorite = () => saveFavorites(favorites.some(p => p.latitude === place.latitude && p.longitude === place.longitude) ? favorites.filter(p => p.latitude !== place.latitude || p.longitude !== place.longitude) : [...favorites, place].slice(-8));
  const enableNotifications = async () => { if (!('Notification' in window)) return; const permission = await Notification.requestPermission(); setNotificationsEnabled(permission === 'granted'); if (permission === 'granted' && warnings.length) new Notification('PogodaPL – ostrzeżenia IMGW', { body: warnings[0].nazwa_zdarzenia || 'Aktywne ostrzeżenie pogodowe. Sprawdź mapę IMGW.' }); };
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar" id="top">
      <a className="brand" href="#"><span className="brand-mark"><CloudSun size={23}/></span><span>Pogoda<span className="brand-accent">PL</span><small>POGODA W POLSCE • NA ŻYWO</small></span></a>
      <div className="search-wrap">
        <Search size={18}/>
        <input
          value={query}
          aria-label="Wyszukaj miasto w Polsce"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
          onFocus={() => { if (query.trim().length >= 2) setShowSuggestions(true); }}
          onKeyDown={e => {
            if (e.key === 'Enter' && suggestions[0]) { e.preventDefault(); selectPlace(suggestions[0]); }
            if (e.key === 'Escape') setShowSuggestions(false);
          }}
          placeholder="Wyszukaj miasto w Polsce..."
        />
        {query && <button className="search-clear" aria-label="Wyczyść wyszukiwanie" onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}>×</button>}
        {showSuggestions && query.trim().length >= 2 && <div className="suggestions">
          {searchLoading ? <div className="suggestions-message">Szukam miejscowości…</div> :
            suggestions.length > 0 ? suggestions.map((s,i) => <button key={s.name + s.latitude + i} onClick={() => selectPlace(s)}><MapPin size={15}/><span>{s.name}<small>{s.admin1 || 'Polska'}</small></span></button>) :
            <div className="suggestions-message">{searchError || 'Brak wyników.'}</div>}
        </div>}
      </div>
      <button className="refresh-btn" onClick={refresh} aria-label="Odśwież dane"><RefreshCw size={17} className={refreshing ? 'spin' : ''}/><span>Odśwież</span></button>
    </header>
    <nav className="menu-bar" aria-label="Menu główne"><label className="menu-select-label">Przejdź do <select defaultValue="forecast" onChange={e => goTo(e.target.value)}><option value="forecast">Prognoza</option><option value="alerts">Ostrzeżenia IMGW</option><option value="radar">Radar opadów</option><option value="air">Jakość powietrza i UV</option><option value="hourly">Prognoza godzinowa</option></select></label><button onClick={() => goTo('forecast')}>Prognoza</button><button onClick={() => goTo('alerts')}>Ostrzeżenia</button><button onClick={() => goTo('radar')}>Radar</button><button onClick={() => goTo('air')}>Powietrze / UV</button><button onClick={() => goTo('favorites')}>Ulubione</button></nav>

    <section className="location-line"><div><span className="live-dot"/><span>DANE METEOROLOGICZNE NA ŻYWO</span><span className="muted">/</span><MapPin size={14}/><b>{place.name}{place.admin1 ? ', ' + place.admin1 : ''}</b></div><span className="updated">Aktualizacja: {updated ? updated.toLocaleTimeString('pl-PL', {hour:'2-digit',minute:'2-digit'}) : '—'} · automatycznie co 15 min</span></section>

    <section className="glass alerts-card" id="alerts">
      <div className="section-head"><div><span className="eyebrow">OFICJALNE KOMUNIKATY</span><h2><AlertTriangle size={19}/> Ostrzeżenia IMGW</h2></div><a className="source-link" href="https://meteo.imgw.pl/" target="_blank" rel="noreferrer">Mapa ostrzeżeń IMGW ↗</a></div>
      <p className="alerts-intro">Aktywne ostrzeżenia meteorologiczne publikowane dla obszarów Polski. Sprawdź na mapie IMGW, czy obejmują Twój powiat.</p>
      {warningsLoading ? <div className="empty-state">Pobieram oficjalne ostrzeżenia…</div> :
        warningsError ? <div className="empty-state">{warningsError} <a href="https://meteo.imgw.pl/" target="_blank" rel="noreferrer">Otwórz IMGW</a></div> :
        warnings.length === 0 ? <div className="no-alerts"><span className="live-dot"/> Brak aktywnych ostrzeżeń meteorologicznych w pobranym wykazie IMGW.</div> :
        <div className="alerts-list">{warnings.slice(0, 5).map((w: any) => <article className="alert-item" key={w.id || w.obowiazuje_od + w.nazwa_zdarzenia}>
          <div className={'alert-level level-' + String(w.stopien || '1')}><AlertTriangle size={16}/><b>STOPIEŃ {w.stopien || '—'}</b></div>
          <div className="alert-content"><b>{w.nazwa_zdarzenia || 'Ostrzeżenie meteorologiczne'}</b><p>{w.tresc || 'Szczegóły dostępne w komunikacie IMGW.'}</p><small>Obowiązuje: {w.obowiazuje_od || '—'} – {w.obowiazuje_do || '—'}{w.prawdopodobienstwo ? ' · Prawdopodobieństwo: ' + w.prawdopodobienstwo + '%' : ''}</small></div>
        </article>)}</div>}
      <div className="source-note">Źródło: IMGW-PIB · aktualizacja automatyczna co 10 minut · lista ogólnopolska, nie zastępuje sprawdzenia obszaru na mapie IMGW.</div>
    </section>

    <section className="glass radar-card" id="radar">
      <div className="section-head"><div><span className="eyebrow">OBRAZ OPADÓW</span><h2>Radar opadów</h2></div><span className="subtle-label">Centrum: {place.name}</span></div>
      <div className="radar-frame"><iframe title={'Radar opadów dla ' + place.name} src={'https://www.rainviewer.com/map.html?loc=' + place.latitude + ',' + place.longitude + ',6&layer=radar&sm=1&sn=1&hu=0'} loading="lazy" referrerPolicy="no-referrer" allowFullScreen /></div>
      <div className="source-note">Radar pokazuje dostępne obrazy historyczne opadów; nie jest prognozą, a zasięg i aktualność zależą od dostawcy danych. Źródło: RainViewer.</div>
    </section>

    {error && <div className="error-banner"><AlertTriangle size={17}/>{error} <button onClick={refresh}>Spróbuj ponownie</button></div>}

    <section className="glass tools-card" id="favorites"><div className="section-head"><div><span className="eyebrow">SZYBKI DOSTĘP</span><h2>Ulubione miejscowości</h2></div><button className="tool-button" onClick={toggleFavorite}>{favorites.some(p => p.latitude === place.latitude && p.longitude === place.longitude) ? 'Usuń z ulubionych' : 'Dodaj ' + place.name}</button></div><div className="favorite-list">{favorites.length ? favorites.map((p,i)=><button key={p.latitude + '-' + p.longitude + i} onClick={() => selectPlace(p)}><MapPin size={14}/>{p.name}{p.admin1 ? ', ' + p.admin1 : ''}</button>) : <span className="source-note">Dodaj aktualną miejscowość, aby szybko wracać do jej prognozy.</span>}</div></section>

    <section className="hero-grid">
      <div className="glass hero-card">
        <div className="hero-top"><div><span className="eyebrow">TERAZ W {place.name.toLocaleUpperCase('pl-PL')}</span><h1>{place.name}</h1><p>{current ? weatherText(current.weather_code) : 'Ładowanie warunków...'}</p></div><div className="hero-weather"><WeatherIcon code={current?.weather_code ?? 2} size={76}/></div></div>
        <div className="temperature">{loading ? '—' : fmt(current?.temperature_2m)}<span>°</span></div>
        <div className="feels">Odczuwalna <b>{fmt(current?.apparent_temperature)}°C</b><span className="vertical-line"/> Maks. dziś <b>{fmt(daily?.temperature_2m_max?.[0])}°</b><span className="vertical-line"/> Min. <b>{fmt(daily?.temperature_2m_min?.[0])}°</b></div>
        <div className="hero-footer"><div><Sunrise size={17}/><span>Wschód <b>{daily?.sunrise?.[0]?.slice(11,16) || '—'}</b></span></div><div><Sunset size={17}/><span>Zachód <b>{daily?.sunset?.[0]?.slice(11,16) || '—'}</b></span></div><div><CalendarDays size={17}/><span>{new Date().toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'})}</span></div></div>
      </div>
      <div className="metric-grid">
        <div className="glass metric"><div className="metric-label"><Droplets/> WILGOTNOŚĆ</div><strong>{fmt(current?.relative_humidity_2m)}<small>%</small></strong><span>Wilgotność względna</span></div>
        <div className="glass metric"><div className="metric-label"><Wind/> WIATR</div><strong>{fmt(current?.wind_speed_10m)}<small> km/h</small></strong><span>Prędkość przy ziemi</span></div>
        <div className="glass metric"><div className="metric-label"><Gauge/> CIŚNIENIE</div><strong>{fmt(current?.pressure_msl)}<small> hPa</small></strong><span>Na poziomie morza</span></div>
        <div className="glass metric"><div className="metric-label"><CloudRain/> OPAD TERAZ</div><strong>{current?.precipitation ?? '—'}<small> mm</small></strong><span>Aktualny opad</span></div>
        <div className="glass metric"><div className="metric-label"><Wind/> JAKOŚĆ POWIETRZA</div><strong>{air?.european_aqi ?? '—'}<small> AQI</small></strong><span>{air?.pm2_5 != null ? 'PM2.5: ' + fmt(air.pm2_5) + ' µg/m³' : 'Europejski indeks jakości powietrza'}</span></div>
        <div className="glass metric"><div className="metric-label"><Sun/> INDEKS UV</div><strong>{air?.uv_index == null ? '—' : fmt(air.uv_index)}</strong><span>{air?.uv_index >= 8 ? 'Bardzo wysoki – chroń skórę' : air?.uv_index >= 6 ? 'Wysoki – zalecana ochrona' : air?.uv_index >= 3 ? 'Umiarkowany' : 'Niski'}</span></div>
      </div>
    </section>

    <section className="glass ai-card"><div className="ai-icon"><Sparkles size={21}/></div><div className="ai-copy"><div className="ai-heading">PogodaAI <span>ANALIZA AUTOMATYCZNA</span></div><p>{loading ? 'AI analizuje najnowsze dane...' : ai}</p><small>Analiza regułowa na podstawie aktualnej prognozy. To wskazówka, nie ostrzeżenie IMGW.</small></div><div className="ai-pulse"><i/><i/><i/></div></section>

    <section className="glass forecast-card" id="forecast">
      <div className="section-head"><div><span className="eyebrow">SPRAWDŹ, CO PRZED TOBĄ</span><h2>Prognoza pogody</h2></div><div className="tabs"><button className={tab==='7'?'active':''} onClick={()=>setTab('7')}>7 dni</button><button className={tab==='14'?'active':''} onClick={()=>setTab('14')}>14 dni</button></div></div>
      <div className="daily-list">{(daily?.time || []).slice(0,visibleDays).map((date: string,i: number)=><div className="day-row" key={date}><div className="day-name"><b>{i===0?'Dziś':dayName(date).split(',')[0]}</b><small>{dayName(date)}</small></div><div className="day-icon"><WeatherIcon code={daily.weather_code[i]}/><span>{weatherText(daily.weather_code[i])}</span></div><div className="rain-chance"><Droplets size={14}/>{pct(daily.precipitation_probability_max?.[i])}</div><div className="day-temps"><b>{fmt(daily.temperature_2m_max?.[i])}°</b><span>{fmt(daily.temperature_2m_min?.[i])}°</span></div><div className="wind-mini"><Wind size={14}/>{fmt(daily.wind_speed_10m_max?.[i])} km/h</div></div>)}</div>
    </section>

    {tab !== 'month' && <section className="glass hourly-card" id="hourly"><div className="section-head"><div><span className="eyebrow">SZCZEGÓŁOWO</span><h2>Najbliższe godziny</h2></div><span className="subtle-label">Prognoza godzinowa</span></div><div className="hourly-scroll">{hourRows.map((h:any,i:number)=><div className="hour-item" key={h.time+i}><span>{i===0?'Teraz':h.time}</span><WeatherIcon code={h.code} size={22}/><b>{fmt(h.temp)}°</b><small><Droplets size={12}/>{pct(h.rain)}</small></div>)}</div></section>}

    <section className="glass tools-card notification-card"><div><b>Powiadomienia o ostrzeżeniach</b><span>Włącz powiadomienia przeglądarki i wyświetl aktualne ostrzeżenie. Strona musi być otwarta, aby działała.</span></div><button className="tool-button" onClick={enableNotifications}>{notificationsEnabled ? 'Powiadomienia włączone' : 'Włącz powiadomienia'}</button></section>

    <footer><div className="footer-brand"><CloudSun size={18}/> PogodaPL</div><span>Dane pogodowe: Open-Meteo · Modele numeryczne ECMWF</span><span>Prognozy mają charakter probabilistyczny i mogą się zmieniać.</span></footer>
  </main>;
}
