import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../utils/avatar';

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
        <div className="flex flex-col items-center justify-center w-full min-h-[600px] mt-10 relative">
            {/* 晋级全屏光晕 */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.6, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-yellow-500 rounded-full blur-[200px] pointer-events-none -z-10"
                    />
                )}
            </AnimatePresence>

            <motion.h2
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-rose-700 tracking-[0.5em] italic"
            >
                大魔王降临
            </motion.h2>

            <div className="flex flex-col items-center justify-center w-full relative z-10 max-w-4xl">
                <motion.div
                    animate={{ scale: isSuccess ? 1.05 : 1, y: isSuccess ? -20 : (isFailed ? 20 : 0) }}
                    transition={{ type: 'spring' }}
                    className={`bg-[var(--color-card-bg)] border-4 rounded-[40px] p-12 flex flex-col items-center w-full relative overflow-hidden backdrop-blur-xl ${isSuccess ? 'border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.6)]' : (isFailed ? 'border-slate-600 grayscale brightness-75' : 'border-red-500 shadow-[0_0_40px_rgba(225,29,72,0.4)]')}`}
                >
                    <img src={getFullAvatarUrl(dk.avatar)} alt={dk.name} className={`w-64 h-64 rounded-full border-[8px] object-cover mt-4 mb-8 ${isSuccess ? 'border-amber-400' : 'border-red-500'}`} />
                    <h3 className="text-6xl font-black tracking-widest">{dk.name}</h3>

                    <div className="w-full mt-16 px-12 relative flex flex-col items-center">
                        {/* 目标均分指示线 */}
                        <div className="absolute top-0 right-16 flex flex-col items-end">
                            <div className="text-rose-400 font-bold text-2xl mb-2 flex items-center">
                                <span className="mr-2">🏆 及格线 (16人均分)</span>
                                <span className="font-mono text-3xl">{targetScore.toFixed(3)}</span>
                            </div>
                            <div className="w-[800px] h-[3px] bg-red-500 relative">
                                <div className="absolute top-[-5px] right-0 w-3 h-3 bg-red-400 rounded-full shadow-[0_0_10px_red]"></div>
                            </div>
                        </div>

                        <div className="mt-20 w-full flex justify-center pb-8 border-b-2 border-slate-700">
                            {/* 动态分数跳动 */}
                            <div className="text-[8rem] leading-none font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
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
                                    className={`w-[80%] mt-12 py-6 text-center text-5xl font-black tracking-widest text-white rounded-2xl shadow-2xl border-4 ${isSuccess ? 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-300 shadow-[0_0_40px_rgba(251,191,36,0.8)]' : 'bg-slate-700 border-slate-500 text-slate-300'}`}
                                >
                                    {isSuccess ? '👑 守擂成功 · 直接晋级 👑' : '🛡️ 守擂失败 · 落入待定区 🛡️'}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
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

            // 当突破红线瞬间，变色为金色
            if (current >= target) {
                setColorClass("from-amber-200 to-yellow-500");
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
