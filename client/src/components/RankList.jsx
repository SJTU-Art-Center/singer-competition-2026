import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../utils/avatar';

export default function RankList({ players }) {
    // Sort players by score descending. If scores are equal, keep original ID order as tiebreaker
    const sortedPlayers = [...players].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // For 0 score, just keep them at the bottom
        return a.id - b.id;
    });

    const getRankZoneStyle = (index) => {
        if (index < 2) return "bg-[var(--rank-king-bg)] border-[var(--rank-king-border)] text-[var(--rank-king-text)] shadow-[var(--rank-king-shadow)] border-2";
        if (index < 10) return "bg-[var(--rank-master-bg)] border-[var(--rank-master-border)] text-[var(--rank-master-text)] shadow-[var(--rank-master-shadow)] border";
        if (index < 18) return "bg-[var(--rank-challenger-bg)] border-[var(--rank-challenger-border)] text-[var(--rank-challenger-text)] shadow-[var(--rank-challenger-shadow)] border";
        return "bg-[var(--rank-eliminated-bg)] border-[var(--rank-eliminated-border)] text-[var(--rank-eliminated-text)] opacity-70 border";
    };

    const getRankLabel = (index) => {
        if (index < 2) return "大魔王区";
        if (index < 10) return "擂主区";
        if (index < 18) return "挑战者区";
        return "淘汰区";
    };

    return (
        <div className="w-full max-w-7xl mx-auto pb-12">
            <div className="flex justify-between items-end mb-8 mt-12 px-2">
                <h2 className="text-3xl font-bold tracking-widest border-l-4 border-blue-500 pl-4 text-[var(--color-text-main)]">第一轮：30进18 排位战</h2>
                <div className="flex space-x-6 text-sm font-bold text-[var(--color-text-main)]">
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--rank-king-border)' }}></div> 大魔王 (2名)</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--rank-master-border)' }}></div> 擂主 (8名)</div>
                    <div className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{ background: 'var(--rank-challenger-border)' }}></div> 挑战者 (8名)</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {sortedPlayers.map((player, index) => (
                        <motion.div
                            key={player.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className={`rounded-xl p-4 flex items-center justify-between backdrop-blur-md relative overflow-hidden transition-all duration-300 ${getRankZoneStyle(index)}`}
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-0 left-0 bg-black/60 text-xs px-3 py-1 rounded-br-xl font-black text-amber-200 tracking-wider z-10">
                                NO.{index + 1} | {getRankLabel(index)}
                            </div>

                            <div className="flex items-center space-x-4 mt-2">
                                <img src={getFullAvatarUrl(player.avatar)} alt={player.name} className="w-16 h-16 rounded-full border-2 border-white/30 shadow-2xl object-cover relative z-10" />
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold tracking-wide">{player.name}</h3>
                                </div>
                            </div>
                            <div className="text-5xl font-black font-mono tracking-tighter pr-2 relative z-10">
                                <ScoreCounter value={player.score} />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

// 动态数字滚动组件
function ScoreCounter({ value }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let start = displayValue;
        const end = value;
        if (start === end) return;

        // 如果是 0，跳过缓慢动画直接置零
        if (end === 0) {
            setDisplayValue(0);
            return;
        }

        const duration = 1500;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo function for cool deceleration
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = start + (end - start) * easeProgress;

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setDisplayValue(end);
            }
        };

        requestAnimationFrame(tick);
    }, [value]);

    return <span>{displayValue.toFixed(2)}</span>;
}
