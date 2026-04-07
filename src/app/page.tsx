'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BarChart3, BookOpen, CheckCircle2, Clock, School, TrendingUp,
  Filter, ArrowRight, LayoutDashboard, Sparkles, Shield, Zap, Eye,
  MapPin, ChevronDown, Award,
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { getAllReports, getAllSchoolProfiles, type Report, type UserProfile } from '@/lib/firestore-service';
import { LoginModal } from '@/components/login-modal';

// ── PALETTE (Islamic green-gold) ──
const P = {
  forestDark: '#1A3C2B',
  forest:     '#2D6A4F',
  sage:       '#74B38A',
  gold:       '#FAC84A',
  goldLight:  '#FDE68A',
  cream:      '#FEFAE0',
  creamMid:   '#FEF3C7',
};

// ── CONSTANTS (tahun dinamis, mulai 2026) ──
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

interface KecamatanStat {
  name: string; totalSchools: number; submittedSchools: number;
  unsubmittedList: UserProfile[]; completion: number;
}

// ── ANIMATION VARIANTS ──
const fadeUp: any = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };
const stagger: any = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ── ANIMATED NUMBER ──
const AnimatedNumber: React.FC<{ target: number; duration?: number }> = ({ target, duration = 1.4 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0; const step = target / (duration * 60);
    const t = setInterval(() => { v += step; if (v >= target) { setVal(target); clearInterval(t); } else setVal(Math.round(v)); }, 1000 / 60);
    return () => clearInterval(t);
  }, [inView, target, duration]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
};

