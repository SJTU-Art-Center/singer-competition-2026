import PropTypes from 'prop-types';
import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { formatPlayerNumber } from '../../utils/playerIdentity';

function RollingScore({ value, active }) {
    const [displayValue, setDisplayValue] = useState(active ? 0 : Number(value || 0));
    const frameRef = useRef(null);

    useEffect(() => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        if (!active) {
            setDisplayValue(Number(value || 0));
            return;
        }

        const target = Number(value || 0);
        const duration = 1500;
        let startTime = null;

        setDisplayValue(0);

        const tick = (timestamp) => {
            if (startTime === null) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(2, -10 * progress);
            const current = target * eased;

            setDisplayValue(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(tick);
            } else {
                setDisplayValue(target);
            }
        };

        frameRef.current = requestAnimationFrame(tick);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [active, value]);

    return <span>{displayValue.toFixed(2)}</span>;
}

RollingScore.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    active: PropTypes.bool.isRequired,
};

const PlayerCard = ({ player, layoutId, showScore, scoreRollActive, scoreValue, isAdvancedNode, isEliminatedNode, xsmall = false, compact = false, small = false, medium = false, large = false, mlarge = false, xlarge = false, extraScale = false, slowTransition = false }) => {
    let targetScale = 1;
    if (isAdvancedNode) targetScale = 1.05;
    else if (isEliminatedNode) targetScale = 0.85;
    else if (extraScale) targetScale = 1.05;

    const displayScore = scoreValue !== undefined ? scoreValue : (player.round2Score ?? player.scoreDK ?? player.score);

    return (
        <motion.div
            layoutId={layoutId}
            animate={{
                scale: targetScale,
                opacity: isEliminatedNode ? 0.6 : 1,
                y: 0,
            }}
            transition={slowTransition ? { type: 'spring', stiffness: 60, damping: 14 } : { type: 'spring', stiffness: 200, damping: 25 }}
            className={`flex flex-col items-center justify-center rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] backdrop-blur-[6px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_30px_rgba(2,6,23,0.22)] overflow-hidden shrink-0 ${xsmall ? 'w-[98px] h-[142px] p-2 gap-1'
                : compact ? 'w-[110px] h-[155px] p-2 gap-1'
                    : xlarge ? 'w-[280px] h-[390px] p-6 gap-3'
                        : mlarge ? 'w-[200px] h-[290px] p-4 gap-2'
                            : large ? 'w-[148px] h-[210px] p-3 gap-2'
                                : medium ? 'w-[145px] h-[204px] p-2.5 gap-1.5'
                                    : small ? 'w-[122px] h-[172px] p-2 gap-1.5'
                                        : 'w-[135px] h-[190px] p-3 gap-2'
                }`}
        >
            <img
                src={getFullAvatarUrl(player.avatar)}
                alt={player.name}
                className={`${xsmall ? 'w-[56px] h-[56px]'
                    : compact ? 'w-[64px] h-[64px]'
                        : xlarge ? 'w-[150px] h-[150px]'
                            : mlarge ? 'w-[110px] h-[110px]'
                                : large ? 'w-[88px] h-[88px]'
                                    : medium ? 'w-[75px] h-[75px]'
                                        : small ? 'w-[70px] h-[70px]'
                                            : 'w-[80px] h-[80px]'
                    } rounded-[20px] border border-white/25 object-cover shadow-[0_8px_18px_rgba(2,6,23,0.18)] mb-1 shrink-0`}
            />
            <div className="flex flex-col items-center text-center w-full px-1 min-h-0">
                <div className={`text-white/50 tracking-widest font-black uppercase ${xsmall ? 'text-[8px]' : compact ? 'text-[9px]' : xlarge ? 'text-[16px]' : mlarge ? 'text-[13px]' : large ? 'text-[11px]' : medium ? 'text-[9px]' : small ? 'text-[9px]' : 'text-[10px]'}`}>
                    No.{formatPlayerNumber(player)}
                </div>
                <div className={`font-black text-white truncate w-full ${xsmall ? 'text-[11px]' : compact ? 'text-[13px]' : xlarge ? 'text-[26px]' : mlarge ? 'text-[20px]' : large ? 'text-[17px]' : medium ? 'text-[14px]' : small ? 'text-[13px]' : 'text-[15px]'}`}>
                    {player.name}
                </div>
            </div>
            {showScore && (
                <div className={`font-mono font-black text-teal-100 mt-auto ${xsmall ? 'text-[14px]' : compact ? 'text-[16px]' : xlarge ? 'text-[36px]' : mlarge ? 'text-[26px]' : large ? 'text-[22px]' : medium ? 'text-[18px]' : small ? 'text-[17px]' : 'text-[20px]'}`}>
                    <RollingScore value={displayScore} active={scoreRollActive} />
                </div>
            )}
        </motion.div>
    );
};

