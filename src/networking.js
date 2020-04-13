import Bintocol from 'bintocol-js';
import { BACKEND_URL, EVENTS, GAME_STATES } from '~/src/constants';
import { initLobby, updateLobby } from '~/src/lobby';
import { json } from '~/src/utils';
import { initGame, tick, countdownTick } from '~/src';

export const initConnection = () => {
  window.ws = new WebSocket(`${BACKEND_URL}/?roomId=${window.roomId}&userId=${window.playerId}`);
  ws.onmessage = msg => {
    (msg.data.arrayBuffer ? msg.data : new Response(msg.data))
      .arrayBuffer()
      .then(buffer => networkController(Bintocol.decode(new Uint8Array(buffer))));
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
        setTimeout(() => ws.send(Bintocol.encode({ event: EVENTS.PING }, { compress: false })), 100);
        break;
      case EVENTS.UPDATE_LOBBY:
        updateLobby(data);
        break;
      case EVENTS.PLAY_GAME:
        initGame(data);
        ws.send(Bintocol.encode({ event: EVENTS.PING }, { compress: false }));
        break;
      case EVENTS.TICK:
        tick(data);
        break;
      case EVENTS.COUNTDOWN:
        countdownTick(data);
        break;
    }
  }
};

export const joinAsPlayer = () => {
  setLoading();
  ws.send(Bintocol.encode({ event: EVENTS.JOIN_AS_PLAYER }, { compress: false }));
};

export const joinAsSpectator = () => {
  setLoading();
  ws.send(Bintocol.encode({ event: EVENTS.JOIN_AS_SPECTATOR }, { compress: false }));
};

export const playGame = () => {
  setLoading();
  ws.send(Bintocol.encode({ event: EVENTS.PLAY_GAME }, { compress: false }));
};

export const onInput = (key, isPressed) => {
  ws.send(Bintocol.encode({
    event: EVENTS.INPUT,
    data: { key, isPressed },
  }));
};
