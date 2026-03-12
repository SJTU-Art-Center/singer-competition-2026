import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../utils/avatar';

export default function PkBattle({ gameState }) {
    const pkMatches = gameState.pkMatches || [];
    // 查找最新触发过 active 或者是 finished 的最新一条
    const activeMatch = [...pkMatches].reverse().find(m => m.status === 'active' || m.status === 'finished');

    if (!activeMatch) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">16强对战初始化中...</div>;
    }

    const cInfo = gameState.players.find(p => p.id === activeMatch.challengerId);
    const mInfo = gameState.players.find(p => p.id === activeMatch.masterId);

    const isFinished = activeMatch.status === 'finished';
    const winner = activeMatch.winner; // 'master', 'both_pending'

    // Animation variants
    const getCardVariant = (role) => {
        if (!isFinished) return { scale: 1, opacity: 1, filter: 'grayscale(0%)' };

        if (winner === 'both_pending') {
            // 情形B: 两人都待定
            return {
                scale: 0.9,
                opacity: 0.8,
                y: 80,
                filter: 'grayscale(60%)',
                transition: { type: 'spring', stiffness: 100 }
            };
        }

        if (winner === 'master') {
            if (role === 'master') {
                // 擂主晋级 (情形A)
                return {
                    scale: 1.15,
                    y: -40,
                    boxShadow: "0 0 80px rgba(251, 191, 36, 0.8)",
                    borderColor: "rgba(251, 191, 36, 1)",
                    zIndex: 10,
                    transition: { duration: 0.8, type: 'spring' }
                };
            } else {
                // 挑战者淘汰 (情形A)
                return {
                    scale: 0.7,
                    opacity: 0.4,
                    y: 180,
                    filter: 'grayscale(100%) blur(4px)',
                    transition: { duration: 0.8 }
                };
            }
        }
        return {};
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[600px] mt-2 relative">
            {/* 晋级全屏光晕 */}
            <AnimatePresence>
                {isFinished && winner === 'master' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.4, scale: 2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-amber-500 rounded-full blur-[150px] pointer-events-none -z-10 right-[-30%]"
                    />
                )}
            </AnimatePresence>

            <h2 className="text-5xl font-black mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-rose-400 tracking-[0.5em] italic">1V1 BATTLE</h2>

            <div className="flex items-center justify-center space-x-20 w-full relative z-10">
                {/* 挑战者卡片 */}
                <motion.div
                    animate={getCardVariant('challenger')}
                    className="bg-[var(--color-card-bg)] border-2 border-blue-500/50 rounded-3xl p-8 flex flex-col items-center w-[420px] relative overflow-hidden backdrop-blur-xl text-[var(--color-text-main)]"
                >
                    <div className="absolute top-0 w-full h-2 bg-blue-500"></div>
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold tracking-widest shadow-md">挑战者</div>
                    <img src={getFullAvatarUrl(cInfo?.avatar)} alt={cInfo?.name} className="w-56 h-56 rounded-full border-[6px] border-blue-400/80 mt-6 object-cover shadow-[0_0_40px_rgba(59,130,246,0.5)]" />
                    <h3 className="text-5xl font-black mt-8 tracking-wider">{cInfo?.name || "未知选手"}</h3>

                    <div className="mt-8 text-center min-h-[120px] flex items-center justify-center w-full">
                        {isFinished ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                                className={`text-[5.5rem] leading-none font-mono font-black ${winner === 'master' ? 'text-slate-500' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-300'}`}
                            >
                                {activeMatch.challengerScore?.toFixed(2)}
                            </motion.div>
                        ) : (
                            <div className="text-4xl text-blue-300 font-bold opacity-60 animate-pulse">演唱中...</div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isFinished && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`w-full mt-6 py-4 text-center text-3xl font-black tracking-widest text-white rounded-xl shadow-lg border-2 ${winner === 'both_pending' ? 'bg-slate-700 border-slate-500 text-amber-200' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                            >
                                {winner === 'both_pending' ? '🛡️ 落入待定区' : '❌ 淘 汰'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* VS 图标 */}
                <motion.div
                    animate={{
                        scale: isFinished ? 0.6 : 1.2,
                        opacity: isFinished ? 0.3 : 1
                    }}
                    transition={{ type: 'spring' }}
                    className="text-[8rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-400 to-rose-700 italic drop-shadow-[0_0_30px_rgba(225,29,72,0.8)] z-20"
                >
                    VS
                </motion.div>

                {/* 擂主卡片 */}
                <motion.div
                    animate={getCardVariant('master')}
                    className="bg-[var(--color-card-bg)] border-2 border-rose-500/50 rounded-3xl p-8 flex flex-col items-center w-[420px] relative overflow-hidden backdrop-blur-xl text-[var(--color-text-main)]"
                >
                    <div className="absolute top-0 w-full h-2 bg-rose-500"></div>
                    <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1 rounded text-sm font-bold tracking-widest shadow-md">擂主</div>
                    <img src={getFullAvatarUrl(mInfo?.avatar)} alt={mInfo?.name} className="w-56 h-56 rounded-full border-[6px] border-rose-400/80 mt-6 object-cover shadow-[0_0_40px_rgba(225,29,72,0.5)]" />
                    <h3 className="text-5xl font-black mt-8 tracking-wider">{mInfo?.name || "未知擂主"}</h3>

                    <div className="mt-8 text-center min-h-[120px] flex items-center justify-center w-full">
                        {isFinished ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.1 }}
                                className={`text-[5.5rem] leading-none font-mono font-black ${winner === 'master' ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-300' : 'text-slate-400'}`}
                            >
                                {activeMatch.masterScore?.toFixed(2)}
                            </motion.div>
                        ) : (
                            <div className="text-4xl text-rose-300 font-bold opacity-60 animate-pulse">演唱中...</div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isFinished && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`w-full mt-6 py-4 text-center text-3xl font-black tracking-widest text-white rounded-xl shadow-xl border-2 ${winner === 'both_pending' ? 'bg-slate-700 border-slate-500 text-amber-200' : 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)]'}`}
                            >
                                {winner === 'both_pending' ? '🛡️ 落入待定区' : '🏆 守擂成功晋级'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
