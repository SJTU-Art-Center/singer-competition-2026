import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullAvatarUrl } from '../../utils/avatar';
import { deriveFinalSettlement, getPlayerLatestScore } from '../../utils/finalSettlement';

const TOTAL_SUBCOLS = 16;
const BOARD_SAFE_LEFT = 6;
const BOARD_SAFE_WIDTH = 88;

const ROW_CENTER_Y = {
    2: 26,
    4: 56,
    6: 82
};

const TITLE_CENTER_Y = {
    1: 10,
    3: 40,
    5: 69
};

const MOTION = {
    layout: { duration: 0.66, ease: [0.4, 0, 0.2, 1] },
    detail: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

const STAGE_OUT_DURATION_MS = 420;
const STAGE_IN_SETTLE_MS = 460;

const HERO_SIZE = { width: 186, height: 232 };
const COMPACT_HEIGHT = 94;
const COMPACT_DENSE_HEIGHT = 82;

const FALLBACK_AVATAR = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#1f2937"/><circle cx="60" cy="46" r="22" fill="#94a3b8"/><rect x="28" y="78" width="64" height="28" rx="14" fill="#94a3b8"/></svg>')}`;

const handleAvatarError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_AVATAR;
};

const getSlotWidth = (colSpan, dense = false) => {
    const slotPercent = (BOARD_SAFE_WIDTH / TOTAL_SUBCOLS) * colSpan;
    const gapOffset = dense ? 6 : 10;
    return `calc(${slotPercent}% - ${gapOffset}px)`;
};

const COMPACT_SIZE = { width: getSlotWidth(2), height: COMPACT_HEIGHT };
const COMPACT_DENSE_SIZE = { width: getSlotWidth(1, true), height: COMPACT_DENSE_HEIGHT };

const clampStage = (value) => {
    const stage = Number(value);
    if (!Number.isFinite(stage)) return 1;
    if (stage < 1) return 1;
    if (stage > 7) return 7;
    return Math.floor(stage);
};

const toneToClass = (tone) => {
    if (tone === 'demon') return 'border-cyan-500/80 bg-cyan-900/25';
    if (tone === 'master') return 'border-emerald-600/80 bg-emerald-900/25';
    if (tone === 'challenger') return 'border-teal-700/80 bg-teal-900/20';
    if (tone === 'pending') return 'border-slate-600/90 bg-slate-900/55';
    return 'border-teal-600/85 bg-teal-900/25';
};

const statusToClass = (statusTone) => {
    if (statusTone === 'pending') return 'bg-slate-700/60 border-slate-500 text-teal-200';
    return 'bg-emerald-600/55 border-emerald-400 text-emerald-100';
};

const buildCenteredStarts = (count, colSpan, totalCols = TOTAL_SUBCOLS) => {
    if (count <= 0) return [];

    const maxSlots = Math.floor(totalCols / colSpan);
    const clampedCount = Math.min(count, maxSlots);
    const totalSpan = clampedCount * colSpan;
    const start = Math.floor((totalCols - totalSpan) / 2) + 1;

    return Array.from({ length: clampedCount }, (_, index) => start + index * colSpan);
};

const getDensityForCount = (count) => {
    if (count > 12) {
        return { colSpan: 1, width: COMPACT_DENSE_SIZE.width, height: COMPACT_DENSE_SIZE.height };
    }

    if (count > 8) {
        return { colSpan: 1, width: COMPACT_DENSE_SIZE.width, height: COMPACT_DENSE_SIZE.height };
    }

    return { colSpan: 2, width: COMPACT_SIZE.width, height: COMPACT_SIZE.height };
};

const makePlacement = ({
    row,
    col,
    colSpan,
    mode,
    tone,
    showScore,
    showStatus,
    statusLabel,
    statusTone,
    width,
    height,
    z,
    scale = 1,
    appearDelay = 0,
    emphasis = 1
}) => {
    return {
        row,
        col,
        colSpan,
        mode,
        tone,
        showScore,
        showStatus,
        statusLabel,
        statusTone,
        width,
        height,
        z,
        scale,
        appearDelay,
        emphasis
    };
};

