import { GAME_STATES, MAX_PLAYERS } from '~/src/constants';
import { playGame, joinAsPlayer, joinAsSpectator, stopLoading } from '~/src/networking';
import { initGame } from '~/src/'

const clearChildren = (el) => {
  while (el.children.length > 0) {
    el.removeChild(el.children[0]);
  }
}

export const initLobby = (data) => {
  const root = document.getElementById("lobby");
  const joinPlayerBtn = document.getElementById("lobby-join-player");
  const joinSpectatorBtn = document.getElementById("lobby-join-spectator");
  const playersList = document.getElementById('lobby-players');
  const spectatorsList = document.getElementById('lobby-spectators');

  window.lobby = { root, joinPlayerBtn, joinSpectatorBtn, playersList, spectatorsList };

  window.onJoinSpectator = joinAsSpectator;
  window.onJoinPlayer = joinAsPlayer;
  window.onPlayGame = playGame;
};

export const hideLobby = () => {
  lobby.root.classList.add('hidden');
};

export const updateLobby = ({ owner, players, spectators, state }) => {
  if (state === GAME_STATES.LOBBY) {
    clearChildren(lobby.playersList);
    for (let i = 0; i < 4; i++) {
      const player = players[i];
      const node = document.createElement('div');
      node.classList.add('slot');
      if (player) {
        node.append(`- @${player.name}`);
      } else {
        node.append('- Empty player slot');
      }
      lobby.playersList.appendChild(node);
    }

    if (owner && (owner.id === playerId)) {
      playButton.classList.remove('hidden');
    } else {
      playButton.classList.add('hidden');
    }

    if (players.find(p => p.id === playerId)) {
      lobby.joinSpectatorBtn.classList.remove('hidden');
      lobby.joinPlayerBtn.classList.add('hidden');
    } else if (players.length < MAX_PLAYERS) {
      lobby.joinPlayerBtn.classList.remove('hidden');
      lobby.joinSpectatorBtn.classList.add('hidden');
    }
  }

  clearChildren(lobby.spectatorsList);
  spectators.forEach(s => {
    const node = document.createElement('div');
    node.classList.add('slot');
    node.append(`- @${s.name}`);
    lobby.spectatorsList.appendChild(node);
    if (s.id === playerId && state === GAME_STATES.GAME)
      initGame({ players });
  });

  stopLoading();
}
