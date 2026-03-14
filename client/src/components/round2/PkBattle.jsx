import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';

export default function PkBattle({ gameState }) {
    const pkMatches = gameState.pkMatches || [];
    // 使用 screenMatchIndex 精确选择大屏展示的对战，该字段由管理后台独立控制
    const screenIdx = gameState.screenMatchIndex ?? 0;
    const activeMatch = pkMatches[screenIdx] || null;

    if (!activeMatch) {
        return <div className="text-center mt-32 text-6xl text-slate-700 font-bold loading-dots">16强对战初始化中...</div>;
    }

    const cInfo = gameState.players.find(p => p.id === activeMatch.challengerId);
    const mInfo = gameState.players.find(p => p.id === activeMatch.masterId);

    const isFinished = activeMatch.status === 'finished';
    const winner = activeMatch.winner; // 'master', 'both_pending'
    const isMasterWin = winner === 'master';
    const isBothPending = winner === 'both_pending';
    const pairResultText = isMasterWin ? '晋级 & 淘汰' : isBothPending ? '待定 & 待定' : '结果待确认';

    // Animation variants
    const getCardVariant = (role) => {
        if (!isFinished) return { scale: 1, opacity: 1, filter: 'grayscale(0%)' };

        if (winner === 'both_pending') {
            // 情形B: 两人都待定
            return {
                scale: 0.8,
                opacity: 0.82,
                y: 26,
                filter: 'grayscale(60%)',
                transition: { type: 'spring', stiffness: 110, damping: 16 }
            };
        }

        if (winner === 'master') {
            if (role === 'master') {
                // 擂主晋级 (情形A)
                return {
                    scale: 1.03,
                    y: -4,
                    boxShadow: "0 0 50px rgba(251, 191, 36, 0.58)",
                    borderColor: "rgba(251, 191, 36, 1)",
                    zIndex: 10,
                    transition: { duration: 0.75, type: 'spring', stiffness: 120, damping: 16 }
                };
            } else {
                // 挑战者淘汰 (情形A)
                return {
                    scale: 0.74,
                    opacity: 0.45,
                    y: 42,
                    filter: 'grayscale(100%) blur(4px)',
                    transition: { duration: 0.75 }
                };
            }
        }
        return {};
    };

    return (
        <div className="flex flex-col items-center justify-end w-full h-full pt-1 pb-2 relative overflow-hidden">
            {/* 晋级全屏光晕 */}
            <AnimatePresence>
                {isFinished && isMasterWin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.13, scale: 1.55 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-emerald-500 rounded-full blur-[80px] pointer-events-none -z-10 right-[-18%]"
                    />
                )}
                {isFinished && isBothPending && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 0.16, scale: 1.45 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2 }}
                        className="absolute inset-0 bg-cyan-500 rounded-full blur-[75px] pointer-events-none -z-10"
                    />
                )}
            </AnimatePresence>

            <h2 className="text-4xl font-black mt-4 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 tracking-[0.35em] italic">1V1 BATTLE</h2>

            <AnimatePresence>
                {isFinished && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 12 }}
                        className={`mb-2 px-8 py-2.5 rounded-2xl border-2 text-3xl font-black tracking-[0.18em] ${isMasterWin ? 'bg-emerald-600/30 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.45)]' : isBothPending ? 'bg-cyan-700/30 border-cyan-300 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-amber-700/30 border-amber-300 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.4)]'}`}
                    >
                        结果：{pairResultText}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-start justify-center gap-6 w-full max-w-[1060px] relative z-10 px-4 pb-2 mt-2 flex-wrap md:flex-nowrap">
                {/* 挑战者卡片 */}
                <motion.div
                    animate={getCardVariant('challenger')}
                    className="bg-[var(--color-card-bg)] border-2 border-teal-500/50 rounded-3xl px-5 pt-5 pb-4 flex flex-col items-center w-[clamp(260px,29%,320px)] min-h-[400px] relative overflow-hidden backdrop-blur-xl text-[var(--color-text-main)]"
                >
                    <div className="absolute top-0 w-full h-2 bg-teal-500"></div>
                    <div className="absolute top-4 left-4 bg-teal-600 text-white px-3 py-1 rounded text-sm font-bold tracking-widest shadow-md">挑战者</div>
                    <div className="rounded-full p-[3px] bg-gradient-to-b from-white/40 to-white/5 shadow-[0_6px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(20,184,166,0.25)] mt-8">
                        <img src={getFullAvatarUrl(cInfo?.avatar)} alt={cInfo?.name} className="w-36 h-36 rounded-full border-[3px] border-teal-400/50 object-cover block" />
                    </div>
                    <h3 className="text-[clamp(1.3rem,2.2vw,1.8rem)] font-black mt-4 tracking-wide text-center leading-tight min-h-[64px] flex items-center justify-center">{cInfo?.name || "未知选手"}</h3>

                    <div className="mt-4 text-center min-h-[84px] flex items-center justify-center w-full">
                        {isFinished ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                                className={`text-[clamp(2.2rem,4.1vw,3.6rem)] leading-none font-mono font-black ${isMasterWin ? 'text-slate-500' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-teal-300'}`}
                            >
                                {activeMatch.challengerScore?.toFixed(2)}
                            </motion.div>
                        ) : (
                            <div className="text-3xl text-teal-300 font-bold opacity-60 animate-pulse">演唱中...</div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isFinished && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`w-full mt-3 py-2.5 text-center text-xl font-black tracking-[0.12em] text-white rounded-xl shadow-md border-2 ${isBothPending ? 'bg-slate-700 border-slate-500 text-teal-200' : isMasterWin ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-amber-800/60 border-amber-500 text-amber-100'}`}
                            >
                                {isBothPending ? '🛡️ 待定池' : isMasterWin ? '❌ 直接淘汰' : '⚠️ 结果待确认'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* VS 图标 */}
                <motion.div
                    animate={{
                        scale: isFinished ? 0.62 : 1,
                        opacity: isFinished ? 0.3 : 1
                    }}
                    transition={{ type: 'spring' }}
                    className="text-[clamp(2.6rem,5.2vw,4.6rem)] mt-4 md:mt-20 font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 to-emerald-700 italic drop-shadow-lg z-20"
                >
                    VS
                </motion.div>

                {/* 擂主卡片 */}
                <motion.div
                    animate={getCardVariant('master')}
                    className="bg-[var(--color-card-bg)] border-2 border-emerald-500/50 rounded-3xl px-5 pt-5 pb-4 flex flex-col items-center w-[clamp(260px,29%,320px)] min-h-[400px] relative overflow-hidden backdrop-blur-xl text-[var(--color-text-main)]"
                >
                    <div className="absolute top-0 w-full h-2 bg-emerald-500"></div>
                    <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold tracking-widest shadow-md">擂主</div>
                    <div className="rounded-full p-[3px] bg-gradient-to-b from-white/40 to-white/5 shadow-[0_6px_24px_rgba(0,0,0,0.6),0_0_20px_rgba(16,185,129,0.25)] mt-8">
                        <img src={getFullAvatarUrl(mInfo?.avatar)} alt={mInfo?.name} className="w-36 h-36 rounded-full border-[3px] border-emerald-400/50 object-cover block" />
                    </div>
                    <h3 className="text-[clamp(1.3rem,2.2vw,1.8rem)] font-black mt-4 tracking-wide text-center leading-tight min-h-[64px] flex items-center justify-center">{mInfo?.name || "未知擂主"}</h3>

                    <div className="mt-4 text-center min-h-[84px] flex items-center justify-center w-full">
                        {isFinished ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.1 }}
                                className={`text-[clamp(2.2rem,4.1vw,3.6rem)] leading-none font-mono font-black ${isMasterWin ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-300' : 'text-slate-400'}`}
                            >
                                {activeMatch.masterScore?.toFixed(2)}
                            </motion.div>
                        ) : (
                            <div className="text-3xl text-emerald-300 font-bold opacity-60 animate-pulse">演唱中...</div>
                        )}
                    </div>

                    <AnimatePresence>
                        {isFinished && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`w-full mt-3 py-2.5 text-center text-xl font-black tracking-[0.12em] text-white rounded-xl shadow-md border-2 ${isBothPending ? 'bg-slate-700 border-slate-500 text-teal-200' : isMasterWin ? 'bg-emerald-600 border-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.4)]' : 'bg-amber-800/60 border-amber-500 text-amber-100'}`}
                            >
                                {isBothPending ? '🛡️ 待定池' : isMasterWin ? '🏆 直接晋级十强' : '⚠️ 结果待确认'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