const toCenterXPct = (col, colSpan) => {
    const local = ((col - 1) + colSpan / 2) / TOTAL_SUBCOLS;
    return BOARD_SAFE_LEFT + local * BOARD_SAFE_WIDTH;
};

const getTitleRows = ({ stage, advancedMasters, pendingMasters }) => {
    if (stage === 1) return [{ key: 's1', text: '大魔王登场（暂不显示晋级）', row: 1 }];
    if (stage === 2) return [{ key: 's2', text: '大魔王成绩与结果', row: 1 }];
    if (stage === 3) {
        return [
            { key: 's3m', text: '擂主（8）', row: 1 },
            { key: 's3c', text: '攻擂者（8）', row: 3 }
        ];
    }

    if (stage === 4) {
        if (advancedMasters.length > 0) {
            return [
                { key: 's4a', text: '晋级擂主', row: 1 },
                ...(pendingMasters.length > 0 ? [{ key: 's4p', text: '待定擂主', row: 3 }] : []),
                { key: 's4c', text: '攻擂者', row: 5 }
            ];
        }
        return [
            { key: 's4p-only', text: '待定擂主', row: 1 },
            { key: 's4c-only', text: '攻擂者', row: 3 }
        ];
    }

    if (stage === 5) {
        return [{ key: 's5-zone', text: '待定区', row: 1 }];
    }

    if (stage === 6) {
        return [
            { key: 's6a', text: '待定区晋级', row: 1 },
            { key: 's6n', text: '待定区未晋级', row: 3 }
        ];
    }

    return [
        { key: 's7a', text: '最终晋级阵容', row: 1 },
        { key: 's7n', text: '未晋级阵容', row: 3 }
    ];
};

const placeCenteredRow = ({
    target,
    players,
    row,
    tone,
    showScore,
    showStatus,
    statusLabel,
    statusTone,
    z
}) => {
    if (!players || players.length === 0) return;

    const density = getDensityForCount(players.length);
    const visiblePlayers = players.slice(0, Math.floor(TOTAL_SUBCOLS / density.colSpan));
    const starts = buildCenteredStarts(visiblePlayers.length, density.colSpan, TOTAL_SUBCOLS);

    visiblePlayers.forEach((player, index) => {
        target.set(player.id, makePlacement({
            row,
            col: starts[index],
            colSpan: density.colSpan,
            mode: 'compact',
            tone,
            showScore,
            showStatus,
            statusLabel,
            statusTone,
            width: density.width,
            height: density.height,
            z,
            appearDelay: index * 0.022
        }));
    });
};

