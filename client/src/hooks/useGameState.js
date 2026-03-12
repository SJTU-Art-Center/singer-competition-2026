import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// 动态获取当前访问的域名/IP，确保局域网其他设备访问时能连上其对应后端的3001端口
// 如果是由于本地开发，通常 window.location.hostname 是 'localhost' 或本机局域网 IP
const serverUrl = `http://${window.location.hostname}:3001`;
const socket = io(serverUrl);

export function useGameState() {
    const [gameState, setGameState] = useState(null);

    useEffect(() => {
        // 每次挂件挂载时，主动要求同步（解决直接从路由跳转进来时错过初次 stateSync 的问题）
        socket.emit('requestState');

        socket.on('stateSync', (state) => {
            setGameState(state);
        });

        return () => {
            socket.off('stateSync');
        };
    }, []);

    const updateState = (newState) => {
        socket.emit('updateState', newState);
        // 乐观更新机制，确保本地体验极速
        setGameState(newState);
    };

    return { gameState, updateState, socket };
}
