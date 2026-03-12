import React, { useState } from 'react';
import { getFullAvatarUrl } from '../utils/avatar';

export default function AdminRound1({ gameState, updateState }) {
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [judgeScoreInput, setJudgeScoreInput] = useState("");
    const [publicScoreInput, setPublicScoreInput] = useState("");
    const [history, setHistory] = useState([]); // Undo history

    const handleSelect = (id) => {
        setSelectedPlayerId(id);
        const p = gameState.players.find(p => p.id === id);
        setJudgeScoreInput(p && p.judgeScore !== undefined ? p.judgeScore : "");
        setPublicScoreInput(p && p.publicScore !== undefined ? p.publicScore : "");
    };

    const handleSubmitScore = () => {
        if (!selectedPlayerId) return;
        const judgeScore = parseFloat(judgeScoreInput);
        const publicScore = parseFloat(publicScoreInput);

        if (isNaN(judgeScore) || judgeScore < 0 || judgeScore > 100 || isNaN(publicScore) || publicScore < 0 || publicScore > 100) {
            alert("请输入有效的0-100分数");
            return;
        }

        const finalScore = judgeScore * 0.75 + publicScore * 0.25;

        // Capture history before changing
        setHistory([...history, JSON.stringify(gameState)]);

        const newPlayers = gameState.players.map(p => {
            if (p.id === selectedPlayerId) {
                return { ...p, score: finalScore, judgeScore, publicScore };
            }
            return p;
        });

        updateState({ ...gameState, players: newPlayers });
        setSelectedPlayerId(null);
        setJudgeScoreInput("");
        setPublicScoreInput("");
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const prevStateStr = history[history.length - 1];
        setHistory(history.slice(0, -1));
        updateState(JSON.parse(prevStateStr));
    };

    const selectedPlayer = gameState.players.find(p => p.id === selectedPlayerId);

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-blue-400 flex items-center">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded justify-center items-center flex mr-3 text-sm">1</span>
                    第一轮管理：30进18成绩录入
                </h2>
                <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className={`px-4 py-2 rounded font-bold transition-all ${history.length > 0 ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'}`}
                >
                    ↩ 撤销上一步
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 左侧：选手列表 */}
                <div className="col-span-2">
                    <h3 className="text-lg mb-4 text-slate-300 font-bold border-l-4 border-slate-500 pl-3">选手库 ({gameState.players.length}人)</h3>
                    <div className="grid grid-cols-4 xl:grid-cols-5 gap-3">
                        {gameState.players.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSelect(p.id)}
                                className={`py-3 px-2 rounded-lg transition-all border ${selectedPlayerId === p.id ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)] border-blue-400 scale-105' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                            >
                                <div className="font-bold truncate">{p.name}</div>
                                <div className={`text-xs mt-1 font-mono flex flex-col items-center ${p.score > 0 ? 'text-green-300' : 'text-slate-500'}`}>
                                    {p.score > 0 ? (
                                        <>
                                            <span className="text-sm font-bold">{parseFloat(p.score).toFixed(2)}分</span>
                                            <span className="text-[10px] opacity-70">专:{p.judgeScore} 大:{p.publicScore}</span>
                                        </>
                                    ) : '未打分'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 右侧：打分操作 */}
                <div className="col-span-1 bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-2xl h-fit sticky top-6">
                    <h3 className="text-lg mb-6 text-blue-300 text-center font-bold tracking-widest bg-blue-900/30 py-2 rounded">打分面板</h3>
                    {selectedPlayer ? (
                        <div className="flex flex-col items-center">
                            <img src={getFullAvatarUrl(selectedPlayer.avatar)} alt="avatar" className="w-28 h-28 rounded-full mb-4 border-4 border-blue-500 shadow-xl object-cover" />
                            <h4 className="text-3xl font-black mb-1">{selectedPlayer.name}</h4>
                            <div className="text-sm text-slate-400 mb-2">当前得分: {selectedPlayer.score > 0 ? selectedPlayer.score.toFixed(2) : '暂无'}</div>
                            {selectedPlayer.score > 0 && (
                                <div className="text-xs text-slate-500 mb-6 flex space-x-4">
                                    <span>专业评委: {selectedPlayer.judgeScore} (75%)</span>
                                    <span>大众评审: {selectedPlayer.publicScore} (25%)</span>
                                </div>
                            )}

                            <div className="w-full flex flex-col space-y-4">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-sm text-slate-400 font-bold">专业分(75%)</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={judgeScoreInput}
                                            onChange={e => setJudgeScoreInput(e.target.value)}
                                            className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl py-3 pl-24 pr-4 border-l-8 border-l-blue-500 text-2xl font-black text-right text-blue-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                                            placeholder="0 - 100"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') document.getElementById('publicScoreInput')?.focus();
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-4 text-sm text-slate-400 font-bold">大众分(25%)</span>
                                        <input
                                            id="publicScoreInput"
                                            type="number"
                                            step="0.01"
                                            value={publicScoreInput}
                                            onChange={e => setPublicScoreInput(e.target.value)}
                                            className="w-full bg-slate-800 border-2 border-slate-600 rounded-xl py-3 pl-24 pr-4 border-l-8 border-l-emerald-500 text-2xl font-black text-right text-emerald-400 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                                            placeholder="0 - 100"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleSubmitScore();
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSubmitScore}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] text-xl tracking-wider uppercase mt-2"
                                >
                                    确认提交
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-500 text-center py-16 flex flex-col items-center border-2 border-dashed border-slate-700 rounded-xl">
                            <span className="text-5xl mb-6 opacity-30">👈</span>
                            <p className="font-bold text-lg">在左侧列表选择</p>
                            <p className="text-sm mt-2 opacity-60">点击需要录入分数的选手</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