const getStagePlacements = ({
    stage,
    demonKings,
    advancedDemonKings,
    pendingDemonKings,
    masterRows,
    advancedMasters,
    pendingMasters,
    challengersByPair,
    promotedPending,
    nonPromotedPending,
    stage7TopRow,
    stage7BottomRow
}) => {
    const placements = new Map();

    const setHero = (player, col) => {
        if (!player) return;
        placements.set(player.id, makePlacement({
            row: 4,
            col,
            colSpan: 4,
            mode: 'hero',
            tone: 'demon',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'success',
            width: HERO_SIZE.width,
            height: HERO_SIZE.height,
            z: 8
        }));
    };

    if (stage === 1 || stage === 2) {
        const heroCols = buildCenteredStarts(2, 4, TOTAL_SUBCOLS);
        demonKings.forEach((player, index) => {
            const isAdvanced = advancedDemonKings.some((item) => item.id === player.id);
            const hasDkScore = player.scoreDK !== undefined && player.scoreDK !== null && player.scoreDK !== '';

            setHero(player, heroCols[index] || 4);
            const existing = placements.get(player.id);
            placements.set(player.id, {
                ...existing,
                showScore: stage >= 2 && hasDkScore,
                showStatus: stage >= 2 && hasDkScore,
                statusLabel: isAdvanced ? '晋级' : '待定',
                statusTone: isAdvanced ? 'success' : 'pending'
            });
        });

        return placements;
    }

    if (stage === 3) {
        const strictStarts = Array.from({ length: 8 }, (_, index) => index * 2 + 1);
        masterRows.forEach((row, index) => {
            const start = strictStarts[index] || 1;

            placements.set(row.master.id, makePlacement({
                row: 2,
                col: start,
                colSpan: 2,
                mode: 'compact',
                tone: 'master',
                showScore: false,
                showStatus: false,
                statusLabel: '',
                statusTone: 'success',
                width: COMPACT_SIZE.width,
                height: COMPACT_SIZE.height,
                z: 6
            }));

            if (row.challenger) {
                placements.set(row.challenger.id, makePlacement({
                    row: 4,
                    col: start,
                    colSpan: 2,
                    mode: 'compact',
                    tone: 'challenger',
                    showScore: false,
                    showStatus: false,
                    statusLabel: '',
                    statusTone: 'success',
                    width: COMPACT_SIZE.width,
                    height: COMPACT_SIZE.height,
                    z: 5
                }));
            }
        });

        return placements;
    }

    if (stage === 4) {
        if (advancedMasters.length > 0) {
            placeCenteredRow({
                target: placements,
                players: advancedMasters,
                row: 2,
                tone: 'master',
                showScore: true,
                showStatus: true,
                statusLabel: '晋级',
                statusTone: 'success',
                z: 7
            });

            if (pendingMasters.length > 0) {
                placeCenteredRow({
                    target: placements,
                    players: pendingMasters,
                    row: 4,
                    tone: 'pending',
                    showScore: true,
                    showStatus: true,
                    statusLabel: '待定',
                    statusTone: 'pending',
                    z: 6
                });
            }

            const strictStarts = Array.from({ length: 8 }, (_, index) => index * 2 + 1);
            challengersByPair.forEach((player, index) => {
                placements.set(player.id, makePlacement({
                    row: 6,
                    col: strictStarts[index] || 1,
                    colSpan: 2,
                    mode: 'compact',
                    tone: 'challenger',
                    showScore: false,
                    showStatus: false,
                    statusLabel: '',
                    statusTone: 'success',
                    width: COMPACT_SIZE.width,
                    height: COMPACT_SIZE.height,
                    z: 4
                }));
            });

            return placements;
        }

        placeCenteredRow({
            target: placements,
            players: pendingMasters,
            row: 2,
            tone: 'pending',
            showScore: true,
            showStatus: true,
            statusLabel: '待定',
            statusTone: 'pending',
            z: 6
        });

        const strictStarts = Array.from({ length: 8 }, (_, index) => index * 2 + 1);
        challengersByPair.forEach((player, index) => {
            placements.set(player.id, makePlacement({
                row: 4,
                col: strictStarts[index] || 1,
                colSpan: 2,
                mode: 'compact',
                tone: 'challenger',
                showScore: false,
                showStatus: false,
                statusLabel: '',
                statusTone: 'success',
                width: COMPACT_SIZE.width,
                height: COMPACT_SIZE.height,
                z: 4
            }));
        });

        return placements;
    }

    if (stage === 5) {
        if (pendingDemonKings.length > 0) {
            placeCenteredRow({
                target: placements,
                players: pendingDemonKings,
                row: 2,
                tone: 'pending',
                showScore: true,
                showStatus: true,
                statusLabel: '待定',
                statusTone: 'pending',
                z: 7
            });
        }

        const pendingMasterRow = pendingDemonKings.length > 0 ? 4 : 2;
        placeCenteredRow({
            target: placements,
            players: pendingMasters,
            row: pendingMasterRow,
            tone: 'pending',
            showScore: true,
            showStatus: true,
            statusLabel: '待定',
            statusTone: 'pending',
            z: 6
        });

        const challengerRow = pendingDemonKings.length > 0 ? 6 : 4;
        const strictStarts = Array.from({ length: 8 }, (_, index) => index * 2 + 1);
        challengersByPair.forEach((player, index) => {
            placements.set(player.id, makePlacement({
                row: challengerRow,
                col: strictStarts[index] || 1,
                colSpan: 2,
                mode: 'compact',
                tone: 'challenger',
                showScore: false,
                showStatus: false,
                statusLabel: '',
                statusTone: 'success',
                width: COMPACT_SIZE.width,
                height: COMPACT_SIZE.height,
                z: 4
            }));
        });

        return placements;
    }

    if (stage === 6) {
        placeCenteredRow({
            target: placements,
            players: promotedPending,
            row: 2,
            tone: 'success',
            showScore: true,
            showStatus: true,
            statusLabel: '晋级',
            statusTone: 'success',
            z: 7
        });

        placeCenteredRow({
            target: placements,
            players: nonPromotedPending,
            row: 4,
            tone: 'pending',
            showScore: true,
            showStatus: true,
            statusLabel: '未晋级',
            statusTone: 'pending',
            z: 6
        });

        return placements;
    }

    placeCenteredRow({
        target: placements,
        players: stage7TopRow,
        row: 2,
        tone: 'success',
        showScore: true,
        showStatus: true,
        statusLabel: '晋级',
        statusTone: 'success',
        z: 8
    });

    placeCenteredRow({
        target: placements,
        players: stage7BottomRow,
        row: 4,
        tone: 'pending',
        showScore: true,
        showStatus: true,
        statusLabel: '未晋级',
        statusTone: 'pending',
        z: 6
    });

    return placements;
};

