export const getPlayerLatestScore = (player) => {
    if (!player) return 0;
    return Number(player?.score ?? 0);
};

export const deriveFinalSettlement = () => {
    return {
        demonKingThreshold: 0,
        directAdvanced: [],
        pendingDemonKings: [],
        pendingMasters: [],
        challengersByPair: [],
        pendingCandidates: [],
        remainingSpots: 10,
        promotedPending: [],
        nonPromotedPending: [],
        finalTop10: [],
        allPlayerResults: [],
        masters: [],
        challengers: [],
        masterRows: [],
        demonKings: []
    };
};
