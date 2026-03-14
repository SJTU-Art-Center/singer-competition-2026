import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function DemonKing({ gameState }) {
    const { activeDemonKingId, demonKingAvgScore, dkScoreSubmitted, players } = gameState;

    const dk = players.find(p => p.id === activeDemonKingId);

    if (!dk) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">等待大魔王登场...</div>;
    }

    const targetScore = parseFloat(demonKingAvgScore);
    const finalScore = dkScoreSubmitted ? dk.scoreDK : 0;
    const isSuccess = dkScoreSubmitted && finalScore >= targetScore;
    const isFailed = dkScoreSubmitted && finalScore < targetScore;

    return (
        <div className="flex flex-col items-center justify-start w-full h-full pt-1 pb-2 relative overflow-hidden">
            {/* 晋级全屏光晕 */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.16, scale: 1.45 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-emerald-500 rounded-full blur-[80px] pointer-events-none -z-10"
                    />
                )}
            </AnimatePresence>

            <motion.h2
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[2.7rem] font-black mt-[58px] mb-3 text-transparent bg-clip-text bg-gradient-to-b from-teal-400 to-emerald-700 tracking-[0.3em] italic"
            >
                大魔王降临
            </motion.h2>

            <div className="w-full flex-1 min-h-0 relative z-10 flex items-center justify-center overflow-hidden">
                <div className="w-full max-w-[640px] translate-y-[2%]">
                    <motion.div
                        animate={{ scale: isSuccess ? 1.03 : 1, y: isSuccess ? -8 : (isFailed ? 14 : 0) }}
                        transition={{ type: 'spring' }}
                        className={`bg-[var(--color-card-bg)] border-2 rounded-3xl px-5 pt-4 pb-3.5 flex flex-col items-center w-full relative overflow-hidden backdrop-blur-xl ${isSuccess ? 'border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.35)]' : (isFailed ? 'border-slate-600 grayscale brightness-75' : 'border-teal-500 shadow-lg')}`}
                    >
                    <div className="rounded-full p-[3px] bg-gradient-to-b from-white/40 to-white/5 shadow-[0_6px_24px_rgba(0,0,0,0.65),0_0_24px_rgba(20,184,166,0.18)] mt-3 mb-4">
                        <img src={getFullAvatarUrl(dk.avatar)} alt={dk.name} className={`w-30 h-30 rounded-full border-[3px] object-cover block ${isSuccess ? 'border-emerald-400/60' : 'border-teal-500/40'}`} />
                    </div>
                    <h3 className="text-[clamp(1.3rem,2.2vw,1.7rem)] font-black tracking-wide text-center">{dk.name}</h3>

                    <div className="w-full mt-5 px-2 relative flex flex-col items-center">
                        <div className="w-full flex flex-col items-end">
                            <div className="text-teal-400 font-bold text-sm mb-1 flex items-center">
                                <span className="mr-2">🏆 及格线 (16人均分)</span>
                                <span className="font-mono text-lg">{targetScore.toFixed(3)}</span>
                            </div>
                            <div className="w-full h-[2px] bg-teal-500/80 relative">
                                <div className="absolute top-[-4px] right-0 w-2.5 h-2.5 bg-teal-400 rounded-full shadow-md"></div>
                            </div>
                        </div>

                        <div className="mt-5 w-full flex justify-center pb-3.5 border-b border-slate-700/80">
                            <div className="text-[clamp(2.2rem,4.9vw,3.9rem)] leading-none font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                                {dkScoreSubmitted ? (
                                    <AnimatedScore value={finalScore} target={targetScore} isSuccess={isSuccess} />
                                ) : (
                                    <span className="text-slate-600 opacity-50">0.000</span>
                                )}
                            </div>
                        </div>

                        <AnimatePresence>
                            {dkScoreSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 1.5, type: 'spring' }}
                                    className={`w-[88%] mt-3.5 py-2.5 text-center text-[clamp(1rem,1.8vw,1.6rem)] font-black tracking-[0.08em] text-white rounded-xl shadow-lg border-2 ${isSuccess ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-700 border-slate-500 text-slate-300'}`}
                                >
                                    {isSuccess ? '👑 守擂成功 · 直接晋级 👑' : '🛡️ 守擂失败 · 落入待定区 🛡️'}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// 带颜色渐变和音效节奏的分数跳动组件
function AnimatedScore({ value, target, isSuccess }) {
    const [displayValue, setDisplayValue] = useState(0);
    const [colorClass, setColorClass] = useState("from-white to-slate-400");

    useEffect(() => {
        setDisplayValue(0);
        setColorClass("from-white to-slate-400");

        let start = 0;
        const end = value;
        const duration = 2500; // 长时间滚动营造紧张感
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 缓动函数
            const easeProgress = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const current = start + (end - start) * easeProgress;

            setDisplayValue(current);

            // 当突破红线瞬间，绿色
            if (current >= target) {
                setColorClass("from-teal-200 to-emerald-400");
            }

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setDisplayValue(end);
                if (!isSuccess) {
                    setColorClass("from-slate-400 to-slate-600");
                }
            }
        };

        requestAnimationFrame(tick);
    }, [value, target, isSuccess]);

    return <span className={`text-transparent bg-clip-text bg-gradient-to-b ${colorClass}`}>{displayValue.toFixed(3)}</span>;
}