const normalizePlacements = (placementMap) => {
    const occupied = new Set();
    const normalized = new Map();

    const occupy = (row, col, colSpan) => {
        for (let i = 0; i < colSpan; i += 1) {
            occupied.add(`${row}:${col + i}`);
        }
    };

    const canOccupy = (row, col, colSpan) => {
        if (col < 1 || col + colSpan - 1 > TOTAL_SUBCOLS) return false;
        for (let i = 0; i < colSpan; i += 1) {
            if (occupied.has(`${row}:${col + i}`)) return false;
        }
        return true;
    };

    placementMap.forEach((placement, id) => {
        let targetCol = placement.col;
        if (targetCol === undefined || targetCol === null) return;

        if (!canOccupy(placement.row, targetCol, placement.colSpan)) {
            const step = placement.colSpan;
            for (let col = 1; col <= TOTAL_SUBCOLS - placement.colSpan + 1; col += step) {
                if (canOccupy(placement.row, col, placement.colSpan)) {
                    targetCol = col;
                    break;
                }
            }
        }

        if (!canOccupy(placement.row, targetCol, placement.colSpan)) return;

        const safePlacement = { ...placement, col: targetCol };
        normalized.set(id, safePlacement);
        occupy(safePlacement.row, safePlacement.col, safePlacement.colSpan);
    });

    return normalized;
};

const buildBasePlacementMap = ({ demonKings, masterRows, pendingCandidates }) => {
    const map = new Map();

    const heroCols = buildCenteredStarts(2, 4, TOTAL_SUBCOLS);
    demonKings.forEach((player, index) => {
        map.set(player.id, makePlacement({
            row: 4,
            col: heroCols[index] || 4,
            colSpan: 4,
            mode: 'hero',
            tone: 'demon',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'success',
            width: HERO_SIZE.width,
            height: HERO_SIZE.height,
            z: 5
        }));
    });

    const strictStarts = Array.from({ length: 8 }, (_, index) => index * 2 + 1);
    masterRows.forEach((row, index) => {
        const start = strictStarts[index] || 1;
        map.set(row.master.id, makePlacement({
            row: 2,
            col: start,
            colSpan: 2,
            mode: 'compact',
            tone: 'master',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'success',
            width: COMPACT_SIZE.width,
            height: COMPACT_SIZE.height,
            z: 4
        }));

        if (row.challenger) {
            map.set(row.challenger.id, makePlacement({
                row: 4,
                col: start,
                colSpan: 2,
                mode: 'compact',
                tone: 'challenger',
                showScore: false,
                showStatus: false,
                statusLabel: '',
                statusTone: 'success',
                width: COMPACT_SIZE.width,
                height: COMPACT_SIZE.height,
                z: 3
            }));
        }
    });

    placeCenteredRow({
        target: map,
        players: pendingCandidates,
        row: 6,
        tone: 'pending',
        showScore: false,
        showStatus: false,
        statusLabel: '',
        statusTone: 'pending',
        z: 1
    });

    return normalizePlacements(map);
};

