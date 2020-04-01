import LZUTF8 from 'lzutf8';

import { BACKEND_URL, EVENTS, GAME_STATES } from '~/src/constants';
import { initLobby, updateLobby } from '~/src/lobby';
import { json } from '~/src/utils';
import { initGame, tick } from '~/src';

export const initConnection = () => {
  window.ws = new WebSocket(`${BACKEND_URL}/?roomId=${window.roomId}&userId=${window.playerId}`);
  ws.onmessage = msg => {
    debugger;
    networkController(JSON.parse(msg.data));
    // const { compressed, content } = JSON.parse(msg.data);
    // if (compressed) {
    //   networkController(JSON.parse(LZUTF8.decompress(content, { inputEncoding: 'Base64' })));
    // } else {
    //   networkController(content);
    // }
  }
  ws.onerror = error => console.error('WebSocket error:', error);
  ws.onclose = () => console.log('connection closed');
};

export const setLoading = () => {
  loader.classList.remove('invisible');
};

export const stopLoading = () => {
  loader.classList.add('invisible');
};

const networkController = (message) => {
  const { error, event, data } = message;
  if (error) {
    console.error('Error:', error);
  } else {
    switch (event) {
      case EVENTS.PONG:
        pings.push(Date.now() - lastPing);
        if (pings.length > 10)
          pings.shift();
        lastPing = Date.now();
        setTimeout(() => ws.send(json({ event: EVENTS.PING })), 100);
        break;
      case EVENTS.UPDATE_LOBBY:
        updateLobby(data);
        break;
      case EVENTS.PLAY_GAME:
        initGame(data);
        ws.send(json({ event: EVENTS.PING }));
        break;
      case EVENTS.TICK:
        packets.push(json(data).length);
        if (packets.length > 16)
          packets.shift();
        tick(data);
        break;
    }
  }
};

export const joinAsPlayer = () => {
  setLoading();
  ws.send(json({ event: EVENTS.JOIN_AS_PLAYER }));
};

export const joinAsSpectator = () => {
  setLoading();
  ws.send(json({ event: EVENTS.JOIN_AS_SPECTATOR }));
};

export const playGame = () => {
  setLoading();
  ws.send(json({ event: EVENTS.PLAY_GAME }));
};

export const onInput = (key, isPressed) => {
  ws.send(json({
    event: EVENTS.INPUT,
    data: { key, isPressed },
  }));
}