PlayerCard.propTypes = {
    player: PropTypes.object.isRequired,
    layoutId: PropTypes.string.isRequired,
    showScore: PropTypes.bool.isRequired,
    scoreRollActive: PropTypes.bool.isRequired,
    scoreValue: PropTypes.number,
    isAdvancedNode: PropTypes.bool,
    isEliminatedNode: PropTypes.bool,
    xsmall: PropTypes.bool,
    compact: PropTypes.bool,
    small: PropTypes.bool,
    medium: PropTypes.bool,
    large: PropTypes.bool,
    mlarge: PropTypes.bool,
    xlarge: PropTypes.bool,
    extraScale: PropTypes.bool,
    slowTransition: PropTypes.bool,
};

export default function Resurrection({ gameState }) {
    const stage = Number(gameState.screenFinalStageIndex ?? 1);
    const players = Array.isArray(gameState.players) ? gameState.players : [];

    // Stage 4 动画相位（原 s2Phase）
    const [s4Phase, setS4Phase] = useState(0);
    // Stage 5 动画相位（原 s3Phase）
    const [s5Phase, setS5Phase] = useState(0);

    useEffect(() => {
        if (stage === 4) {
            setS4Phase(0);
            const t1 = setTimeout(() => setS4Phase(1), 2500);
            const t2 = setTimeout(() => setS4Phase(2), 3300);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        } else {
            setS4Phase(0);
        }
    }, [stage]);

    useEffect(() => {
        if (stage === 5) {
            setS5Phase(0);
            const t = setTimeout(() => setS5Phase(1), 800);
            return () => clearTimeout(t);
        } else {
            setS5Phase(0);
        }
    }, [stage]);

    // ── 数据派生 ──

    // 大魔王：第一轮总分最高的2人（与 scoreDK 字段无关）
    const demonKings = useMemo(() => {
        return [...players]
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if ((b.judgeScore ?? 0) !== (a.judgeScore ?? 0)) return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
                return a.id - b.id;
            })
            .slice(0, 2);
    }, [players]);

    const demonKingIds = useMemo(() => new Set(demonKings.map(p => p.id)), [demonKings]);

    // 晋级擂主：status='advanced' 且不是大魔王（第二轮PK赢了的擂主）
    const advancedMasters = useMemo(() => {
        return players
            .filter(p => p.status === 'advanced' && !demonKingIds.has(p.id))
            .sort((a, b) => {
                if ((b.round2Score ?? 0) !== (a.round2Score ?? 0)) return (b.round2Score ?? 0) - (a.round2Score ?? 0);
                if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
                return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
            });
    }, [players, demonKingIds]);

    // 待定区（按编号顺序展示）
    const pendingPlayers = useMemo(() => {
        return players.filter(p => p.status === 'pending').sort((a, b) => a.id - b.id);
    }, [players]);

    // 十强剩余名额：10 - 晋级大魔王数 - 晋级擂主数
    const demonKingsAdvanced = useMemo(() => demonKings.filter(p => p.status === 'advanced'), [demonKings]);
    const remainingSpots = Math.max(0, 10 - demonKingsAdvanced.length - advancedMasters.length);

    const pendingSorted = useMemo(() => {
        return [...pendingPlayers].sort((a, b) => {
            const aR2 = a.round2Score ?? a.scoreDK ?? 0;
            const bR2 = b.round2Score ?? b.scoreDK ?? 0;
            if (bR2 !== aR2) return bR2 - aR2;
            if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
            return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
        });
    }, [pendingPlayers]);

    const advancedFromPending = useMemo(() => pendingSorted.slice(0, remainingSpots), [pendingSorted, remainingSpots]);
    const eliminatedFromPending = useMemo(() => pendingSorted.slice(remainingSpots), [pendingSorted, remainingSpots]);

    // 完整十强：大魔王晋级 + 晋级擂主 + 待定区晋级
    const fullTop10 = useMemo(() => {
        return [...demonKingsAdvanced, ...advancedMasters, ...advancedFromPending].sort((a, b) => {
            const aScore = a.round2Score ?? a.scoreDK ?? a.score ?? 0;
            const bScore = b.round2Score ?? b.scoreDK ?? b.score ?? 0;
            if (bScore !== aScore) return bScore - aScore;
            if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
            return (b.judgeScore ?? 0) - (a.judgeScore ?? 0);
        });
    }, [demonKingsAdvanced, advancedMasters, advancedFromPending]);

    // ── 状态派生 ──
    const isStage1 = stage === 1;
    const isStage2 = stage === 2;
    const isStage3 = stage === 3;
    const isStage4 = stage === 4;
    const isStage5 = stage === 5;

    // 待定区分数：Stage 4 才揭分
    const showPendingScore = stage >= 4;
    const scoreRollActive = stage === 4 && s4Phase === 0;

    // 标题文字
    const titleText = isStage5 ? '十强诞生'
        : isStage1 ? '晋级大魔王'
            : isStage2 ? '晋级擂主'
                : '待定区';

    return (
        <div className="w-full h-full flex flex-col items-center justify-start pt-4 pb-6 overflow-hidden">
            {/* 标题 */}
            <motion.h2
                key={titleText}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: (isStage4 && s4Phase > 0) ? 0 : 1, y: 0 }}
                className="text-[clamp(2rem,3.5vw,2.8rem)] font-black mb-8 text-transparent bg-clip-text bg-[linear-gradient(to_bottom,rgba(255,255,255,0.96),rgba(220,240,255,0.72))] tracking-[0.24em] drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]"
            >
                {titleText}
            </motion.h2>

            <div className="w-full max-w-[1700px] px-6 flex-1 min-h-0 relative flex items-center justify-center -translate-y-8">
                <AnimatePresence mode="popLayout">

                    {/* ── Stage 1：首发晋级大魔王 ── */}
                    {isStage1 && (
                        <motion.div
                            key="grid-stage1-kings"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-[200px]"
                        >
                            {demonKingsAdvanced.length > 0 ? (
                                demonKingsAdvanced.map((p) => (
                                    <PlayerCard
                                        key={p.id}
                                        player={p}
                                        layoutId={`player-${p.id}`}
                                        showScore={false}
                                        scoreRollActive={false}
                                        xlarge
                                    />
                                ))
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center">
                                    无直接晋级大魔王
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Stage 2：晋级擂主 ── */}
                    {isStage2 && (
                        <motion.div
                            key="grid-stage2-masters"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-wrap items-center justify-center gap-8"
                        >
                            {advancedMasters.length > 0 ? (
                                advancedMasters.map((p) => (
                                    <PlayerCard
                                        key={p.id}
                                        player={p}
                                        layoutId={`player-${p.id}`}
                                        showScore={false}
                                        scoreRollActive={false}
                                        mlarge={advancedMasters.length <= 6}
                                        medium={advancedMasters.length >= 7}
                                    />
                                ))
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center">
                                    无直接晋级擂主
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Stage 3 + Stage 4 早期（s4Phase=0）：待定区整体展示，Stage 4 时滚动揭分 ── */}
                    {(isStage3 || (isStage4 && s4Phase === 0)) && (
                        <motion.div
                            key="grid-stage3-pending"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center gap-6"
                        >
                            {pendingPlayers.length === 0 ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center mt-4">
                                    待定区选手全部淘汰
                                </motion.div>
                            ) : pendingPlayers.length <= 9 ? (
                                <div className="flex flex-wrap items-center justify-center gap-8">
                                    {pendingPlayers.map((p) => (
                                        <PlayerCard key={p.id} player={p} layoutId={`player-${p.id}`} showScore={showPendingScore} scoreRollActive={scoreRollActive} slowTransition={s4Phase >= 2} small={pendingPlayers.length > 16} />
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-wrap items-center justify-center gap-8">
                                        {pendingPlayers.slice(0, Math.ceil(pendingPlayers.length / 2)).map((p) => (
                                            <PlayerCard key={p.id} player={p} layoutId={`player-${p.id}`} showScore={showPendingScore} scoreRollActive={scoreRollActive} slowTransition={s4Phase >= 2} small={pendingPlayers.length > 16} />
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-8">
                                        {pendingPlayers.slice(Math.ceil(pendingPlayers.length / 2)).map((p) => (
                                            <PlayerCard key={p.id} player={p} layoutId={`player-${p.id}`} showScore={showPendingScore} scoreRollActive={scoreRollActive} slowTransition={s4Phase >= 2} small={pendingPlayers.length > 16} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* ── Stage 4 分流（s4Phase > 0）：晋级 / 淘汰 ── */}
                    {isStage4 && s4Phase > 0 && (
                        pendingPlayers.length === 0 ? (
                            <motion.div
                                key="grid-stage4-empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center gap-6"
                            >
                                <motion.div className="text-[48px] tracking-[0.25em] text-teal-200/80 font-bold border-2 border-dashed border-teal-500/40 bg-teal-900/20 rounded-[40px] backdrop-blur-sm shadow-[0_0_40px_rgba(20,184,166,0.1)] w-[800px] h-[300px] flex items-center justify-center mt-4">
                                    待定区选手全部淘汰
                                </motion.div>
                            </motion.div>
                        ) : remainingSpots === 0 ? (
                            <motion.div
                                key="grid-stage4-split"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center gap-6"
                            >
                                <div className="flex flex-wrap items-center justify-center max-w-[1400px] mx-auto gap-[28px] mt-10">
                                    {pendingSorted.map((p) => (
                                        <PlayerCard key={p.id} player={p} layoutId={`player-${p.id}`} showScore={true} scoreRollActive={false} isEliminatedNode={s4Phase >= 2} slowTransition={s4Phase >= 2} />
                                    ))}
                                </div>
                                <motion.div animate={{ opacity: s4Phase >= 2 ? 1 : 0 }} transition={{ duration: 0.8 }} className="text-3xl font-bold text-slate-400 tracking-widest mt-12 bg-slate-900/60 px-8 py-3 rounded-full border border-slate-700 shadow-2xl backdrop-blur-sm">
                                    十强已满，待定区全员淘汰
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid-stage4-split"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col w-full items-center justify-center gap-8 -mt-6"
                            >
                                <div className="flex flex-col items-center gap-6">
                                    <motion.div animate={{ opacity: s4Phase >= 2 ? 1 : 0 }} transition={{ duration: 0.8 }} className="text-xl font-bold text-teal-300 tracking-widest bg-teal-900/40 px-6 py-1 rounded-full border border-teal-500/40">待定区晋级选手</motion.div>
                                    <div className="flex flex-wrap items-center justify-center gap-8">
                                        {advancedFromPending.map((p) => (
                                            <PlayerCard key={p.id} player={p} layoutId={`player-${p.id}`} showScore={true} scoreRollActive={false} isAdvancedNode={s4Phase >= 2} slowTransition={s4Phase >= 2} small={advancedFromPending.length === 9} xsmall={advancedFromPending.length > 9} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <motion.div animate={{ opacity: s4Phase >= 2 ? 1 : 0 }} transition={{ duration: 0.8 }} className="text-xl font-bold text-slate-400 tracking-widest bg-slate-800/50 px-6 py-1 rounded-full border border-slate-600/50">待定区淘汰选手</motion.div>
                                    <div className="flex flex-wrap items-center justify-center gap-8">
                                        {eliminatedFromPending.map((p) => (
                                            <PlayerCard key={p.id} player={p} layoutId={`player-${p.id}`} showScore={true} scoreRollActive={false} isEliminatedNode={s4Phase >= 2} slowTransition={s4Phase >= 2} small={eliminatedFromPending.length >= 9 || advancedFromPending.length > 9} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    )}

                    {/* ── Stage 5：十强诞生 ── */}
                    {isStage5 && (
                        <motion.div
                            key="grid-stage5-top10"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center gap-8 w-full mt-12"
                        >
                            <div className="grid grid-cols-5 gap-8 place-items-center w-fit mx-auto">
                                {fullTop10.map((p) => (
                                    <PlayerCard key={p.id} player={p} layoutId={`player-${p.id}`} showScore={false} scoreRollActive={false} large extraScale={s5Phase > 0} slowTransition={s5Phase > 0} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}

Resurrection.propTypes = {
    gameState: PropTypes.object.isRequired,
};