// ── INTERACTIVE DONUT CHART ──
const DonutChart: React.FC<{ data: { label: string; count: number; color: string; light: string }[]; total: number }> = ({ data, total }) => {
  const [hov, setHov] = useState<string | null>(null);
  const S = 220, cx = 110, cy = 110, R = 88, r = 56;
  let ang = -Math.PI / 2;
  const arcs = data.map(d => {
    const frac = total > 0 ? d.count / total : 0;
    const sw = frac * 2 * Math.PI;
    const sa = ang, ea = ang + sw; ang += sw;
    const x1 = cx + R * Math.cos(sa), y1 = cy + R * Math.sin(sa);
    const x2 = cx + R * Math.cos(ea), y2 = cy + R * Math.sin(ea);
    const ix1 = cx + r * Math.cos(sa), iy1 = cy + r * Math.sin(sa);
    const ix2 = cx + r * Math.cos(ea), iy2 = cy + r * Math.sin(ea);
    const lg = sw > Math.PI ? 1 : 0;
    const path = sw < 0.002 ? '' : `M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${ix2} ${iy2} A${r} ${r} 0 ${lg} 0 ${ix1} ${iy1}Z`;
    return { ...d, path, frac, pct: Math.round(frac * 100) };
  });
  const active = arcs.find(a => a.label === hov);
  return (
    <div className="flex flex-col items-center gap-5">
      <div style={{ width: S, height: S, position: 'relative' }}>
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
          <circle cx={cx} cy={cy} r={(R + r) / 2} fill="none" strokeWidth={R - r} stroke="#E5E7EB" />
          {arcs.map(a => a.path && (
            <motion.path key={a.label} d={a.path}
              fill={hov === a.label ? a.light : a.color}
              style={{ transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
              animate={{ scale: hov === a.label ? 1.06 : 1 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setHov(a.label)} onMouseLeave={() => setHov(null)} />
          ))}
          {active ? (
            <>
              <text x={cx} y={cy - 12} textAnchor="middle" fontSize="26" fontWeight="900" fill={active.color}>{active.count}</text>
              <text x={cx} y={cy + 8}  textAnchor="middle" fontSize="10" fontWeight="700" fill={active.color}>{active.label}</text>
              <text x={cx} y={cy + 22} textAnchor="middle" fontSize="10" fontWeight="700" fill={active.color}>{active.pct}%</text>
            </>
          ) : (
            <>
              <text x={cx} y={cy - 6}  textAnchor="middle" fontSize="28" fontWeight="900" fill={P.forest}>{total}</text>
              <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9"  fontWeight="700" fill={P.sage} letterSpacing="2">TOTAL</text>
            </>
          )}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
        {arcs.map(a => (
          <div key={a.label} className="flex items-center gap-2 cursor-pointer group"
            onMouseEnter={() => setHov(a.label)} onMouseLeave={() => setHov(null)}>
            <div className="w-3 h-3 rounded-full shrink-0 transition-transform group-hover:scale-125" style={{ backgroundColor: a.color }} />
            <div>
              <div className="text-xs font-bold text-slate-700">{a.label}</div>
              <div className="text-[10px] text-slate-400">{a.count} item · {a.pct}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── STAT CARD ──
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; sub?: string; color: string; bg: string; pct?: number; border?: string }> = ({ icon, label, value, sub, color, bg, pct, border }) => (
  <motion.div variants={fadeUp} whileHover={{ y: -5, boxShadow: `0 16px 40px ${color}20` }}
    className="bg-white rounded-2xl p-5 border border-slate-100 transition-all duration-300"
    style={border ? { borderLeft: `4px solid ${border}` } : {}}>
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
        <span style={{ color }}>{icon}</span>
      </div>
      {pct !== undefined && (
        <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: bg, color }}>{pct}%</span>
      )}
    </div>
    <div className="text-3xl font-black mb-0.5" style={{ color }}>
      <AnimatedNumber target={value} />
    </div>
    <div className="text-xs text-slate-400 font-semibold">{label}</div>
    {pct !== undefined && (
      <div className="mt-2.5 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}15` }}>
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.2 }} />
      </div>
    )}
  </motion.div>
);

// ── HEXAGON PATTERN SVG (Islamic geometric) ──
const HexPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="hex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
        <polygon points="30,2 58,17 58,47 30,62 2,47 2,17" fill="none" stroke="#FAC84A" strokeWidth="1"/>
        <polygon points="30,12 48,22 48,42 30,52 12,42 12,22" fill="none" stroke="#FAC84A" strokeWidth="0.5"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex)" />
  </svg>
);

// ── MAIN COMPONENT ──
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('Januari');
  const [reports, setReports] = useState<Report[]>([]);
  const [allSchools, setAllSchools] = useState<UserProfile[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>(['2026']);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKecamatan, setSelectedKecamatan] = useState<typeof kecamatanStats[0] | null>(null);

  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(26,60,43,0)', 'rgba(254,250,224,1)']);
  const navShadow = useTransform(scrollY, [0, 80], ['none', '0 2px 20px rgba(0,0,0,0.08)']);
  const [navScrolled, setNavScrolled] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on('change', v => setNavScrolled(v > 50));
    return unsub;
  }, [scrollY]);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [allReports, schools] = await Promise.all([getAllReports(), getAllSchoolProfiles()]);
        const years = new Set<string>();
        allReports.forEach(r => { if (r.bulan_laporan) years.add(r.bulan_laporan.split('-')[0]); });
        const sortedYears = Array.from(years).filter(y => parseInt(y) >= 2026).sort().reverse();
        setAvailableYears(sortedYears.length > 0 ? sortedYears : ['2026']);
        if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) setSelectedYear(sortedYears[0]);
        setAllSchools(schools);
        setReports(allReports.filter(r => r.bulan_laporan &&
          r.bulan_laporan.startsWith(selectedYear) &&
          r.bulan_laporan.endsWith(`-${String(MONTHS.indexOf(selectedMonth) + 1).padStart(2, '0')}`)
        ));
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    }
    fetchData();
  }, [selectedYear, selectedMonth]);

  const stats = useMemo(() => {
    const terverifikasi = reports.filter(r => r.status === 'Terverifikasi').length;
    const menunggu      = reports.filter(r => r.status === 'Menunggu').length;
    const revisi        = reports.filter(r => r.status === 'Revisi').length;
    const sekolahMelapor = new Set(reports.map(r => r.npsn_sekolah)).size;
    return { terverifikasi, menunggu, revisi, sekolahMelapor, total: reports.length };
  }, [reports]);

  const unsubmitted = useMemo(() => allSchools.filter(s => !reports.some(r => r.npsn_sekolah === s.npsn)), [allSchools, reports]);
  const capaian = allSchools.length > 0 ? Math.round((stats.sekolahMelapor / allSchools.length) * 100) : 0;

  const kecamatanStats = useMemo<KecamatanStat[]>(() => {
    const g: Record<string, { sub: UserProfile[]; unsub: UserProfile[]; all: UserProfile[] }> = {};
    allSchools.forEach(s => {
      const k = (s as any).kecamatan || 'Unknown';
      if (!g[k]) g[k] = { sub: [], unsub: [], all: [] };
      g[k].all.push(s);
      if (reports.some(r => r.npsn_sekolah === s.npsn)) g[k].sub.push(s);
      else g[k].unsub.push(s);
    });
    return Object.entries(g).map(([name, { sub, unsub, all }]) => ({
      name, totalSchools: all.length, submittedSchools: sub.length,
      unsubmittedList: unsub, completion: all.length > 0 ? Math.round(sub.length / all.length * 100) : 0,
    })).sort((a, b) => b.completion - a.completion || a.name.localeCompare(b.name));
  }, [allSchools, reports]);

  const donutData = [
    { label: 'Terverifikasi', count: stats.terverifikasi, color: P.forest, light: '#3D8B65' },
    { label: 'Menunggu',      count: stats.menunggu,      color: P.gold,   light: '#FBD365' },
    { label: 'Perlu Revisi',  count: stats.revisi,        color: '#EF4444', light: '#FCA5A5' },
    { label: 'Belum Lapor',   count: unsubmitted.length,  color: P.sage,   light: '#95C9A8' },
  ];
  const donutTotal = stats.total + unsubmitted.length;

  const CARD_ACCENTS = [P.forest, P.sage, '#D97706', '#0284C7', '#7C3AED', '#DB2777'];

  if (!mounted) return null;

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden" style={{ backgroundColor: P.cream }}>
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />

      {/* ── STICKY NAV ── */}
      <motion.nav style={{ backgroundColor: navBg, boxShadow: navShadow }}
        className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${P.forest}, ${P.sage})` }}
              whileHover={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
              <School className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-black tracking-tight leading-none"
                style={{ color: navScrolled ? P.forestDark : P.cream }}>SIMPEKA SD</p>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-60"
                style={{ color: navScrolled ? P.forest : P.cream }}>Kab. Tabalong</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.05, boxShadow: `0 8px 24px ${P.gold}50` }}
            whileTap={{ scale: 0.95 }} onClick={() => setLoginOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black shadow-lg transition-all"
            style={{ background: P.gold, color: P.forestDark }}>
            Masuk <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${P.forestDark} 0%, ${P.forest} 55%, #3D8B65 100%)` }}>
        <HexPattern />
        {/* Gold glow orbs */}
        <div className="absolute top-24 right-16 w-72 h-72 rounded-full blur-[100px] opacity-15" style={{ background: P.gold }} />
        <div className="absolute bottom-40 left-10 w-56 h-56 rounded-full blur-[80px] opacity-10" style={{ background: P.sage }} />

        {/* Hero content */}
        <div className="flex-1 flex items-center justify-center pt-20 pb-8">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-4xl mx-auto px-6 text-center">
            {/* Badge */}
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{ backgroundColor: `${P.gold}18`, border: `1px solid ${P.gold}40` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.gold }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.gold }}>Portal Publik Monitoring · PEKA</span>
              <Sparkles className="w-3 h-3" style={{ color: P.gold }} />
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] text-white mb-5">
              Pantau Progres
              <span className="block mt-1" style={{
                WebkitTextFillColor: 'transparent',
                backgroundImage: `linear-gradient(90deg, ${P.gold}, ${P.goldLight}, ${P.gold})`,
                WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundSize: '200%',
              }}>Pelaporan PEKA</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-sm sm:text-lg text-white/55 font-medium max-w-xl mx-auto mb-8 leading-relaxed px-2">
              Sistem monitoring real-time ketersediaan laporan kegiatan sekolah tingkat SD se-Kabupaten Tabalong.
            </motion.p>

            {/* ── FILTER CONTROLS ── */}
            <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 mb-8 w-full max-w-sm mx-auto px-2">
              {/* Year pills — compact, auto width */}
              <div className="flex items-center justify-center gap-1 p-1 rounded-2xl backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: `1px solid ${P.gold}25` }}>
                <Filter className="h-3 w-3 ml-2 shrink-0" style={{ color: P.gold }} />
                <span className="text-[9px] text-white/40 font-black uppercase tracking-wider mr-0.5 shrink-0">Tahun</span>
                {availableYears.map(y => (
                  <motion.button
                    key={y} onClick={() => setSelectedYear(y)}
                    className="relative px-3 py-1 rounded-lg text-xs font-black transition-colors duration-200 shrink-0"
                    style={{ color: selectedYear === y ? P.forestDark : 'rgba(255,255,255,0.6)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {selectedYear === y && (
                      <motion.span layoutId="year-pill" className="absolute inset-0 rounded-lg"
                        style={{ backgroundColor: P.gold }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                    )}
                    <span className="relative z-10">{y}</span>
                  </motion.button>
                ))}
              </div>

              {/* Month — grid 4 kolom, semua tampil */}
              <div className="w-full rounded-2xl p-2 backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: `1px solid ${P.gold}25` }}>
                <div className="text-[9px] text-white/40 font-black uppercase tracking-wider mb-1.5 px-1">Bulan</div>
                <div className="grid grid-cols-4 gap-1">
                  {MONTHS.map(m => (
                    <motion.button
                      key={m} onClick={() => setSelectedMonth(m)}
                      className="relative py-1.5 rounded-lg text-[10px] font-black transition-colors duration-200"
                      style={{ color: selectedMonth === m ? P.forestDark : 'rgba(255,255,255,0.6)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {selectedMonth === m && (
                        <motion.span layoutId="month-pill" className="absolute inset-0 rounded-lg"
                          style={{ backgroundColor: P.gold }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                      )}
                      <span className="relative z-10">{m.slice(0, 3)}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CTAs — inline auto-width, tidak memenuhi layar */}
            <motion.div variants={fadeUp} className="flex flex-row items-center justify-center gap-3 flex-wrap">
              <motion.button whileHover={{ scale: 1.05, boxShadow: `0 10px 32px ${P.gold}55` }}
                whileTap={{ scale: 0.96 }} onClick={() => setLoginOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black shadow-2xl"
                style={{ background: P.gold, color: P.forestDark }}>
                Masuk <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                onClick={() => document.getElementById('data-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border backdrop-blur-sm"
                style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'white', backgroundColor: 'rgba(255,255,255,0.06)' }}>
                Lihat Data <ChevronDown className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero stats bottom bar */}
        <div className="w-full border-t backdrop-blur-md"
          style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.25)' }}>
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: 'Total Sekolah',   value: allSchools.length,       icon: <School className="h-4 w-4" /> },
              { label: 'Sudah Melapor',   value: stats.sekolahMelapor,    icon: <CheckCircle2 className="h-4 w-4" /> },
              { label: 'Terverifikasi',   value: stats.terverifikasi,     icon: <Award className="h-4 w-4" /> },
              { label: 'Capaian Bulan',   value: capaian, suffix: '%',    icon: <TrendingUp className="h-4 w-4" /> },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: `${P.gold}20` }}>
                  <span style={{ color: P.gold }}>{s.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-black text-white leading-none">
                    <AnimatedNumber target={s.value} />{(s as any).suffix || ''}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-white/45 font-medium uppercase tracking-wide mt-0.5 truncate">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-28 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ChevronDown className="h-6 w-6" style={{ color: `${P.gold}70` }} />
        </motion.div>
      </section>

      {/* ── STAT CARDS ── */}
      <section id="data-section" style={{ backgroundColor: P.cream }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <School className="h-6 w-6" />, label: 'Sekolah Melapor', value: isLoading ? 0 : stats.sekolahMelapor, color: P.forest, bg: '#D1FAE5', pct: capaian, border: P.forest },
              { icon: <BookOpen className="h-6 w-6" />, label: 'Total Laporan', value: isLoading ? 0 : stats.total, color: '#D97706', bg: '#FEF3C7', border: '#D97706' },
              { icon: <CheckCircle2 className="h-6 w-6" />, label: 'Terverifikasi', value: isLoading ? 0 : stats.terverifikasi, color: P.forest, bg: '#D1FAE5', border: P.sage },
              { icon: <Clock className="h-6 w-6" />, label: 'Menunggu Review', value: isLoading ? 0 : stats.menunggu, color: '#B45309', bg: '#FDE68A50', border: P.gold },
            ].map((card, i) => (
              <StatCard key={i} {...card} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DATA VISUALIZATION ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
              <BarChart3 className="h-3.5 w-3.5" style={{ color: P.forest }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Visualisasi Interaktif</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2" style={{ color: P.forestDark }}>
              Distribusi &amp; Laporan Terbaru
            </h2>
            <p className="text-slate-400 font-medium text-sm">Hover pada grafik untuk detail · Periode {selectedMonth} {selectedYear}</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Donut Chart Panel */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="rounded-3xl p-5 sm:p-8 flex flex-col items-center"
              style={{ backgroundColor: P.cream, border: `1px solid ${P.sage}30`, borderLeft: `4px solid ${P.forest}` }}>
              <h3 className="text-base font-black mb-4 sm:mb-6 self-start" style={{ color: P.forestDark }}>Distribusi Status Laporan</h3>
              <DonutChart data={donutData} total={donutTotal} />
              <div className="w-full mt-4 sm:mt-6 space-y-2.5">
                {donutData.map(d => {
                  const pct = donutTotal > 0 ? Math.round(d.count / donutTotal * 100) : 0;
                  return (
                    <div key={d.label} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs font-bold text-slate-600 w-24 shrink-0">{d.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: d.color }}
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }} transition={{ duration: 1 }} />
                      </div>
                      <span className="text-xs font-black w-8 text-right" style={{ color: d.color }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Reports Panel */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="rounded-3xl p-5 sm:p-8"
              style={{ backgroundColor: P.cream, border: `1px solid ${P.sage}30`, borderLeft: `4px solid ${P.gold}` }}>
              <h3 className="text-base font-black mb-6" style={{ color: P.forestDark }}>Laporan Terbaru</h3>
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {isLoading ? [...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 rounded-2xl animate-pulse bg-slate-100" />
                )) : reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: `${P.sage}20` }}>
                      <BookOpen className="h-5 w-5" style={{ color: P.sage }} />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Belum ada laporan untuk periode ini</p>
                  </div>
                ) : reports.slice(0, 10).map((r, i) => {
                  const sc: Record<string, { bg: string; text: string; label: string }> = {
                    terverifikasi: { bg: '#D1FAE5', text: P.forest, label: 'Terverifikasi' },
                    menunggu:      { bg: '#FEF3C7', text: '#D97706', label: 'Menunggu' },
                    revisi:        { bg: '#FEE2E2', text: '#DC2626', label: 'Revisi' },
                  };
                  const s = sc[r.status] || sc.menunggu;
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white border hover:shadow-md transition-all"
                      style={{ borderColor: `${P.sage}20` }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${P.forest}12` }}>
                        <School className="h-4 w-4" style={{ color: P.forest }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{r.nama_sekolah}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{r.bulan_laporan}</div>
                      </div>
                      <span className="text-[9px] font-black px-2 py-1 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
                    </motion.div>
                  );
                })}
              </div>
              {reports.length > 10 && (
                <p className="text-center text-xs text-slate-400 mt-3">+{reports.length - 10} laporan lainnya</p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${P.forestDark} 0%, ${P.forest} 100%)` }}>
        <HexPattern />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ backgroundColor: `${P.gold}15`, border: `1px solid ${P.gold}30` }}>
              <Zap className="h-3.5 w-3.5" style={{ color: P.gold }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.gold }}>Kemampuan Sistem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Fitur Utama Sistem</h2>
            <p className="mt-2 text-sm font-medium" style={{ color: P.sage }}>Dirancang untuk efisiensi monitoring pelaporan sekolah</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <CheckCircle2 className="h-6 w-6" />, title: 'Verifikasi Cepat', desc: 'Disdik mengecek dan memverifikasi laporan sekolah langsung dari dashboard.', accent: '#6EE7B7' },
              { icon: <BarChart3 className="h-6 w-6" />,    title: 'Pantau Real-Time', desc: 'Visualisasi data terkini menampilkan progress pelaporan sekolah per wilayah.', accent: P.gold },
              { icon: <School className="h-6 w-6" />,       title: 'Portal Sekolah',  desc: 'Operator sekolah melacak dan memantau status laporan dengan mudah.', accent: P.sage },
              { icon: <Shield className="h-6 w-6" />,       title: 'Sistem Aman',     desc: 'Otentikasi multi-level memastikan data terlindungi dan akses terkontrol.', accent: '#93C5FD' },
              { icon: <Eye className="h-6 w-6" />,          title: 'Transparansi',    desc: 'Portal terbuka untuk umum agar masyarakat dapat memantau progres pelaporan.', accent: '#FCA5A5' },
              { icon: <TrendingUp className="h-6 w-6" />,   title: 'Analisis Wilayah',desc: 'Pantau capaian per kecamatan dan identifikasi sekolah yang belum melapor.', accent: '#C4B5FD' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.09)', borderColor: `${f.accent}30` }}
                className="p-6 rounded-2xl border transition-all duration-300 cursor-default"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${f.accent}20` }}>
                  <span style={{ color: f.accent }}>{f.icon}</span>
                </div>
                <h3 className="text-sm font-black text-white mb-2">{f.title}</h3>
                <p className="text-xs leading-relaxed text-white/45">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── KECAMATAN LEADERBOARD ── */}
      <section style={{ backgroundColor: P.cream }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ backgroundColor: `${P.forest}10` }}>
              <MapPin className="h-3 w-3" style={{ color: P.forest }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Peringkat Wilayah</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black" style={{ color: P.forestDark }}>Pantauan Kecamatan</h2>
            <p className="text-sm text-slate-400 mt-1">Periode: {selectedMonth} {selectedYear}</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kecamatanStats.map((k, i) => {
              const is100 = k.completion === 100;
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <motion.div key={k.name} variants={fadeUp}
                  whileHover={{ y: -4, boxShadow: `0 12px 36px ${accent}22` }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedKecamatan(k)}
                  className="bg-white rounded-2xl p-4 flex items-start gap-3 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                  style={{ borderLeft: `4px solid ${accent}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {/* Rank badge */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black mt-0.5"
                    style={{ backgroundColor: is100 ? '#D1FAE5' : `${accent}15`, color: is100 ? P.forest : accent }}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Name + percentage */}
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="text-sm font-black text-slate-800 leading-tight line-clamp-2">{k.name}</span>
                      <span className="text-base font-black shrink-0" style={{ color: is100 ? P.forest : accent }}>{k.completion}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 rounded-full overflow-hidden mb-2.5" style={{ backgroundColor: `${accent}15` }}>
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: is100 ? P.forest : accent }}
                        initial={{ width: 0 }} whileInView={{ width: `${k.completion}%` }}
                        viewport={{ once: true }} transition={{ duration: 1.1, delay: i * 0.04 }} />
                    </div>
                    {/* Sudah / Belum badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#D1FAE5' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: P.forest }} />
                        <span className="text-[10px] font-black" style={{ color: P.forest }}>Lapor: {k.submittedSchools}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: k.unsubmittedList.length > 0 ? '#FEE2E2' : '#D1FAE5' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: k.unsubmittedList.length > 0 ? '#DC2626' : P.forest }} />
                        <span className="text-[10px] font-black" style={{ color: k.unsubmittedList.length > 0 ? '#DC2626' : P.forest }}>Belum: {k.unsubmittedList.length}</span>
                      </div>
                      <span className="text-[9px] text-slate-300 ml-auto font-medium hidden sm:block">Klik →</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 sm:py-12 px-4"
        style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})` }}>
        <div className="max-w-7xl mx-auto">
          {/* Top divider */}
          <div className="h-px w-full mb-6 sm:mb-8" style={{ background: `linear-gradient(90deg, transparent, ${P.gold}30, transparent)` }} />

          {/* Footer body */}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between sm:items-center">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${P.gold}20`, border: `1px solid ${P.gold}30` }}>
                <School className="w-5 h-5" style={{ color: P.gold }} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white leading-none">SIMPEKA SD Tabalong</h3>
                <p className="text-[9px] font-medium mt-0.5 leading-relaxed" style={{ color: P.sage }}>
                  Sistem Informasi Monitoring Pelaporan Kegiatan Sekolah
                </p>
              </div>
            </div>

            {/* Year badges */}
            <div className="flex flex-col items-center sm:items-end gap-1">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: P.sage }}>Tahun Data</p>
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-end">
                {Array.from({ length: new Date().getFullYear() - 2026 + 1 }, (_, i) => (2026 + i)).map(yr => (
                  <span key={yr} className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${P.gold}20`, color: P.gold }}>{yr}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] font-medium leading-relaxed" style={{ color: `${P.sage}90` }}>
              &copy; {new Date().getFullYear()} | Bidang Pembinaan SD - Disdikbud Tabalong. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {/* ── SCHOOL POPUP MODAL ── */}
      <AnimatePresence>
        {selectedKecamatan && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(26,60,43,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedKecamatan(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl mx-2"
              style={{ backgroundColor: P.cream, maxHeight: '92vh' }}
            >
              {/* Modal header */}
              <div className="p-6 pb-4" style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 shrink-0" style={{ color: P.gold }} />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.gold }}>Kecamatan</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white leading-tight">{selectedKecamatan.name}</h3>
                    <p className="text-xs sm:text-sm mt-1" style={{ color: `${P.sage}` }}>
                      {selectedKecamatan.totalSchools} sekolah · capaian {selectedKecamatan.completion}%
                    </p>
                  </div>
                  <button onClick={() => setSelectedKecamatan(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white/60 hover:text-white transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>✕</button>
                </div>
                {/* Summary badges */}
                <div className="flex gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-black text-white">Sudah Lapor: {selectedKecamatan.submittedSchools}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs font-black text-white">Belum Lapor: {selectedKecamatan.unsubmittedList.length}</span>
                  </div>
                </div>
              </div>

              {/* School list */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 175px)' }}>
                {selectedKecamatan.unsubmittedList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#D1FAE5' }}>
                      <CheckCircle2 className="h-7 w-7" style={{ color: P.forest }} />
                    </div>
                    <p className="font-black text-slate-700">Semua sudah melapor!</p>
                    <p className="text-xs text-slate-400 mt-1">Seluruh sekolah di kecamatan ini telah mengirim laporan</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-1 mb-3">Daftar Sekolah Belum Melapor</p>
                    {selectedKecamatan.unsubmittedList.map((s, idx) => (
                      <motion.div key={s.uid || idx}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white border"
                        style={{ borderColor: '#FEE2E250' }}>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black"
                          style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>{idx + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-slate-800 break-words leading-snug">{s.nama_instansi || 'Sekolah'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{s.npsn ? `NPSN: ${s.npsn}` : '—'}</div>
                        </div>
                        <div className="px-2 py-1 rounded-lg text-[9px] font-black shrink-0" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>Belum</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
