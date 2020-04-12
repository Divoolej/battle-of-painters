import Bintocol from 'bintocol-js';

import { EVENTS } from '~/src/constants';

const { NOTHING, OBJECT, ARRAY, UINT, BOOL } = Bintocol.types;

const registerPing = () => Bintocol.register({
  event: EVENTS.PING,
  body: { type: NOTHING },
});

const registerPong = () => Bintocol.register({
  event: EVENTS.PONG,
  body: { type: NOTHING },
});

const registerTick = () => Bintocol.register({
  event: EVENTS.TICK,
  body: {
    type: OBJECT,
    schema: {
      players: {
        type: ARRAY,
        lengthSize: 3,
        content: {
          type: OBJECT,
          schema: {
            x: { type: UINT, size: 10 },
            y: { type: UINT, size: 10 },
            radius: { type: UINT, size: 2 },
          },
        },
      },
      diff: {
        type: ARRAY,
        lengthSize: 14,
        content: {
          type: OBJECT,
          schema: {
            location: {
              type: UINT,
              size: 19,
            },
            value: {
              type: UINT,
              size: 3,
            },
          },
        },
      },
    },
  },
});

const registerJoinAsSpectator = () => Bintocol.register({
  event: EVENTS.JOIN_AS_SPECTATOR,
  body: { type: NOTHING },
});

const registerJoinAsPlayer = () => Bintocol.register({
  event: EVENTS.JOIN_AS_PLAYER,
  body: { type: NOTHING },
});

const registerPlayGame = () => Bintocol.register({
  event: EVENTS.PLAY_GAME,
  body: { type: NOTHING },
});

const registerInput = () => Bintocol.register({
  event: EVENTS.INPUT,
  body: {
    type: OBJECT,
    schema: {
      key: {
        type: UINT,
        size: 1,
      },
      isPressed: { type: BOOL },
    },
  },
});

export const registerEvents = () => {
  registerPing();
  registerPong();
  registerTick();
  registerJoinAsPlayer();
  registerJoinAsSpectator();
  registerPlayGame();
  registerInput();
};
