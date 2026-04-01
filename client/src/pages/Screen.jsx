import { useGameState } from '../hooks/useGameState';
import RankList from '../components/round1/RankList';
import PkBattle from '../components/round2/PkBattle';
import DemonKing from '../components/demonKing/DemonKing';
import Resurrection from '../components/final/Resurrection';
import PickOpponent from '../components/transition/PickOpponent';
import GroupIntro from '../components/round1/GroupIntro';

export default function Screen() {
    const { gameState, connectionError, activeServerUrl } = useGameState();

    if (!gameState) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-4xl font-black bg-[var(--color-bg-base)] text-[var(--color-text-muted)] tracking-widest gap-4">
                <div className="animate-pulse">连接总控制台...</div>
                {connectionError && <div className="text-sm text-red-300 bg-red-900/30 border border-red-600/40 px-4 py-2 rounded-xl tracking-normal">{connectionError}</div>}
                {activeServerUrl && <div className="text-xs text-slate-400 font-mono tracking-normal">已连接：{activeServerUrl}</div>}
            </div>
        );
    }

    const themeClass = gameState.theme || 'theme-background';
    const screenDisplayMode = gameState.screenDisplayMode || 'live';
    const specialScreenAsset = screenDisplayMode === 'background' ? '/background.png' : screenDisplayMode === 'kv' ? '/kv.jpg' : null;
    const isSpecialMode = screenDisplayMode !== 'live';
    const screenSubtitle = (() => {
        if (gameState.screenRound === 0) return 'PREPARATION : 赛前准备部署中';
        if (gameState.screenRound === 1) {
            if (gameState.round1Mode === 'groupIntro') return 'ROUND 1 : 分组介绍';
            if (gameState.round1Mode === 'group') return `ROUND 1 : 第 ${gameState.currentGroup || 1} 组`;
            return 'ROUND 1 : 三十强排位赛';
        }
        if (gameState.screenRound === 1.5) return 'SELECTION : 对手挑选环节';
        if (gameState.screenRound === 2) return 'ROUND 2 : 十六强对战赛';
        if (gameState.screenRound === 3) return 'EXTRA ROUND : 大魔王返场';
        if (gameState.screenRound === 4) return 'FINAL ROUND : 十强终极补位';
        return '';
    })();

    return (
        <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-black">
            <div className="w-full h-full max-w-[calc(100vh*2)] max-h-[calc(100vw/2)]">
                <div className={`relative w-full h-full overflow-hidden flex flex-col font-sans bg-[var(--color-bg-screen)] text-[var(--color-text-main)] ${themeClass}`}>
                    {isSpecialMode ? (
                        <div className="relative w-full h-full overflow-hidden bg-black">
                            {specialScreenAsset && <img src={specialScreenAsset} alt="投屏画面" className="absolute inset-0 w-full h-full object-cover object-center" />}
                            {screenDisplayMode !== 'black' && <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.24))]" />}
                        </div>
                    ) : (
                        <>
                            {themeClass === 'theme-background' && <div className="absolute inset-0 bg-cover bg-center opacity-38" style={{ backgroundImage: "url('/background.png')" }} />}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_28%),linear-gradient(135deg,rgba(7,13,28,0.14),rgba(2,6,23,0.55))]" />
                            <div className="absolute top-[-12%] right-[-2%] w-[42vw] h-[42vw] bg-[var(--color-glow-1)] rounded-full blur-[120px] pointer-events-none transition-colors duration-500"></div>
                            <div className="absolute bottom-[-18%] left-[-4%] w-[36vw] h-[36vw] bg-[var(--color-glow-2)] rounded-full blur-[110px] pointer-events-none transition-colors duration-500"></div>
                            <div className="absolute inset-[14px] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_80px_rgba(2,6,23,0.45)]" />

                            <div className="relative z-20 px-8 pt-5 shrink-0 pointer-events-none">
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/14 bg-black/22 backdrop-blur-md text-[11px] font-black tracking-[0.36em] text-[var(--color-text-muted)] uppercase shadow-[0_10px_28px_rgba(2,6,23,0.22)]">
                                    <span>Campus Live Stage</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.85)]" />
                                    <span>Semifinal</span>
                                </div>
                                <div className="mt-4 flex items-end justify-between gap-8">
                                    <div>
                                        <h1 className="text-[clamp(3rem,4.9vw,4.9rem)] leading-none font-black tracking-[0.22em] text-transparent bg-clip-text bg-[linear-gradient(to_bottom,var(--title-gradient-from),var(--title-gradient-to))] text-shadow-glow drop-shadow-2xl italic transition-all duration-500">
                                            SUPER SINGER
                                        </h1>
                                        <p className={`text-[clamp(0.92rem,1.35vw,1.12rem)] mt-3 font-bold text-[var(--color-text-muted)] tracking-[0.16em] uppercase border-l-4 border-cyan-300/80 pl-4 max-w-[72%] ${gameState.screenRound === 1.5 ? 'opacity-0 h-0 mt-0 overflow-hidden' : ''}`}>
                                            {screenSubtitle}
                                        </p>
                                    </div>
                                    <div className="mb-1 shrink-0 rounded-full border border-white/12 bg-black/24 px-4 py-2 text-[11px] font-black tracking-[0.28em] uppercase text-white/85 backdrop-blur-md">
                                        Live Projection
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 flex-1 min-h-0 overflow-hidden px-6 pb-5 pt-3 flex flex-col items-center justify-start">
                                {gameState.screenRound === 0 && <div className="text-center mt-16 text-[var(--color-text-muted)]"><div className="text-[7rem] mb-5 opacity-40 animate-pulse">🎤</div><div className="text-[clamp(2rem,3vw,3rem)] font-black tracking-[0.2em] uppercase">比赛即将开始，敬请期待</div></div>}
                                {gameState.screenRound === 1 && gameState.round1Mode === 'groupIntro' && <GroupIntro gameState={gameState} />}
                                {gameState.screenRound === 1 && gameState.round1Mode !== 'groupIntro' && <RankList gameState={gameState} />}
                                {gameState.screenRound === 1.5 && <PickOpponent gameState={gameState} />}
                                {gameState.screenRound === 2 && <PkBattle gameState={gameState} />}
                                {gameState.screenRound === 3 && <DemonKing gameState={gameState} />}
                                {gameState.screenRound === 4 && <Resurrection gameState={gameState} />}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
