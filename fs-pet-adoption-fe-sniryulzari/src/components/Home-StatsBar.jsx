import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { getPetStats } from "../api/pets";

function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

function StatItem({ value, label, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useCountUp(inView ? value : 0);

  return (
    <div className="stats-bar-item" ref={ref}>
      <span className="stats-bar-number">{count}{suffix}</span>
      <span className="stats-bar-label">{label}</span>
    </div>
  );
}

export default function HomeStatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPetStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const happyFamilies = stats.adopted + stats.fostered;

  return (
    <motion.div
      className="stats-bar"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5 }}
    >
      <StatItem value={stats.adopted}  label="Pets Adopted" />
      <div className="stats-bar-divider" aria-hidden="true" />
      <StatItem value={stats.fostered} label="Currently Fostered" />
      <div className="stats-bar-divider" aria-hidden="true" />
      <StatItem value={happyFamilies}  label="Happy Families" suffix="+" />
      <div className="stats-bar-divider" aria-hidden="true" />
      <StatItem value={stats.available} label="Pets Waiting" />
    </motion.div>
  );
}