export default function Resurrection({ gameState }) {
    const stageIndex = clampStage(gameState.screenFinalStageIndex ?? gameState.finalStageIndex ?? 1);
    const pkMatches = gameState.pkMatches || [];

    const {
        sortedByRound1,
        demonKings,
        advancedDemonKings,
        pendingDemonKings,
        masterRows,
        advancedMasters,
        pendingMasters,
        challengersByPair,
        pendingCandidates,
        promotedPending,
        nonPromotedPending,
        stage7TopRow,
        stage7BottomRow,
        remainingSpots
    } = React.useMemo(() => deriveFinalSettlement(gameState), [gameState]);

    const playerById = React.useMemo(() => {
        return new Map(sortedByRound1.map((player) => [player.id, player]));
    }, [sortedByRound1]);

    const [visualStage, setVisualStage] = React.useState(stageIndex);
    const [transitionState, setTransitionState] = React.useState({
        phase: 'idle',
        from: stageIndex,
        to: stageIndex
    });

    React.useEffect(() => {
        if (stageIndex === visualStage) {
            if (transitionState.phase !== 'idle') {
                setTransitionState({ phase: 'idle', from: stageIndex, to: stageIndex });
            }
            return;
        }

        const fromStage = visualStage;
        let inTimer = null;
        setTransitionState({ phase: 'out', from: fromStage, to: stageIndex });

        const outTimer = window.setTimeout(() => {
            setVisualStage(stageIndex);
            setTransitionState({ phase: 'in', from: fromStage, to: stageIndex });

            inTimer = window.setTimeout(() => {
                setTransitionState({ phase: 'idle', from: stageIndex, to: stageIndex });
            }, STAGE_IN_SETTLE_MS);
        }, STAGE_OUT_DURATION_MS);

        return () => {
            window.clearTimeout(outTimer);
            if (inTimer) window.clearTimeout(inTimer);
        };
    }, [stageIndex, visualStage, transitionState.phase]);

    const activeIds = React.useMemo(() => {
        return new Set([
            ...demonKings.map((player) => player.id),
            ...masterRows.map((row) => row.master.id),
            ...challengersByPair.map((player) => player.id),
            ...pendingCandidates.map((player) => player.id),
            ...stage7TopRow.map((player) => player.id),
            ...stage7BottomRow.map((player) => player.id)
        ]);
    }, [demonKings, masterRows, challengersByPair, pendingCandidates, stage7TopRow, stage7BottomRow]);

    const basePlacementMap = React.useMemo(() => {
        return buildBasePlacementMap({ demonKings, masterRows, pendingCandidates });
    }, [demonKings, masterRows, pendingCandidates]);

    const visualPlacementMap = React.useMemo(() => {
        const raw = getStagePlacements({
            stage: visualStage,
            demonKings,
            advancedDemonKings,
            pendingDemonKings,
            masterRows,
            advancedMasters,
            pendingMasters,
            challengersByPair,
            promotedPending,
            nonPromotedPending,
            stage7TopRow,
            stage7BottomRow
        });
        return normalizePlacements(raw);
    }, [
        visualStage,
        demonKings,
        advancedDemonKings,
        pendingDemonKings,
        masterRows,
        advancedMasters,
        pendingMasters,
        challengersByPair,
        promotedPending,
        nonPromotedPending,
        stage7TopRow,
        stage7BottomRow
    ]);

    const targetPlacementMap = React.useMemo(() => {
        const raw = getStagePlacements({
            stage: stageIndex,
            demonKings,
            advancedDemonKings,
            pendingDemonKings,
            masterRows,
            advancedMasters,
            pendingMasters,
            challengersByPair,
            promotedPending,
            nonPromotedPending,
            stage7TopRow,
            stage7BottomRow
        });
        return normalizePlacements(raw);
    }, [
        stageIndex,
        demonKings,
        advancedDemonKings,
        pendingDemonKings,
        masterRows,
        advancedMasters,
        pendingMasters,
        challengersByPair,
        promotedPending,
        nonPromotedPending,
        stage7TopRow,
        stage7BottomRow
    ]);

    const lastPlacementRef = React.useRef(new Map());

    React.useEffect(() => {
        activeIds.forEach((id) => {
            if (!lastPlacementRef.current.has(id) && basePlacementMap.has(id)) {
                lastPlacementRef.current.set(id, basePlacementMap.get(id));
            }
        });

        visualPlacementMap.forEach((placement, id) => {
            lastPlacementRef.current.set(id, placement);
        });
    }, [activeIds, basePlacementMap, visualPlacementMap]);

    const parkingPlacement = React.useMemo(() => {
        return makePlacement({
            row: 6,
            col: 8,
            colSpan: 2,
            mode: 'compact',
            tone: 'pending',
            showScore: false,
            showStatus: false,
            statusLabel: '',
            statusTone: 'pending',
            width: COMPACT_DENSE_SIZE.width,
            height: COMPACT_DENSE_SIZE.height,
            z: 0
        });
    }, []);

    const rowTitles = React.useMemo(() => {
        return getTitleRows({
            stage: visualStage,
            advancedMasters,
            pendingMasters
        });
    }, [visualStage, advancedMasters, pendingMasters]);

    const showPendingPanel = visualStage === 6;

    return (
        <div className="w-full h-full max-w-[1600px] mx-auto mt-4 px-4 md:px-6 pb-4 relative">
            <div className="h-full rounded-3xl border border-[var(--color-card-border)] bg-[var(--color-card-bg)] backdrop-blur-md p-5 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-teal-600/20 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/20 blur-[70px] rounded-full pointer-events-none"></div>

                <h2 className="text-2xl md:text-3xl font-black text-center tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 mb-4">
                    终极十强补位
                </h2>

                <div className={`relative h-[min(76vh,700px)] ${showPendingPanel ? 'grid grid-cols-1 lg:grid-cols-[1fr_2.4fr] gap-5 lg:gap-6' : ''}`}>
                    <AnimatePresence initial={false}>
                        {showPendingPanel && (
                            <motion.aside
                                key="pending-panel"
                                initial={{ opacity: 0, x: -14 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={MOTION.detail}
                                className="h-full rounded-2xl border border-[var(--color-card-border)] bg-black/20 p-4 overflow-y-auto custom-scrollbar"
                            >
                                <h3 className="text-lg font-black tracking-[0.08em] text-slate-300 mb-3 border-l-4 border-teal-500 pl-3">待定区分数</h3>
                                <div className="text-xs text-slate-500 mb-3 tracking-wide">补位名额：{remainingSpots} 人</div>

                                <div className="space-y-2">
                                    {pendingCandidates.map((player, index) => {
                                        const promoted = promotedPending.some((item) => item.id === player.id);
                                        return (
                                            <motion.div
                                                key={`pending-rank-${player.id}`}
                                                initial={false}
                                                animate={{ opacity: 1 }}
                                                transition={MOTION.detail}
                                                className={`flex items-center justify-between rounded-xl border px-3 py-2 ${promoted ? 'border-teal-500 bg-teal-900/30' : 'border-slate-700 bg-slate-900/40'}`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="w-5 text-center font-black text-slate-400">{index + 1}</span>
                                                    <img src={getFullAvatarUrl(player.avatar)} alt={player.name} onError={handleAvatarError} className="w-7 h-7 rounded-full border border-white/20 object-cover" />
                                                    <span className="font-bold text-slate-200 truncate text-xs">{player.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono font-black text-slate-100 text-sm">{player.latestScore.toFixed(2)}</div>
                                                    <div className={`text-[10px] font-bold tracking-wide ${promoted ? 'text-teal-300' : 'text-slate-400'}`}>
                                                        {promoted ? '晋级' : '未晋级'}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    <section className="h-full relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {rowTitles.map((title) => (
                                <motion.div
                                    key={`${visualStage}-${title.key}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{
                                        top: `${TITLE_CENTER_Y[title.row] || 9}%`,
                                        opacity: transitionState.phase === 'out' ? 0.35 : 1,
                                        y: 0
                                    }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={MOTION.detail}
                                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-slate-300 text-[10px] md:text-xs font-black tracking-[0.1em] whitespace-nowrap"
                                >
                                    {title.text}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {[...activeIds].map((id) => {
                            const player = playerById.get(id);
                            if (!player) return null;

                            const visiblePlacement = visualPlacementMap.get(id);
                            const targetPlacement = targetPlacementMap.get(id);
                            const fallbackPlacement = lastPlacementRef.current.get(id) || basePlacementMap.get(id) || parkingPlacement;
                            const placement = visiblePlacement || fallbackPlacement;
                            const isVisible = !!visiblePlacement;
                            const xPct = toCenterXPct(placement.col, placement.colSpan);
                            const yPct = placement.mode === 'hero' ? 50 : (ROW_CENTER_Y[placement.row] || 53);
                            const scoreValue = getPlayerLatestScore(player, pkMatches);

                            let opacity = isVisible ? 1 : 0;
                            let nodeScale = 1;
                            let nodeTransition = MOTION.layout;

                            if (transitionState.phase === 'out') {
                                const inFrom = !!visiblePlacement;
                                const inTo = !!targetPlacement;
                                if (inFrom && !inTo) opacity = 0;
                                if (!inFrom && inTo) opacity = 0;
                                nodeTransition = {
                                    ...MOTION.layout,
                                    duration: STAGE_OUT_DURATION_MS / 1000,
                                    ease: [0.4, 0, 0.2, 1],
                                    delay: 0
                                };
                            }

                            if (transitionState.phase === 'in') {
                                const inNow = !!visiblePlacement;
                                opacity = inNow ? 1 : 0;

                                let appearDelay = inNow ? (visiblePlacement?.appearDelay || 0) : 0;

                                if (transitionState.from === 2 && transitionState.to === 3 && inNow) {
                                    const rowDelay = visiblePlacement.row === 4 ? 0.12 : 0;
                                    appearDelay = rowDelay + ((id % 8) * 0.03);
                                }

                                if (transitionState.from === 1 && transitionState.to === 2 && inNow && visiblePlacement.mode === 'hero' && visiblePlacement.statusLabel === '晋级') {
                                    nodeScale = 1.1;
                                }

                                nodeTransition = {
                                    ...MOTION.layout,
                                    delay: appearDelay
                                };
                            }

                            if (transitionState.phase === 'idle' && visualStage === 2 && isVisible && placement.mode === 'hero' && placement.statusLabel === '晋级') {
                                nodeScale = 1.03;
                            }

                            const movementOnly = transitionState.phase !== 'idle';
                            const hideScoreForMovement = movementOnly && visualStage >= 3 && visualStage <= 5;
                            const hideStatusForMovement = movementOnly && visualStage >= 3 && visualStage <= 5;

                            return (
                                <motion.div
                                    key={`node-${id}`}
                                    initial={false}
                                    animate={{
                                        left: `${xPct}%`,
                                        top: `${yPct}%`,
                                        width: placement.width,
                                        height: placement.height,
                                        opacity
                                    }}
                                    transition={nodeTransition}
                                    style={{ zIndex: placement.z }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-[left,top,width,height,opacity]"
                                >
                                    <PlayerCard
                                        player={player}
                                        mode={placement.mode}
                                        tone={placement.tone}
                                        showScore={isVisible && !hideScoreForMovement ? placement.showScore : false}
                                        showStatus={isVisible && !hideStatusForMovement ? placement.showStatus : false}
                                        statusLabel={placement.statusLabel}
                                        statusTone={placement.statusTone}
                                        scoreValue={scoreValue}
                                        cardScale={nodeScale}
                                        transitionState={transitionState}
                                    />
                                </motion.div>
                            );
                        })}

                        <AnimatePresence initial={false}>
                            {visualStage >= 7 && (
                                <motion.div
                                    key="stage7-badge"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={MOTION.detail}
                                    className="absolute bottom-2 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-teal-600 text-white font-black tracking-[0.1em] text-xs md:text-sm shadow-[0_4px_20px_rgba(20,184,166,0.4)]"
                                >
                                    最终十强归位
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>
            </div>
        </div>
    );
}

function PlayerCard({
    player,
    mode,
    tone,
    showScore,
    showStatus,
    statusLabel,
    statusTone,
    scoreValue,
    cardScale,
    transitionState
}) {
    const toneClass = toneToClass(tone);
    const statusClass = statusToClass(statusTone);

    if (mode === 'hero') {
        return (
            <motion.div
                initial={false}
                animate={{
                    scale: cardScale,
                    opacity: transitionState.phase === 'out' ? 0.84 : 1
                }}
                transition={MOTION.detail}
                className={`h-full rounded-3xl border ${toneClass} px-4 py-4 text-center flex flex-col items-center justify-start`}
            >
                <div className="rounded-full p-[2px] bg-gradient-to-b from-white/35 to-white/10 mx-auto w-fit">
                    <img src={getFullAvatarUrl(player.avatar)} alt={player.name} onError={handleAvatarError} className="w-16 h-16 rounded-full border border-white/20 object-cover" />
                </div>

                <div className="text-base font-black mt-2 text-slate-100 truncate w-full">{player.name}</div>

                <motion.div
                    initial={false}
                    animate={{ opacity: showScore ? 1 : 0, y: showScore ? 0 : 4 }}
                    transition={{ ...MOTION.detail, duration: 0.34 }}
                    className="mt-2 min-h-[28px] text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-teal-300"
                >
                    {showScore ? Number(scoreValue || 0).toFixed(2) : ''}
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{ opacity: showStatus ? 1 : 0, y: showStatus ? 0 : 4 }}
                    transition={{ ...MOTION.detail, duration: 0.32, delay: showStatus ? 0.08 : 0 }}
                    className={`mt-1.5 text-[11px] font-black tracking-[0.06em] px-2.5 py-0.5 rounded-full border ${statusClass}`}
                >
                    {showStatus ? statusLabel : ''}
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={false}
            animate={{
                scale: cardScale,
                opacity: transitionState.phase === 'out' ? 0.88 : 1
            }}
            transition={MOTION.detail}
            className={`h-full rounded-2xl border ${toneClass} px-2 py-2 text-center flex flex-col items-center`}
        >
            <img src={getFullAvatarUrl(player.avatar)} alt={player.name} onError={handleAvatarError} className="w-8 h-8 rounded-full border border-white/20 object-cover" />
            <div className="mt-1 text-[10px] leading-tight font-black text-slate-100 truncate w-full">{player.name}</div>

            <motion.div
                initial={false}
                animate={{ opacity: showScore ? 1 : 0, y: showScore ? 0 : 4 }}
                transition={{ ...MOTION.detail, duration: 0.3 }}
                className="mt-0.5 text-[11px] font-mono font-black text-teal-200 min-h-[16px]"
            >
                {showScore ? Number(scoreValue || 0).toFixed(2) : ''}
            </motion.div>

            <motion.div
                initial={false}
                animate={{ opacity: showStatus ? 1 : 0, y: showStatus ? 0 : 4 }}
                transition={{ ...MOTION.detail, duration: 0.28, delay: showStatus ? 0.05 : 0 }}
                className={`mt-0.5 text-[9px] font-black tracking-[0.04em] px-1 py-0.5 rounded border ${statusClass}`}
            >
                {showStatus ? statusLabel : ''}
            </motion.div>
        </motion.div>
    );
}

Resurrection.propTypes = {
    gameState: PropTypes.shape({
        finalStageIndex: PropTypes.number,
        screenFinalStageIndex: PropTypes.number,
        pkMatches: PropTypes.arrayOf(PropTypes.shape({
            challengerId: PropTypes.number,
            masterId: PropTypes.number,
            status: PropTypes.string,
            winner: PropTypes.string,
            challengerScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            masterScore: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
        })),
        players: PropTypes.array
    }).isRequired
};

PlayerCard.propTypes = {
    player: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string
    }).isRequired,
    mode: PropTypes.oneOf(['hero', 'compact']).isRequired,
    tone: PropTypes.oneOf(['pending', 'challenger', 'master', 'demon', 'success']).isRequired,
    showScore: PropTypes.bool.isRequired,
    showStatus: PropTypes.bool.isRequired,
    statusLabel: PropTypes.string.isRequired,
    statusTone: PropTypes.oneOf(['pending', 'success']).isRequired,
    scoreValue: PropTypes.number.isRequired,
    cardScale: PropTypes.number.isRequired,
    transitionState: PropTypes.shape({
        phase: PropTypes.oneOf(['idle', 'out', 'in']).isRequired,
        from: PropTypes.number.isRequired,
        to: PropTypes.number.isRequired
    }).isRequired
};
